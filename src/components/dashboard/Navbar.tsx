import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  CreditCard, 
  Menu, 
  X, 
  Home, 
  Send, 
  Settings, 
  Users, 
  Shield,
  LogOut,
  Wallet,
  Plus,
  Target,
  Crown,
  Eye
} from 'lucide-react';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b-2 border-black dark:border-white">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="neo-brutal bg-black dark:bg-white text-white dark:text-black p-2">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-lg font-black uppercase tracking-wider dark:text-white">MBank</span>
          </Link>

          {/* Theme Toggle and Menu Button */}
          <div className="flex items-center space-x-2">
            {/* <ThemeToggle /> */}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="neo-brutal bg-white dark:bg-gray-700 dark:text-white p-2"
              size="sm"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b-2 border-black dark:border-white shadow-lg">
            <div className="p-4 space-y-3">
              {/* User Info */}
              <Card className="neo-brutal-card bg-gray-50 dark:bg-gray-700 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getRoleBadgeColor(user.role)} text-white`}>
                      <RoleIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-black uppercase text-sm truncate dark:text-white">{user.name}</div>
                      <div className="font-semibold text-xs text-gray-600 dark:text-gray-300 truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getRoleBadgeColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </Card>

              {/* Menu Items */}
              <div className="space-y-2">
                {filteredMenuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 font-bold uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm border-2 border-gray-200 dark:border-gray-600 dark:text-white"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Logout Button */}
              <Button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="neo-brutal bg-red-500 dark:bg-red-600 text-white w-full font-bold py-3 uppercase tracking-wider"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}