"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const POLYGON_AMOY_CHAIN_ID = 80002;

interface WalletState {
  connected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    provider: null,
    signer: null,
    chainId: null,
  });

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("⚠️ У вас не установлен MetaMask");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const network = await provider.getNetwork();
      if (Number(network.chainId) !== POLYGON_AMOY_CHAIN_ID) {
        try {
          await window.ethereum.request?.({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x13882" }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request?.({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x13882",
                  chainName: "Polygon Amoy Testnet",
                  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                  rpcUrls: ["https://rpc-amoy.polygon.technology/"],
                  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
                },
              ],
            });
          } else {
            console.error("❌ Ошибка при переключении сети:", switchError);
            return;
          }
        }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWallet({
        connected: true,
        address,
        provider,
        signer,
        chainId: POLYGON_AMOY_CHAIN_ID,
      });

      console.log("✅ Connected to MetaMask:", address);
    } catch (err: any) {
      console.error("❌ MetaMask connection error:", err);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      connected: false,
      address: null,
      provider: null,
      signer: null,
      chainId: null,
    });
    console.log("🔌 Wallet disconnected");
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const handleChainChanged = (_chainId: string) => {
    window.location.reload();
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const ethereum = window.ethereum as {
        on: (event: string, handler: (...args: any[]) => void) => void;
        removeListener: (event: string, handler: (...args: any[]) => void) => void;
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return { wallet, connectWallet, disconnectWallet };
}
