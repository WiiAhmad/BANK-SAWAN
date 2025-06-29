'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import DashboardContent from '@/components/dashboard/DashboardContent';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 dark:from-gray-800 dark:to-gray-600 flex items-center justify-center p-4">
        <div className="neo-brutal-card">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-black dark:border-white mx-auto"></div>
          <p className="mt-4 font-bold uppercase text-center text-sm sm:text-base dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600">
      {/* Mobile Navbar */}
      <Navbar user={user} onLogout={handleLogout} />
      
      {/* Desktop Sidebar */}
      <Sidebar 
        user={user} 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <main className={`transition-all duration-300 pt-16 md:pt-0 ${
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'
      }`}>
        <DashboardContent user={user} />
      </main>
    </div>
  );
}