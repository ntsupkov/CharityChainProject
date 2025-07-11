'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Campaign } from '@/types';
import { Calendar, Target, Wallet, Gift } from 'lucide-react';
import DonateModal from './DonateModal';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const [showDonateModal, setShowDonateModal] = useState(false);
  
  const progress = (campaign.currentAmount / campaign.targetAmount) * 100;
  const remaining = campaign.targetAmount - campaign.currentAmount;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm border-stone-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg text-stone-800 line-clamp-2">
              {campaign.title}
            </CardTitle>
            <Badge variant={campaign.isActive ? 'default' : 'secondary'} className="ml-2">
              {campaign.isActive ? 'Активно' : 'Завершено'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-stone-500">
            <Calendar className="h-4 w-4" />
            <span>{campaign.createdAt.toLocaleDateString('ru-RU')}</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-stone-600 line-clamp-3">
            {campaign.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-stone-700">Прогресс</span>
              <span className="text-sm text-stone-500">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">
                {campaign.currentAmount.toFixed(2)} MATIC собрано
              </span>
              <span className="text-stone-500">
                из {campaign.targetAmount.toFixed(2)} MATIC
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1 text-sm text-stone-500">
              <Target className="h-4 w-4" />
              <span>Осталось: {remaining.toFixed(2)} MATIC</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-amber-700">
              <Gift className="h-4 w-4" />
              <span>NFT: {campaign.nftCollection.length}</span>
            </div>
          </div>
          
          <Button
            onClick={() => setShowDonateModal(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
            disabled={!campaign.isActive}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Поддержать
          </Button>
        </CardContent>
      </Card>
      
      <DonateModal
        campaign={campaign}
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
      />
    </>
  );
}