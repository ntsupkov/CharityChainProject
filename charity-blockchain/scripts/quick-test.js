const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Quick Test Script for Polygon Amoy\n");
  

  const deploymentPath = path.join(__dirname, "../deployments/amoy.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ No deployment found! Run: npm run deploy:amoy");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const [signer] = await hre.ethers.getSigners();
  
  
  const donation = await hre.ethers.getContractAt("Donation", deployment.contracts.Donation.address);
  const nft = await hre.ethers.getContractAt("DonationNFT", deployment.contracts.DonationNFT.address);
  
  console.log("📍 Connected to contracts:");
  console.log("   Donation:", deployment.contracts.Donation.address);
  console.log("   NFT:", deployment.contracts.DonationNFT.address);
  console.log("   Your address:", signer.address);
  
 
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("\n💰 Your balance:", hre.ethers.formatEther(balance), "MATIC");
  
  if (balance < hre.ethers.parseEther("0.1")) {
    console.error("❌ Insufficient balance! Get MATIC from faucet.");
    process.exit(1);
  }
  
  try {
    
    console.log("\n🔍 Checking campaigns...");
    const campaigns = await donation.getActiveCampaigns();
    
    if (campaigns.length === 0) {
      console.log("❌ No active campaigns found!");
      
      
      const owner = await donation.owner();
      if (owner === signer.address) {
        console.log("\n📝 Creating test campaign...");
        const tx = await donation.createCampaign(
          "Test Campaign " + Date.now(),
          "Quick test campaign for donations",
          hre.ethers.parseEther("10"), 
          7, 
          signer.address
        );
        await tx.wait();
        console.log("✅ Campaign created!");
      } else {
        console.log("❌ You're not the owner. Can't create campaigns.");
        process.exit(1);
      }
    }
    
    const campaignId = campaigns.length > 0 ? campaigns[0] : 0;
    const campaignInfo = await donation.getCampaignInfo(campaignId);
    
    console.log("\n🎯 Donating to campaign:", campaignInfo.name);
    console.log("   Current raised:", hre.ethers.formatEther(campaignInfo.raised), "MATIC");
    console.log("   Goal:", hre.ethers.formatEther(campaignInfo.goal), "MATIC");
    
    const amounts = [
      { value: "0.01", level: "Testing minimum" },
      { value: "0.1", level: "Bronze NFT" },
      { value: "0.5", level: "Silver NFT" },
      { value: "1", level: "Gold NFT" }
    ];
    
    console.log("\n💸 Making test donations...");
    for (const amount of amounts.slice(0, 2)) { // Делаем только 2 первых доната для экономии
      console.log(`\n   Donating ${amount.value} MATIC (${amount.level})...`);
      
      const tx = await donation.donateToCampaign(campaignId, {
        value: hre.ethers.parseEther(amount.value)
      });
      
      const receipt = await tx.wait();
      console.log(`   ✅ Done! Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`   📍 Tx: https://amoy.polygonscan.com/tx/${receipt.transactionHash}`);
    }
    
    console.log("\n🎨 Checking your NFTs...");
    const nftBalance = await nft.balanceOf(signer.address);
    console.log("   NFT balance:", nftBalance.toString());
    
    if (nftBalance > 0) {
      const tokens = await nft.getTokensByOwner(signer.address);
      console.log("   Your token IDs:", tokens.map(t => t.toString()).join(", "));
      
      const lastTokenId = tokens[tokens.length - 1];
      const metadata = await nft.getNFTMetadata(lastTokenId);
      console.log("\n   Latest NFT metadata:");
      console.log("   - Token ID:", lastTokenId.toString());
      console.log("   - Amount:", hre.ethers.formatEther(metadata.amount), "MATIC");
      console.log("   - Level:", metadata.donorLevel);
      console.log("   - Campaign:", metadata.campaignName);
    }
    
    console.log("\n📊 Platform statistics:");
    const stats = await donation.getPlatformStats();
    console.log("   Total donations:", hre.ethers.formatEther(stats._totalDonations), "MATIC");
    console.log("   Total fees:", hre.ethers.formatEther(stats._totalFeesCollected), "MATIC");
    console.log("   Campaigns:", stats._campaignCount.toString());
    
    console.log("\n📜 Your donation history:");
    const history = await donation.getDonorHistory(signer.address);
    console.log("   Total donations made:", history.length);
    
    console.log("\n✅ Quick test completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("   - Try different donation amounts");
    console.log("   - Check your NFTs on PolygonScan");
    console.log("   - Test withdraw function (if you're beneficiary)");
    console.log("   - Create more campaigns (if you're owner)");
    
  } catch (error) {
    console.error("\n❌ Error during test:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });