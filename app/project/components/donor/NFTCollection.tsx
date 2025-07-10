'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockNFTTemplates, getNFTRarityColor } from '@/lib/mock-data';
import { Gift, Star, Crown, Sparkles, Diamond, Zap } from 'lucide-react';

export default function NFTCollection() {
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Симуляция коллекции пользователя
  const userNFTs = [
    { ...mockNFTTemplates[0], id: 'user-1', mintedAt: new Date('2024-01-22') },
    { ...mockNFTTemplates[1], id: 'user-2', mintedAt: new Date('2024-01-23') },
    { ...mockNFTTemplates[2], id: 'user-3', mintedAt: new Date('2024-01-24') },
    { ...mockNFTTemplates[3], id: 'user-4', mintedAt: new Date('2024-01-25') },
    { ...mockNFTTemplates[4], id: 'user-5', mintedAt: new Date('2024-01-26') },
  ];

  const filteredNFTs = selectedRarity === 'all' 
    ? userNFTs 
    : userNFTs.filter(nft => nft.rarity === selectedRarity);

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Common': return <Star className="h-4 w-4" />;
      case 'Uncommon': return <Gift className="h-4 w-4" />;
      case 'Rare': return <Crown className="h-4 w-4" />;
      case 'Epic': return <Sparkles className="h-4 w-4" />;
      case 'Legendary': return <Diamond className="h-4 w-4" />;
      case 'Mythic': return <Zap className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const rarityStats = [
    { name: 'Common', count: 1, color: 'bg-stone-100 text-stone-700' },
    { name: 'Uncommon', count: 1, color: 'bg-amber-100 text-amber-700' },
    { name: 'Rare', count: 1, color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Epic', count: 1, color: 'bg-orange-100 text-orange-700' },
    { name: 'Legendary', count: 1, color: 'bg-red-100 text-red-700' },
    { name: 'Mythic', count: 0, color: 'bg-rose-100 text-rose-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-stone-800">Моя NFT коллекция</h2>
        <Badge variant="secondary" className="bg-amber-50 text-amber-700">
          {userNFTs.length} NFT
        </Badge>
      </div>

      {/* Статистика по редкости */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {rarityStats.map((stat) => (
          <Card key={stat.name} className={`${stat.color} border-current/20`}>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                {getRarityIcon(stat.name)}
              </div>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs font-medium">{stat.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Фильтры */}
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

        <TabsContent value={selectedRarity} className="mt-6">
          {filteredNFTs.length === 0 ? (
            <Card className="p-8 text-center">
              <Gift className="h-16 w-16 text-stone-400 mx-auto mb-4" />
              <p className="text-stone-500 mb-4">
                {selectedRarity === 'all' 
                  ? 'У вас пока нет NFT в коллекции' 
                  : `У вас нет NFT редкости ${selectedRarity}`}
              </p>
              <Button
                onClick={() => setSelectedRarity('all')}
                variant="outline"
                className="border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                Посмотреть все NFT
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNFTs.map((nft) => (
                <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{nft.name}</CardTitle>
                      <Badge className={`${getNFTRarityColor(nft.rarity)}`}>
                        {nft.rarity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-stone-600 mb-3">{nft.description}</p>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Получено: {nft.mintedAt.toLocaleDateString('ru-RU')}</span>
                      <span>#{nft.id}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}