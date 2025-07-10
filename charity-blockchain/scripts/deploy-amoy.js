const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Polygon Amoy Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC\n");
  
  if (balance < hre.ethers.parseEther("0.1")) {
    console.error("❌ Insufficient MATIC balance! Need at least 0.1 MATIC for deployment.");
    console.log("Get test MATIC from:");
    console.log("  - https://faucet.polygon.technology/ (official)");
    console.log("  - https://www.alchemy.com/faucets/polygon-amoy");
    console.log("  - https://faucets.chain.link/polygon-amoy");
    process.exit(1);
  }

  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  console.log("Treasury address:", treasuryAddress);
  console.log("Deployer address:", deployer.address, "\n");

  try {
    console.log("📝 [1/4] Deploying DonationNFT contract...");
    const DonationNFT = await hre.ethers.getContractFactory("DonationNFT");
    const donationNFT = await DonationNFT.deploy(
      "Charity Hero NFT",     
      "HERO",                 
      treasuryAddress,        
      500                     
    );
    
    await donationNFT.waitForDeployment();
    const nftAddress = await donationNFT.getAddress();
    console.log("✅ DonationNFT deployed to:", nftAddress);
    console.log("   Gas used:", (await donationNFT.deploymentTransaction().wait()).gasUsed.toString());

    console.log("\n📝 [2/4] Deploying Donation contract...");
    const Donation = await hre.ethers.getContractFactory("Donation");
    const donation = await Donation.deploy(treasuryAddress);
    
    await donation.waitForDeployment();
    const donationAddress = await donation.getAddress();
    console.log("✅ Donation deployed to:", donationAddress);
    console.log("   Gas used:", (await donation.deploymentTransaction().wait()).gasUsed.toString());

    console.log("\n🔗 [3/4] Linking contracts...");
    
    console.log("   Setting donation contract in NFT...");
    const tx1 = await donationNFT.setDonationContract(donationAddress);
    await tx1.wait();
    console.log("   ✅ Donation contract set in NFT");
    
    console.log("   Setting NFT contract in Donation...");
    const tx2 = await donation.setNFTContract(nftAddress);
    await tx2.wait();
    console.log("   ✅ NFT contract set in Donation");

    if (hre.network.name === "amoy") {
      console.log("\n🎯 [4/4] Creating test campaign...");
      const beneficiary = process.env.BENEFICIARY_ADDRESS || deployer.address;
      
      const tx3 = await donation.createCampaign(
        "Clean Ocean Initiative",
        "Help us clean the oceans from plastic waste and protect marine life",
        hre.ethers.parseEther("100"), 
        30, 
        beneficiary
      );
      await tx3.wait();
      console.log("✅ Test campaign created!");
    }

    console.log("\n💾 Saving deployment data...");
    const deploymentData = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      contracts: {
        Donation: {
          address: donationAddress,
          deploymentBlock: (await donation.deploymentTransaction().wait()).blockNumber
        },
        DonationNFT: {
          address: nftAddress,
          deploymentBlock: (await donationNFT.deploymentTransaction().wait()).blockNumber
        }
      },
      treasury: treasuryAddress,
      deployer: deployer.address,
      timestamp: new Date().toISOString()
    };

    const deploymentDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
    console.log("✅ Deployment data saved to:", deploymentPath);

    const abiDir = path.join(__dirname, "../abi");
    if (!fs.existsSync(abiDir)) {
      fs.mkdirSync(abiDir, { recursive: true });
    }

    const donationArtifact = await hre.artifacts.readArtifact("Donation");
    const nftArtifact = await hre.artifacts.readArtifact("DonationNFT");

    fs.writeFileSync(
      path.join(abiDir, "Donation.json"),
      JSON.stringify(donationArtifact.abi, null, 2)
    );
    fs.writeFileSync(
      path.join(abiDir, "DonationNFT.json"),
      JSON.stringify(nftArtifact.abi, null, 2)
    );
    console.log("✅ ABI files saved to:", abiDir);

    // ============ Верификация контрактов ============
    if (hre.network.name === "amoy" && process.env.POLYGONSCAN_API_KEY) {
      console.log("\n🔍 Starting contract verification...");
      console.log("⏳ Waiting 30 seconds for PolygonScan to index contracts...");
      await new Promise(resolve => setTimeout(resolve, 30000));

      try {
        console.log("\nVerifying DonationNFT...");
        await hre.run("verify:verify", {
          address: nftAddress,
          constructorArguments: [
            "Charity Hero NFT",
            "HERO",
            treasuryAddress,
            500
          ],
          network: "polygonAmoy"
        });
        console.log("✅ DonationNFT verified!");
      } catch (error) {
        console.log("❌ DonationNFT verification failed:", error.message);
      }

      try {
        console.log("\nVerifying Donation...");
        await hre.run("verify:verify", {
          address: donationAddress,
          constructorArguments: [treasuryAddress],
          network: "polygonAmoy"
        });
        console.log("✅ Donation verified!");
      } catch (error) {
        console.log("❌ Donation verification failed:", error.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📋 Contract Addresses:");
    console.log("   Donation:    ", donationAddress);
    console.log("   DonationNFT: ", nftAddress);
    console.log("\n🔗 Polygon Amoy Explorer Links:");
    console.log("   Donation:     https://amoy.polygonscan.com/address/" + donationAddress);
    console.log("   DonationNFT:  https://amoy.polygonscan.com/address/" + nftAddress);
    console.log("\n💰 Treasury:", treasuryAddress);
    console.log("\n💸 Estimated costs on Mainnet:");
    console.log("   Deployment: ~0.1-0.2 MATIC (~$0.10)");
    console.log("   Per donation: ~0.001 MATIC (~$0.001)");
    console.log("   NFT mint: ~0.002 MATIC (~$0.002)");
    console.log("\n⚠️  Don't forget to:");
    console.log("   1. Save these addresses!");
    console.log("   2. Set up IPFS for NFT metadata");
    console.log("   3. Test all functions on testnet");
    console.log("   4. Audit contracts before mainnet deployment");
    console.log("\n" + "=".repeat(60));

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });