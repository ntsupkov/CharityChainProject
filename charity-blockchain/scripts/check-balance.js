const hre = require("hardhat");

async function main() {
  const [account] = await hre.ethers.getSigners();
  
  console.log("\n🔍 Checking balance on", hre.network.name);
  console.log("📍 Address:", account.address);
  
  const balance = await hre.ethers.provider.getBalance(account.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "MATIC");
  
  if (hre.network.name === "amoy" && balance < hre.ethers.parseEther("0.1")) {
    console.log("\n⚠️  Low balance! You need at least 0.1 MATIC for deployment.");
    console.log("🚰 Get test MATIC from:");
    console.log("  - https://faucet.polygon.technology/ (official)");
    console.log("  - https://www.alchemy.com/faucets/polygon-amoy");
    console.log("  - https://faucets.chain.link/polygon-amoy");
    console.log("  - https://mumbaifaucet.com/ (might work for Amoy)");
  }
  
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    try {
      const feeData = await hre.ethers.provider.getFeeData();
      if (feeData.gasPrice) {
        console.log("\n⛽ Current gas price:", hre.ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
        
        const estimatedGasForDeploy = BigInt(3000000); // ~3M gas for both contracts
        const estimatedCost = feeData.gasPrice * estimatedGasForDeploy;
        console.log("💵 Estimated deployment cost:", hre.ethers.formatEther(estimatedCost), "MATIC");
        
        const maticPriceUSD = 1.0; // Примерная цена MATIC
        console.log("💲 Estimated cost in USD: $" + (Number(hre.ethers.formatEther(estimatedCost)) * maticPriceUSD).toFixed(2));
      }
    } catch (error) {
      console.log("\n⚠️  Could not fetch gas price");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });