'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Campaign } from '@/types';
import { generateRandomNFT, getNFTRarityColor } from '@/lib/mock-data';
import { Wallet, Gift, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface DonateModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}

type DonationStep = 'form' | 'processing' | 'success' | 'error';

export default function DonateModal({ campaign, isOpen, onClose }: DonateModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<DonationStep>('form');
  const [txHash, setTxHash] = useState('');
  const [generatedNFTs, setGeneratedNFTs] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('Подключите кошелёк для пожертвования');
      return;
    }
    setStep('processing');
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/donation/make`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(user.id),
          collection_id: Number(campaign.id),
          amount: parseFloat(amount)
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка при пожертвовании');
      }
      // Обновляем сумму на фронте
      const donationResult = await response.json();
      campaign.currentAmount += parseFloat(amount);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Ошибка при обработке транзакции');
      setStep('error');
    }
  };

  const resetModal = () => {
    setAmount('');
    setStep('form');
    setTxHash('');
    setGeneratedNFTs([]);
    setError('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  const progress = (campaign.currentAmount / campaign.targetAmount) * 100;
  const estimatedNFTs = Math.floor(parseFloat(amount) / 0.05) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">Поддержать проект</DialogTitle>
        </DialogHeader>
        
        {/* Информация о кампании */}
        <Card className="bg-gradient-to-r from-amber-50 to-stone-50 border-stone-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-stone-800 mb-2">{campaign.title}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600">Прогресс</span>
                <span className="text-sm text-stone-500">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-stone-600">
                <span>{campaign.currentAmount.toFixed(2)} ETH</span>
                <span>из {campaign.targetAmount.toFixed(2)} ETH</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {step === 'form' && (
          <form onSubmit={handleDonate} className="space-y-6">
            <div>
              <Label htmlFor="amount">Сумма пожертвования (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="mt-1 text-lg"
                placeholder="0.1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Минимальная сумма: 0.01 ETH
              </p>
            </div>

            {amount && estimatedNFTs > 0 && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Gift className="h-5 w-5 text-amber-700" />
                    <span className="font-medium text-amber-800">
                      Вы получите: {estimatedNFTs} NFT
                    </span>
                  </div>
                  <p className="text-sm text-amber-700">
                    1 NFT за каждые 0.05 ETH пожертвования
                  </p>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-700" />
                    <span className="text-orange-800">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Пожертвовать
              </Button>
            </div>
          </form>
        )}

        {step === 'processing' && (
          <div className="text-center space-y-4 py-8">
            <Clock className="h-16 w-16 text-amber-600 mx-auto animate-pulse" />
            <h3 className="text-xl font-semibold text-stone-800">Обработка транзакции</h3>
            <p className="text-stone-600">Ожидание подтверждения в сети...</p>
            {txHash && (
              <p className="text-xs text-stone-500 font-mono">
                TX: {txHash}
              </p>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6 py-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <h3 className="text-xl font-semibold text-stone-800">Пожертвование успешно отправлено!</h3>
            <p className="text-stone-600">
              Спасибо за вашу поддержку! Вы получили {generatedNFTs.length} NFT
            </p>
            
            <div className="space-y-4">
              <h4 className="font-medium text-stone-800">Полученные NFT:</h4>
              <div className="grid grid-cols-2 gap-3">
                {generatedNFTs.map((nft, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm text-stone-800">{nft.name}</h5>
                        <Badge className={`text-xs ${getNFTRarityColor(nft.rarity)}`}>
                          {nft.rarity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleClose}
              className="bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
            >
              Закрыть
            </Button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center space-y-4 py-8">
            <AlertCircle className="h-16 w-16 text-orange-600 mx-auto" />
            <h3 className="text-xl font-semibold text-stone-800">Ошибка транзакции</h3>
            <p className="text-stone-600">{error}</p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Закрыть
              </Button>
              <Button
                onClick={() => setStep('form')}
                className="bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
              >
                Попробовать снова
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}