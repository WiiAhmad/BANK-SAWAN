import Link from 'next/link';
import { Card } from '@/components/ui/card';
// import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  CreditCard, 
  Shield, 
  Smartphone, 
  Zap, 
  TrendingUp, 
  Users,
  ArrowRight,
  Star
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-violet-200 to-rose-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="neo-brutal bg-black dark:bg-white text-white dark:text-black p-2 sm:p-3">
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <span className="text-xl sm:text-2xl font-black uppercase tracking-wider dark:text-white">Bank Sawan</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-6">
            {/* <ThemeToggle /> */}
            <Link href="/login" className="font-bold uppercase tracking-wider hover:underline text-sm sm:text-base dark:text-white">Login</Link>
            <Link href="/register" className="neo-brutal neo-brutal-button">Sign Up</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-tight dark:text-white">
              Banking
              <span className="block text-indigo-600 dark:text-indigo-400">Revolution</span>
              <span className="block text-emerald-500 dark:text-emerald-400">Starts Here</span>
            </h1>
            <p className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 max-w-lg mx-auto lg:mx-0">
              Experience lightning-fast transactions, military-grade security, and 24/7 availability with Bank Sawan's cutting-edge mobile banking platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto lg:mx-0">
              <Link href="/register" className="neo-brutal neo-brutal-button text-center flex-1">
                Get Started Free
              </Link>
              <Link href="/login" className="neo-brutal neo-brutal-secondary font-bold py-3 px-4 sm:py-4 sm:px-8 uppercase tracking-wider text-center flex-1 text-sm sm:text-base">
                Existing User
              </Link>
            </div>
          </div>
          <div className="relative max-w-sm mx-auto lg:max-w-none">
            <div className="neo-brutal neo-brutal-card bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-sm sm:text-base">Bank Sawan Card</span>
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full"></div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-400 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xl sm:text-2xl font-mono">**** **** **** 1234</div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="font-bold">JOHN DOE</span>
                    <span className="font-mono">12/26</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase text-center mb-8 sm:mb-16 dark:text-white">
          Why Choose Bank Sawan?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card className="neo-brutal neo-brutal-card neo-brutal-emerald">
            <Shield className="h-8 w-8 sm:h-12 sm:w-12 mb-4 text-emerald-800 dark:text-emerald-200" />
            <h3 className="text-xl sm:text-2xl font-black uppercase mb-4 text-emerald-800 dark:text-emerald-200">Bank-Level Security</h3>
            <p className="font-semibold text-sm sm:text-base text-emerald-700 dark:text-emerald-300">Military-grade encryption and biometric authentication keep your money safe 24/7.</p>
          </Card>
          <Card className="neo-brutal neo-brutal-card neo-brutal-amber">
            <Zap className="h-8 w-8 sm:h-12 sm:w-12 mb-4 text-amber-800 dark:text-amber-200" />
            <h3 className="text-xl sm:text-2xl font-black uppercase mb-4 text-amber-800 dark:text-amber-200">Lightning Fast</h3>
            <p className="font-semibold text-sm sm:text-base text-amber-700 dark:text-amber-300">Transfer money instantly to anyone, anywhere in the world within seconds.</p>
          </Card>
          <Card className="neo-brutal neo-brutal-card neo-brutal-violet sm:col-span-2 lg:col-span-1">
            <Smartphone className="h-8 w-8 sm:h-12 sm:w-12 mb-4 text-violet-800 dark:text-violet-200" />
            <h3 className="text-xl sm:text-2xl font-black uppercase mb-4 text-violet-800 dark:text-violet-200">Mobile First</h3>
            <p className="font-semibold text-sm sm:text-base text-violet-700 dark:text-violet-300">Designed for your smartphone with an intuitive interface and offline capabilities.</p>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="neo-brutal neo-brutal-card bg-black dark:bg-white text-white dark:text-black text-center">
            <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
            <div className="text-2xl sm:text-4xl font-black mb-2">$2.5B+</div>
            <div className="font-bold uppercase tracking-wider text-sm sm:text-base">Transactions Daily</div>
          </div>
          <div className="neo-brutal neo-brutal-card neo-brutal-emerald text-center">
            <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-emerald-800 dark:text-emerald-200" />
            <div className="text-2xl sm:text-4xl font-black mb-2 text-emerald-800 dark:text-emerald-200">5M+</div>
            <div className="font-bold uppercase tracking-wider text-sm sm:text-base text-emerald-800 dark:text-emerald-200">Happy Customers</div>
          </div>
          <div className="neo-brutal neo-brutal-card bg-indigo-500 dark:bg-indigo-600 text-white text-center sm:col-span-2 lg:col-span-1">
            <Star className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
            <div className="text-2xl sm:text-4xl font-black mb-2">4.9/5</div>
            <div className="font-bold uppercase tracking-wider text-sm sm:text-base">App Store Rating</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <div className="neo-brutal neo-brutal-card bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase mb-6 sm:mb-8">
            Ready to Start? JOIN Bank Sawan
          </h2>
          <p className="text-lg sm:text-xl font-semibold mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join millions of users who have already revolutionized their banking experience with Bank Sawan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/register" className="neo-brutal bg-white text-black font-bold py-3 px-4 sm:py-4 sm:px-8 uppercase tracking-wider inline-flex items-center justify-center text-sm sm:text-base">
              Create Account <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Link href="/login" className="neo-brutal bg-transparent border-white text-white font-bold py-3 px-4 sm:py-4 sm:px-8 uppercase tracking-wider text-sm sm:text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black dark:bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-xl sm:text-2xl font-black uppercase">Bank Sawan</span>
              </div>
              <p className="font-semibold text-sm sm:text-base">The future of digital banking is here.</p>
            </div>
            <div>
              <h3 className="font-black uppercase mb-4 text-sm sm:text-base">Services</h3>
              <ul className="space-y-2 font-semibold text-sm">
                <li>Mobile Banking</li>
                <li>Money Transfer</li>
                <li>Digital Wallet</li>
                <li>Investment</li>
              </ul>
            </div>
            <div>
              <h3 className="font-black uppercase mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 font-semibold text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Security</li>
                <li>Privacy</li>
              </ul>
            </div>
            <div>
              <h3 className="font-black uppercase mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 font-semibold text-sm">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center font-semibold text-sm">
            <p>&copy; 2025 Bank Sawan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}