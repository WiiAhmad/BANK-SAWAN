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

  // Mock super admin statistics (focused on core metrics)
  const stats: SuperAdminStats = {
    pendingTopups: 12,
    pendingUsers: 8,
    totalTransactions: 15420,
    totalUsers: 2847
  };

  // Mock recent activities for super admin
  const recentActivities = [
    { id: 1, type: 'system_backup', message: 'Database backup completed', time: '2 min ago' },
    { id: 2, type: 'security_scan', message: 'Security scan completed', time: '15 min ago' },
    { id: 3, type: 'admin_login', message: 'Admin user logged in', user: 'admin@example.com', time: '23 min ago' },
    { id: 4, type: 'large_transaction', message: 'Large transaction flagged', amount: 10000, time: '35 min ago' },
    { id: 5, type: 'api_error', message: 'Payment gateway timeout', time: '42 min ago' },
  ];

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
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="p-3 sm:p-4 pt-20 md:pt-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="neo-brutal bg-red-500 text-white p-2 sm:p-3">
                <Crown className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase">Super Admin</h1>
                <p className="font-semibold text-gray-700 text-sm sm:text-base">Full system access and monitoring</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              disabled={isRefreshing}
              className="neo-brutal bg-red-500 text-white font-bold py-2 px-4 text-xs sm:text-sm"
            >
              Logout
            </Button>
            <Button
              onClick={refreshDashboard}
              disabled={isRefreshing}
              className="neo-brutal bg-blue-500 text-white font-bold py-2 px-4 text-xs sm:text-sm"
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
                <p className="font-black uppercase text-sm sm:text-base">Super admin dashboard refreshed successfully!</p>
              </div>
            </Card>
          )}

          {/* Role Notice */}
          <Card className="neo-brutal-card bg-gradient-to-br from-red-500 to-purple-600 text-white mb-6 sm:mb-8">
            <div className="flex items-center space-x-3">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-black uppercase text-sm sm:text-base">Super Admin Access</h3>
                <p className="font-semibold text-xs sm:text-sm">Full system access including transactions monitoring and system logs</p>
              </div>
            </div>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {isLoading || isRefreshing ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <StatsSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                <Card className="neo-brutal-card bg-gradient-to-br from-red-500 to-pink-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Pending Top-ups</p>
                      <p className="text-xl sm:text-2xl font-black">{stats.pendingTopups}</p>
                    </div>
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>

                <Card className="neo-brutal-card bg-gradient-to-br from-orange-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Pending Users</p>
                      <p className="text-xl sm:text-2xl font-black">{stats.pendingUsers}</p>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>

                <Card className="neo-brutal-card neo-brutal-green">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Total Users</p>
                      <p className="text-xl sm:text-2xl font-black">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>

                <Card className="neo-brutal-card neo-brutal-purple">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Link href="/dashboard/superadmin/transactions">
              <Card className="neo-brutal-card hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="neo-brutal bg-blue-500 text-white p-2 sm:p-3">
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-sm sm:text-base">All Transactions</h3>
                    <p className="font-semibold text-xs sm:text-sm text-gray-600">Monitor all system transactions</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Card className="neo-brutal-card bg-gradient-to-br from-green-500 to-blue-600 text-white">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="neo-brutal bg-white bg-opacity-20 text-white p-2 sm:p-3">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm sm:text-base">System Logs</h3>
                  <p className="font-semibold text-xs sm:text-sm">{filteredLogs.length} recent entries</p>
                </div>
              </div>
            </Card>

            <Link href="/dashboard/admin/verify-topup">
              <Card className="neo-brutal-card hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="neo-brutal bg-red-500 text-white p-2 sm:p-3">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-sm sm:text-base">Verify Top-ups</h3>
                    <p className="font-semibold text-xs sm:text-sm text-gray-600">{stats.pendingTopups} pending</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/admin/verify-users">
              <Card className="neo-brutal-card hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="neo-brutal bg-orange-500 text-white p-2 sm:p-3">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-sm sm:text-base">Verify Users</h3>
                    <p className="font-semibold text-xs sm:text-sm text-gray-600">{stats.pendingUsers} pending</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* System Logs */}
            <div className="lg:col-span-2">
              <Card className="neo-brutal-card">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="neo-brutal bg-purple-500 text-white p-2">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase">System Logs</h2>
                  </div>
                  <Button 
                    onClick={refreshDashboard}
                    disabled={isRefreshing}
                    className="neo-brutal bg-white font-bold text-xs sm:text-sm py-2 px-3"
                  >
                    <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                {/* Log Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="neo-brutal h-10 sm:h-12 font-semibold pl-10 text-sm"
                      placeholder="Search logs..."
                      disabled={isLoading}
                    />
                  </div>
                  <Select value={logFilter} onValueChange={setLogFilter} disabled={isLoading}>
                    <SelectTrigger className="neo-brutal h-10 sm:h-12 font-semibold">
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
                  {isLoading || isRefreshing ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <LogSkeleton key={i} />
                      ))}
                    </>
                  ) : (
                    <>
                      {filteredLogs.map((log) => {
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
                                    <Badge className={`${getCategoryColor(log.category)} text-white text-xs font-bold`}>
                                      {log.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs font-bold">
                                      {log.level}
                                    </Badge>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-500">
                                    {formatTimestamp(log.timestamp)}
                                  </span>
                                </div>
                                <p className="font-bold text-sm mb-1">{log.message}</p>
                                {log.details && (
                                  <p className="font-semibold text-xs text-gray-600 mb-1">{log.details}</p>
                                )}
                                {log.userName && (
                                  <p className="font-semibold text-xs text-blue-600">User: {log.userName}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {filteredLogs.length === 0 && (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-black uppercase mb-2">No Logs Found</h3>
                          <p className="font-semibold text-gray-600 text-sm">
                            No logs match your current filters.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* System Activities */}
            <div>
              <Card className="neo-brutal-card">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-black uppercase">System Activities</h2>
                  <Button className="neo-brutal bg-white font-bold text-xs sm:text-sm py-2 px-3">View All</Button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {isLoading || isRefreshing ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <ActivitySkeleton key={i} />
                      ))}
                    </>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="p-4 border-2 border-gray-200 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className={`p-2 border-2 border-black ${
                              activity.type === 'system_backup' ? 'bg-green-400' :
                              activity.type === 'security_scan' ? 'bg-blue-400' :
                              activity.type === 'admin_login' ? 'bg-purple-400' :
                              activity.type === 'large_transaction' ? 'bg-orange-400' :
                              'bg-red-400'
                            }`}>
                              {activity.type === 'system_backup' ? (
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : activity.type === 'security_scan' ? (
                                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : activity.type === 'admin_login' ? (
                                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : activity.type === 'large_transaction' ? (
                                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{activity.message}</p>
                              {activity.user && (
                                <p className="font-semibold text-xs text-gray-600">{activity.user}</p>
                              )}
                              <p className="font-semibold text-xs text-gray-600">{activity.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {activity.amount && (
                              <p className="font-black text-sm sm:text-lg text-orange-600">
                                ${activity.amount.toLocaleString()}
                              </p>
                            )}
                            <Badge variant={
                              activity.type === 'system_backup' || activity.type === 'security_scan' ? 'default' :
                              activity.type === 'large_transaction' ? 'destructive' :
                              'secondary'
                            } className="text-xs">
                              {activity.type === 'system_backup' || activity.type === 'security_scan' ? 'Completed' :
                               activity.type === 'large_transaction' ? 'Flagged' :
                               activity.type === 'admin_login' ? 'Active' : 'Error'}
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