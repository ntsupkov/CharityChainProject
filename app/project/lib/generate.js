const fs = require("fs");
const fetch = require("node-fetch");

const API_KEY = "2819bbff-d326-449a-9030-6c9c9de97b76";
const WALLET_ADDRESS = "0xa42C59388804338661A71Ff30A4ec05C7f0fa199";

const nftPrompt = "пушистые коты в стиле импрессионизма";
const nftCount = 5;

async function generateNFTs(collectionId) {
  for (let i = 0; i < nftCount; i++) {
    const response = await fetch("https://api.chaingpt.org/nft/generate-nft-queue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        prompt: nftPrompt,
        collectionId,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to generate NFT");
    }
    const data = await response.json();
    console.log(`NFT #${i + 1} сгенерирован, collectionId: ${collectionId}`);
    await new Promise(r => setTimeout(r, 3000));
    const progressResponse = await fetch(`https://api.chaingpt.org/nft/progress/${collectionId}`, {
      headers: { "x-api-key": API_KEY },
    });
    if (!progressResponse.ok) {
      throw new Error("Failed to check progress");
    }
    const progress = await progressResponse.json();
    if (progress.status !== "completed") {
      throw new Error("NFT generation not completed");
    }
    const nft = {
      name: `NFT #${i + 1}`,
      image: progress.image,
      description: progress.description,
    };
    try {
      // Здесь можно сохранить в mock-data.js
    } catch (e) {
      console.error(`Не удалось сгенерировать NFT #${i + 1}`);
    }
  }
}
