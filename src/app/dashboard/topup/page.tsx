'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Wallet,
  CreditCard,
  DollarSign,
  CheckCircle,
  Banknote,
  Smartphone,
  Building
} from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';

interface Wallet {
  id: string;
  name: string;
  type: 'main' | 'secondary';
  balance: number;
  currency: string;
  color: string;
}

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export default function TopUp() {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    email: 'user@example.com',
    name: 'John Doe',
    role: 'USER'
  });
  
  const [topupData, setTopupData] = useState({
    wallet: '',
    amount: '',
    paymentMethod: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [topupComplete, setTopupComplete] = useState(false);

  // Mock wallet data
  const wallets: Wallet[] = [
    { id: '1', name: 'Main Wallet', type: 'main', balance: 8345.67, currency: 'USD', color: 'bg-blue-500' },
    { id: '2', name: 'Savings Wallet', type: 'secondary', balance: 4000.00, currency: 'USD', color: 'bg-green-500' },
    { id: '3', name: 'Investment Wallet', type: 'secondary', balance: 2500.50, currency: 'USD', color: 'bg-purple-500' },
    { id: '4', name: 'Emergency Fund', type: 'secondary', balance: 1500.00, currency: 'USD', color: 'bg-orange-500' },
  ];

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: Banknote, description: 'Pay with cash at our partner locations' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building, description: 'Transfer from your bank account' },
    { value: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard, description: 'Pay with your debit card' },
    { value: 'MOBILE_PAYMENT', label: 'Mobile Payment', icon: Smartphone, description: 'Use mobile payment services' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate top-up process
    setTimeout(() => {
      setIsLoading(false);
      setTopupComplete(true);
    }, 2000);
  };

  const handleChange = (field: string, value: string) => {
    setTopupData({
      ...topupData,
      [field]: value
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const getWalletById = (id: string) => wallets.find(w => w.id === id);
  const selectedWallet = getWalletById(topupData.wallet);
  const selectedPaymentMethod = paymentMethods.find(pm => pm.value === topupData.paymentMethod);

  if (topupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex items-center justify-center min-h-screen p-4 pt-20 md:pt-4">
          <Card className="neo-brutal-card neo-brutal-green max-w-md w-full text-center">
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-green-600" />
            <h1 className="text-2xl sm:text-3xl font-black uppercase mb-4">Top-up Successful!</h1>
            <p className="font-semibold mb-6 text-sm sm:text-base">
              Successfully added ${topupData.amount} to {selectedWallet?.name} using {selectedPaymentMethod?.label}
            </p>
            <div className="space-y-3 sm:space-y-4">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="neo-brutal-button w-full"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => {
                  setTopupComplete(false);
                  setTopupData({ wallet: '', amount: '', paymentMethod: '' });
                }}
                className="neo-brutal bg-white w-full font-bold py-3 px-6 uppercase tracking-wider"
              >
                New Top-up
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="p-4 pt-20 md:pt-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
            <Button
              onClick={() => router.push('/dashboard')}
              className="neo-brutal bg-white p-2 sm:p-3 hidden md:flex"
            >
              <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase">Top Up Wallet</h1>
              <p className="font-semibold text-gray-700 text-sm sm:text-base">Add money to your wallets</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Top-up Form */}
            <div className="lg:col-span-2">
              <Card className="neo-brutal-card">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="neo-brutal bg-green-500 text-white p-2 sm:p-3">
                    <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase">Top-up Details</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm">Select Wallet</Label>
                    <Select value={topupData.wallet} onValueChange={(value) => handleChange('wallet', value)}>
                      <SelectTrigger className="neo-brutal h-10 sm:h-12 font-semibold">
                        <SelectValue placeholder="Choose wallet to top up" />
                      </SelectTrigger>
                      <SelectContent>
                        {wallets.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${wallet.color}`}></div>
                              <span className="text-sm">{wallet.name} - ${wallet.balance.toFixed(2)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm">Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                      <Input
                        type="number"
                        step="0.01"
                        min="1"
                        value={topupData.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                        className="neo-brutal h-10 sm:h-12 font-semibold pl-8 sm:pl-10 text-sm sm:text-base"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm">Payment Method</Label>
                    <Select value={topupData.paymentMethod} onValueChange={(value) => handleChange('paymentMethod', value)}>
                      <SelectTrigger className="neo-brutal h-10 sm:h-12 font-semibold">
                        <SelectValue placeholder="Choose payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center space-x-3">
                              <method.icon className="h-4 w-4" />
                              <div>
                                <div className="font-semibold text-sm">{method.label}</div>
                                <div className="text-xs text-gray-600">{method.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !topupData.wallet || !topupData.amount || !topupData.paymentMethod}
                    className="neo-brutal-button w-full h-10 sm:h-12"
                  >
                    {isLoading ? 'Processing Top-up...' : 'Top Up Wallet'}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Top-up Summary & Quick Amounts */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="neo-brutal-card bg-gradient-to-br from-green-500 to-blue-600 text-white">
                <h3 className="font-black uppercase mb-4 text-sm sm:text-base">Top-up Summary</h3>
                <div className="space-y-3 sm:space-y-4">
                  {selectedWallet && (
                    <div className="p-3 bg-white/20 border-2 border-white border-opacity-30">
                      <p className="font-semibold text-xs sm:text-sm">Wallet</p>
                      <p className="font-bold text-sm sm:text-base">{selectedWallet.name}</p>
                      <p className="font-mono text-xs sm:text-sm">Current: ${selectedWallet.balance.toFixed(2)}</p>
                    </div>
                  )}

                  {topupData.amount && (
                    <div className="p-3 bg-white/20 border-2 border-white border-opacity-30">
                      <p className="font-semibold text-xs sm:text-sm">Amount</p>
                      <p className="font-black text-lg sm:text-xl">+${topupData.amount}</p>
                    </div>
                  )}

                  {selectedPaymentMethod && (
                    <div className="p-3 bg-white/20 border-2 border-white border-opacity-30">
                      <p className="font-semibold text-xs sm:text-sm">Payment Method</p>
                      <div className="flex items-center space-x-2">
                        <selectedPaymentMethod.icon className="h-4 w-4" />
                        <p className="font-bold text-sm sm:text-base">{selectedPaymentMethod.label}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="neo-brutal-card neo-brutal-orange">
                <h3 className="font-black uppercase mb-4 text-sm sm:text-base">Quick Amounts</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[50, 100, 250, 500].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => handleChange('amount', amount.toString())}
                      className="neo-brutal bg-white font-bold py-2 px-3 sm:px-4 text-xs sm:text-sm"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="neo-brutal-card bg-blue-100">
                <h3 className="font-black uppercase mb-3 text-sm">Payment Methods</h3>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div key={method.value} className="flex items-center space-x-2 p-2 border border-gray-300">
                      <method.icon className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-bold text-xs">{method.label}</p>
                        <p className="text-xs text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}