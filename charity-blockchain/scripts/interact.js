const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {

  const network = hre.network.name;
  const deploymentPath = path.join(__dirname, `../deployments/${network}.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ No deployment found for network:", network);
    console.log("Run deployment first: npm run deploy:amoy");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log("📋 Using deployment from:", deploymentPath);
  console.log("Donation contract:", deployment.contracts.Donation.address);
  console.log("NFT contract:", deployment.contracts.DonationNFT.address);
  
 
  const Donation = await hre.ethers.getContractFactory("Donation");
  const donation = await Donation.attach(deployment.contracts.Donation.address);
  
  const DonationNFT = await hre.ethers.getContractFactory("DonationNFT");
  const nft = await DonationNFT.attach(deployment.contracts.DonationNFT.address);
  
  const [signer] = await hre.ethers.getSigners();
  
 
  console.log("\n🎯 Interactive Contract Dashboard");
  console.log("=".repeat(50));
  

  const userBalance = await hre.ethers.provider.getBalance(signer.address);
  console.log("\n👤 Your Account:");
  console.log("   Address:", signer.address);
  console.log("   Balance:", hre.ethers.formatEther(userBalance), "MATIC");
  
  console.log("\n📊 Platform Statistics:");
  const stats = await donation.getPlatformStats();
  console.log("   Total donations:", hre.ethers.formatEther(stats._totalDonations), "MATIC");
  console.log("   Total fees collected:", hre.ethers.formatEther(stats._totalFeesCollected), "MATIC");
  console.log("   Total campaigns:", stats._campaignCount.toString());
  console.log("   Contract balance:", hre.ethers.formatEther(stats._currentBalance), "MATIC");
  
  const maticPriceUSD = 1.0; // Примерная цена MATIC
  console.log("   Total in USD: ~$" + (Number(hre.ethers.formatEther(stats._totalDonations)) * maticPriceUSD).toFixed(2));
  
  console.log("\n🎯 Active Campaigns:");
  const activeCampaigns = await donation.getActiveCampaigns();
  
  if (activeCampaigns.length === 0) {
    console.log("   No active campaigns at the moment.");
  } else {
    for (const campaignId of activeCampaigns) {
      const info = await donation.getCampaignInfo(campaignId);
      console.log(`\n   Campaign #${campaignId}: ${info.name}`);
      console.log(`   📝 ${info.description}`);
      console.log(`   🎯 Goal: ${hre.ethers.formatEther(info.goal)} MATIC (~$${(Number(hre.ethers.formatEther(info.goal)) * maticPriceUSD).toFixed(2)})`);
      console.log(`   💰 Raised: ${hre.ethers.formatEther(info.raised)} MATIC (~$${(Number(hre.ethers.formatEther(info.raised)) * maticPriceUSD).toFixed(2)})`);
      console.log(`   📈 Progress: ${((Number(info.raised) / Number(info.goal)) * 100).toFixed(2)}%`);
      console.log(`   👤 Beneficiary: ${info.beneficiary}`);
      
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = Number(info.deadline) - now;
      if (timeLeft > 0) {
        const daysLeft = Math.floor(timeLeft / 86400);
        const hoursLeft = Math.floor((timeLeft % 86400) / 3600);
        console.log(`   ⏰ Time left: ${daysLeft} days, ${hoursLeft} hours`);
      } else {
        console.log(`   ⏰ Status: Ended`);
      }
    }
  }
  
  console.log("\n💎 NFT Statistics:");
  console.log("   Total NFTs minted:", (await nft.totalSupply()).toString());
  console.log("   Your NFT balance:", (await nft.balanceOf(signer.address)).toString());
  
  const userNFTs = await nft.getTokensByOwner(signer.address);
  if (userNFTs.length > 0) {
    console.log("\n🎨 Your NFT Collection:");
    for (const tokenId of userNFTs) {
      const metadata = await nft.getNFTMetadata(tokenId);
      console.log(`\n   Token #${tokenId}:`);
      console.log(`   🏷️  Campaign: ${metadata.campaignName}`);
      console.log(`   💰 Amount: ${hre.ethers.formatEther(metadata.amount)} MATIC`);
      console.log(`   🏆 Level: ${metadata.donorLevel}`);
      console.log(`   📅 Date: ${new Date(Number(metadata.timestamp) * 1000).toLocaleDateString()}`);
    }
  }
  
  console.log("\n💡 Quick Actions:");
  console.log("\n1. Make a donation (0.1 MATIC):");
  console.log(`   await donation.donateToCampaign(0, { value: ethers.parseEther("0.1") })`);
  
  console.log("\n2. Make a larger donation (10 MATIC):");
  console.log(`   await donation.donateToCampaign(0, { value: ethers.parseEther("10") })`);
  
  console.log("\n3. Create a campaign (owner only):");
  console.log(`   await donation.createCampaign(
     "Campaign Name",
     "Description", 
     ethers.parseEther("100"),  // 100 MATIC goal
     30,                        // 30 days
     "0x..."                    // beneficiary address
   )`);
  
  console.log("\n🔗 View on Polygon Scan:");
  console.log(`   Donation: https://amoy.polygonscan.com/address/${deployment.contracts.Donation.address}`);
  console.log(`   NFT: https://amoy.polygonscan.com/address/${deployment.contracts.DonationNFT.address}`);
  console.log(`   Your txs: https://amoy.polygonscan.com/address/${signer.address}`);
  
  console.log("\n💸 Estimated Transaction Costs:");
  console.log("   Make donation: ~0.002 MATIC (~$0.002)");
  console.log("   Create campaign: ~0.001 MATIC (~$0.001)");
  console.log("   Withdraw funds: ~0.001 MATIC (~$0.001)");
  
  console.log("\n" + "=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });