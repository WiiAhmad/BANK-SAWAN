'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Users, 
  CreditCard, 
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  Activity,
  FileText,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/dashboard/Navbar';
import { useVerifyTopups, useVerifyUsers } from '@/hooks/useVerifyData';
import { useAdminLogs, useAdminTransactions } from '@/hooks/SuperHooks';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface SuperAdminStats {
  pendingTopups: number;
  pendingUsers: number;
  totalTransactions: number;
  totalUsers: number;
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  category: 'SYSTEM' | 'USER' | 'TRANSACTION' | 'SECURITY' | 'API';
  message: string;
  details?: string;
  userId?: string;
  userName?: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { topups, loading: loadingTopups, error: errorTopups } = useVerifyTopups();
  const { users: verifyUsers, loading: loadingUsers, error: errorUsers } = useVerifyUsers();
  const { logs: adminLogs, loading: loadingLogs, error: errorLogs } = useAdminLogs();
  const { transactions, loading: loadingTransactions, error: errorTransactions } = useAdminTransactions();

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
    generateMockLogs();
  }, [router]);

  const generateMockLogs = () => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          level: 'INFO',
          category: 'USER',
          message: 'New user registration',
          details: 'User completed registration process',
          userId: 'user123',
          userName: 'Alice Cooper'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          level: 'SUCCESS',
          category: 'TRANSACTION',
          message: 'Top-up approved',
          details: 'Admin approved $500 top-up request',
          userId: 'user456',
          userName: 'John Doe'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
          level: 'WARNING',
          category: 'SECURITY',
          message: 'Multiple failed login attempts',
          details: 'IP: 192.168.1.100 - 5 failed attempts in 10 minutes',
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          level: 'INFO',
          category: 'SYSTEM',
          message: 'Database backup completed',
          details: 'Scheduled backup completed successfully - Size: 2.3GB',
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
          level: 'ERROR',
          category: 'API',
          message: 'Payment gateway timeout',
          details: 'Stripe API timeout during transaction processing',
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          level: 'SUCCESS',
          category: 'USER',
          message: 'User verification completed',
          details: 'KYC verification approved for premium account',
          userId: 'user789',
          userName: 'Sarah Johnson'
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          level: 'INFO',
          category: 'TRANSACTION',
          message: 'Large transaction detected',
          details: 'Transaction amount: $10,000 - Auto-flagged for review',
          userId: 'user321',
          userName: 'Mike Wilson'
        },
        {
          id: '8',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          level: 'WARNING',
          category: 'SYSTEM',
          message: 'High server load detected',
          details: 'CPU usage: 85% - Memory usage: 78%',
        },
        {
          id: '9',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          level: 'SUCCESS',
          category: 'SECURITY',
          message: 'Security scan completed',
          details: 'No vulnerabilities detected - All systems secure',
        },
        {
          id: '10',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          level: 'INFO',
          category: 'USER',
          message: 'Password reset requested',
          details: 'User requested password reset via email',
          userId: 'user654',
          userName: 'Emma Davis'
        }
      ];

      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('verify_topups');
    localStorage.removeItem('verify_users');
    localStorage.removeItem('admin_logs');
    localStorage.removeItem('admin_transactions');
    router.push('/');
  };

  const refreshDashboard = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      generateMockLogs();
      setIsRefreshing(false);
      setRefreshSuccess(true);
      
      setTimeout(() => {
        setRefreshSuccess(false);
      }, 3000);
    }, 1000);
  };

  const filterLogs = () => {
    let filtered = logs;

    if (logFilter !== 'ALL') {
      filtered = filtered.filter(log => log.level === logFilter);
    }

    if (logSearch) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.details?.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.userName?.toLowerCase().includes(logSearch.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    filterLogs();
  }, [logFilter, logSearch, logs]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'SUCCESS': return CheckCircle;
      case 'WARNING': return AlertTriangle;
      case 'ERROR': return XCircle;
      default: return Info;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'SUCCESS': return 'text-green-600 bg-green-100';
      case 'WARNING': return 'text-orange-600 bg-orange-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SYSTEM': return 'bg-purple-500';
      case 'USER': return 'bg-blue-500';
      case 'TRANSACTION': return 'bg-green-500';
      case 'SECURITY': return 'bg-red-500';
      case 'API': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Super admin statistics (with correct filters)
  const stats: SuperAdminStats = {
    pendingTopups: loadingTopups || !topups ? 0 : topups.filter((t: any) => t.status === 'PENDING').length,
    pendingUsers: loadingUsers || !verifyUsers ? 0 : verifyUsers.filter((u: any) => u.verificationStatus === 'PENDING').length,
    totalUsers: loadingUsers || !verifyUsers ? 0 : verifyUsers.length,
    totalTransactions: loadingTopups || !topups ? 0 : topups.length // now used for total topups (monthlyGrowth)
  };

  // Skeleton Components
  const StatsSkeleton = () => (
    <Card className="neo-brutal-card">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="w-20 h-3 mb-2" />
          <Skeleton className="w-16 h-6" />
        </div>
        <Skeleton className="w-6 h-6 sm:w-8 sm:h-8" />
      </div>
    </Card>
  );

  const LogSkeleton = () => (
    <div className="p-4 border-2 border-gray-200 rounded">
      <div className="flex items-start space-x-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-16 h-5" />
              <Skeleton className="w-12 h-5" />
            </div>
            <Skeleton className="w-16 h-3" />
          </div>
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-3/4 h-3 mb-1" />
          <Skeleton className="w-1/2 h-3" />
        </div>
      </div>
    </div>
  );

  const ActivitySkeleton = () => (
    <div className="p-4 border-2 border-gray-200 rounded">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-8 h-8" />
          <div className="flex-1">
            <Skeleton className="w-32 h-4 mb-1" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="w-12 h-4 mb-1" />
          <Skeleton className="w-16 h-5" />
        </div>
      </div>
    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-red-200 via-purple-200 to-blue-200">
      {/* <Navbar user={user} onLogout={handleLogout} /> */}
      <div className="p-3 sm:p-4 pt-10 md:pt-4">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="neo-brutal bg-red-500 text-white p-2 sm:p-3">
                <Crown className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black uppercase leading-tight">Super Admin</h1>
                <p className="font-semibold text-gray-700 text-xs sm:text-base">Full system access and monitoring</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={handleLogout}
                disabled={isRefreshing}
                className="neo-brutal bg-red-500 text-white font-bold py-2 px-4 text-xs sm:text-sm w-full sm:w-auto"
              >
                Logout
              </Button>
              <Button
                onClick={refreshDashboard}
                disabled={isRefreshing}
                className="neo-brutal bg-blue-500 text-white font-bold py-2 px-4 text-xs sm:text-sm w-full sm:w-auto"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {refreshSuccess && (
            <Card className="neo-brutal-card neo-brutal-green mb-4 sm:mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                <p className="font-black uppercase text-sm sm:text-base">Super admin dashboard refreshed successfully!</p>
              </div>
            </Card>
          )}

          {/* Role Notice */}
          <Card className="neo-brutal-card bg-gradient-to-br from-red-500 to-purple-600 text-white mb-4 sm:mb-8">
            <div className="flex items-center space-x-3">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-black uppercase text-xs sm:text-base">Super Admin Access</h3>
                <p className="font-semibold text-xs sm:text-sm">Full system access including transactions monitoring and system logs</p>
              </div>
            </div>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8">
            {isLoading || isRefreshing ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <StatsSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                <Card className="neo-brutal-card bg-gradient-to-br from-red-500 to-pink-600 text-white w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Pending Top-ups</p>
                      <p className="text-xl sm:text-2xl font-black">{stats.pendingTopups}</p>
                    </div>
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>
                <Card className="neo-brutal-card bg-gradient-to-br from-orange-500 to-red-600 text-white w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Pending Users</p>
                      <p className="text-xl sm:text-2xl font-black">{stats.pendingUsers}</p>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>
                <Card className="neo-brutal-card neo-brutal-green w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Total Users</p>
                      <p className="text-xl sm:text-2xl font-black">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>
                <Card className="neo-brutal-card neo-brutal-purple w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Transactions</p>
                      <p className="text-xl sm:text-2xl font-black">{stats.totalTransactions.toLocaleString()}</p>
                    </div>
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Super Admin Actions */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8">
            <Link href="/dashboard/superadmin/transactions">
              <Card className="neo-brutal-card hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-full">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="neo-brutal bg-blue-500 text-white p-2 sm:p-3">
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs sm:text-base">Transactions</h3>
                    <p className="font-semibold text-xs sm:text-sm text-gray-600">View all transactions</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/dashboard/superadmin/systemlog">
              <Card className="neo-brutal-card bg-gradient-to-br from-green-500 to-blue-600 text-white hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-full">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="neo-brutal bg-white/20 text-white p-2 sm:p-3">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs sm:text-base">System Logs</h3>
                    <p className="font-semibold text-xs sm:text-sm text-gray-100">View all system log entries</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/dashboard/admin/verify-topup">
              <Card className="neo-brutal-card hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-full">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="neo-brutal bg-red-500 text-white p-2 sm:p-3">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs sm:text-base">Verify Top-ups</h3>
                    <p className="font-semibold text-xs sm:text-sm text-gray-600">{loadingTopups ? 'Loading...' : `${stats.pendingTopups} pending`}</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/dashboard/admin/verify-users">
              <Card className="neo-brutal-card hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-full">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="neo-brutal bg-orange-500 text-white p-2 sm:p-3">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs sm:text-base">Verify Users</h3>
                    <p className="font-semibold text-xs sm:text-sm text-gray-600">{loadingUsers ? 'Loading...' : `${stats.pendingUsers} pending`}</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* System Logs */}
            <div className="lg:col-span-2 w-full">
              <Card className="neo-brutal-card w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="neo-brutal bg-purple-500 text-white p-2">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black uppercase">System Logs</h2>
                  </div>
                  <Link href="/dashboard/superadmin/systemlog">
                    <Button className="neo-brutal font-bold text-xs sm:text-sm py-2 px-3 w-full sm:w-auto">View All</Button>
                  </Link>
                </div>
                {/* Log Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="neo-brutal h-10 sm:h-12 font-semibold pl-10 text-sm w-full"
                      placeholder="Search logs..."
                      disabled={loadingLogs}
                    />
                  </div>
                  <Select value={logFilter} onValueChange={setLogFilter} disabled={loadingLogs}>
                    <SelectTrigger className="neo-brutal h-10 sm:h-12 font-semibold w-full">
                      <SelectValue placeholder="Filter by level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Levels</SelectItem>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="ERROR">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Log Entries */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loadingLogs ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <LogSkeleton key={i} />
                      ))}
                    </>
                  ) : errorLogs ? (
                    <div className="text-center py-8 text-red-500 font-bold">Failed to load logs</div>
                  ) : (
                    <>
                      {adminLogs.filter((log: any) => {
                        // Filter by level and search
                        const levelMatch = logFilter === 'ALL' || log.level === logFilter;
                        const searchMatch = !logSearch ||
                          (log.action && log.action.toLowerCase().includes(logSearch.toLowerCase())) ||
                          (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase())) ||
                          (log.user && log.user.name && log.user.name.toLowerCase().includes(logSearch.toLowerCase()));
                        return levelMatch && searchMatch;
                      }).map((log: any) => {
                        const LogIcon = getLogIcon(log.level);
                        return (
                          <div key={log.id} className="p-4 border-2 border-gray-200 hover:bg-gray-50 transition-colors rounded">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-full ${getLogColor(log.level)}`}>
                                <LogIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <Badge className="bg-purple-500 text-white text-xs font-bold">{log.entity || 'LOG'}</Badge>
                                    <Badge variant="outline" className="text-xs font-bold">{log.level}</Badge>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-500">
                                    {formatTimestamp(log.timestamp)}
                                  </span>
                                </div>
                                <p className="font-bold text-sm mb-1">{log.action}</p>
                                {log.details && <p className="font-semibold text-xs text-gray-600 mb-1">{log.details}</p>}
                                {log.user && log.user.name && (
                                  <p className="font-semibold text-xs text-blue-600">User: {log.user.name}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {adminLogs.length === 0 && (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-black uppercase mb-2">No Logs Found</h3>
                          <p className="font-semibold text-gray-600 text-sm">No logs available.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* System Activities (Transaction) section */}
            <div className="w-full">
              <Card className="neo-brutal-card w-full">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-2xl font-black uppercase">Transaction</h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {loadingTransactions ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <ActivitySkeleton key={i} />
                      ))}
                    </>
                  ) : errorTransactions ? (
                    <div className="text-center py-8 text-red-500 font-bold">Failed to load transactions</div>
                  ) : (
                    transactions.slice(0, 5).map((tx: any) => (
                      <div key={tx.id} className="p-4 border-2 border-gray-200 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center sm:space-x-4">
                            <div className="p-2 border-2 border-black bg-orange-400">
                              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <div>
                              <p className="font-bold text-sm truncate max-w-xs" title={tx.description || 'Transaction'}>
                                {(tx.description && tx.description.length > 30)
                                  ? `${tx.description.slice(0, 17)}...`
                                  : (tx.description || 'Transaction')}
                              </p>
                              <p className="font-semibold text-xs text-gray-600">{tx.sender?.name || 'Unknown'} → {tx.receiver?.name || 'Unknown'}</p>
                              <p className="font-semibold text-xs text-gray-600">{formatTimestamp(tx.createdAt)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm sm:text-lg text-orange-600">{tx.currency} {Number(tx.amount).toLocaleString()}</p>
                            <Badge variant={tx.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs">
                              {tx.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}