'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Users, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockCampaigns } from '@/lib/mock-data';
import CreateCampaignModal from './CreateCampaignModal';
import CampaignCard from './CampaignCard';

export default function FundDashboard() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const userCampaigns = mockCampaigns.filter(c => c.createdBy === user?.id);
  const totalRaised = userCampaigns.reduce((sum, c) => sum + c.currentAmount, 0);
  const totalTarget = userCampaigns.reduce((sum, c) => sum + c.targetAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-stone-800">Панель фонда</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Создать сбор
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Собрано средств</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{totalRaised.toFixed(2)} ETH</div>
            <p className="text-xs text-amber-700 mt-1">
              из {totalTarget.toFixed(2)} ETH ({((totalRaised / totalTarget) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-stone-50 to-stone-100 border-stone-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-700">Активных сборов</CardTitle>
            <Users className="h-4 w-4 text-stone-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{userCampaigns.length}</div>
            <p className="text-xs text-stone-700 mt-1">кампаний запущено</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">NFT выдано</CardTitle>
            <Gift className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">42</div>
            <p className="text-xs text-yellow-700 mt-1">уникальных токенов</p>
          </CardContent>
        </Card>
      </div>

      {/* Список кампаний */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-stone-800">Ваши сборы</h2>
        {userCampaigns.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-stone-500 mb-4">У вас пока нет активных сборов</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
            >
              Создать первый сбор
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} isOwner={true} />
            ))}
          </div>
        )}
      </div>

      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}