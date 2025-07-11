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
  name: string;
  description: string;
  goal: number;
  collected: number;
  image: string;
  fundId: string;
  beneficiary: string;
}

export interface NFT {
  id: string;
  name: string;
  rarity: string;
  image: string;
  description: string;
  weight: number;
}

export interface Fund {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  wallet: string;
}

export interface Donor {
  id: string;
  name: string;
  wallet: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  connectWallet: () => Promise<void>;
}
