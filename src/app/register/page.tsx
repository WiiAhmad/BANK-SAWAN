'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
// import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CreditCard, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', formData); // Debug log
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      // console.log('Registration response:', data);
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }
      setSuccess('Registration successful! Redirecting...');
      setIsLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    console.log('Form data changed:', {
      ...formData,
      [e.target.name]: e.target.value
    }); // Debug log
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-yellow-200 to-orange-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 flex items-center justify-center p-4">
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
          <h1 className="text-3xl sm:text-4xl font-black uppercase mb-2 dark:text-white">Join MBank</h1>
          <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">Create your account in seconds</p>
        </div>

        {/* Register Form */}
        <Card className="neo-brutal neo-brutal-card">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold uppercase tracking-wider text-sm dark:text-white">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="neo-brutal h-10 sm:h-12 font-semibold text-sm sm:text-base dark:bg-gray-700 dark:text-white"
                placeholder="John Doe"
              />
            </div>

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
                  placeholder="Create a strong password"
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

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">{error}</div>
            )}
            {success && (
              <div className="text-green-600 dark:text-green-400 text-sm font-semibold text-center">{success}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="neo-brutal-button w-full h-10 sm:h-12"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <Card className="neo-brutal-card neo-brutal-green text-center">
            <div className="font-black uppercase text-xs sm:text-sm dark:text-white">Free Forever</div>
          </Card>
          <Card className="neo-brutal-card neo-brutal-orange text-center">
            <div className="font-black uppercase text-xs sm:text-sm dark:text-white">Instant Setup</div>
          </Card>
        </div>
      </div>
    </div>
  );
}