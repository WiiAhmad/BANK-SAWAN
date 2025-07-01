import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Wallet,
  RefreshCw,
  CheckCircle,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAllWallets, useAllSavings, useAllTransactions } from '../../hooks/UserData';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface DashboardContentProps {
  user: User;
}

interface Transaction {
  id: number;
  type: 'received' | 'sent';
  amount: number;
  from?: string;
  to?: string;
  time: string;
  description?: string;
}

interface Wallet {
  id: string;
  name: string;
  type: 'main' | 'secondary';
  balance: number;
  color: string;
  walletNumber?: string; // Add walletNumber to Wallet interface
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  color: string;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  // Fetch data from hooks
  const { wallets: apiWallets, loading: walletsLoading, refetch: refetchWallets } = useAllWallets();
  const { savings: apiSavings, loading: savingsLoading, refetch: refetchSavings } = useAllSavings();
  const { transactions: apiTransactions, loading: txLoading, refetch: refetchTransactions } = useAllTransactions();

  // Add local refreshing state
  const [refreshing, setRefreshing] = useState(false);

  // Map API data to local Wallet type (limit 3)
  const wallets: Wallet[] = (apiWallets || []).slice(0, 3).map((w: any) => ({
    id: w.id,
    name: w.name,
    type: w.walletType === 'MAIN' ? 'main' : 'secondary',
    balance: Number(w.balance),
    color: w.walletType === 'MAIN' ? 'bg-indigo-500' : w.walletType === 'SAVINGS' ? 'bg-emerald-500' : 'bg-violet-500',
    walletNumber: w.walletNumber || w.number || '', // Add wallet number if available
  }));

  // Map API data to local SavingsGoal type (limit 3)
  const savingsGoals: SavingsGoal[] = (apiSavings || [])
    .filter((s: any) => s.status !== 'COMPLETED') // Exclude COMPLETED goals
    .slice(0, 2)
    .map((s: any) => ({
      id: s.id,
      name: s.title,
      targetAmount: Number(s.goalAmount),
      currentAmount: Number(s.currentAmount),
      targetDate: s.targetDate,
      category: s.category || '',
      color: 'bg-blue-500', // You can map category to color if needed
    }));

  // Map API data to local Transaction type (limit 5)
  const userId = (user as any).id || '';
  const transactions: Transaction[] = (apiTransactions || []).slice(0, 5).map((t: any) => ({
    id: t.id,
    type: t.senderId === t.receiverId ? 'received' : (t.senderId === userId ? 'sent' : 'received'),
    amount: Number(t.amount),
    from: t.sender?.name || '',
    to: t.receiver?.name || '',
    time: new Date(t.createdAt).toLocaleString(),
    description: t.description || '',
  }));

