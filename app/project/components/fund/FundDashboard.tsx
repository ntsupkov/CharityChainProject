'use client';
 
import { campaigns } from '@/lib/mock-data';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function FundDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const beneficiaryAddress = '0xa42c59388804338661a71ff30a4ec05c7f0fa199'.toLowerCase();

  const fundCampaigns = campaigns.filter((c) => c.fundId === '1');
  const totalRaised = fundCampaigns.reduce((sum: number, c) => sum + c.collected, 0);
  const totalGoal = fundCampaigns.reduce((sum: number, c) => sum + c.goal, 0);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="p-6">
            <div className="text-2xl font-bold text-amber-700">{totalRaised} MATIC</div>
            <div className="text-sm text-stone-600">Собрано всего</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-stone-50 to-stone-100 border-stone-200">
          <div className="p-6">
            <div className="text-2xl font-bold text-stone-800">{totalGoal} MATIC</div>
            <div className="text-sm text-stone-600">Цель всех сборов</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="p-6">
            <div className="text-2xl font-bold text-green-700">{fundCampaigns.length}</div>
            <div className="text-sm text-stone-600">Активных сборов</div>
          </div>
        </Card>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-stone-800">Ваши сборы</h2>
        {fundCampaigns.map((campaign: typeof campaigns[0]) => (
          <Card key={campaign.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{campaign.name}</div>
                <div className="text-sm text-stone-600">{campaign.description}</div>
              </div>
              <div className="text-right">
                <div className="text-amber-700 font-bold">{campaign.collected} / {campaign.goal} MATIC</div>
                <div className="text-xs text-stone-500">{Math.round((campaign.collected / campaign.goal) * 100)}%</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}