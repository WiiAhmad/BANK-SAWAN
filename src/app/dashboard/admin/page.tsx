'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Users, 
  CreditCard, 
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/dashboard/Navbar'; 
import { useVerifyTopups, useVerifyUsers } from '@/hooks/useVerifyData';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface AdminStats {
  pendingTopups: number;
  pendingUsers: number;
  totalUsers: number;
  monthlyGrowth: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Add refreshKey state

  // Pass refreshKey to hooks so they re-fetch when it changes
  const { topups, loading: loadingTopups, error: errorTopups } = useVerifyTopups(refreshKey);
  const { users: verifyUsers, loading: loadingUsers, error: errorUsers } = useVerifyUsers(refreshKey);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'ADMIN') {
      if (parsedUser.role === 'SUPER_ADMIN') {
        router.push('/dashboard/superadmin');
        return;
      }
      router.push('/dashboard');
      return;
    }
    
    setUser(parsedUser);
  }, [router]);

  useEffect(() => {
    // Fetch recent activities from API log
    const fetchRecentActivities = async () => {
      try {
        const res = await fetch('/api/admin/log', { credentials: 'include' });
        if (!res.ok) return;
        const logs = await res.json();
        if (!Array.isArray(logs)) return;
        // Filter logs for verify topup or verify user actions
        const filtered = logs.filter((log: any) =>
          (log.action === 'TOPUP_REQUEST' || log.action === 'USER_VERIFICATION') &&
          (log.level === 'INFO' || log.level === 'SUCCESS')
        );
        // Map to activity format
        setRecentActivities(filtered.slice(0, 10).map((log: any) => ({
          id: log.id,
          type: log.action === 'TOPUP_REQUEST' ? 'verify_topup' : 'verify_user',
          user: log.user?.name || 'Unknown',
          time: new Date(log.timestamp).toLocaleString(),
          details: log.details,
          status: log.level
        })));
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchRecentActivities();
  }, []);
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // Optionally handle error
    }
    localStorage.removeItem('user');
    localStorage.removeItem('verify_topups');
    localStorage.removeItem('verify_users');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const refreshDashboard = async () => {
    console.log(localStorage.getItem('verify_topups'));
    console.log(localStorage.getItem('verify_users'));
    localStorage.removeItem('verify_topups');
    localStorage.removeItem('verify_users');
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetch('/api/admin/verify-topup', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/admin/verify', { credentials: 'include', cache: 'no-store' })
      ]);
    } catch (e) {
      // Optionally handle error
    }
    setRefreshKey((k) => k + 1); // Trigger hooks to re-fetch
    console.log('Dashboard refreshed');
    setIsRefreshing(false);
    setRefreshSuccess(true);
    setTimeout(() => {
      setRefreshSuccess(false);
    }, 3000);
  };

  // Admin statistics from fetched data
  const stats: AdminStats = {
    pendingTopups: topups?.filter((t: any) => t.status === 'PENDING').length || 0,
    pendingUsers: verifyUsers?.filter((u: any) => u.verificationStatus === 'PENDING').length || 0,
    totalUsers: verifyUsers?.length || 0,
    monthlyGrowth: topups?.length || 0 // now used for total topups
  };

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

  // Helper: show skeletons for stats
  const showStatsSkeleton = loadingTopups || loadingUsers;
  // Helper: show skeletons for activities (while recentActivities is null or undefined)
  const showActivitiesSkeleton = recentActivities.length === 0 && (loadingTopups || loadingUsers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-200 via-orange-200 to-yellow-200">
      {/* <Navbar user={user} onLogout={handleLogout} /> */}
      <div className="p-3 sm:p-4 pt-10 md:pt-4">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 mt-5 sm:mb-8 gap-3 sm:gap-0 w-full">
            <div className="flex items-center space-x-3">
              <div className="neo-brutal bg-orange-500 text-white p-2 sm:p-3">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black uppercase leading-tight">Admin Panel</h1>
                <p className="font-semibold text-gray-700 text-xs sm:text-base">Manage user verifications and top-up approvals</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={handleLogout}
                disabled={isRefreshing}
                className="neo-brutal from-red-500 text-white font-bold py-2 px-4 text-xs sm:text-sm w-full sm:w-auto"
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
                <p className="font-black uppercase text-sm sm:text-base">Admin panel refreshed successfully!</p>
              </div>
            </Card>
          )}

          {/* Role Notice */}
          <Card className="neo-brutal-card bg-gradient-to-br from-orange-500 to-red-600 text-white mb-4 sm:mb-8">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-black uppercase text-xs sm:text-base">Admin Access Level</h3>
                <p className="font-semibold text-xs sm:text-sm">You have access to user verification and top-up approval functions</p>
              </div>
            </div>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8">
            {showStatsSkeleton ? (
              <>
                <StatsSkeleton />
                <StatsSkeleton />
                <StatsSkeleton />
                <StatsSkeleton />
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
                <Card className="neo-brutal-card neo-brutal-orange w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Total Topups</p>
                      <p className="text-xl sm:text-2xl font-black">{stats.monthlyGrowth}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-2 xs:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
            <Link href="/dashboard/admin/verify-topup">
              <Card className="neo-brutal-card hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-full">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="neo-brutal bg-red-500 text-white p-3 sm:p-4">
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs sm:text-lg">Verify Top-ups</h3>
                    <p className="font-semibold text-xs sm:text-sm text-gray-600">{loadingTopups ? 'Loading...' : stats.pendingTopups + ' pending approvals'}</p>
                    <p className="font-semibold text-xs text-gray-500">Review and approve user top-up requests</p>
                    {errorTopups && <div className="text-xs text-red-600">{errorTopups}</div>}
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/dashboard/admin/verify-users">
              <Card className="neo-brutal-card hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-full">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="neo-brutal bg-orange-500 text-white p-3 sm:p-4">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs sm:text-lg">Verify Users</h3>
                    <p className="font-semibold text-xs sm:text-sm text-gray-600">{loadingUsers ? 'Loading...' : stats.pendingUsers + ' pending verifications'}</p>
                    <p className="font-semibold text-xs text-gray-500">Review and approve user registrations</p>
                    {errorUsers && <div className="text-xs text-red-600">{errorUsers}</div>}
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Recent Activities */}
          <Card className="neo-brutal-card w-full">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-black uppercase">Recent Pending Activities</h2>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {showActivitiesSkeleton ? (
                <>
                  <ActivitySkeleton />
                  <ActivitySkeleton />
                  <ActivitySkeleton />
                </>
              ) : recentActivities.length === 0 ? (
                <div className="text-center text-gray-500">No recent activities found.</div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="p-4 border-2 border-gray-200 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`p-2 border-2 border-black ${
                          activity.type === 'verify_topup' ? 'bg-orange-400' : 'bg-blue-400'
                        }`}>
                          {activity.type === 'verify_topup' ? (
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">
                            {activity.type === 'verify_topup' && `Top-up ${activity.user}`}
                            {activity.type === 'verify_user' && `User ${activity.user}`}
                          </p>
                          <p className="font-semibold text-xs text-gray-600">{activity.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          activity.status === 'INFO' ? 'secondary' : 'default'
                        } className="text-xs">
                          {activity.status === 'INFO' ? 'Info' : 'Completed'}
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
  );
}