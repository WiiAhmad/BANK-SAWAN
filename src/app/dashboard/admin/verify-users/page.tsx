'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/dashboard/Navbar';
import { ArrowLeft, RefreshCw, CheckCircle, Clock, XCircle, User, Search } from 'lucide-react';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface UserRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  registeredAt: string;
  verificationLevel: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  notes?: string;
}

export default function VerifyUsers() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<UserRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
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
    if (parsedUser.role !== 'ADMIN' && parsedUser.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }
    setUser(parsedUser);
    loadUserRegistrations();
  }, [router]);

  const loadUserRegistrations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/verify', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUserRegistrations(
        data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          status: u.verificationStatus,
          registeredAt: u.createdAt,
          verificationLevel: 'BASIC', // You can update this if you have the info
        }))
      );
    } catch (e) {
      setUserRegistrations([]);
    }
    setIsLoading(false);
  };

  const fetchUserRegistrations = async () => {
    setIsRefreshing(true);
    await loadUserRegistrations();
    setIsRefreshing(false);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // Optionally handle error
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/verify/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'APPROVED' })
      });
      if (res.ok) {
        setUserRegistrations(prev => prev.map(r => r.id === userId ? { ...r, status: 'APPROVED' } : r));
      }
    } catch {}
  };

  const handleReject = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/verify/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'REJECTED' })
      });
      if (res.ok) {
        setUserRegistrations(prev => prev.map(r => r.id === userId ? { ...r, status: 'REJECTED' } : r));
      }
    } catch {}
  };

  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case 'BASIC': return 'bg-blue-500';
      case 'INTERMEDIATE': return 'bg-orange-500';
      case 'ADVANCED': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredRegistrations = userRegistrations.filter(registration => {
    const matchesSearch = registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || registration.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = userRegistrations.filter(r => r.status === 'PENDING').length;
  const approvedCount = userRegistrations.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = userRegistrations.filter(r => r.status === 'REJECTED').length;

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

  const UserRegistrationSkeleton = () => (
    <Card className="neo-brutal-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-12 h-12" />
            <div className="flex-1">
              <Skeleton className="w-32 h-4 mb-2" />
              <Skeleton className="w-40 h-3" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="w-16 h-5 mb-1" />
            <Skeleton className="w-12 h-5" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Skeleton className="w-12 h-3 mb-1" />
            <Skeleton className="w-24 h-4" />
          </div>
          <div>
            <Skeleton className="w-20 h-3 mb-1" />
            <Skeleton className="w-16 h-5" />
          </div>
        </div>

        <div className="p-3 bg-gray-100 border-2 border-gray-300 mb-4">
          <Skeleton className="w-10 h-3 mb-1" />
          <Skeleton className="w-full h-4" />
        </div>

        <div className="flex space-x-3">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="flex-1 h-10" />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
      {/* <Navbar user={user} onLogout={handleLogout} /> */}
      <div className="p-3 sm:p-4 pt-20 md:pt-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between pt-10 mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                onClick={() => router.push('/dashboard/admin')}
                className="neo-brutal p-2 sm:p-3 md:flex"
              >
                <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase">Verify Users</h1>
                <p className="font-semibold text-gray-700 text-sm sm:text-base">Review and approve user registrations</p>
              </div>
            </div>
            <Button
              onClick={fetchUserRegistrations}
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
                <p className="font-black uppercase text-sm sm:text-base">User registrations refreshed successfully!</p>
              </div>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {isLoading || isRefreshing ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <StatsSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                <Card className="neo-brutal-card bg-gradient-to-br from-orange-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Pending</p>
                      <p className="text-2xl sm:text-3xl font-black">{pendingCount}</p>
                    </div>
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>

                <Card className="neo-brutal-card neo-brutal-green">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Approved</p>
                      <p className="text-2xl sm:text-3xl font-black">{approvedCount}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>

                <Card className="neo-brutal-card bg-gradient-to-br from-red-500 to-pink-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold uppercase text-xs sm:text-sm mb-1">Rejected</p>
                      <p className="text-2xl sm:text-3xl font-black">{rejectedCount}</p>
                    </div>
                    <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Filters */}
          <Card className="neo-brutal-card mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="neo-brutal h-10 sm:h-12 font-semibold pl-8 sm:pl-10"
                    placeholder="Search by name or email..."
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                  <Button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    disabled={isLoading}
                    className={`neo-brutal font-bold text-xs sm:text-sm py-2 px-3 sm:px-4 ${
                      statusFilter === status 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white'
                    }`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* User Registrations */}
          <div className="space-y-4 sm:space-y-6">
            {isLoading || isRefreshing ? (
              [...Array(5)].map((_, i) => <UserRegistrationSkeleton key={i} />)
            ) : (
              filteredRegistrations.map((registration) => (
                <Card key={registration.id} className="neo-brutal-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg ${getVerificationLevelColor(registration.verificationLevel)}`}>{registration.name[0]}</div>
                        <div>
                          <div className="font-black text-lg sm:text-xl">{registration.name}</div>
                          <div className="font-semibold text-gray-600 text-xs sm:text-sm">{registration.email}</div>
                          <div className="font-semibold text-gray-500 text-xs">{registration.phone}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={registration.status === 'PENDING' ? 'secondary' : registration.status === 'APPROVED' ? 'default' : 'destructive'} className="text-xs">
                          {registration.status}
                        </Badge>
                        <div className="text-xs text-gray-400 mt-1">{new Date(registration.registeredAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {registration.status === 'PENDING' && (
                        <>
                          <Button className="neo-brutal bg-green-500 text-white font-bold flex-1" onClick={() => handleApprove(registration.id)}>Approve</Button>
                          <Button className="neo-brutal bg-red-500 text-white font-bold flex-1" onClick={() => handleReject(registration.id)}>Reject</Button>
                        </>
                      )}
                    </div>
                    {registration.notes && <div className="mt-4 text-xs text-gray-600">{registration.notes}</div>}
                  </div>
                </Card>
              ))
            )}
            {filteredRegistrations.length === 0 && !isLoading && !isRefreshing && (
              <Card className="neo-brutal-card text-center py-12">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-black uppercase mb-2">No User Registrations</h3>
                <p className="font-semibold text-gray-600">No users found for the selected filter or search.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}