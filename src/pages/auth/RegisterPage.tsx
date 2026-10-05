import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const { register, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/account', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim() || !email.trim() || !password.trim()) {
      toast.error('দয়া করে সব আবশ্যক তথ্য পূরণ করুন।');
      return;
    }

    if (password.length < 6) {
      toast.error('পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('পাসওয়ার্ড দুটি মেলেনি। দয়া করে আবার মিলিয়ে নিন।');
      return;
    }

    setIsLoading(true);
    try {
      await register(email.trim(), password, displayName.trim(), phoneNumber.trim());
      toast.success('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম মেটালিকে।');
      navigate('/account', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('গুগল দিয়ে সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে!');
      navigate('/account', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'গুগল সাইন-আপ ব্যর্থ হয়েছে।');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center px-4 py-6 relative overflow-hidden bg-gradient-to-br from-blue-50/70 via-slate-50/60 to-blue-100/40">
      <Helmet>
        <title>Create Account | METALIC</title>
        <meta name="description" content="Create your Metalic account to purchase metal posters with cash on delivery and track your orders." />
      </Helmet>

      {/* ব্যাকগ্রাউন্ড আইসি-ব্লু গ্লো অরা */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ফ্রস্টেড গ্লাস কার্ড (এক স্ক্রিনে ফিট) */}
      <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white/80 backdrop-blur-2xl border border-blue-200/70 shadow-[0_12px_40px_-10px_rgba(59,130,246,0.12)] relative text-left">
        
        {/* হেডারের মতো লোগো এবং ডানপাশে বড় কালো METALIC */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-black flex items-center justify-center shrink-0 shadow-sm">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="METALIC Logo"
                onError={() => setLogoError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="text-xl font-black tracking-widest uppercase text-black">
            METALIC
          </span>
        </div>

        {/* হেডিং টেক্সট — শুধুই "Create an account" */}
        <div className="text-center mb-5">
          <h1 className="text-xl font-black uppercase tracking-tight text-black">
            Create an account
          </h1>
        </div>

        {/* রেজিস্ট্রেশন ফর্ম */}
        <form onSubmit={handleRegister} className="flex flex-col space-y-2.5">
          <Input
            label="Full Name"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Tanvir Ahmed"
            leftIcon={<User className="w-3.5 h-3.5" />}
            className="bg-white/90 border-slate-200 focus:border-black focus:bg-white h-9 text-xs"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              leftIcon={<Mail className="w-3.5 h-3.5" />}
              className="bg-white/90 border-slate-200 focus:border-black focus:bg-white h-9 text-xs"
            />

            <Input
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="017XXXXXXXX"
              leftIcon={<Phone className="w-3.5 h-3.5" />}
              className="bg-white/90 border-slate-200 focus:border-black focus:bg-white h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 chars"
              leftIcon={<Lock className="w-3.5 h-3.5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-black focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              }
              className="bg-white/90 border-slate-200 focus:border-black focus:bg-white h-9 text-xs"
            />

            <Input
              label="Confirm"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter"
              leftIcon={<Lock className="w-3.5 h-3.5" />}
              className="bg-white/90 border-slate-200 focus:border-black focus:bg-white h-9 text-xs"
            />
          </div>

          {/* ক্রিয়েট অ্যাকাউন্ট বাটন */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isGoogleLoading}
            className="w-full h-10 bg-black text-white hover:bg-neutral-800 font-bold uppercase tracking-widest text-xs mt-1 shadow-sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account
          </Button>
        </form>

        {/* ডিভাইডার — এক লাইনে সেন্টারে */}
        <div className="relative flex items-center justify-center my-3.5">
          <div className="border-t border-slate-200/80 flex-grow" />
          <span className="bg-white/90 backdrop-blur-sm px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap shrink-0">
            OR CONTINUE WITH
          </span>
          <div className="border-t border-slate-200/80 flex-grow" />
        </div>

        {/* সাইন-আপ বাটনের নিচে গুগল অপশন */}
        <button
          type="button"
          disabled={isGoogleLoading || isLoading}
          onClick={handleGoogleRegister}
          className="w-full h-10 px-4 rounded-xl bg-white/95 border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-standard flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}</span>
        </button>

        {/* সাইন ইন লিংক */}
        <div className="mt-4 text-center border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold uppercase tracking-wider text-black hover:text-blue-600 transition-colors ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

RegisterPage.displayName = 'RegisterPage';