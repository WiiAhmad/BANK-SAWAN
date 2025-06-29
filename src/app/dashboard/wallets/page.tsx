'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Wallet,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface Wallet {
  id: string;
  name: string;
  type: 'main' | 'secondary';
  balance: number;
  currency: string;
  color: string;
  createdAt: string;
  transactions: number;
  description?: string;
}

interface Transaction {
  id: string;
  walletId: string;
  type: 'in' | 'out';
  amount: number;
  description: string;
  date: string;
}

interface WalletFormData {
  name: string;
  description: string;
  type: 'main' | 'secondary';
  color: string;
}

export default function Wallets() {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    email: 'user@example.com',
    name: 'John Doe',
    role: 'USER'
  });
  
  const [wallets, setWallets] = useState<Wallet[]>([
    { 
      id: '1', 
      name: 'Main Wallet', 
      type: 'main', 
      balance: 8345.67, 
      currency: 'USD', 
      color: 'bg-indigo-500',
      createdAt: '2024-01-15',
      transactions: 156,
      description: 'Primary wallet for daily transactions'
    },
    { 
      id: '2', 
      name: 'Savings Wallet', 
      type: 'secondary', 
      balance: 4000.00, 
      currency: 'USD', 
      color: 'bg-emerald-500',
      createdAt: '2024-02-01',
      transactions: 23,
      description: 'Long-term savings and emergency fund'
    },
    { 
      id: '3', 
      name: 'Investment Wallet', 
      type: 'secondary', 
      balance: 2500.50, 
      currency: 'USD', 
      color: 'bg-violet-500',
      createdAt: '2024-02-15',
      transactions: 45,
      description: 'Investment portfolio and trading funds'
    },
    { 
      id: '4', 
      name: 'Emergency Fund', 
      type: 'secondary', 
      balance: 1500.00, 
      currency: 'USD', 
      color: 'bg-rose-500',
      createdAt: '2024-03-01',
      transactions: 12,
      description: 'Emergency expenses and unexpected costs'
    },
  ]);

  const [newWallet, setNewWallet] = useState<WalletFormData>({
    name: '',
    description: '',
    type: 'secondary',
    color: 'bg-indigo-500'
  });
  
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [editWalletData, setEditWalletData] = useState<WalletFormData>({
    name: '',
    description: '',
    type: 'secondary',
    color: 'bg-indigo-500'
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const recentTransactions: Transaction[] = [
    { id: '1', walletId: '1', type: 'in', amount: 1250, description: 'Salary Deposit', date: '2024-03-15' },
    { id: '2', walletId: '2', type: 'out', amount: 500, description: 'Transfer to Investment', date: '2024-03-14' },
    { id: '3', walletId: '3', type: 'in', amount: 500, description: 'From Savings', date: '2024-03-14' },
    { id: '4', walletId: '1', type: 'out', amount: 89, description: 'Coffee Shop', date: '2024-03-13' },
  ];

  const colorOptions = [
    { value: 'bg-indigo-500', label: 'Indigo', color: 'bg-indigo-500' },
    { value: 'bg-emerald-500', label: 'Emerald', color: 'bg-emerald-500' },
    { value: 'bg-violet-500', label: 'Violet', color: 'bg-violet-500' },
    { value: 'bg-rose-500', label: 'Rose', color: 'bg-rose-500' },
    { value: 'bg-amber-500', label: 'Amber', color: 'bg-amber-500' },
    { value: 'bg-cyan-500', label: 'Cyan', color: 'bg-cyan-500' },
    { value: 'bg-pink-500', label: 'Pink', color: 'bg-pink-500' },
    { value: 'bg-teal-500', label: 'Teal', color: 'bg-teal-500' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const fetchWallets = async () => {
    setIsFetching(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsFetching(false);
      showSuccessMessage('Wallets refreshed successfully');
    }, 1000);
  };

  const showSuccessMessage = (message: string) => {
    setActionSuccess(message);
    setTimeout(() => {
      setActionSuccess('');
    }, 3000);
  };

  const handleCreateWallet = () => {
    if (!newWallet.name.trim()) return;

    const wallet: Wallet = {
      id: Date.now().toString(),
      name: newWallet.name,
      type: newWallet.type,
      balance: 0,
      currency: 'USD',
      color: newWallet.color,
      createdAt: new Date().toISOString().split('T')[0],
      transactions: 0,
      description: newWallet.description
    };

    setWallets([...wallets, wallet]);
    setNewWallet({ name: '', description: '', type: 'secondary', color: 'bg-indigo-500' });
    setIsCreateDialogOpen(false);
    showSuccessMessage('Wallet created successfully');
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setEditWalletData({
      name: wallet.name,
      description: wallet.description || '',
      type: wallet.type,
      color: wallet.color
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateWallet = () => {
    if (!editingWallet || !editWalletData.name.trim()) return;

    setWallets(prev => prev.map(wallet => 
      wallet.id === editingWallet.id 
        ? { 
            ...wallet, 
            name: editWalletData.name,
            description: editWalletData.description,
            color: editWalletData.color
          }
        : wallet
    ));

    setIsEditDialogOpen(false);
    setEditingWallet(null);
    showSuccessMessage('Wallet updated successfully');
  };

  const handleDeleteWallet = (wallet: Wallet) => {
    setWalletToDelete(wallet);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteWallet = () => {
    if (!walletToDelete) return;

    setWallets(prev => prev.filter(wallet => wallet.id !== walletToDelete.id));
    setIsDeleteDialogOpen(false);
    setWalletToDelete(null);
    showSuccessMessage('Wallet deleted successfully');
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const mainWallet = wallets.find(w => w.type === 'main');
  const secondaryWallets = wallets.filter(w => w.type === 'secondary');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="p-4 pt-20 md:pt-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="neo-brutal bg-white dark:bg-gray-700 dark:text-white p-2 sm:p-3"
              >
                <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase dark:text-white">My Wallets</h1>
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">Manage all your wallets in one place</p>
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-3">
              <Button
                onClick={fetchWallets}
                disabled={isFetching}
                className="neo-brutal-refresh font-bold py-2 px-3 sm:px-4 text-xs sm:text-sm"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="neo-brutal-button">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Create Wallet
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white max-w-md mx-auto p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-black uppercase dark:text-white">Create New Wallet</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Wallet Name</Label>
                      <Input
                        value={newWallet.name}
                        onChange={(e) => setNewWallet({...newWallet, name: e.target.value})}
                        className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white"
                        placeholder="Enter wallet name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Description</Label>
                      <Textarea
                        value={newWallet.description}
                        onChange={(e) => setNewWallet({...newWallet, description: e.target.value})}
                        className="border-2 border-black dark:border-white font-semibold min-h-[80px] dark:bg-gray-700 dark:text-white"
                        placeholder="Enter wallet description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Wallet Type</Label>
                      <Select value={newWallet.type} onValueChange={(value: 'main' | 'secondary') => setNewWallet({...newWallet, type: value})}>
                        <SelectTrigger className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="secondary">Secondary Wallet</SelectItem>
                          <SelectItem value="main" disabled={mainWallet !== undefined}>Main Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Color</Label>
                      <div className="grid grid-cols-4 gap-2 sm:gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setNewWallet({...newWallet, color: color.value})}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded border-2 sm:border-4 ${color.color} ${
                              newWallet.color === color.value ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-600'
                            } transition-all hover:scale-105`}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-gray-400 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateWallet}
                        disabled={!newWallet.name.trim()}
                        className="bg-indigo-500 dark:bg-indigo-600 text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-indigo-600 dark:hover:bg-indigo-700"
                      >
                        Create Wallet
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Success Message */}
          {actionSuccess && (
            <Card className="neo-brutal-card neo-brutal-emerald mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-700 dark:text-emerald-300" />
                <p className="font-black uppercase text-sm sm:text-base text-emerald-800 dark:text-emerald-200">{actionSuccess}</p>
              </div>
            </Card>
          )}

          {/* Overview Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="neo-brutal-card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1">Total Balance</p>
                  <p className="text-2xl sm:text-3xl font-black">${totalBalance.toFixed(2)}</p>
                </div>
                <Wallet className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            </Card>

            <Card className="neo-brutal-card neo-brutal-emerald">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1 text-emerald-800 dark:text-emerald-200">Active Wallets</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-100">{wallets.length}</p>
                </div>
                <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-800 dark:text-emerald-200" />
              </div>
            </Card>

            <Card className="neo-brutal-card neo-brutal-amber sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1 text-amber-800 dark:text-amber-200">This Month</p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-100">+12.5%</p>
                </div>
                <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-amber-800 dark:text-amber-200" />
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Wallets List */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Main Wallet */}
              {mainWallet && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase mb-4 dark:text-white">Main Wallet</h2>
                  <Card className="neo-brutal-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${mainWallet.color} flex items-center justify-center`}>
                          <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black uppercase text-base sm:text-lg dark:text-white">{mainWallet.name}</h3>
                          <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">{mainWallet.transactions} transactions</p>
                          {mainWallet.description && (
                            <p className="font-semibold text-xs text-gray-500 dark:text-gray-500 mt-1">{mainWallet.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="text-right">
                          <p className="text-xl sm:text-2xl font-black dark:text-white">${mainWallet.balance.toFixed(2)}</p>
                          <p className="font-semibold text-xs sm:text-sm text-gray-600 dark:text-gray-400">{mainWallet.currency}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Button
                            onClick={() => handleEditWallet(mainWallet)}
                            variant="ghost"
                            size="sm"
                            className="p-2 h-8 w-8 dark:text-white dark:hover:bg-gray-700"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Secondary Wallets */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase mb-4 dark:text-white">Secondary Wallets</h2>
                <div className="space-y-3 sm:space-y-4">
                  {secondaryWallets.map((wallet) => (
                    <Card key={wallet.id} className="neo-brutal-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${wallet.color} flex items-center justify-center`}>
                            <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-black uppercase text-sm sm:text-base dark:text-white">{wallet.name}</h3>
                            <p className="font-semibold text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{wallet.transactions} transactions</p>
                            {wallet.description && (
                              <p className="font-semibold text-xs text-gray-500 dark:text-gray-500 mt-1">{wallet.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="text-right">
                            <p className="text-lg sm:text-xl font-black dark:text-white">${wallet.balance.toFixed(2)}</p>
                            <p className="font-semibold text-xs sm:text-sm text-gray-600 dark:text-gray-400">{wallet.currency}</p>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Button
                              onClick={() => handleEditWallet(wallet)}
                              variant="ghost"
                              size="sm"
                              className="p-2 h-8 w-8 dark:text-white dark:hover:bg-gray-700"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteWallet(wallet)}
                              variant="ghost"
                              size="sm"
                              className="p-2 h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="neo-brutal-card neo-brutal-sky">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-black uppercase text-sky-800 dark:text-sky-200">Recent Activity</h3>
                  <Button
                    onClick={fetchWallets}
                    variant="ghost"
                    size="sm"
                    className="p-2 text-sky-800 dark:text-sky-200 hover:bg-sky-200 dark:hover:bg-sky-700"
                  >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {recentTransactions.map((transaction) => {
                    const wallet = wallets.find(w => w.id === transaction.walletId);
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-2 sm:p-3 border-2 border-sky-300 dark:border-sky-600 rounded">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className={`p-1 sm:p-2 border-2 border-black dark:border-white ${
                            transaction.type === 'in' ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-rose-400 dark:bg-rose-500'
                          }`}>
                            {transaction.type === 'in' ? (
                              <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-sky-800 dark:text-sky-200">{transaction.description}</p>
                            <p className="font-semibold text-xs text-sky-600 dark:text-sky-400">{wallet?.name}</p>
                          </div>
                        </div>
                        <p className={`font-black text-xs sm:text-sm ${
                          transaction.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {transaction.type === 'in' ? '+' : '-'}${transaction.amount}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          {/* Edit Wallet Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white max-w-md mx-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-black uppercase dark:text-white">Edit Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Wallet Name</Label>
                  <Input
                    value={editWalletData.name}
                    onChange={(e) => setEditWalletData({...editWalletData, name: e.target.value})}
                    className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white"
                    placeholder="Enter wallet name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Description</Label>
                  <Textarea
                    value={editWalletData.description}
                    onChange={(e) => setEditWalletData({...editWalletData, description: e.target.value})}
                    className="border-2 border-black dark:border-white font-semibold min-h-[80px] dark:bg-gray-700 dark:text-white"
                    placeholder="Enter wallet description"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Color</Label>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setEditWalletData({...editWalletData, color: color.value})}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded border-2 sm:border-4 ${color.color} ${
                          editWalletData.color === color.value ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-600'
                        } transition-all hover:scale-105`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setIsEditDialogOpen(false)}
                    className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-gray-400 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateWallet}
                    disabled={!editWalletData.name.trim()}
                    className="bg-indigo-500 dark:bg-indigo-600 text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-indigo-600 dark:hover:bg-indigo-700"
                  >
                    Update Wallet
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white max-w-md mx-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-red-600 dark:text-red-400">Delete Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-bold text-sm dark:text-white">Are you sure you want to delete this wallet?</p>
                    <p className="font-semibold text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {walletToDelete?.name} - ${walletToDelete?.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                  This action cannot be undone. All transaction history will be permanently deleted.
                </p>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-gray-400 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteWallet}
                    className="bg-red-500 dark:bg-red-600 text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-red-600 dark:hover:bg-red-700"
                  >
                    Delete Wallet
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}