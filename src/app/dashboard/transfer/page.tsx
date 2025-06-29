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
  Send, 
  Wallet,
  CreditCard,
  DollarSign,
  CheckCircle
} from 'lucide-react';

interface Wallet {
  id: string;
  name: string;
  type: 'main' | 'secondary';
  balance: number;
  currency: string;
  color: string;
}

export default function Transfer() {
  const router = useRouter();
  const [transferData, setTransferData] = useState({
    fromWallet: '',
    toWallet: '',
    amount: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);

  // Mock wallet data
  const wallets: Wallet[] = [
    { id: '1', name: 'Main Wallet', type: 'main', balance: 8345.67, currency: 'USD', color: 'bg-blue-500' },
    { id: '2', name: 'Savings Wallet', type: 'secondary', balance: 4000.00, currency: 'USD', color: 'bg-green-500' },
    { id: '3', name: 'Investment Wallet', type: 'secondary', balance: 2500.50, currency: 'USD', color: 'bg-purple-500' },
    { id: '4', name: 'Emergency Fund', type: 'secondary', balance: 1500.00, currency: 'USD', color: 'bg-orange-500' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate transfer process
    setTimeout(() => {
      setIsLoading(false);
      setTransferComplete(true);
    }, 2000);
  };

  const handleChange = (field: string, value: string) => {
    setTransferData({
      ...transferData,
      [field]: value
    });
  };

  const getWalletById = (id: string) => wallets.find(w => w.id === id);
  const fromWallet = getWalletById(transferData.fromWallet);
  const toWallet = getWalletById(transferData.toWallet);

  if (transferComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center p-4">
        <Card className="neo-brutal-card neo-brutal-green max-w-md w-full text-center">
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-green-600" />
          <h1 className="text-2xl sm:text-3xl font-black uppercase mb-4">Transfer Complete!</h1>
          <p className="font-semibold mb-6 text-sm sm:text-base">
            Successfully transferred ${transferData.amount} from {fromWallet?.name} to {toWallet?.name}
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
                setTransferComplete(false);
                setTransferData({ fromWallet: '', toWallet: '', amount: '', description: '' });
              }}
              className="neo-brutal bg-white w-full font-bold py-3 px-6 uppercase tracking-wider"
            >
              New Transfer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
          <Button
            onClick={() => router.push('/dashboard')}
            className="neo-brutal bg-white p-2 sm:p-3"
          >
            <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase">Transfer Money</h1>
            <p className="font-semibold text-gray-700 text-sm sm:text-base">Send money between your wallets</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Transfer Form */}
          <div className="lg:col-span-2">
            <Card className="neo-brutal neo-brutal-card">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="neo-brutal bg-blue-500 text-white p-2 sm:p-3">
                  <Send className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase">Transfer Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm">From Wallet</Label>
                    <Select value={transferData.fromWallet} onValueChange={(value) => handleChange('fromWallet', value)}>
                      <SelectTrigger className="neo-brutal h-10 sm:h-12 font-semibold">
                        <SelectValue placeholder="Select source wallet" />
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
                    <Label className="font-bold uppercase tracking-wider text-sm">To Wallet</Label>
                    <Select value={transferData.toWallet} onValueChange={(value) => handleChange('toWallet', value)}>
                      <SelectTrigger className="neo-brutal h-10 sm:h-12 font-semibold">
                        <SelectValue placeholder="Select destination wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        {wallets.filter(w => w.id !== transferData.fromWallet).map((wallet) => (
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
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    <Input
                      type="number"
                      step="0.01"
                      value={transferData.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      className="neo-brutal h-10 sm:h-12 font-semibold pl-8 sm:pl-10 text-sm sm:text-base"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {fromWallet && (
                    <p className="text-xs sm:text-sm font-semibold text-gray-600">
                      Available: ${fromWallet.balance.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm">Description (Optional)</Label>
                  <Input
                    value={transferData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="neo-brutal h-10 sm:h-12 font-semibold text-sm sm:text-base"
                    placeholder="What's this transfer for?"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !transferData.fromWallet || !transferData.toWallet || !transferData.amount}
                  className="neo-brutal neo-brutal-button w-full h-10 sm:h-12"
                >
                  {isLoading ? 'Processing Transfer...' : 'Transfer Money'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Transfer Summary */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="neo-brutal neo-brutal-card bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <h3 className="font-black uppercase mb-4 text-sm sm:text-base">Transfer Summary</h3>
              <div className="space-y-3 sm:space-y-4">
                {fromWallet && (
                  <div className="p-3 bg-white/20 border-2 border-white border-opacity-30">
                    <p className="font-semibold text-xs sm:text-sm">From</p>
                    <p className="font-bold text-sm sm:text-base">{fromWallet.name}</p>
                    <p className="font-mono text-xs sm:text-sm">${fromWallet.balance.toFixed(2)}</p>
                  </div>
                )}
                
                {toWallet && (
                  <div className="p-3 bg-white/20 border-2 border-white border-opacity-30">
                    <p className="font-semibold text-xs sm:text-sm">To</p>
                    <p className="font-bold text-sm sm:text-base">{toWallet.name}</p>
                    <p className="font-mono text-xs sm:text-sm">${toWallet.balance.toFixed(2)}</p>
                  </div>
                )}

                {transferData.amount && (
                  <div className="p-3 bg-white/20 border-2 border-white border-opacity-30">
                    <p className="font-semibold text-xs sm:text-sm">Amount</p>
                    <p className="font-black text-lg sm:text-xl">${transferData.amount}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="neo-brutal neo-brutal-card neo-brutal-orange">
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
          </div>
        </div>
      </div>
    </div>
  );
}