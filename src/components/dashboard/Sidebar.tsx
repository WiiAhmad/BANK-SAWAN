'use client';

import Link from 'next/link';
import { 
  CreditCard, 
  Home, 
  Send, 
  Settings, 
  Users, 
  Shield,
  LogOut,
  Wallet,
  Plus,
  ChevronLeft,
  ChevronRight,
  Target,
  Crown,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { ThemeToggle } from '@/components/ui/theme-toggle';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface SidebarProps {
  user: User;
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function Sidebar({ user, collapsed, onToggle, onLogout }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { icon: Wallet, label: 'Wallets', href: '/dashboard/wallets', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { icon: Target, label: 'Savings Goals', href: '/dashboard/savings', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { icon: Send, label: 'Transfer', href: '/dashboard/transfer', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { icon: Plus, label: 'Top Up', href: '/dashboard/topup', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { icon: Shield, label: 'Admin Panel', href: '/dashboard/admin', roles: ['ADMIN'] },
    { icon: Crown, label: 'Super Admin', href: '/dashboard/superadmin', roles: ['SUPER_ADMIN'] },
    { icon: Eye, label: 'All Transactions', href: '/dashboard/superadmin/transactions', roles: ['SUPER_ADMIN'] },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-500';
      case 'ADMIN':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return Crown;
      case 'ADMIN':
        return Shield;
      default:
        return CreditCard;
    }
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className={`hidden md:block fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r-2 sm:border-r-4 border-black dark:border-white transition-all duration-300 z-40 ${
        collapsed ? 'w-16 sm:w-20' : 'w-64 sm:w-80'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 sm:p-6 border-b-2 sm:border-b-4 border-black dark:border-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="neo-brutal bg-black dark:bg-white text-white dark:text-black p-2 sm:p-3">
                  <CreditCard className="h-5 w-5 sm:h-8 sm:w-8" />
                </div>
                {!collapsed && (
                  <span className="text-lg sm:text-2xl font-black uppercase tracking-wider dark:text-white">MBank</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {/* {!collapsed && <ThemeToggle />} */}
                <Button
                  onClick={onToggle}
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                >
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </div>
            </div>
            {collapsed && (
              <div className="mt-3 flex justify-center">
                {/* <ThemeToggle /> */}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-6">
            <ul className="space-y-2 sm:space-y-4">
              {filteredMenuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 font-bold uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm rounded dark:text-white ${
                      collapsed ? 'justify-center' : ''
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-3 sm:p-6 border-t-2 sm:border-t-4 border-black dark:border-white">
            {!collapsed && (
              <Card className="neo-brutal-card bg-gray-50 dark:bg-gray-700">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="font-bold text-xs sm:text-sm dark:text-white">Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded-full ${getRoleBadgeColor(user.role)} text-white`}>
                      <RoleIcon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black uppercase text-xs sm:text-sm truncate dark:text-white">{user.name}</div>
                      <div className="font-semibold text-xs text-gray-600 dark:text-gray-300 truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getRoleBadgeColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                    <Button
                      onClick={onLogout}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 dark:text-white dark:hover:bg-gray-600"
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            {collapsed && (
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${getRoleBadgeColor(user.role)} flex items-center justify-center`}>
                  <RoleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 dark:text-white dark:hover:bg-gray-600"
                  title="Logout"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}