'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Plus, 
  Target,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  TrendingUp,
  Wallet,
  Send,
  RefreshCw,
  Archive,
  X,
  Filter,
  ArrowDownLeft
} from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface SavingsGoal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'VACATION' | 'EMERGENCY' | 'HOUSE' | 'CAR' | 'EDUCATION' | 'RETIREMENT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';
  createdAt: string;
  color: string;
}

interface Wallet {
  id: string;
  name: string;
  balance: number;
  color: string;
}

interface SavingsGoalFormData {
  name: string;
  description: string;
  targetAmount: string;
  targetDate: string;
  category: string;
  priority: string;
  color: string;
}

export default function SavingsGoals() {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    email: 'user@example.com',
    name: 'John Doe',
    role: 'USER'
  });
  
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      description: 'Build a 6-month emergency fund for unexpected expenses',
      targetAmount: 15000,
      currentAmount: 8500,
      targetDate: '2024-12-31',
      category: 'EMERGENCY',
      priority: 'HIGH',
      status: 'ACTIVE',
      createdAt: '2024-01-15',
      color: 'bg-red-500'
    },
    {
      id: '2',
      name: 'Dream Vacation',
      description: 'Trip to Japan for 2 weeks including flights and accommodation',
      targetAmount: 5000,
      currentAmount: 5000,
      targetDate: '2024-08-15',
      category: 'VACATION',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      createdAt: '2024-02-01',
      color: 'bg-blue-500'
    },
    {
      id: '3',
      name: 'New Car',
      description: 'Down payment for a new electric vehicle',
      targetAmount: 12000,
      currentAmount: 4200,
      targetDate: '2025-03-01',
      category: 'CAR',
      priority: 'MEDIUM',
      status: 'ACTIVE',
      createdAt: '2024-02-15',
      color: 'bg-green-500'
    },
    {
      id: '4',
      name: 'Old Laptop Fund',
      description: 'Saving for a new laptop - no longer needed',
      targetAmount: 2000,
      currentAmount: 800,
      targetDate: '2024-06-01',
      category: 'OTHER',
      priority: 'LOW',
      status: 'CANCELLED',
      createdAt: '2024-01-01',
      color: 'bg-gray-500'
    },
    {
      id: '5',
      name: 'Wedding Fund',
      description: 'Completed wedding savings - archived for reference',
      targetAmount: 8000,
      currentAmount: 8000,
      targetDate: '2023-12-01',
      category: 'OTHER',
      priority: 'HIGH',
      status: 'ARCHIVED',
      createdAt: '2023-06-01',
      color: 'bg-purple-500'
    }
  ]);

  const [wallets, setWallets] = useState<Wallet[]>([
    { id: '1', name: 'Main Wallet', balance: 8345.67, color: 'bg-indigo-500' },
    { id: '2', name: 'Savings Wallet', balance: 4000.00, color: 'bg-emerald-500' },
    { id: '3', name: 'Investment Wallet', balance: 2500.50, color: 'bg-violet-500' },
  ]);

  const [newGoal, setNewGoal] = useState<SavingsGoalFormData>({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    color: 'bg-indigo-500'
  });

  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [editGoalData, setEditGoalData] = useState<SavingsGoalFormData>({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    color: 'bg-indigo-500'
  });

  const [transferData, setTransferData] = useState({
    goalId: '',
    walletId: '',
    amount: ''
  });

  const [redeemData, setRedeemData] = useState({
    goalId: '',
    walletId: '',
    amount: ''
  });

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED'>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const categoryOptions = [
    { value: 'VACATION', label: 'Vacation', icon: '🏖️' },
    { value: 'EMERGENCY', label: 'Emergency Fund', icon: '🚨' },
    { value: 'HOUSE', label: 'House/Property', icon: '🏠' },
    { value: 'CAR', label: 'Car/Vehicle', icon: '🚗' },
    { value: 'EDUCATION', label: 'Education', icon: '🎓' },
    { value: 'RETIREMENT', label: 'Retirement', icon: '👴' },
    { value: 'OTHER', label: 'Other', icon: '🎯' },
  ];

  const colorOptions = [
    { value: 'bg-indigo-500', label: 'Indigo', color: 'bg-indigo-500' },
    { value: 'bg-emerald-500', label: 'Emerald', color: 'bg-emerald-500' },
    { value: 'bg-violet-500', label: 'Violet', color: 'bg-violet-500' },
    { value: 'bg-rose-500', label: 'Rose', color: 'bg-rose-500' },
    { value: 'bg-amber-500', label: 'Amber', color: 'bg-amber-500' },
    { value: 'bg-cyan-500', label: 'Cyan', color: 'bg-cyan-500' },
    { value: 'bg-pink-500', label: 'Pink', color: 'bg-pink-500' },
    { value: 'bg-teal-500', label: 'Teal', color: 'bg-teal-500' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const showSuccessMessage = (message: string) => {
    setActionSuccess(message);
    setTimeout(() => {
      setActionSuccess('');
    }, 3000);
  };

  const handleCreateGoal = () => {
    if (!newGoal.name.trim() || !newGoal.targetAmount) return;

    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      description: newGoal.description,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      targetDate: newGoal.targetDate,
      category: newGoal.category as any,
      priority: newGoal.priority as any,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      color: newGoal.color
    };

    setSavingsGoals([...savingsGoals, goal]);
    setNewGoal({
      name: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      category: 'OTHER',
      priority: 'MEDIUM',
      color: 'bg-indigo-500'
    });
    setIsCreateDialogOpen(false);
    showSuccessMessage('Savings goal created successfully');
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setEditGoalData({
      name: goal.name,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority,
      color: goal.color
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGoal = () => {
    if (!editingGoal || !editGoalData.name.trim() || !editGoalData.targetAmount) return;

    setSavingsGoals(prev => prev.map(goal => 
      goal.id === editingGoal.id 
        ? { 
            ...goal, 
            name: editGoalData.name,
            description: editGoalData.description,
            targetAmount: parseFloat(editGoalData.targetAmount),
            targetDate: editGoalData.targetDate,
            category: editGoalData.category as any,
            priority: editGoalData.priority as any,
            color: editGoalData.color
          }
        : goal
    ));

    setIsEditDialogOpen(false);
    setEditingGoal(null);
    showSuccessMessage('Savings goal updated successfully');
  };

  const handleDeleteGoal = (goal: SavingsGoal) => {
    setGoalToDelete(goal);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteGoal = () => {
    if (!goalToDelete) return;

    setSavingsGoals(prev => prev.filter(goal => goal.id !== goalToDelete.id));
    setIsDeleteDialogOpen(false);
    setGoalToDelete(null);
    showSuccessMessage('Savings goal deleted successfully');
  };

  const handleTransferToGoal = (goalId: string) => {
    setTransferData({ goalId, walletId: '', amount: '' });
    setIsTransferDialogOpen(true);
  };

  const executeTransfer = () => {
    if (!transferData.goalId || !transferData.walletId || !transferData.amount) return;

    const amount = parseFloat(transferData.amount);
    const selectedWallet = wallets.find(w => w.id === transferData.walletId);
    
    if (!selectedWallet || selectedWallet.balance < amount) {
      alert('Insufficient funds in selected wallet');
      return;
    }

    // Update wallet balance
    setWallets(prev => prev.map(wallet => 
      wallet.id === transferData.walletId 
        ? { ...wallet, balance: wallet.balance - amount }
        : wallet
    ));

    setSavingsGoals(prev => prev.map(goal => {
      if (goal.id === transferData.goalId) {
        const newAmount = goal.currentAmount + amount;
        const updatedGoal = { ...goal, currentAmount: newAmount };
        
        // Auto-complete goal if target is reached
        if (newAmount >= goal.targetAmount && goal.status === 'ACTIVE') {
          updatedGoal.status = 'COMPLETED';
        }
        
        return updatedGoal;
      }
      return goal;
    }));

    setTransferData({ goalId: '', walletId: '', amount: '' });
    setIsTransferDialogOpen(false);
    showSuccessMessage(`Successfully transferred $${amount} to savings goal`);
  };

  const handleRedeemFromGoal = (goalId: string) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal || goal.status !== 'COMPLETED') return;

    setRedeemData({ 
      goalId, 
      walletId: '1', // Default to main wallet
      amount: goal.currentAmount.toString() 
    });
    setIsRedeemDialogOpen(true);
  };

  const executeRedeem = () => {
    if (!redeemData.goalId || !redeemData.walletId || !redeemData.amount) return;

    const amount = parseFloat(redeemData.amount);
    const goal = savingsGoals.find(g => g.id === redeemData.goalId);
    
    if (!goal || amount > goal.currentAmount) {
      alert('Invalid redeem amount');
      return;
    }

    // Update wallet balance (add money back)
    setWallets(prev => prev.map(wallet => 
      wallet.id === redeemData.walletId 
        ? { ...wallet, balance: wallet.balance + amount }
        : wallet
    ));

    // Update goal amount (subtract redeemed amount)
    setSavingsGoals(prev => prev.map(goal => 
      goal.id === redeemData.goalId 
        ? { ...goal, currentAmount: goal.currentAmount - amount }
        : goal
    ));

    setRedeemData({ goalId: '', walletId: '', amount: '' });
    setIsRedeemDialogOpen(false);
    showSuccessMessage(`Successfully redeemed $${amount} to your wallet`);
  };

  const handleStatusChange = (goalId: string, newStatus: SavingsGoal['status']) => {
    setSavingsGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, status: newStatus } : goal
    ));
    showSuccessMessage(`Goal status updated to ${newStatus.toLowerCase()}`);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-orange-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'ARCHIVED': return 'bg-purple-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return Target;
      case 'COMPLETED': return CheckCircle;
      case 'ARCHIVED': return Archive;
      case 'CANCELLED': return X;
      default: return Target;
    }
  };

  const getCategoryIcon = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option?.icon || '🎯';
  };

  // Filter goals by status
  const filteredGoals = savingsGoals.filter(goal => 
    statusFilter === 'ALL' || goal.status === statusFilter
  );

  const totalSaved = filteredGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = filteredGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // Status counts
  const statusCounts = {
    ACTIVE: savingsGoals.filter(g => g.status === 'ACTIVE').length,
    COMPLETED: savingsGoals.filter(g => g.status === 'COMPLETED').length,
    ARCHIVED: savingsGoals.filter(g => g.status === 'ARCHIVED').length,
    CANCELLED: savingsGoals.filter(g => g.status === 'CANCELLED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="p-4 pt-20 md:pt-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="neo-brutal bg-white dark:bg-gray-700 dark:text-white p-2 sm:p-3"
              >
                <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase dark:text-white">Savings Goals</h1>
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">Track and achieve your financial goals</p>
              </div>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neo-brutal-button">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white max-w-md mx-auto p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-black uppercase dark:text-white">Create Savings Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Goal Name</Label>
                    <Input
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                      className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white"
                      placeholder="Enter goal name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Description</Label>
                    <Textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      className="border-2 border-black dark:border-white font-semibold min-h-[80px] dark:bg-gray-700 dark:text-white"
                      placeholder="Describe your goal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Target Amount</Label>
                      <Input
                        type="number"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                        className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Target Date</Label>
                      <Input
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                        className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Category</Label>
                      <Select value={newGoal.category} onValueChange={(value) => setNewGoal({...newGoal, category: value})}>
                        <SelectTrigger className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center space-x-2">
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Priority</Label>
                      <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({...newGoal, priority: value})}>
                        <SelectTrigger className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Color</Label>
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNewGoal({...newGoal, color: color.value})}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded border-2 sm:border-4 ${color.color} ${
                            newGoal.color === color.value ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-600'
                          } transition-all hover:scale-105`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-gray-400 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateGoal}
                      disabled={!newGoal.name.trim() || !newGoal.targetAmount}
                      className="bg-indigo-500 dark:bg-indigo-600 text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-indigo-600 dark:hover:bg-indigo-700"
                    >
                      Create Goal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

          {/* Status Filter */}
          <Card className="neo-brutal-card mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 dark:text-white" />
                <h3 className="font-black uppercase text-sm sm:text-base dark:text-white">Filter by Status</h3>
              </div>
              <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                {filteredGoals.length} of {savingsGoals.length} goals
              </span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {(['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED'] as const).map((status) => (
                <Button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`neo-brutal font-bold text-xs sm:text-sm py-2 px-3 sm:px-4 ${
                    statusFilter === status 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white dark:bg-gray-700 dark:text-white'
                  }`}
                >
                  {status}
                  {status !== 'ALL' && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-black bg-opacity-20 text-xs">
                      {statusCounts[status]}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </Card>

          {/* Overview Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="neo-brutal-card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1">Total Saved</p>
                  <p className="text-2xl sm:text-3xl font-black">${totalSaved.toFixed(2)}</p>
                </div>
                <Target className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            </Card>

            <Card className="neo-brutal-card neo-brutal-emerald">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1 text-emerald-800 dark:text-emerald-200">Total Target</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-100">${totalTarget.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-800 dark:text-emerald-200" />
              </div>
            </Card>

            <Card className="neo-brutal-card neo-brutal-amber">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1 text-amber-800 dark:text-amber-200">Filtered Goals</p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-100">{filteredGoals.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-amber-800 dark:text-amber-200" />
              </div>
            </Card>

            <Card className="neo-brutal-card neo-brutal-sky">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase text-xs sm:text-sm mb-1 text-sky-800 dark:text-sky-200">Overall Progress</p>
                  <p className="text-2xl sm:text-3xl font-black text-sky-900 dark:text-sky-100">{overallProgress.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-sky-800 dark:text-sky-200" />
              </div>
            </Card>
          </div>

          {/* Savings Goals List */}
          <div className="space-y-4 sm:space-y-6">
            {filteredGoals.map((goal) => {
              const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const StatusIcon = getStatusIcon(goal.status);
              
              return (
                <Card key={goal.id} className="neo-brutal-card">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full ${goal.color} flex items-center justify-center text-white text-xl`}>
                          {getCategoryIcon(goal.category)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-black uppercase text-lg dark:text-white">{goal.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getPriorityColor(goal.priority)}`}>
                              {goal.priority}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getStatusColor(goal.status)} flex items-center`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {goal.status}
                            </span>
                          </div>
                          <p className="font-semibold text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleEditGoal(goal)}
                          variant="ghost"
                          size="sm"
                          className="p-2 h-8 w-8 dark:text-white dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteGoal(goal)}
                          variant="ghost"
                          size="sm"
                          className="p-2 h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {goal.status !== 'CANCELLED' && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm dark:text-white">Progress</span>
                          <span className="font-black text-lg dark:text-white">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 border-2 border-black dark:border-white">
                          <div 
                            className={`h-full ${goal.color} transition-all duration-300`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="font-bold uppercase text-xs text-gray-600 dark:text-gray-400">Current</p>
                        <p className="font-black text-lg text-green-600 dark:text-green-400">${goal.currentAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-xs text-gray-600 dark:text-gray-400">Target</p>
                        <p className="font-black text-lg dark:text-white">${goal.targetAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-xs text-gray-600 dark:text-gray-400">Remaining</p>
                        <p className="font-black text-lg text-orange-600 dark:text-orange-400">
                          ${Math.max(0, goal.targetAmount - goal.currentAmount).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-xs text-gray-600 dark:text-gray-400">Days Left</p>
                        <p className={`font-black text-lg ${daysRemaining < 30 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {daysRemaining > 0 ? daysRemaining : 'Overdue'}
                        </p>
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {goal.status === 'ACTIVE' && progress >= 100 && (
                        <Button
                          onClick={() => handleStatusChange(goal.id, 'COMPLETED')}
                          className="neo-brutal bg-green-500 text-white font-bold py-2 px-4 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                      {goal.status === 'ACTIVE' && (
                        <Button
                          onClick={() => handleStatusChange(goal.id, 'CANCELLED')}
                          className="neo-brutal bg-red-500 text-white font-bold py-2 px-4 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel Goal
                        </Button>
                      )}
                      {goal.status === 'COMPLETED' && (
                        <Button
                          onClick={() => handleStatusChange(goal.id, 'ARCHIVED')}
                          className="neo-brutal bg-purple-500 text-white font-bold py-2 px-4 text-xs"
                        >
                          <Archive className="h-3 w-3 mr-1" />
                          Archive Goal
                        </Button>
                      )}
                      {(goal.status === 'CANCELLED' || goal.status === 'ARCHIVED') && (
                        <Button
                          onClick={() => handleStatusChange(goal.id, 'ACTIVE')}
                          className="neo-brutal bg-blue-500 text-white font-bold py-2 px-4 text-xs"
                        >
                          <Target className="h-3 w-3 mr-1" />
                          Reactivate Goal
                        </Button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Transfer Button for Active Goals */}
                      {goal.status === 'ACTIVE' && progress < 100 && (
                        <Button
                          onClick={() => handleTransferToGoal(goal.id)}
                          className="neo-brutal bg-green-500 dark:bg-green-600 text-white font-bold py-3 px-6 w-full hover:bg-green-600 dark:hover:bg-green-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Transfer Money to Goal
                        </Button>
                      )}

                      {/* Redeem Button for Completed Goals */}
                      {goal.status === 'COMPLETED' && goal.currentAmount > 0 && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => handleRedeemFromGoal(goal.id)}
                            className="neo-brutal bg-blue-500 dark:bg-blue-600 text-white font-bold py-3 px-6 flex-1 hover:bg-blue-600 dark:hover:bg-blue-700"
                          >
                            <ArrowDownLeft className="h-4 w-4 mr-2" />
                            Redeem to Main Wallet
                          </Button>
                          <Button
                            onClick={() => handleStatusChange(goal.id, 'ARCHIVED')}
                            className="neo-brutal bg-purple-500 text-white font-bold py-3 px-6 flex-1"
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive Goal
                          </Button>
                        </div>
                      )}

                      {/* Status Messages */}
                      {goal.status === 'COMPLETED' && goal.currentAmount === 0 && (
                        <div className="text-center p-4 bg-green-100 dark:bg-green-900 border-2 border-green-500">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                          <p className="font-black uppercase text-green-800 dark:text-green-200">Goal Completed & Redeemed!</p>
                        </div>
                      )}

                      {goal.status === 'COMPLETED' && goal.currentAmount > 0 && (
                        <div className="text-center p-4 bg-green-100 dark:bg-green-900 border-2 border-green-500">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                          <p className="font-black uppercase text-green-800 dark:text-green-200">Goal Completed!</p>
                          <p className="font-semibold text-sm text-green-700 dark:text-green-300 mt-1">
                            ${goal.currentAmount.toFixed(2)} available to redeem
                          </p>
                        </div>
                      )}

                      {goal.status === 'CANCELLED' && (
                        <div className="text-center p-4 bg-red-100 dark:bg-red-900 border-2 border-red-500">
                          <X className="h-8 w-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
                          <p className="font-black uppercase text-red-800 dark:text-red-200">Goal Cancelled</p>
                        </div>
                      )}

                      {goal.status === 'ARCHIVED' && (
                        <div className="text-center p-4 bg-purple-100 dark:bg-purple-900 border-2 border-purple-500">
                          <Archive className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                          <p className="font-black uppercase text-purple-800 dark:text-purple-200">Goal Archived</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredGoals.length === 0 && (
              <Card className="neo-brutal-card text-center py-12">
                <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-black uppercase mb-2 dark:text-white">
                  {statusFilter === 'ALL' ? 'No Savings Goals' : `No ${statusFilter} Goals`}
                </h3>
                <p className="font-semibold text-gray-600 dark:text-gray-400 mb-6">
                  {statusFilter === 'ALL' 
                    ? 'Start your savings journey by creating your first goal.'
                    : `You don't have any ${statusFilter.toLowerCase()} goals at the moment.`
                  }
                </p>
                {statusFilter === 'ALL' && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="neo-brutal-button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                )}
              </Card>
            )}
          </div>

          {/* Transfer Dialog */}
          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogContent className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white max-w-md mx-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-black uppercase dark:text-white">Transfer to Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Select Wallet</Label>
                  <Select value={transferData.walletId} onValueChange={(value) => setTransferData({...transferData, walletId: value})}>
                    <SelectTrigger className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white">
                      <SelectValue placeholder="Choose wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${wallet.color}`}></div>
                            <span>{wallet.name} - ${wallet.balance.toFixed(2)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                    className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setIsTransferDialogOpen(false)}
                    className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-gray-400 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={executeTransfer}
                    disabled={!transferData.walletId || !transferData.amount}
                    className="bg-green-500 dark:bg-green-600 text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-green-600 dark:hover:bg-green-700"
                  >
                    Transfer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Redeem Dialog */}
          <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
            <DialogContent className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white max-w-md mx-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-black uppercase dark:text-white">Redeem from Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <p className="font-bold text-sm dark:text-white">Goal Completed!</p>
                  </div>
                  <p className="font-semibold text-xs text-blue-700 dark:text-blue-300">
                    Transfer your saved money back to your wallet to use it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Select Wallet</Label>
                  <Select value={redeemData.walletId} onValueChange={(value) => setRedeemData({...redeemData, walletId: value})}>
                    <SelectTrigger className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white">
                      <SelectValue placeholder="Choose wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${wallet.color}`}></div>
                            <span>{wallet.name} - ${wallet.balance.toFixed(2)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Amount to Redeem</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={redeemData.amount}
                    onChange={(e) => setRedeemData({...redeemData, amount: e.target.value})}
                    className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                  {redeemData.goalId && (
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Available: ${savingsGoals.find(g => g.id === redeemData.goalId)?.currentAmount.toFixed(2) || '0.00'}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setIsRedeemDialogOpen(false)}
                    className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-gray-400 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={executeRedeem}
                    disabled={!redeemData.walletId || !redeemData.amount}
                    className="bg-blue-500 dark:bg-blue-600 text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Goal Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white max-w-md mx-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-black uppercase dark:text-white">Edit Savings Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Goal Name</Label>
                  <Input
                    value={editGoalData.name}
                    onChange={(e) => setEditGoalData({...editGoalData, name: e.target.value})}
                    className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white"
                    placeholder="Enter goal name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Description</Label>
                  <Textarea
                    value={editGoalData.description}
                    onChange={(e) => setEditGoalData({...editGoalData, description: e.target.value})}
                    className="border-2 border-black dark:border-white font-semibold min-h-[80px] dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your goal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Target Amount</Label>
                    <Input
                      type="number"
                      value={editGoalData.targetAmount}
                      onChange={(e) => setEditGoalData({...editGoalData, targetAmount: e.target.value})}
                      className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Target Date</Label>
                    <Input
                      type="date"
                      value={editGoalData.targetDate}
                      onChange={(e) => setEditGoalData({...editGoalData, targetDate: e.target.value})}
                      className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Category</Label>
                    <Select value={editGoalData.category} onValueChange={(value) => setEditGoalData({...editGoalData, category: value})}>
                      <SelectTrigger className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center space-x-2">
                              <span>{category.icon}</span>
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Priority</Label>
                    <Select value={editGoalData.priority} onValueChange={(value) => setEditGoalData({...editGoalData, priority: value})}>
                      <SelectTrigger className="border-2 border-black dark:border-white h-10 sm:h-12 font-semibold dark:bg-gray-700 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-sm dark:text-white">Color</Label>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setEditGoalData({...editGoalData, color: color.value})}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded border-2 sm:border-4 ${color.color} ${
                          editGoalData.color === color.value ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-600'
                        } transition-all hover:scale-105`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setIsEditDialogOpen(false)}
                    className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-gray-400 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateGoal}
                    disabled={!editGoalData.name.trim() || !editGoalData.targetAmount}
                    className="bg-indigo-500 dark:bg-indigo-600 text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-indigo-600 dark:hover:bg-indigo-700"
                  >
                    Update Goal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white max-w-md mx-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-red-600 dark:text-red-400">Delete Savings Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-bold text-sm dark:text-white">Are you sure you want to delete this goal?</p>
                    <p className="font-semibold text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {goalToDelete?.name} - ${goalToDelete?.currentAmount.toFixed(2)} saved
                    </p>
                  </div>
                </div>
                
                <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                  This action cannot be undone. The saved amount will remain in your account, but the goal tracking will be permanently deleted.
                </p>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-gray-400 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteGoal}
                    className="bg-red-500 dark:bg-red-600 text-white border-2 border-black dark:border-white flex-1 font-bold py-3 uppercase tracking-wider hover:bg-red-600 dark:hover:bg-red-700"
                  >
                    Delete Goal
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