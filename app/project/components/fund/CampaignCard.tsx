'use client';
 
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Campaign } from '@/types';
import { Calendar, Target, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import DonationABI from '@/abi/Donation.json';
import { MATICers } from 'MATICers';
 
interface CampaignCardProps {
  campaign: Campaign;
  isOwner?: boolean;
}
 
export default function CampaignCard({ campaign, isOwner = false }: CampaignCardProps) {
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
 
  const progress = (campaign.currentAmount / campaign.targetAmount) * 100;
  const remaining = campaign.targetAmount - campaign.currentAmount;
 
  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Симуляция API-запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Удаляем кампанию:', campaign.id);
      // В реальном приложении здесь был бы API-запрос
    } catch (error) {
      console.error('Ошибка удаления:', error);
    } finally {
      setDeleting(false);
    }
  };
 
  const handleWithdraw = async () => {
    if (!window.MATICereum) {
      alert('MetaMask не найден в браузере');
      return;
    }
 
    try {
      const provider = new MATICers.BrowserProvider(window.MATICereum);
      const signer = await provider.getSigner();
 
      const donationContract = new MATICers.Contract(
        '0xB6E8c52C39A89f589bc76af3BD81CFFa313e362b', // Адрес контракта
        DonationABI,
        signer
      );
 
      const tx = await donationContract.emergencyWithdraw({
        gasLimit: 200_000,
      });
 
      console.log('✅ Средства успешно выведены:', tx.hash);
      alert('✅ Средства успешно выведены!');
    } catch (err: any) {
      console.error('❌ Ошибка при выводе средств:', err);
      alert('❌ Ошибка при выводе средств: ' + (err.reason || err.message));
    }
  };
 
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm border-stone-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-stone-800 line-clamp-2">
            {campaign.title}
          </CardTitle>
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить сбор?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Сбор будет удалён навсегда.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {deleting ? 'Удаляем...' : 'Удалить'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
 
        <div className="flex items-center space-x-2 text-sm text-stone-500">
          <Calendar className="h-4 w-4" />
          <span>{campaign.createdAt.toLocaleDateString('ru-RU')}</span>
          <Badge variant={campaign.isActive ? 'default' : 'secondary'} className="ml-auto">
            {campaign.isActive ? 'Активно' : 'Завершено'}
          </Badge>
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
            <TrendingUp className="h-4 w-4" />
            <span>NFT: {campaign.nftCollection.length}</span>
          </div>
        </div>
 
        {/* Кнопки */}
        {!isOwner && (
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
            disabled={!campaign.isActive}
          >
            Поддержать
          </Button>
        )}
 
        {/* ✅ Кнопка Забрать средства для фонда */}
        {user?.role === 'fund' &&
          user.walletAddress?.toLowerCase() ===
            campaign.beneficiary?.toLowerCase() && (
            <Button
              onClick={handleWithdraw}
              className="w-full mt-2 bg-green-600 text-white hover:bg-green-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Забрать средства
            </Button>
          )}
      </CardContent>
    </Card>
  );
}

