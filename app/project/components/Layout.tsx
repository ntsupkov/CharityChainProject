'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Wallet, User, Heart } from 'lucide-react';
import { ReactNode } from 'react';
import ProfileModal from '@/components/profile/ProfileModal';
import WalletModal from '@/components/wallet/WalletModal';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, connectWallet } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-neutral-50">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-amber-600" />
              <h1 className="text-2xl font-bold text-stone-800">CharityChain</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Card 
                className="px-3 py-2 bg-gradient-to-r from-amber-50 to-stone-50 border-stone-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setShowProfileModal(true)}
              >
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-stone-700">{user.name}</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    {user.role === 'fund' ? 'Фонд' : 'Жертвователь'}
                  </span>
                </div>
              </Card>
              
              {!user.walletAddress ? (
                <Button
                  onClick={() => setShowWalletModal(true)}
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Подключить кошелёк
                </Button>
              ) : (
                <Card 
                  className="px-3 py-2 bg-yellow-50 border-yellow-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setShowWalletModal(true)}
                >
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4 text-yellow-700" />
                    <span className="text-sm font-medium text-yellow-800">
                      {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                    </span>
                  </div>
                </Card>
              )}
              
              <Button
                onClick={logout}
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
}