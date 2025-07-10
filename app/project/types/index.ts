export type UserRole = 'fund' | 'donor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
  createdAt: Date;
  registration_date?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  createdBy: string;
  createdAt: Date;
  nftPrompt: string;
  nftCollection: NFTTemplate[];
  isActive: boolean;
}

export interface NFTTemplate {
  id: string;
  name: string;
  rarity: NFTRarity;
  image: string;
  description: string;
  weight: number;
}

export type NFTRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface NFT {
  id: string;
  templateId: string;
  ownerId: string;
  campaignId: string;
  mintedAt: Date;
  transactionHash: string;
}

export interface Donation {
  id: string;
  donorId: string;
  campaignId: string;
  amount: number;
  transactionHash: string;
  nftsReceived: NFT[];
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  connectWallet: () => Promise<void>;
}