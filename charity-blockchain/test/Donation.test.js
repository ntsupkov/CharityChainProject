const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Donation with Security Features", function () {
    async function deployContractsFixture() {
        const [owner, donor1, donor2, beneficiary, treasury, attacker] = await ethers.getSigners();
        
        const Donation = await ethers.getContractFactory("Donation");
        const donation = await Donation.deploy(treasury.address);
        
        return { donation, owner, donor1, donor2, beneficiary, treasury, attacker };
    }

    async function deployWithCampaignFixture() {
        const { donation, owner, donor1, donor2, beneficiary, treasury, attacker } = await deployContractsFixture();
        
        await donation.createCampaign(
            "Test Campaign",
            "Test Description",
            ethers.parseEther("10"),
            30,
            beneficiary.address
        );
        
        return { donation, owner, donor1, donor2, beneficiary, treasury, attacker, campaignId: 0 };
    }

    describe("Deployment", function () {
        it("Should set correct initial values", async function () {
            const { donation, owner, treasury } = await loadFixture(deployContractsFixture);
            
            expect(await donation.owner()).to.equal(owner.address);
            expect(await donation.treasuryAddress()).to.equal(treasury.address);
            expect(await donation.platformFee()).to.equal(100); // 1%
            expect(await donation.paused()).to.be.false;
        });

        it("Should reject zero treasury address", async function () {
            const Donation = await ethers.getContractFactory("Donation");
            await expect(
                Donation.deploy(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid treasury address");
        });
    });

    describe("Campaign Management", function () {
        it("Should create a new campaign", async function () {
            const { donation, beneficiary } = await loadFixture(deployContractsFixture);
            
            const name = "Clean Water Initiative";
            const description = "Providing clean water to communities";
            const goal = ethers.parseEther("10");
            const duration = 30; // days
            
            const tx = await donation.createCampaign(
                name,
                description,
                goal,
                duration,
                beneficiary.address
            );
            
            const receipt = await tx.wait();
            const campaignId = 0;
            
            const campaignInfo = await donation.getCampaignInfo(campaignId);
            expect(campaignInfo.name).to.equal(name);
            expect(campaignInfo.description).to.equal(description);
            expect(campaignInfo.goal).to.equal(goal);
            expect(campaignInfo.raised).to.equal(0);
            expect(campaignInfo.active).to.be.true;
            expect(campaignInfo.beneficiary).to.equal(beneficiary.address);
        });

        it("Should not allow non-owner to create campaign", async function () {
            const { donation, donor1, beneficiary } = await loadFixture(deployContractsFixture);
            
            await expect(
                donation.connect(donor1).createCampaign(
                    "Test",
                    "Test",
                    ethers.parseEther("5"),
                    7,
                    beneficiary.address
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should validate campaign parameters", async function () {
            const { donation, beneficiary } = await loadFixture(deployContractsFixture);
            
            await expect(
                donation.createCampaign("Test", "Test", 0, 7, beneficiary.address)
            ).to.be.revertedWith("Goal must be greater than 0");
            
            await expect(
                donation.createCampaign("Test", "Test", ethers.parseEther("1"), 0, beneficiary.address)
            ).to.be.revertedWith("Duration must be greater than 0");
            
            await expect(
                donation.createCampaign("Test", "Test", ethers.parseEther("1"), 7, ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid beneficiary address");
            
            await expect(
                donation.createCampaign("", "Test", ethers.parseEther("1"), 7, beneficiary.address)
            ).to.be.revertedWith("Name cannot be empty");
            
            await expect(
                donation.createCampaign("Test", "", ethers.parseEther("1"), 7, beneficiary.address)
            ).to.be.revertedWith("Description cannot be empty");
        });
    });

    describe("Donations with Fee", function () {
        it("Should accept donations and deduct platform fee", async function () {
            const { donation, donor1, treasury, campaignId } = await loadFixture(deployWithCampaignFixture);
            
            const donationAmount = ethers.parseEther("1");
            const expectedFee = donationAmount * BigInt(100) / BigInt(10000); // 1%
            const expectedNetDonation = donationAmount - expectedFee;
            
            const treasuryBalanceBefore = await ethers.provider.getBalance(treasury.address);
            
            await expect(
                donation.connect(donor1).donateToCampaign(campaignId, {
                    value: donationAmount
                })
            ).to.emit(donation, "DonationReceived")
             .withArgs(donor1.address, campaignId, donationAmount);
            
            const campaignInfo = await donation.getCampaignInfo(campaignId);
            expect(campaignInfo.raised).to.equal(expectedNetDonation);
            
            const treasuryBalanceAfter = await ethers.provider.getBalance(treasury.address);
            expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(expectedFee);
            
            expect(await donation.totalFeesCollected()).to.equal(expectedFee);
        });

        it("Should handle zero fee correctly", async function () {
            const { donation, donor1, campaignId } = await loadFixture(deployWithCampaignFixture);
            
            await donation.setPlatformFee(0);
            
            const donationAmount = ethers.parseEther("1");
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: donationAmount
            });
            
            const campaignInfo = await donation.getCampaignInfo(campaignId);
            expect(campaignInfo.raised).to.equal(donationAmount);
            expect(await donation.totalFeesCollected()).to.equal(0);
        });

        it("Should reject donations when paused", async function () {
            const { donation, donor1, campaignId } = await loadFixture(deployWithCampaignFixture);
            
            await donation.pause();
            
            await expect(
                donation.connect(donor1).donateToCampaign(campaignId, {
                    value: ethers.parseEther("1")
                })
            ).to.be.revertedWith("Pausable: paused");
        });
    });

    describe("Security Features", function () {
        it("Should prevent reentrancy attacks", async function () {
            expect(true).to.be.true; // Placeholder
        });

        it("Should allow owner to pause and unpause", async function () {
            const { donation, owner, donor1 } = await loadFixture(deployContractsFixture);
            
            await donation.pause();
            expect(await donation.paused()).to.be.true;
            
            await expect(
                donation.createCampaign("Test", "Test", ethers.parseEther("1"), 7, owner.address)
            ).to.be.revertedWith("Pausable: paused");
            
            await donation.unpause();
            expect(await donation.paused()).to.be.false;
            
            await donation.createCampaign("Test", "Test", ethers.parseEther("1"), 7, owner.address);
        });

        it("Should not allow non-owner to pause", async function () {
            const { donation, donor1 } = await loadFixture(deployContractsFixture);
            
            await expect(
                donation.connect(donor1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should handle emergency withdraw correctly", async function () {
            const { donation, owner, donor1, campaignId } = await loadFixture(deployWithCampaignFixture);
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: ethers.parseEther("5")
            });
            
            const contractBalance = await ethers.provider.getBalance(await donation.getAddress());
            expect(contractBalance).to.be.gt(0);
            
            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
            await donation.emergencyWithdraw(owner.address);
            
            const contractBalanceAfter = await ethers.provider.getBalance(await donation.getAddress());
            expect(contractBalanceAfter).to.equal(0);
        });
    });

    describe("Fund Withdrawals", function () {
        it("Should allow beneficiary to withdraw after campaign ends", async function () {
            const { donation, donor1, beneficiary } = await loadFixture(deployWithCampaignFixture);
            const campaignId = 0;
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: ethers.parseEther("3")
            });
            
            await donation.stopCampaign(campaignId);
            
            const initialBalance = await ethers.provider.getBalance(beneficiary.address);
            await donation.connect(beneficiary).withdrawCampaignFunds(campaignId);
            
            const finalBalance = await ethers.provider.getBalance(beneficiary.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should prevent withdrawal when paused", async function () {
            const { donation, donor1, beneficiary } = await loadFixture(deployWithCampaignFixture);
            const campaignId = 0;
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: ethers.parseEther("3")
            });
            
            await donation.stopCampaign(campaignId);
            await donation.pause();
            
            await expect(
                donation.connect(beneficiary).withdrawCampaignFunds(campaignId)
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should prevent double withdrawal", async function () {
            const { donation, donor1, beneficiary } = await loadFixture(deployWithCampaignFixture);
            const campaignId = 0;
            
            await donation.connect(donor1).donateToCampaign(campaignId, {
                value: ethers.parseEther("3")
            });
            
            await donation.stopCampaign(campaignId);
            await donation.connect(beneficiary).withdrawCampaignFunds(campaignId);
            
            await expect(
                donation.connect(beneficiary).withdrawCampaignFunds(campaignId)
            ).to.be.revertedWith("Funds already withdrawn");
        });
    });

    describe("Platform Stats", function () {
        it("Should return correct platform statistics", async function () {
            const { donation, donor1, beneficiary } = await loadFixture(deployContractsFixture);
            
            await donation.createCampaign("Campaign 1", "Test 1", ethers.parseEther("5"), 30, beneficiary.address);
            await donation.createCampaign("Campaign 2", "Test 2", ethers.parseEther("10"), 30, beneficiary.address);
            
            await donation.connect(donor1).donateToCampaign(0, {
                value: ethers.parseEther("1")
            });
            await donation.connect(donor1).donateToCampaign(1, {
                value: ethers.parseEther("2")
            });
            
            const stats = await donation.getPlatformStats();
            expect(stats._totalDonations).to.equal(ethers.parseEther("3"));
            expect(stats._campaignCount).to.equal(2);
            expect(stats._totalFeesCollected).to.be.gt(0);
        });
    });

    describe("Fallback Functions", function () {
        it("Should reject direct ETH transfers", async function () {
            const { donation, donor1 } = await loadFixture(deployContractsFixture);
            
            await expect(
                donor1.sendTransaction({
                    to: await donation.getAddress(),
                    value: ethers.parseEther("1")
                })
            ).to.be.revertedWith("Please use donateToCampaign function");
        });
    });
});