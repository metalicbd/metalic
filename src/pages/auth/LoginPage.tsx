import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // লগইনের পর পূর্বের পেজে বা একাউন্টে রিডাইরেক্ট
  const from = (location.state as any)?.from?.pathname || '/account';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back to Metalic!');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google successfully!');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Google sign in failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem-4rem)] flex flex-col justify-center items-center px-4 py-4 sm:py-8 bg-slate-50/50 text-left">
      <Helmet>
        <title>Login to Account | METALIC</title>
      </Helmet>

      {/* স্ট্যান্ডার্ড ও প্রিমিয়াম থিকনেস সহ লগইন কার্ড */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-premium relative overflow-hidden my-auto">
        
        {/* টপ হেডার */}
        <div className="flex flex-col items-center text-center space-y-1 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white shadow-xs mb-1">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black font-sans leading-tight">
            WELCOME BACK
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs leading-snug">
            Sign in to track orders and manage your saved metal posters.
          </p>
        </div>

        {/* ফর্ম — স্ট্যান্ডার্ড h-11 ইনপুট বক্স */}
        <form onSubmit={handleEmailLogin} className="space-y-3.5">
          <Input
            label="EMAIL ADDRESS"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            className="h-11 text-xs sm:text-sm bg-slate-50/50 border border-slate-200"
          />

          <div className="space-y-1">
            <Input
              label="PASSWORD"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              className="h-11 text-xs sm:text-sm bg-slate-50/50 border border-slate-200"
            />

            <div className="flex justify-end pt-0.5">
              <Link
                to="/forgot-password"
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-black transition-colors"
              >
                FORGOT PASSWORD?
              </Link>
            </div>
          </div>

          {/* সাইন ইন বাটন — স্ট্যান্ডার্ড h-11 থিকনেস */}
          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="w-full h-11 sm:h-12 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer mt-1"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isLoading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </Button>
        </form>

        {/* সেপারেটর */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <span className="relative bg-white px-3 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-400">
            OR CONTINUE WITH
          </span>
        </div>

        {/* গুগল সাইন ইন বাটন — স্ট্যান্ডার্ড h-11 থিকনেস */}
        <button
          type="button"
          disabled={isGoogleLoading}
          onClick={handleGoogleSignIn}
          className="w-full h-11 sm:h-12 rounded-xl border border-slate-200 hover:border-black bg-white flex items-center justify-center space-x-2.5 text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer active:scale-[0.99]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isGoogleLoading ? 'Connecting...' : 'SIGN IN WITH GOOGLE'}</span>
        </button>

        {/* রেজিস্টার লিংক — ২ লাইনে স্পষ্ট */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-500 text-center">
          <span>Don&apos;t have an account yet?</span>
          <Link
            to="/register"
            className="font-bold uppercase tracking-wider text-black hover:text-blue-600 transition-colors underline-offset-4 hover:underline"
          >
            CREATE ACCOUNT
          </Link>
        </div>

      </div>
    </div>
  );
};

LoginPage.displayName = 'LoginPage';
export default LoginPage;