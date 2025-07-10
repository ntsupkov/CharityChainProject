import { Campaign, User, NFTTemplate, Donation, NFT } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Фонд Помощи Животным',
    email: 'animals@charity.ru',
    role: 'fund',
    walletAddress: '0x742d35Cc6634C0532925a3b8D404d56AC3D8F7C8',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Алексей Петров',
    email: 'alex@example.com',
    role: 'donor',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c72c9b',
    createdAt: new Date('2024-01-20')
  }
];

export const mockNFTTemplates: NFTTemplate[] = [
  {
    id: '1',
    name: 'Пушистый Котёнок',
    rarity: 'Common',
    image: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Милый котёнок с голубыми глазами',
    weight: 40
  },
  {
    id: '2',
    name: 'Золотой Кот',
    rarity: 'Uncommon',
    image: 'https://images.pexels.com/photos/96938/pexels-photo-96938.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Редкий золотистый кот',
    weight: 25
  },
  {
    id: '3',
    name: 'Мистический Кот',
    rarity: 'Rare',
    image: 'https://images.pexels.com/photos/156934/pexels-photo-156934.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Кот с загадочными глазами',
    weight: 15
  },
  {
    id: '4',
    name: 'Королевский Кот',
    rarity: 'Epic',
    image: 'https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Величественный кот в короне',
    weight: 10
  },
  {
    id: '5',
    name: 'Легендарный Кот',
    rarity: 'Legendary',
    image: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Легендарный кот с магическими способностями',
    weight: 7
  },
  {
    id: '6',
    name: 'Мифический Кот',
    rarity: 'Mythic',
    image: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Мифический кот из древних легенд',
    weight: 3
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Помощь бездомным животным',
    description: 'Сбор средств на приют для бездомных кошек и собак. Ваши пожертвования помогут обеспечить животных едой, лекарствами и уютным домом.',
    targetAmount: 10,
    currentAmount: 3.5,
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    nftPrompt: 'пушистые коты, нарисованные в стиле импрессионизма',
    nftCollection: mockNFTTemplates,
    isActive: true
  },
  {
    id: '2',
    title: 'Образование для детей',
    description: 'Поддержка образовательных программ для детей из малообеспеченных семей. Каждый ETH поможет ребёнку получить качественное образование.',
    targetAmount: 5,
    currentAmount: 2.1,
    createdBy: '1',
    createdAt: new Date('2024-01-18'),
    nftPrompt: 'детские книги и игрушки в акварельном стиле',
    nftCollection: mockNFTTemplates,
    isActive: true
  }
];

export const mockDonations: Donation[] = [
  {
    id: '1',
    donorId: '2',
    campaignId: '1',
    amount: 0.1,
    transactionHash: '0x123abc...',
    nftsReceived: [],
    createdAt: new Date('2024-01-22')
  }
];

export const getNFTRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Common': return 'bg-stone-100 text-stone-700 border-stone-300';
    case 'Uncommon': return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'Rare': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'Epic': return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'Legendary': return 'bg-red-100 text-red-700 border-red-300';
    case 'Mythic': return 'bg-rose-100 text-rose-700 border-rose-300';
    default: return 'bg-stone-100 text-stone-700 border-stone-300';
  }
};

export const generateRandomNFT = (templates: NFTTemplate[]): NFTTemplate => {
  const totalWeight = templates.reduce((sum, template) => sum + template.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const template of templates) {
    random -= template.weight;
    if (random <= 0) {
      return template;
    }
  }
  
  return templates[0];
};