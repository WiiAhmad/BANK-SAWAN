'use client';

import { useEffect, useState } from 'react';
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
import { useUserTransactions } from '@/hooks/UserData';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface Wallet {
  id: string;
  name: string;
  description?: string;
  balance: number;
  currency: string;
  walletType?: string;
  createdAt: string;
}

// Add Transaction type for correct typing
interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  senderWalletId?: string;
  receiverWalletId?: string;
  amount: string;
  currency: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export default function Wallets() {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    email: 'user@example.com',
    name: 'John Doe',
    role: 'USER',
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [newWallet, setNewWallet] = useState({ name: '', description: '', walletType: 'SECONDARY' });
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [editWalletData, setEditWalletData] = useState({ name: '', description: '', walletType: 'SECONDARY' });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const { transactions: userTransactions } = useUserTransactions() as { transactions: Transaction[] };

  // Fetch all wallets from API
  const fetchWallets = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/user/wallets', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setWallets(data);
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleCreateWallet = async () => {
    if (!newWallet.name.trim()) return;
    const res = await fetch('/api/user/wallets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: newWallet.name, description: newWallet.description, walletType: newWallet.walletType }),
    });
    if (res.ok) {
      setIsCreateDialogOpen(false);
      setNewWallet({ name: '', description: '', walletType: 'SECONDARY' });
      fetchWallets();
      setActionSuccess('Wallet created successfully');
    }
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setEditWalletData({ name: wallet.name, description: wallet.description || '', walletType: wallet.walletType || 'SECONDARY' });
    setIsEditDialogOpen(true);
  };

  const handleUpdateWallet = async () => {
    if (!editingWallet || !editWalletData.name.trim()) return;
    const res = await fetch(`/api/user/wallets/${editingWallet.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: editWalletData.name, description: editWalletData.description, walletType: editWalletData.walletType }),
    });
    if (res.ok) {
      setIsEditDialogOpen(false);
      setEditingWallet(null);
      fetchWallets();
      setActionSuccess('Wallet updated successfully');
    }
  };

  const handleDeleteWallet = (wallet: Wallet) => {
    setWalletToDelete(wallet);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteWallet = async () => {
    if (!walletToDelete) return;
    const res = await fetch(`/api/user/wallets/${walletToDelete.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setIsDeleteDialogOpen(false);
      setWalletToDelete(null);
      fetchWallets();
      setActionSuccess('Wallet deleted successfully');
    }
  };

  // Calculate total balance and active wallets (exclude SAVINGS wallets)
  const activeWallets = wallets.filter(w => w.walletType === 'MAIN' || w.walletType === 'SECONDARY').length;
  const totalBalance = wallets
    .filter(w => w.walletType === 'MAIN' || w.walletType === 'SECONDARY')
    .reduce((sum, wallet) => sum + Number(wallet.balance), 0);
  // Find main, secondary, and savings wallets
  const mainWallet = wallets.find(w => w.walletType === 'MAIN');
  const secondaryWallets = wallets.filter(w => w.walletType === 'SECONDARY');
  const savingsWallets = wallets.filter(w => w.walletType === 'SAVINGS');

  // For recent transactions, show only those related to user's wallets
  const walletIds = wallets.map(w => w.id);
  const filteredTransactions = userTransactions
    .filter(tx => (tx.senderWalletId && walletIds.includes(tx.senderWalletId)) || (tx.receiverWalletId && walletIds.includes(tx.receiverWalletId)))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600">
      <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); router.push('/'); }} />
      
      <div className="p-4 pt-20 md:pt-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="neo-brutal dark:bg-gray-700 dark:text-white p-2 sm:p-3"
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
                      <Select value={newWallet.walletType} onValueChange={(value: 'SECONDARY') => setNewWallet({...newWallet, walletType: value})}>
                        <SelectTrigger className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SECONDARY">Secondary Wallet</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <p className="text-2xl sm:text-3xl font-black">{`Rp. ${totalBalance.toLocaleString('id-ID')}`}</p>
                </div>
                <Wallet className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            </Card>

            <Card className="neo-brutal-card neo-brutal-emerald">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1 text-emerald-800 dark:text-emerald-200">Active Wallets</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-100">{activeWallets}</p>
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
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-500 flex items-center justify-center`}>
                          <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black uppercase text-base sm:text-lg dark:text-white">{mainWallet.name}</h3>
                          {/* Removed transactions count */}
                          {mainWallet.description && (
                            <p className="font-semibold text-xs text-gray-500 dark:text-gray-500 mt-1">{mainWallet.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="text-right">
                          <p className="text-xl sm:text-2xl font-black dark:text-white">{`Rp. ${Number(mainWallet.balance).toLocaleString('id-ID')}`}</p>
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
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-500 flex items-center justify-center`}>
                            <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-black uppercase text-sm sm:text-base dark:text-white">{wallet.name}</h3>
                            {/* Removed transactions count */}
                            {wallet.description && (
                              <p className="font-semibold text-xs text-gray-500 dark:text-gray-500 mt-1">{wallet.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="text-right">
                            <p className="text-lg sm:text-xl font-black dark:text-white">{`Rp. ${Number(wallet.balance).toLocaleString('id-ID')}`}</p>
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
                  {filteredTransactions.slice(0, 5).map((transaction) => {
                    const wallet = wallets.find(w => w.id === transaction.senderWalletId || w.id === transaction.receiverWalletId);
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-2 sm:p-3 border-2 border-sky-300 dark:border-sky-600 rounded">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className={`p-1 sm:p-2 border-2 border-black dark:border-white ${
                            transaction.status === 'COMPLETED' && transaction.senderWalletId === wallet?.id ? 'bg-rose-400 dark:bg-rose-500' : 'bg-emerald-400 dark:bg-emerald-500'
                          }`}>
                            {transaction.senderWalletId === wallet?.id ? (
                              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-sky-800 dark:text-sky-200">{transaction.description}</p>
                            <p className="font-semibold text-xs text-sky-600 dark:text-sky-400">{wallet?.name}</p>
                          </div>
                        </div>
                        <p className={`font-black text-xs sm:text-sm ${
                          transaction.senderWalletId === wallet?.id ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {transaction.senderWalletId === wallet?.id ? '-' : '+'}{Number(transaction.amount).toLocaleString()} {transaction.currency}
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
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Wallet Type</Label>
                  <Select value={editWalletData.walletType} onValueChange={(value: 'MAIN' | 'SECONDARY') => setEditWalletData({...editWalletData, walletType: value})}>
                    <SelectTrigger className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SECONDARY">Secondary Wallet</SelectItem>
                      <SelectItem value="MAIN" disabled={mainWallet !== undefined}>Main Wallet</SelectItem>
                    </SelectContent>
                  </Select>
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
                      {walletToDelete?.name} - {walletToDelete ? `Rp. ${Number(walletToDelete.balance).toLocaleString('id-ID')}` : ''}
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