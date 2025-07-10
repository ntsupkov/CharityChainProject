'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, Building, User } from 'lucide-react';
import { UserRole } from '@/types';

export default function AuthForm() {
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor' as UserRole
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(loginData.email, loginData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(registerData.name, registerData.email, registerData.password, registerData.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-stone-50 to-neutral-50 p-4">
      <Card className="w-full max-w-md shadow-lg bg-white/90 backdrop-blur-sm border-stone-200">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-amber-600" />
          </div>
          <CardTitle className="text-2xl text-stone-800">CharityChain</CardTitle>
          <CardDescription className="text-stone-600">
            Блокчейн-платформа для благотворительности
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Войти</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
                  disabled={loading}
                >
                  {loading ? 'Входим...' : 'Войти'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reg-password">Пароль</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Тип аккаунта</Label>
                  <RadioGroup
                    value={registerData.role}
                    onValueChange={(value) => setRegisterData({...registerData, role: value as UserRole})}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="donor" id="donor" />
                      <Label htmlFor="donor" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Жертвователь</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fund" id="fund" />
                      <Label htmlFor="fund" className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>Фонд</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
                  disabled={loading}
                >
                  {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Демо-аккаунты:
            </p>
            <div className="mt-2 text-xs text-stone-500">
              <p>Фонд: animals@charity.ru</p>
              <p>Жертвователь: alex@example.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}