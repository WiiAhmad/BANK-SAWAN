'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';

interface User {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  address?: string;
  phone?: string;
}

interface UserSettings {
  name: string;
  email: string;
  password: string;
  updatedPassword: string;
  address: string;
  phone: string;
}

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    password: '',
    updatedPassword: '',
    address: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUserData();
  }, [router]);

  const fetchUserData = async () => {
    setIsFetching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Mock user settings data
      setSettings({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        password: '',
        updatedPassword: '',
        address: parsedUser.address || '',
        phone: parsedUser.phone || ''
      });
      
      setIsFetching(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleChange = (field: keyof UserSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!settings.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!settings.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(settings.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (settings.password && settings.password.length < 6) {
      newErrors.password = 'Current password must be at least 6 characters';
    }

    if (settings.updatedPassword && settings.updatedPassword.length < 6) {
      newErrors.updatedPassword = 'New password must be at least 6 characters';
    }

    if (settings.updatedPassword && !settings.password) {
      newErrors.password = 'Current password is required to change password';
    }

    if (settings.phone && !/^\+?[\d\s\-\(\)]+$/.test(settings.phone)) {
      newErrors.phone = 'Phone number format is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Add null check for user to ensure type narrowing
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Update localStorage with new user data
      const updatedUser: User = {
        ...user,
        name: settings.name,
        email: settings.email,
        address: settings.address || undefined,
        phone: settings.phone || undefined
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Clear password fields
      setSettings(prev => ({
        ...prev,
        password: '',
        updatedPassword: ''
      }));

      setIsLoading(false);
      setUpdateSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    }, 1500);
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center p-4">
        <div className="neo-brutal-card">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 font-bold uppercase text-center text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="p-4 pt-20 md:pt-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="neo-brutal  p-2 sm:p-3 hidden md:flex"
              >
                <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase">Settings</h1>
                <p className="font-semibold text-gray-700 text-sm sm:text-base">Manage your account preferences</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isFetching}
              className="neo-brutal bg-blue-500 text-white font-bold py-2 px-4 text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Success Message */}
          {updateSuccess && (
            <Card className="neo-brutal-card neo-brutal-green mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                <div>
                  <h3 className="font-black uppercase text-sm sm:text-base">Settings Updated!</h3>
                  <p className="font-semibold text-xs sm:text-sm">Your account settings have been successfully updated.</p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Settings Form */}
            <div className="lg:col-span-2">
              <Card className="neo-brutal-card">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="neo-brutal bg-purple-500 text-white p-2 sm:p-3">
                    <User className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase">Account Settings</h2>
                </div>

                {isFetching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="font-bold uppercase text-sm">Fetching user data...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-black uppercase border-b-2 border-gray-200 pb-2">Personal Information</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold uppercase tracking-wider text-sm">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                            <Input
                              value={settings.name}
                              onChange={(e) => handleChange('name', e.target.value)}
                              className={`neo-brutal h-10 sm:h-12 font-semibold pl-8 sm:pl-10 ${errors.name ? 'border-red-500' : ''}`}
                              placeholder="Enter your full name"
                            />
                          </div>
                          {errors.name && (
                            <p className="text-red-600 text-xs font-semibold flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold uppercase tracking-wider text-sm">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                            <Input
                              type="email"
                              value={settings.email}
                              onChange={(e) => handleChange('email', e.target.value)}
                              className={`neo-brutal h-10 sm:h-12 font-semibold pl-8 sm:pl-10 ${errors.email ? 'border-red-500' : ''}`}
                              placeholder="Enter your email"
                            />
                          </div>
                          {errors.email && (
                            <p className="text-red-600 text-xs font-semibold flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold uppercase tracking-wider text-sm">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                            <Input
                              value={settings.phone}
                              onChange={(e) => handleChange('phone', e.target.value)}
                              className={`neo-brutal h-10 sm:h-12 font-semibold pl-8 sm:pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-red-600 text-xs font-semibold flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold uppercase tracking-wider text-sm">Role</Label>
                          <div className="neo-brutal h-10 sm:h-12 bg-gray-100 flex items-center px-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                              user.role === 'SUPER_ADMIN' ? 'bg-red-500' :
                              user.role === 'ADMIN' ? 'bg-orange-500' : 'bg-green-500'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold uppercase tracking-wider text-sm">Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          <Textarea
                            value={settings.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="neo-brutal font-semibold pl-8 sm:pl-10 min-h-[80px]"
                            placeholder="Enter your address"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Change */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-black uppercase border-b-2 border-gray-200 pb-2">Change Password</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold uppercase tracking-wider text-sm">Current Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              value={settings.password}
                              onChange={(e) => handleChange('password', e.target.value)}
                              className={`neo-brutal h-10 sm:h-12 font-semibold pl-8 sm:pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-red-600 text-xs font-semibold flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold uppercase tracking-wider text-sm">New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                            <Input
                              type={showNewPassword ? 'text' : 'password'}
                              value={settings.updatedPassword}
                              onChange={(e) => handleChange('updatedPassword', e.target.value)}
                              className={`neo-brutal h-10 sm:h-12 font-semibold pl-8 sm:pl-10 pr-10 ${errors.updatedPassword ? 'border-red-500' : ''}`}
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                              )}
                            </button>
                          </div>
                          {errors.updatedPassword && (
                            <p className="text-red-600 text-xs font-semibold flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.updatedPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="neo-brutal-button w-full h-10 sm:h-12"
                    >
                      <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {isLoading ? 'Updating Settings...' : 'Save Changes'}
                    </Button>
                  </form>
                )}
              </Card>
            </div>

            {/* Account Summary */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="neo-brutal-card bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <h3 className="font-black uppercase mb-4 text-sm sm:text-base">Account Summary</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3  bg-opacity-20 border-2 border-white border-opacity-30">
                    <p className="font-semibold text-xs sm:text-sm">Account Type</p>
                    <p className="font-bold text-sm sm:text-base">{user.role}</p>
                  </div>
                  <div className="p-3  bg-opacity-20 border-2 border-white border-opacity-30">
                    <p className="font-semibold text-xs sm:text-sm">Member Since</p>
                    <p className="font-bold text-sm sm:text-base">January 2024</p>
                  </div>
                  <div className="p-3  bg-opacity-20 border-2 border-white border-opacity-30">
                    <p className="font-semibold text-xs sm:text-sm">Status</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <p className="font-bold text-sm sm:text-base">Active</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="neo-brutal-card neo-brutal-orange">
                <h3 className="font-black uppercase mb-4 text-sm sm:text-base">Security Tips</h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-black rounded-full mt-2"></div>
                    <p className="font-semibold">Use a strong, unique password</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-black rounded-full mt-2"></div>
                    <p className="font-semibold">Keep your contact information updated</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-black rounded-full mt-2"></div>
                    <p className="font-semibold">Never share your login credentials</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-black rounded-full mt-2"></div>
                    <p className="font-semibold">Log out from shared devices</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}