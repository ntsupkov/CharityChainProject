const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("DonationNFT", function () {
    async function deployContractsFixture() {
        const [owner, donor1, donor2, beneficiary, treasury] = await ethers.getSigners();
        
        const DonationNFT = await ethers.getContractFactory("DonationNFT");
        const donationNFT = await DonationNFT.deploy(
            "Charity Hero NFT",
            "HERO",
            treasury.address,
            500 
        );
        
        const Donation = await ethers.getContractFactory("Donation");
        const donation = await Donation.deploy(treasury.address);
        
        await donationNFT.setDonationContract(await donation.getAddress());
        await donation.setNFTContract(await donationNFT.getAddress());
        
        return { donationNFT, donation, owner, donor1, donor2, beneficiary, treasury };
    }
    
    async function deployWithCampaignFixture() {
        const { donationNFT, donation, owner, donor1, donor2, beneficiary, treasury } = await deployContractsFixture();
        
        await donation.createCampaign(
            "Save the Ocean",
            "Cleaning ocean from plastic",
            ethers.parseEther("10"),
            30,
            beneficiary.address
        );
        
        return { donationNFT, donation, owner, donor1, donor2, beneficiary, treasury, campaignId: 0 };
    }

    describe("NFT Minting", function () {
        it("Should mint NFT for donations above minimum", async function () {
            const { donationNFT, donation, donor1, campaignId } = await loadFixture(deployWithCampaignFixture);
            
            const donationAmount = ethers.parseEther("0.1"); // Выше минимума
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: donationAmount
            });
            
            const balance = await donationNFT.balanceOf(donor1.address);
            expect(balance).to.equal(1);
            
            const metadata = await donationNFT.getNFTMetadata(0);
            expect(metadata.donor).to.equal(donor1.address);
            expect(metadata.amount).to.equal(donationAmount);
            expect(metadata.campaignId).to.equal(campaignId);
        });

        it("Should not mint NFT for small donations", async function () {
            const { donationNFT, donation, donor1, campaignId } = await loadFixture(deployWithCampaignFixture);
            
            const smallDonation = ethers.parseEther("0.005"); // Ниже минимума
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: smallDonation
            });
            
            const balance = await donationNFT.balanceOf(donor1.address);
            expect(balance).to.equal(0);
        });

        it("Should assign correct donor levels", async function () {
            const { donationNFT } = await loadFixture(deployContractsFixture);
            
            expect(await donationNFT.getDonorLevel(ethers.parseEther("0.1"))).to.equal("Bronze");
            expect(await donationNFT.getDonorLevel(ethers.parseEther("0.5"))).to.equal("Silver");
            expect(await donationNFT.getDonorLevel(ethers.parseEther("1"))).to.equal("Gold");
            expect(await donationNFT.getDonorLevel(ethers.parseEther("5"))).to.equal("Platinum");
            expect(await donationNFT.getDonorLevel(ethers.parseEther("10"))).to.equal("Diamond");
        });
    });

    describe("Royalties", function () {
        it("Should return correct royalty info", async function () {
            const { donationNFT, donation, donor1, treasury, campaignId } = await loadFixture(deployWithCampaignFixture);
            
            const tokenId = 0;
            const salePrice = ethers.parseEther("1");
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: ethers.parseEther("0.1")
            });
            
            const [receiver, royaltyAmount] = await donationNFT.royaltyInfo(tokenId, salePrice);
            expect(receiver).to.equal(treasury.address);
            expect(royaltyAmount).to.equal(ethers.parseEther("0.05")); // 5%
        });

        it("Should allow owner to update royalty", async function () {
            const { donationNFT, donation, donor1, donor2, campaignId } = await loadFixture(deployWithCampaignFixture);
            
            const newReceiver = donor2.address;
            const newFee = 1000; // 10%
            
            await donationNFT.updateDefaultRoyalty(newReceiver, newFee);
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: ethers.parseEther("0.1")
            });
            
            const [receiver, royaltyAmount] = await donationNFT.royaltyInfo(0, ethers.parseEther("1"));
            expect(receiver).to.equal(newReceiver);
            expect(royaltyAmount).to.equal(ethers.parseEther("0.1")); // 10%
        });
    });

    describe("Access Control", function () {
        it("Should not allow direct minting", async function () {
            const { donationNFT, donor1 } = await loadFixture(deployContractsFixture);
            
            await expect(
                donationNFT.connect(donor1).mintDonationNFT(
                    donor1.address,
                    ethers.parseEther("1"),
                    0,
                    "Test"
                )
            ).to.be.revertedWith("Only donation contract can call");
        });

        it("Should not allow non-owner to set donation contract", async function () {
            const { donationNFT, donor1, donor2 } = await loadFixture(deployContractsFixture);
            
            await expect(
                donationNFT.connect(donor1).setDonationContract(donor2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Token Management", function () {
        it("Should return all tokens by owner", async function () {
            const { donationNFT, donation, donor1, campaignId } = await loadFixture(deployWithCampaignFixture);
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: ethers.parseEther("0.1")
            });
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: ethers.parseEther("0.2")
            });
            
            const tokens = await donationNFT.getTokensByOwner(donor1.address);
            expect(tokens.length).to.equal(2);
            expect(tokens[0]).to.equal(0);
            expect(tokens[1]).to.equal(1);
        });

        it("Should support ERC721 and ERC2981 interfaces", async function () {
            const { donationNFT } = await loadFixture(deployContractsFixture);
            
            expect(await donationNFT.supportsInterface("0x80ac58cd")).to.be.true;
            expect(await donationNFT.supportsInterface("0x2a55205a")).to.be.true;
        });
    });

    describe("Integration with Platform Fee", function () {
        it("Should mint NFT correctly despite platform fee", async function () {
            const { donationNFT, donation, donor1, campaignId } = await loadFixture(deployWithCampaignFixture);
            
            const donationAmount = ethers.parseEther("0.1");
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: donationAmount
            });
            
            const metadata = await donationNFT.getNFTMetadata(0);
            expect(metadata.amount).to.equal(donationAmount);
            
            const campaignInfo = await donation.getCampaignInfo(campaignId);
            const expectedAmount = donationAmount * BigInt(9900) / BigInt(10000); // 99%
            expect(campaignInfo.raised).to.equal(expectedAmount);
        });
    });
});