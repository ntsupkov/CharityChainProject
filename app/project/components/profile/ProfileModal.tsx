'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { User, Building, Mail, Calendar, Wallet, Edit3, Save, X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  if (!user) return null;

  const handleSave = async () => {
    try {
      const endpoint = user.role === 'fund'
        ? `http://localhost:8001/profile/fund/${user.id}`
        : `http://localhost:8001/profile/user/${user.id}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editData.name })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Ошибка обновления профиля');
      }
      // Можно обновить локальное состояние пользователя, если нужно
      setIsEditing(false);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email
    });
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-stone-800 flex items-center space-x-2">
            <User className="h-6 w-6 text-amber-600" />
            <span>Профиль пользователя</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Основная информация */}
          <Card className="bg-gradient-to-r from-amber-50 to-stone-50 border-stone-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-stone-800">Основная информация</CardTitle>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Имя</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-white rounded-md border border-stone-200">
                      {user.name}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-white rounded-md border border-stone-200 flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-stone-500" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Тип аккаунта</Label>
                  <div className="mt-1 p-2 bg-white rounded-md border border-stone-200 flex items-center space-x-2">
                    {user.role === 'fund' ? (
                      <Building className="h-4 w-4 text-amber-600" />
                    ) : (
                      <User className="h-4 w-4 text-amber-600" />
                    )}
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                      {user.role === 'fund' ? 'Фонд' : 'Жертвователь'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label>Дата регистрации</Label>
                  <div className="mt-1 p-2 bg-white rounded-md border border-stone-200 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-stone-500" />
                    <span>{user.registration_date ? new Date(user.registration_date).toLocaleDateString('ru-RU') : ''}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Информация о кошельке */}
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg text-stone-800 flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-amber-600" />
                <span>Кошелёк</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label>Адрес кошелька</Label>
                  <div className="mt-1 p-3 bg-white rounded-md border border-amber-200 font-mono text-sm">
                    {user.walletAddress || '0x0000...DEMO'}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-amber-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Кошелёк подключен</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card className="bg-gradient-to-r from-stone-50 to-neutral-50 border-stone-200">
            <CardHeader>
              <CardTitle className="text-lg text-stone-800">Статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {user.role === 'fund' ? (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-stone-800">2</div>
                      <div className="text-sm text-stone-600">Сборов создано</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-stone-800">5.6</div>
                      <div className="text-sm text-stone-600">ETH собрано</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-stone-800">42</div>
                      <div className="text-sm text-stone-600">NFT выдано</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-stone-800">15</div>
                      <div className="text-sm text-stone-600">Жертвователей</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-stone-800">0.1</div>
                      <div className="text-sm text-stone-600">ETH пожертвовано</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-stone-800">1</div>
                      <div className="text-sm text-stone-600">Проектов поддержано</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-stone-800">5</div>
                      <div className="text-sm text-stone-600">NFT получено</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-stone-800">3</div>
                      <div className="text-sm text-stone-600">Редких NFT</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}