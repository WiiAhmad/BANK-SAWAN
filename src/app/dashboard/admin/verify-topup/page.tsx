'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft, 
  CreditCard,
  Search,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/dashboard/Navbar';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface TopupRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  walletName: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  proofImage?: string;
  notes?: string;
}

export default function VerifyTopup() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
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
    loadTopupRequests();
  }, [router]);

  const loadTopupRequests = () => {
    setIsLoading(true);
    // Load from localStorage if available
    const local = localStorage.getItem('verify_topups');
    if (local) {
      setTopupRequests(JSON.parse(local));
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };

  const fetchTopupRequests = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/verify/topup', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setTopupRequests(data);
        localStorage.setItem('verify_topups', JSON.stringify(data));
      }
    } catch (e) {}
    setIsRefreshing(false);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 3000);
  };

  const handleApprove = async (requestId: string) => {
    try {
      const res = await fetch(`/api/admin/verify/topup/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'APPROVED' })
      });
      if (res.ok) {
        setTopupRequests(prev => prev.map(request =>
          request.id === requestId ? { ...request, status: 'APPROVED' } : request
        ));
        // Update localStorage
        localStorage.setItem('verify_topups', JSON.stringify(
          topupRequests.map(request =>
            request.id === requestId ? { ...request, status: 'APPROVED' } : request
          )
        ));
      }
    } catch (e) {}
  };

  const handleReject = async (requestId: string) => {
    try {
      const res = await fetch(`/api/admin/verify/topup/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'REJECTED' })
      });
      if (res.ok) {
        setTopupRequests(prev => prev.map(request =>
          request.id === requestId ? { ...request, status: 'REJECTED' } : request
        ));
        // Update localStorage
        localStorage.setItem('verify_topups', JSON.stringify(
          topupRequests.map(request =>
            request.id === requestId ? { ...request, status: 'REJECTED' } : request
          )
        ));
      }
    } catch (e) {}
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return '💵';
      case 'BANK_TRANSFER': return '🏦';
      case 'DEBIT_CARD': return '💳';
      case 'MOBILE_PAYMENT': return '📱';
      default: return '💰';
    }
  };

  const filteredRequests = topupRequests.filter(request => {
    const userName = request.userName || '';
    const userEmail = request.userEmail || '';
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = topupRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = topupRequests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = topupRequests.filter(r => r.status === 'REJECTED').length;

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

  const TopupRequestSkeleton = () => (
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
            <Skeleton className="w-16 h-6 mb-1" />
            <Skeleton className="w-12 h-5" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Skeleton className="w-12 h-3 mb-1" />
            <Skeleton className="w-20 h-4" />
          </div>
          <div>
            <Skeleton className="w-20 h-3 mb-1" />
            <Skeleton className="w-24 h-4" />
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
    <div className="min-h-screen bg-gradient-to-br from-red-200 via-orange-200 to-yellow-200">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="p-3 sm:p-4 pt-20 md:pt-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                onClick={() => router.push('/dashboard/admin')}
                className="neo-brutal bg-white p-2 sm:p-3 hidden md:flex"
              >
                <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase">Verify Top-ups</h1>
                <p className="font-semibold text-gray-700 text-sm sm:text-base">Review and approve top-up requests</p>
              </div>
            </div>
            <Button
              onClick={fetchTopupRequests}
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
                <p className="font-black uppercase text-sm sm:text-base">Top-up requests refreshed successfully!</p>
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
                    placeholder="Search by user name or email..."
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

          {/* Top-up Requests */}
          <div className="space-y-4 sm:space-y-6">
            {isLoading || isRefreshing ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <TopupRequestSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="neo-brutal-card">
                    <div className="p-6">
                      {/* Header with User Info and Amount */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="neo-brutal bg-blue-500 text-white p-3">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-black uppercase text-base">{request.userName}</h3>
                            <p className="font-semibold text-sm text-gray-600">{request.userEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-xl text-green-600">${request.amount}</p>
                          <Badge 
                            variant={
                              request.status === 'PENDING' ? 'destructive' :
                              request.status === 'APPROVED' ? 'default' : 
                              'secondary'
                            }
                            className="text-xs font-bold uppercase"
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="font-bold uppercase text-xs text-gray-600">Wallet</p>
                          <p className="font-semibold text-sm">{request.walletName}</p>
                        </div>
                        <div>
                          <p className="font-bold uppercase text-xs text-gray-600">Payment Method</p>
                          <p className="font-semibold text-sm flex items-center">
                            <span className="mr-1">{getPaymentMethodIcon(request.paymentMethod)}</span>
                            {(request.paymentMethod || '').replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="font-bold uppercase text-xs text-gray-600">Date</p>
                          <p className="font-semibold text-sm">{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-bold uppercase text-xs text-gray-600">Time</p>
                          <p className="font-semibold text-sm">{new Date(request.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      {/* Notes */}
                      {request.notes && (
                        <div className="p-3 bg-gray-100 border-2 border-gray-300 mb-4">
                          <p className="font-bold uppercase text-xs text-gray-600 mb-1">Notes</p>
                          <p className="font-semibold text-sm">{request.notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {request.status === 'PENDING' ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => handleApprove(request.id)}
                            className="neo-brutal bg-green-500 text-white font-bold py-3 px-4 text-sm flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(request.id)}
                            className="neo-brutal bg-red-500 text-white font-bold py-3 px-4 text-sm flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center p-4 border-2 border-gray-300 bg-gray-50">
                          <p className="font-bold uppercase text-sm text-gray-600">
                            {request.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                          </p>
                          <p className="font-semibold text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                {filteredRequests.length === 0 && (
                  <Card className="neo-brutal-card text-center py-12">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-2xl font-black uppercase mb-2">No Top-up Requests</h3>
                    <p className="font-semibold text-gray-600">
                      {statusFilter === 'ALL' 
                        ? 'No top-up requests found matching your search.'
                        : `No ${statusFilter.toLowerCase()} top-up requests found.`
                      }
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