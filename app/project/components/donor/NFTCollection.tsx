'use client';

import { nfts } from '@/lib/mock-data';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const rarityStats = [
  { rarity: 'Common', count: 2 },
  { rarity: 'Uncommon', count: 1 },
  { rarity: 'Rare', count: 1 },
  { rarity: 'Epic', count: 0 },
  { rarity: 'Legendary', count: 1 },
  { rarity: 'Mythic', count: 0 },
];

export default function NFTCollection() {
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const userNFTs = [
    { ...nfts[0], id: 'user-1', mintedAt: new Date('2024-01-22') },
    { ...nfts[1], id: 'user-2', mintedAt: new Date('2024-01-23') },
    { ...nfts[2], id: 'user-3', mintedAt: new Date('2024-01-24') },
    { ...nfts[3], id: 'user-4', mintedAt: new Date('2024-01-25') },
    { ...nfts[4], id: 'user-5', mintedAt: new Date('2024-01-26') },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {rarityStats.map((stat) => (
          <div key={stat.rarity} className="text-center">
            <div className="text-lg font-bold">{stat.count}</div>
            <div className="text-xs text-gray-500">{stat.rarity}</div>
          </div>
        ))}
      </div>
      <Tabs value={selectedRarity} onValueChange={setSelectedRarity}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="Common">Common</TabsTrigger>
          <TabsTrigger value="Uncommon">Uncommon</TabsTrigger>
          <TabsTrigger value="Rare">Rare</TabsTrigger>
          <TabsTrigger value="Epic">Epic</TabsTrigger>
          <TabsTrigger value="Legendary">Legendary</TabsTrigger>
          <TabsTrigger value="Mythic">Mythic</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            {userNFTs.map((nft) => (
              <div key={nft.id} className="border rounded p-2">
                <img src={nft.image} alt={nft.name} className="w-full h-32 object-cover rounded" />
                <div className="font-semibold mt-2">{nft.name}</div>
                <div className="text-xs text-gray-500">{nft.rarity}</div>
              </div>
            ))}
          </div>
        </TabsContent>
        {['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'].map((rarity) => (
          <TabsContent value={rarity} key={rarity}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              {userNFTs.filter((nft) => nft.rarity === rarity).map((nft) => (
                <div key={nft.id} className="border rounded p-2">
                  <img src={nft.image} alt={nft.name} className="w-full h-32 object-cover rounded" />
                  <div className="font-semibold mt-2">{nft.name}</div>
                  <div className="text-xs text-gray-500">{nft.rarity}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}