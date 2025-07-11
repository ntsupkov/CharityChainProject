'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Layout from '@/components/Layout';
import FundDashboard from '@/components/fund/FundDashboard';
import DonorDashboard from '@/components/donor/DonorDashboard';


export default function Home() {
  const { user } = useAuth();

  useEffect(() => {
    // Запрос разрешения на push-уведомления
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center gap-4">
        {user.role === 'fund' ? <FundDashboard /> : <DonorDashboard />}
      </div>
    </Layout>
  );
}
