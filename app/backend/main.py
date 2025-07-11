import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRIVATE_KEY = os.getenv("PRIVATE_KEY")
NFT_ADDRESS = os.getenv("NFT_ADDRESS")
DONATION_ADDRESS = os.getenv("DONATION_ADDRESS")
RPC_URL = os.getenv("AMOY_RPC_URL", "https://rpc-amoy.polygon.technology/")

web3 = Web3(Web3.HTTPProvider(RPC_URL))

with open("../project/abi/DonationNFT.json", "r", encoding="utf-8") as f:
    nft_abi = json.load(f)

with open("../project/abi/Donation.json", "r", encoding="utf-8") as f:
    donation_abi = json.load(f)

class MintRequest(BaseModel):
    wallet_address: str
    amount: float
    campaign_id: int
    metadata_name: str

@app.get("/")
def root():
    return {"message": "Backend is running!"}

@app.post("/mint-nft")
def mint_nft(request: MintRequest):
    fake_tx_hash = "0x" + "deadbeef"*8
    return {
        "tx_hash": fake_tx_hash,
        "polygonscan": f"https://amoy.polygonscan.com/tx/{fake_tx_hash}"
    }
