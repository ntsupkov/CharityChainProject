import { Campaign, NFT, Fund, Donor } from "../types";

export const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Помощь животным",
    description: "Сбор средств для приюта животных.",
    goal: 10000,
    collected: 3500,
    image: new URL('https://gateway.ipfs.chaingpt.org/ipfs/Qmd83dn3wMKLmfnmef85r9TxYXiT9XG39q9XMu3qf5mP9x/1.png').toString(),
    fundId: "1",
    beneficiary: "Фонд Доброе Сердце"
  },
  {
    id: "2",
    name: "Поддержка детских домов",
    description: "Сбор средств для детских домов.",
    goal: 20000,
    collected: 12000,
    image: new URL('https://gateway.ipfs.chaingpt.org/ipfs/Qmd83dn3wMKLmfnmef85r9TxYXiT9XG39q9XMu3qf5mP9x/2.png').toString(),
    fundId: "2",
    beneficiary: "Фонд Детство"
  },
  {
    id: "3",
    name: "Экологические проекты",
    description: "Сбор средств на посадку деревьев.",
    goal: 15000,
    collected: 8000,
    image: new URL('https://gateway.ipfs.chaingpt.org/ipfs/QmUYTxnLjxU1DSAYBYSXBKGfUViu2BWurW4i9PiLABsy36/1.png').toString(),
    fundId: "3",
    beneficiary: "Фонд Зеленый Мир"
  },
  {
    id: "4",
    name: "Помощь пожилым людям",
    description: "Сбор средств для домов престарелых.",
    goal: 12000,
    collected: 4000,
    image: new URL('https://gateway.ipfs.chaingpt.org/ipfs/QmUYTxnLjxU1DSAYBYSXBKGfUViu2BWurW4i9PiLABsy36/2.png').toString(),
    fundId: "4",
    beneficiary: "Фонд Забота"
  },
  {
    id: "5",
    name: "Поддержка образования",
    description: "Сбор средств на стипендии студентам.",
    goal: 18000,
    collected: 9000,
    image: new URL('https://gateway.ipfs.chaingpt.org/ipfs/QmUYTxnLjxU1DSAYBYSXBKGfUViu2BWurW4i9PiLABsy36/3.png').toString(),
    fundId: "5",
    beneficiary: "Фонд Будущее"
  },
];

export const nfts: NFT[] = [
  {
    id: "1",
    name: "Кот-герой",
    rarity: "Legendary",
    image: new URL('https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400').toString(),
    description: "Легендарный кот, спасший приют.",
    weight: 5
  },
  {
    id: "2",
    name: "Кот-волшебник",
    rarity: "Epic",
    image: new URL('https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=400').toString(),
    description: "Эпический кот с магическими способностями.",
    weight: 4
  },
  {
    id: "3",
    name: "Кот-рыцарь",
    rarity: "Rare",
    image: new URL('https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg?auto=compress&cs=tinysrgb&w=400').toString(),
    description: "Редкий кот-защитник.",
    weight: 3
  },
  {
    id: "4",
    name: "Кот-учёный",
    rarity: "Uncommon",
    image: new URL('https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400').toString(),
    description: "Необычный кот-исследователь.",
    weight: 2
  },
  {
    id: "5",
    name: "Кот-друг",
    rarity: "Common",
    image: new URL('https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=400').toString(),
    description: "Обычный, но очень добрый кот.",
    weight: 1
  },
];

export const funds: Fund[] = [
  {
    id: "1",
    name: "Фонд Доброе Сердце",
    description: "Помощь животным.",
    logo: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    website: "https://goodheart.org",
    wallet: "0x123...abc"
  },
  {
    id: "2",
    name: "Фонд Детство",
    description: "Поддержка детских домов.",
    logo: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    website: "https://childhood.org",
    wallet: "0x456...def"
  },
];

export const donors: Donor[] = [
  {
    id: "1",
    name: "Иван Иванов",
    wallet: "0xabc...123"
  },
  {
    id: "2",
    name: "Мария Петрова",
    wallet: "0xdef...456"
  },
];