'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
// import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CreditCard, Eye, EyeOff, Shield, Crown, User } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }
      // Store user and token (for demo: localStorage)
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (data.user.role === 'SUPER_ADMIN') {
        router.push('/dashboard/superadmin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDemoLogin = (role: 'USER' | 'ADMIN' | 'SUPER_ADMIN') => {
    setIsLoading(true);
    
    let userData;
    let redirectPath: string;
    
    switch (role) {
      case 'ADMIN':
        userData = {
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN'
        };
        redirectPath = '/dashboard/admin';
        break;
      case 'SUPER_ADMIN':
        userData = {
          email: 'superadmin@example.com',
          name: 'Super Admin',
          role: 'SUPER_ADMIN'
        };
        redirectPath = '/dashboard/superadmin';
        break;
      default:
        userData = {
          email: 'user@example.com',
          name: 'John Doe',
          role: 'USER'
        };
        redirectPath = '/dashboard';
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    setTimeout(() => {
      setIsLoading(false);
      router.push(redirectPath);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="neo-brutal bg-black dark:bg-white text-white dark:text-black p-2 sm:p-3">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <span className="text-xl sm:text-2xl font-black uppercase tracking-wider dark:text-white">MBank</span>
            </Link>
            {/* <ThemeToggle /> */}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase mb-2 dark:text-white">Welcome Back</h1>
          <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card className="neo-brutal neo-brutal-card">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold uppercase tracking-wider text-sm dark:text-white">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="neo-brutal h-10 sm:h-12 font-semibold text-sm sm:text-base dark:bg-gray-700 dark:text-white"
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold uppercase tracking-wider text-sm dark:text-white">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="neo-brutal h-10 sm:h-12 font-semibold pr-10 sm:pr-12 text-sm sm:text-base dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="neo-brutal neo-brutal-button w-full h-10 sm:h-12"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">{error}</div>
            )}
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </Card>

        {/* Demo Credentials */}
        <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          <Card className="neo-brutal neo-brutal-card bg-yellow-300 dark:bg-yellow-600">
            <h3 className="font-black uppercase mb-3 text-sm sm:text-base dark:text-white">Demo Credentials</h3>
            <div className="space-y-2 text-xs sm:text-sm dark:text-white">
              <div className="font-semibold">
                <strong>User:</strong> user@example.com / password123
              </div>
              <div className="font-semibold">
                <strong>Admin:</strong> admin@example.com / password123
              </div>
              <div className="font-semibold">
                <strong>Super Admin:</strong> superadmin@example.com / password123
              </div>
            </div>
          </Card>

          {/* Role-based Quick Demo Login Buttons */}
          <Card className="neo-brutal neo-brutal-card bg-green-300 dark:bg-green-600">
            <h3 className="font-black uppercase mb-3 text-sm sm:text-base dark:text-white">Quick Demo Login</h3>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              <Button
                onClick={() => handleDemoLogin('USER')}
                disabled={isLoading}
                className="neo-brutal bg-blue-500 dark:bg-blue-600 text-white font-bold py-2 px-4 text-xs sm:text-sm w-full flex items-center justify-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Login as User</span>
              </Button>
              <Button
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={isLoading}
                className="neo-brutal bg-orange-500 dark:bg-orange-600 text-white font-bold py-2 px-4 text-xs sm:text-sm w-full flex items-center justify-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Login as Admin</span>
              </Button>
              <Button
                onClick={() => handleDemoLogin('SUPER_ADMIN')}
                disabled={isLoading}
                className="neo-brutal bg-red-500 dark:bg-red-600 text-white font-bold py-2 px-4 text-xs sm:text-sm w-full flex items-center justify-center space-x-2"
              >
                <Crown className="h-4 w-4" />
                <span>Login as Super Admin</span>
              </Button>
            </div>
          </Card>

          {/* Role Descriptions */}
          <Card className="neo-brutal neo-brutal-card bg-blue-100 dark:bg-blue-800">
            <h3 className="font-black uppercase mb-3 text-sm sm:text-base dark:text-white">Role Permissions</h3>
            <div className="space-y-2 text-xs sm:text-sm dark:text-white">
              <div className="flex items-start space-x-2">
                <User className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-300" />
                <div>
                  <p className="font-bold">User:</p>
                  <p className="font-semibold text-gray-600 dark:text-gray-300">Dashboard, wallets, transfers, savings goals</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 mt-0.5 text-orange-600 dark:text-orange-300" />
                <div>
                  <p className="font-bold">Admin:</p>
                  <p className="font-semibold text-gray-600 dark:text-gray-300">Verify top-ups and user registrations</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Crown className="h-4 w-4 mt-0.5 text-red-600 dark:text-red-300" />
                <div>
                  <p className="font-bold">Super Admin:</p>
                  <p className="font-semibold text-gray-600 dark:text-gray-300">Full access: transactions, system logs, all admin functions</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}