  // Use loading state for skeletons
  const isRefreshing = walletsLoading || savingsLoading || txLoading || refreshing;

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      // Await all refetches in parallel if available
      await Promise.all([
        refetchWallets?.(),
        refetchSavings?.(),
        refetchTransactions?.(),
      ]);
    } catch (e) {
      // Optionally handle error
    } finally {
      setRefreshing(false);
    }
  };

  const mainWallet = wallets.find(w => w.type === 'main');
  const secondaryWallets = wallets.filter(w => w.type === 'secondary');
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  // Calculate savings goals stats
  const totalSavingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSavingsCurrent = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const savingsProgress = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0;

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const WalletSkeleton = () => (
    <Card className="neo-brutal-card">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
        <Skeleton className="w-16 h-4 rounded" />
      </div>
      <Skeleton className="w-20 h-3 mb-1" />
      <Skeleton className="w-24 h-5" />
    </Card>
  );

  const TransactionSkeleton = () => (
    <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 border-2 border-gray-200 dark:border-gray-600">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-black dark:border-white" />
        <div>
          <Skeleton className="w-24 h-3 mb-1" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <Skeleton className="w-12 h-4" />
    </div>
  );

  const SavingsGoalSkeleton = () => (
    <Card className="neo-brutal-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div>
            <Skeleton className="w-20 h-4 mb-1" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <Skeleton className="w-12 h-4" />
      </div>
      <div className="mb-2">
        <Skeleton className="w-full h-3 rounded" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-12 h-3" />
      </div>
    </Card>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
      {/* Header with proper margins */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 lg:mb-10 space-y-4 sm:space-y-0">
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black uppercase leading-tight dark:text-white">
            {getWelcomeMessage()}, {user.name.split(' ')[0]}!
          </h1>
          <p className="font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm md:text-base">
            Here's what's happening with your account today.
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          disabled={isRefreshing}
          className="neo-brutal-refresh py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm"
        >
          <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards - Improved responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {isRefreshing ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="neo-brutal-card">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="w-16 h-3 mb-1" />
                    <Skeleton className="w-20 h-5" />
                  </div>
                  <Skeleton className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="neo-brutal-card neo-brutal-emerald">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1 text-emerald-800 dark:text-emerald-200">Total Balance</p>
                  <p className="text-sm sm:text-lg lg:text-xl font-black text-emerald-900 dark:text-emerald-100">Rp. {totalBalance.toLocaleString()}</p>
                </div>
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-emerald-800 dark:text-emerald-200" />
              </div>
            </Card>

            <Card className="neo-brutal-card neo-brutal-amber">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1 text-amber-800 dark:text-amber-200">Monthly Income</p>
                  <p className="text-sm sm:text-lg lg:text-xl font-black text-amber-900 dark:text-amber-100">Rp. 4,250</p>
                </div>
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-amber-800 dark:text-amber-200" />
              </div>
            </Card>

            <Card className="neo-brutal-card neo-brutal-violet">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1 text-violet-800 dark:text-violet-200">Monthly Spending</p>
                  <p className="text-sm sm:text-lg lg:text-xl font-black text-violet-900 dark:text-violet-100">Rp. 1,875</p>
                </div>
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-violet-800 dark:text-violet-200" />
              </div>
            </Card>

            <Card className="neo-brutal-card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1">Savings Goal</p>
                  <p className="text-sm sm:text-lg lg:text-xl font-black">{savingsProgress.toFixed(0)}%</p>
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        {/* Wallet Overview */}
        <div className="lg:col-span-2 xl:col-span-2">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase dark:text-white">My Wallets</h2>
            <Link href="/dashboard/wallets">
              <Button className="neo-brutal-view-all font-bold text-xs sm:text-sm py-2 px-3 sm:px-4">View All</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Main Wallet */}
            {isRefreshing ? (
              <Card className="neo-brutal-card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/30" />
                  <Skeleton className="w-10 h-3 rounded bg-white/30" />
                </div>
                <Skeleton className="w-16 h-3 mb-1 bg-white/30" />
                <Skeleton className="w-20 h-4 bg-white/30" />
              </Card>
            ) : mainWallet && (
              <Card className="neo-brutal-card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${mainWallet.color} flex items-center justify-center`}>
                    <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase bg-white/20 px-2 py-1 rounded">Main</span>
                </div>
                <p className="font-bold uppercase text-xs sm:text-sm mb-1">{mainWallet.name}</p>
                <p className="text-sm sm:text-lg lg:text-xl font-black">Rp. {mainWallet.balance.toLocaleString()}</p>
                {mainWallet.walletNumber && (
                  <p className="font-bold sm:text-sm font-mono mt-1">{mainWallet.walletNumber}</p>
                )}
              </Card>
            )}

            {/* Secondary Wallets */}
            {isRefreshing ? (
              <>
                <WalletSkeleton />
                <WalletSkeleton />
              </>
            ) : (
              secondaryWallets.slice(0, 2).map((wallet) => (
                <Card key={wallet.id} className="neo-brutal-card neo-brutal-cyan">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${wallet.color} flex items-center justify-center`}>
                      <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase bg-cyan-600 dark:bg-cyan-700 text-white px-2 py-1 rounded">Secondary</span>
                  </div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1 text-cyan-800 dark:text-cyan-200">{wallet.name}</p>
                  <p className="text-sm sm:text-lg lg:text-xl font-black text-cyan-900 dark:text-cyan-100">Rp. {wallet.balance.toLocaleString()}</p>
                  {wallet.walletNumber && (
                    <p className="font-bold sm:text-sm text-cyan-700 dark:text-cyan-200 font-mono mt-1">{wallet.walletNumber}</p>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase mb-3 sm:mb-4 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link href="/dashboard/transfer">
                <Button className="neo-brutal neo-brutal-button h-14 sm:h-16 lg:h-20 flex-col space-y-1 sm:space-y-2 w-full">
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <span className="text-xs sm:text-sm">Send Money</span>
                </Button>
              </Link>
              <Link href="/dashboard/topup">
                <Button className="neo-brutal bg-rose-500 dark:bg-rose-600 text-white font-bold h-14 sm:h-16 lg:h-20 flex-col space-y-1 sm:space-y-2 w-full hover:bg-rose-600 dark:hover:bg-rose-700 border-2 sm:border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:sm:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] uppercase tracking-wider">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <span className="text-xs sm:text-sm">Top Up</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Savings Goals */}
        <div className="lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase dark:text-white">Savings Goals</h2>
            <Link href="/dashboard/savings">
              <Button className="neo-brutal-view-all font-bold text-xs sm:text-sm py-2 px-3 sm:px-4">View Details</Button>
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {isRefreshing ? (
              <>
                {[...Array(2)].map((_, i) => (
                  <SavingsGoalSkeleton key={i} />
                ))}
              </>
            ) : (
              savingsGoals.map((goal) => {
                const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
                return (
                  <Card key={goal.id} className="neo-brutal-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full ${goal.color} flex items-center justify-center`}>
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-bold uppercase text-xs sm:text-sm mb-1">{goal.name}</p>
                          <p className="font-bold text-xs text-gray-500">
                          Target: {new Date(goal.targetDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold uppercase bg-blue-100 text-blue-800 px-2 py-1 rounded">{goal.category}</span>
                    </div>
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Rp. {goal.currentAmount.toLocaleString()} / Rp. {goal.targetAmount.toLocaleString()}</span>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{progress.toFixed(0)}%</span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {savingsGoals.length === 0 && !isRefreshing && (
            <Card className="neo-brutal-card text-center py-6">
              <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-black uppercase mb-2 dark:text-white">No Savings Goals</h3>
              <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm mb-4">
                Start saving for your dreams!
              </p>
              <Link href="/dashboard/savings">
                <Button className="neo-brutal-button text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Create Goal
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="neo-brutal-card neo-brutal-sky">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase text-sky-800 dark:text-sky-200">Recent Transactions</h2>
          <div className="flex space-x-2 sm:space-x-3"></div>
        </div>
        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          {isRefreshing ? (
            <>
              {[...Array(5)].map((_, i) => (
                <TransactionSkeleton key={i} />
              ))}
            </>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-2 sm:p-3 lg:p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${tx.type === 'received' ? 'bg-emerald-500' : 'bg-rose-500'} flex items-center justify-center`}>
                    {tx.type === 'received' ? <ArrowDownLeft className="h-4 w-4 text-white" /> : <ArrowUpRight className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm mb-1">{tx.type === 'received' ? `From: ${tx.from}` : `To: ${tx.to}`}</p>
                    {tx.description && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">{tx.description}</p>
                    )}
                    <p className="text-xs text-gray-500">{tx.time}</p>
                  </div>
                </div>
                <span className={`font-black text-sm sm:text-base ${tx.type === 'received' ? 'text-emerald-700' : 'text-rose-700'}`}>{tx.type === 'received' ? '+' : '-'}Rp. {tx.amount.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}