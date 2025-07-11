'use client';
 
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, CheckCircle, AlertCircle, ExternalLink, Copy, Unlink } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
 
interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}
 
export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
 
  const handleConnect = async () => {
    setConnecting(true);
    setError('');
 
    try {
      await connectWallet();
    } catch (err: any) {
      setError(err.message || 'Ошибка подключения кошелька');
    } finally {
      setConnecting(false);
    }
  };
 
  const handleCopyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
 
  const handleDisconnect = () => {
    disconnectWallet();
  };
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-stone-800 flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-amber-600" />
            <span>Управление кошельком</span>
          </DialogTitle>
        </DialogHeader>
 
        <div className="space-y-6">
          {wallet.connected ? (
            // ✅ Кошелёк подключен
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-green-50 to-amber-50 border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg text-green-800">Кошелёк подключен</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-stone-600 mb-1">Адрес кошелька:</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 p-2 bg-white rounded border border-green-200 font-mono text-sm">
                        {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                      </div>
                      <Button
                        onClick={handleCopyAddress}
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
 
                  <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                    Полный адрес: {wallet.address}
                  </div>
                </CardContent>
              </Card>
 
              <Card className="bg-gradient-to-r from-stone-50 to-neutral-50 border-stone-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-stone-800">Информация о сети</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-stone-600">Сеть:</span>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                      {wallet.chainId === 80002 ? 'Polygon Amoy' : `Chain ID: ${wallet.chainId}`}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-stone-600">Валюта:</span>
                    <span className="text-sm font-medium text-stone-800">MATIC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-stone-600">Статус:</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Активен</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
 
              <div className="flex space-x-3">
                <Button
                  onClick={() =>
                    window.open(`https://amoy.polygonscan.com/address/${wallet.address}`, '_blank')
                  }
                  variant="outline"
                  className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Просмотреть в PolygonScan
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Отключить
                </Button>
              </div>
            </div>
          ) : (
            // ❌ Кошелёк не подключен
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-amber-50 to-stone-50 border-amber-200">
                <CardContent className="p-6 text-center">
                  <Wallet className="h-16 w-16 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">
                    Кошелёк не подключен
                  </h3>
                  <p className="text-sm text-stone-600 mb-4">
                    Подключите MetaMask для совершения пожертвований и получения NFT
                  </p>
                </CardContent>
              </Card>
 
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
 
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Подключаем...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Подключить MetaMask
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}