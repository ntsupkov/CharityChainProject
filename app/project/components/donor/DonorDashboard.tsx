'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Gift, Coins, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockCampaigns, mockDonations } from '@/lib/mock-data';
import CampaignCard from './CampaignCard';
import NFTCollection from './NFTCollection';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'nfts'>('campaigns');
  
  const userDonations = mockDonations.filter(d => d.donorId === user?.id);
  const totalDonated = userDonations.reduce((sum, d) => sum + d.amount, 0);
  const nftsOwned = 12; // Mock data

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-stone-800">Дашборд жертвователя</h1>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'campaigns' ? 'default' : 'outline'}
            onClick={() => setActiveTab('campaigns')}
            className={activeTab === 'campaigns' ? 'bg-gradient-to-r from-amber-500 to-stone-500' : ''}
          >
            <Heart className="h-4 w-4 mr-2" />
            Сборы
          </Button>
          <Button
            variant={activeTab === 'nfts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('nfts')}
            className={activeTab === 'nfts' ? 'bg-gradient-to-r from-amber-500 to-stone-500' : ''}
          >
            <Gift className="h-4 w-4 mr-2" />
            Мои NFT
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Всего пожертвовано</CardTitle>
            <Coins className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{totalDonated.toFixed(2)} ETH</div>
            <p className="text-xs text-amber-700 mt-1">за всё время</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-stone-50 to-stone-100 border-stone-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-700">NFT в коллекции</CardTitle>
            <Gift className="h-4 w-4 text-stone-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{nftsOwned}</div>
            <p className="text-xs text-stone-700 mt-1">уникальных токенов</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Поддержано проектов</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{userDonations.length}</div>
            <p className="text-xs text-yellow-700 mt-1">кампаний</p>
          </CardContent>
        </Card>
      </div>

      {/* Контент */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-stone-800">Доступные сборы</h2>
            <Badge variant="secondary" className="bg-amber-50 text-amber-700">
              {mockCampaigns.filter(c => c.isActive).length} активных
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCampaigns.filter(c => c.isActive).map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'nfts' && (
        <NFTCollection />
      )}
    </div>
  );
}