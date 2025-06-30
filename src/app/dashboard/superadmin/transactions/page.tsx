'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Wallet,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  RefreshCw,
  CheckCircle,
  Crown,
  AlertTriangle
} from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';
import { useAdminTransactions } from '@/hooks/SuperHooks';

// Transaction interface for type safety
interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  fee?: number;
  description?: string;
  reference?: string;
  createdAt: string;
  sender?: {
    name?: string;
    email?: string;
  };
  receiver?: {
    name?: string;
    email?: string;
  };
  userName?: string;
  userEmail?: string;
  fromWallet?: string;
  toWallet?: string;
}

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export default function SuperAdminTransactions() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // Use the admin transactions hook with explicit type
  const { transactions, loading: isLoading, error } = useAdminTransactions() as { transactions: Transaction[]; loading: boolean; error: any };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'SUPER_ADMIN') {
      if (parsedUser.role === 'ADMIN') {
        router.push('/dashboard/admin');
        return;
      }
      router.push('/dashboard');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  // Refresh handler: re-fetch transactions by reloading the page
  const fetchTransactions = () => {
    setIsRefreshing(true);
    // Simulate a refresh by reloading the page (or you can refetch via SWR/mutate if using SWR)
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2000);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'TRANSFER': return ArrowUpRight;
      case 'TOPUP': return ArrowDownLeft;
      case 'WITHDRAWAL': return ArrowUpRight;
      case 'PAYMENT': return CreditCard;
      default: return DollarSign;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'TRANSFER': return 'bg-blue-500';
      case 'TOPUP': return 'bg-green-500';
      case 'WITHDRAWAL': return 'bg-orange-500';
      case 'PAYMENT': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default';
      case 'PENDING': return 'destructive';
      case 'FAILED': return 'secondary';
      case 'CANCELLED': return 'outline';
      default: return 'secondary';
    }
  };

  // Filtering logic (use transactions from hook)
  const filteredTransactions = Array.isArray(transactions) ? transactions.filter((transaction: any) => {
    const matchesSearch = (transaction.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.sender?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.receiver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.receiver?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || transaction.status === statusFilter;
    let matchesDate = true;
    if (dateFilter !== 'ALL') {
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      switch (dateFilter) {
        case 'TODAY':
          matchesDate = transactionDate.toDateString() === now.toDateString();
          break;
        case 'WEEK':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
          break;
        case 'MONTH':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= monthAgo;
          break;
      }
    }
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  }) : [];

  // Calculate stats
  const totalTransactions = filteredTransactions.length;
  const totalAmount = filteredTransactions.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
  const totalFees = filteredTransactions.reduce((sum: number, tx: any) => sum + (Number(tx.fee) || 0), 0);
  const completedTransactions = filteredTransactions.filter((tx: any) => tx.status === 'COMPLETED').length;
  const flaggedTransactions = filteredTransactions.filter((tx: any) => Number(tx.amount) > 10000 || tx.description?.includes('FLAGGED')).length;

  // Skeleton Components
  const StatsSkeleton = () => (
    <Card className="neo-brutal-card">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="w-16 h-3 mb-2" />
          <Skeleton className="w-12 h-6" />
        </div>
        <Skeleton className="w-6 h-6 sm:w-8 sm:h-8" />
      </div>
    </Card>
  );

  const TransactionSkeleton = () => (
    <Card className="neo-brutal-card">
      <div className="p-4 sm:p-6">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10" />
              <div>
                <Skeleton className="w-16 h-4 mb-1" />
                <Skeleton className="w-20 h-3" />
              </div>
            </div>
            <Skeleton className="w-12 h-5" />
          </div>
          <Skeleton className="w-full h-3 mb-2" />
          <Skeleton className="w-24 h-3 mb-3" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Skeleton className="w-8 h-3 mb-1" />
              <Skeleton className="w-16 h-3" />
            </div>
            <div>
              <Skeleton className="w-8 h-3 mb-1" />
              <Skeleton className="w-12 h-3" />
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-12 h-12" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-16 h-5" />
                  <Skeleton className="w-20 h-5" />
                </div>
                <Skeleton className="w-full h-4 mb-1" />
                <Skeleton className="w-24 h-3" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="w-16 h-6 mb-1" />
              <Skeleton className="w-12 h-3" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-gray-200">
            <div>
              <Skeleton className="w-8 h-3 mb-1" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div>
              <Skeleton className="w-16 h-3 mb-1" />
              <Skeleton className="w-24 h-4" />
            </div>
            <div>
              <Skeleton className="w-8 h-3 mb-1" />
              <Skeleton className="w-16 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-200 to-orange-200 flex items-center justify-center p-4">
        <div className="neo-brutal-card">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 font-bold uppercase text-center text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-green-200">
      {/* <Navbar user={user} onLogout={handleLogout} /> */}
      
      <div className="p-3 sm:p-4 pt-10 md:pt-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                onClick={() => router.push('/dashboard/superadmin')}
                className="neo-brutal p-2 sm:p-3 md:flex"
              >
                <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-black uppercase">All Transactions</h1>
                  <p className="font-semibold text-gray-700 text-xs sm:text-sm lg:text-base">Super Admin - Full transaction monitoring</p>
                </div>
              </div>
            </div>
            <Button
              onClick={fetchTransactions}
              disabled={isRefreshing}
              className="neo-brutal bg-blue-500 text-white font-bold py-2 px-4 text-xs sm:text-sm w-full sm:w-auto"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Success Message */}
          {refreshSuccess && (
            <Card className="neo-brutal-card neo-brutal-green mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                <p className="font-black uppercase text-sm sm:text-base">Transactions refreshed successfully!</p>
              </div>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {isLoading || false ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <StatsSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                <Card className="neo-brutal-card bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Total</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-black">{totalTransactions}</p>
                    </div>
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                  </div>
                </Card>

                <Card className="neo-brutal-card neo-brutal-green">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Amount</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-black">Rp.{totalAmount.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                  </div>
                </Card>

                <Card className="neo-brutal-card neo-brutal-orange">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Fees</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-black">Rp.{totalFees.toFixed(2)}</p>
                    </div>
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                  </div>
                </Card>

                <Card className="neo-brutal-card neo-brutal-purple">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Completed</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-black">{completedTransactions}</p>
                    </div>
                    <Wallet className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                  </div>
                </Card>

                <Card className="neo-brutal-card bg-gradient-to-br from-red-500 to-pink-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Flagged</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-black">{flaggedTransactions}</p>
                    </div>
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Filters */}
          <Card className="neo-brutal-card mb-6 sm:mb-8">
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-4 xl:gap-6">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="neo-brutal h-10 sm:h-12 font-semibold pl-8 sm:pl-10"
                    placeholder="Search transactions..."
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:col-span-3">
                {/* <Select value={typeFilter} onValueChange={setTypeFilter} disabled={isLoading}>
                  <SelectTrigger className="neo-brutal h-10 sm:h-12 font-semibold">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="TOPUP">Top-up</SelectItem>
                    <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                  </SelectContent>
                </Select> */}

                <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
                  <SelectTrigger className="neo-brutal h-10 sm:h-12 font-semibold">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter} disabled={isLoading}>
                  <SelectTrigger className="neo-brutal h-10 sm:h-12 font-semibold">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Time</SelectItem>
                    <SelectItem value="TODAY">Today</SelectItem>
                    <SelectItem value="WEEK">Last Week</SelectItem>
                    <SelectItem value="MONTH">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Transactions List */}
          <div className="space-y-4 sm:space-y-6">
            {isLoading || false ? (
              <>
                {[...Array(8)].map((_, i) => (
                  <TransactionSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                {filteredTransactions.map((transaction) => {
                  const TransactionIcon = getTransactionIcon(transaction.type);
                  const isLargeTransaction = transaction.amount > 10000;
                  const isFlagged = (transaction.description?.includes('FLAGGED') ?? false) || isLargeTransaction;
                  
                  return (
                    <Card key={transaction.id} className={`neo-brutal-card ${isFlagged ? 'border-red-500 bg-red-50' : ''}`}>
                      {/* Mobile Layout */}
                      <div className="block sm:hidden p-4">
                        {/* Flagged Transaction Warning */}
                        {isFlagged && (
                          <div className="mb-3 p-2 bg-red-100 border-2 border-red-300 rounded">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <p className="font-black uppercase text-xs text-red-800">
                                {isLargeTransaction ? 'LARGE TRANSACTION' : 'FLAGGED'}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`neo-brutal ${getTransactionColor(transaction.type)} text-white p-2`}>
                              <TransactionIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-black uppercase text-sm">{transaction.type}</h3>
                                <Badge variant={getStatusColor(transaction.status)} className="text-xs font-bold">
                                  {transaction.status}
                                </Badge>
                              </div>
                              <p className="font-semibold text-xs text-gray-600">{transaction.userName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-lg ${isLargeTransaction ? 'text-red-600' : 'text-green-600'}`}>
                              ${transaction.amount.toLocaleString()}
                            </p>
                            {transaction.fee && transaction.fee > 0 && (
                              <p className="font-semibold text-xs text-gray-600">Fee: Rp.{transaction.fee}</p>
                            )}
                          </div>
                        </div>
                        
                        <p className="font-semibold text-sm text-gray-600 mb-2">{transaction.description}</p>
                        <p className="font-mono text-xs text-gray-500 mb-3">{transaction.reference}</p>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                          <div>
                            <p className="font-bold uppercase text-gray-600">Sender</p>
                            <p className="font-semibold truncate">{transaction.sender?.name || '-'}</p>
                            <p className="text-gray-500 truncate">{transaction.sender?.email || '-'}</p>
                          </div>
                          <div>
                            <p className="font-bold uppercase text-gray-600">Receiver</p>
                            <p className="font-semibold truncate">{transaction.receiver?.name || '-'}</p>
                            <p className="text-gray-500 truncate">{transaction.receiver?.email || '-'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-bold uppercase text-gray-600">Email</p>
                            <p className="font-semibold truncate">{transaction.userEmail}</p>
                          </div>
                          <div>
                            <p className="font-bold uppercase text-gray-600">Date</p>
                            <p className="font-semibold">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                          </div>
                          {transaction.fromWallet && (
                            <div>
                              <p className="font-bold uppercase text-gray-600">From</p>
                              <p className="font-semibold truncate">{transaction.fromWallet}</p>
                            </div>
                          )}
                          {transaction.toWallet && (
                            <div>
                              <p className="font-bold uppercase text-gray-600">To</p>
                              <p className="font-semibold truncate">{transaction.toWallet}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:block p-6">
                        {/* Flagged Transaction Warning */}
                        {isFlagged && (
                          <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <p className="font-black uppercase text-sm text-red-800">
                                {isLargeTransaction ? 'LARGE TRANSACTION DETECTED' : 'FLAGGED TRANSACTION'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Main Transaction Info */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`neo-brutal ${getTransactionColor(transaction.type)} text-white p-3`}>
                              <TransactionIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-black uppercase text-base">{transaction.type}</h3>
                                <Badge variant={getStatusColor(transaction.status)} className="text-xs font-bold">
                                  {transaction.status}
                                </Badge>
                                {isFlagged && (
                                  <Badge className="bg-red-500 text-white text-xs font-bold">
                                    FLAGGED
                                  </Badge>
                                )}
                              </div>
                              <p className="font-semibold text-sm text-gray-600">{transaction.description}</p>
                              <p className="font-mono text-xs text-gray-500">{transaction.reference}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-xl ${isLargeTransaction ? 'text-red-600' : 'text-green-600'}`}>
                              Rp.{transaction.amount.toLocaleString()}
                            </p>
                            {transaction.fee && transaction.fee > 0 && (
                              <p className="font-semibold text-xs text-gray-600">Fee: ${transaction.fee}</p>
                            )}
                          </div>
                        </div>

                        {/* Additional Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-200">
                          {/* Sender Info */}
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm">Sender</p>
                              <p className="font-semibold text-xs text-gray-600 truncate">{transaction.sender?.name || '-'}</p>
                              <p className="font-semibold text-xs text-gray-500 truncate">{transaction.sender?.email || '-'}</p>
                            </div>
                          </div>
                          {/* Receiver Info */}
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm">Receiver</p>
                              <p className="font-semibold text-xs text-gray-600 truncate">{transaction.receiver?.name || '-'}</p>
                              <p className="font-semibold text-xs text-gray-500 truncate">{transaction.receiver?.email || '-'}</p>
                            </div>
                          </div>
                          {/* Date Info */}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-bold text-sm">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                              <p className="font-semibold text-xs text-gray-600">
                                {new Date(transaction.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <Card className="neo-brutal-card text-center py-8 sm:py-12">
                    <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl sm:text-2xl font-black uppercase mb-2">No Transactions Found</h3>
                    <p className="font-semibold text-gray-600 text-sm sm:text-base">
                      No transactions match your current filters.
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}