const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration Test", function () {
    let donation;
    let donationNFT;
    let owner;
    let donor;
    let beneficiary;
    let treasury;

    before(async function () {
        [owner, donor, beneficiary, treasury] = await ethers.getSigners();
        
        console.log("🚀 Deploying contracts...");
        
        
        const DonationNFT = await ethers.getContractFactory("DonationNFT");
        donationNFT = await DonationNFT.deploy(
            "Charity Hero NFT",
            "HERO",
            treasury.address,
            500 
        );
        console.log("✅ NFT contract deployed");
        
        const Donation = await ethers.getContractFactory("Donation");
        donation = await Donation.deploy(treasury.address);
        console.log("✅ Donation contract deployed");
        
        await donationNFT.setDonationContract(await donation.getAddress());
        await donation.setNFTContract(await donationNFT.getAddress());
        console.log("✅ Contracts linked");
    });

    it("Should complete full donation flow with NFT minting", async function () {
        console.log("\n📝 Creating campaign...");
        await donation.createCampaign(
            "Integration Test Campaign",
            "Testing the full flow",
            ethers.parseEther("10"),
            30,
            beneficiary.address
        );
        
        const campaignId = 0;
        console.log("✅ Campaign created");
        
        console.log("\n💰 Making donation...");
        const donationAmount = ethers.parseEther("1");
        await donation.connect(donor).donateToCampaign(campaignId, {
            value: donationAmount
        });
        console.log("✅ Donation successful");
        
        const campaign = await donation.getCampaignInfo(campaignId);
        const expectedRaised = donationAmount * BigInt(99) / BigInt(100); // 1% fee
        expect(campaign.raised).to.equal(expectedRaised);
        console.log("✅ Campaign raised amount correct:", ethers.formatEther(campaign.raised), "MATIC");
        
        const nftBalance = await donationNFT.balanceOf(donor.address);
        expect(nftBalance).to.equal(1);
        console.log("✅ NFT minted to donor");
        
        const metadata = await donationNFT.getNFTMetadata(0);
        expect(metadata.donor).to.equal(donor.address);
        expect(metadata.amount).to.equal(donationAmount);
        expect(metadata.donorLevel).to.equal("Gold");
        console.log("✅ NFT metadata correct. Level:", metadata.donorLevel);
        
        const stats = await donation.getPlatformStats();
        expect(stats._totalDonations).to.equal(donationAmount);
        expect(stats._totalFeesCollected).to.equal(donationAmount / BigInt(100)); // 1% fee
        console.log("✅ Platform stats updated correctly");
        
        console.log("\n🎉 Integration test passed!");
    });
});