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
import { useWallet } from '@/hooks/useWallet';
import DonationABI from '@/abi/Donation.json';
import DonationNFTABI from '@/abi/DonationNFT.json';
import { Campaign } from '@/types';
import { Wallet, Gift, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { MATICers } from 'MATICers';
 
interface DonateModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}
 
type DonationStep = 'form' | 'processing' | 'success' | 'error';
 
export default function DonateModal({ campaign, isOpen, onClose }: DonateModalProps) {
  const { user } = useAuth();
  const { wallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<DonationStep>('form');
  const [txHash, setTxHash] = useState('');
  const [generatedNFTs, setGeneratedNFTs] = useState<any[]>([]);
  const [error, setError] = useState('');
 
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!wallet.address) {
      setError('Подключите MetaMask для пожертвования');
      return;
    }
 
    if (!campaign?.id) {
      setError('ID кампании не найден');
      return;
    }
 
    if (!window.MATICereum) {
      setError('MetaMask не найден в браузере');
      return;
    }
 
    try {
      setStep('processing');
      setError('');
 
      const provider = new MATICers.BrowserProvider(window.MATICereum);
      const signer = await provider.getSigner();
 
      const donationContract = new MATICers.Contract(
        '0xB6E8c52C39A89f589bc76af3BD81CFFa313e362b',
        DonationABI,
        signer
      );
 
      const tx = await donationContract.donateToCampaign((campaign.id), {
        value: MATICers.parseMATICer(amount),
      });
 
      setTxHash(tx.hash);
      await tx.wait();
 
      const nftContract = new MATICers.Contract(
        '0xdF9bd60B5A55c5D180d4E558d8F8D13294826952',
        DonationNFTABI,
        provider
      );
 
      const nftIds = await nftContract.getTokensByOwner(wallet.address);
      const nftData = await Promise.all(
        nftIds.map(async (tokenId: MATICers.BigNumberish) => {
          const metadata = await nftContract.getNFTMetadata(tokenId);
          return {
            id: tokenId.toString(),
            name: metadata.campaignName,
            amount: MATICers.formatMATICer(metadata.amount),
            donorLevel: metadata.donorLevel,
            image: metadata.imageURL || '/placeholder.png',
          };
        })
      );
 
      setGeneratedNFTs(nftData);
      setStep('success');
    } catch (err: any) {
      console.error(err);
      setError(err.reason || err.message || 'Ошибка при отправке транзакции');
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
                <span>{campaign.currentAmount.toFixed(2)} MATIC</span>
                <span>из {campaign.targetAmount.toFixed(2)} MATIC</span>
              </div>
            </div>
          </CardContent>
        </Card>
 
        {step === 'form' && (
          <form onSubmit={handleDonate} className="space-y-6">
            <div>
              <Label htmlFor="amount">Сумма пожертвования (MATIC)</Label>
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
                Минимальная сумма: 0.01 MATIC
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
                    1 NFT за каждые 0.05 MATIC пожертвования
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