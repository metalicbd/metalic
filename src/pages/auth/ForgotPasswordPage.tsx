import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const { resetPassword } = useAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('দয়া করে আপনার রেজিস্টার্ড ইমেইলটি লিখুন।');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setIsSubmitted(true);
      toast.success('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে!');
    } catch (error: any) {
      toast.error(error.message || 'পাসওয়ার্ড রিসেট লিংক পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] w-full flex items-center justify-center px-4 py-6 relative overflow-hidden bg-gradient-to-br from-blue-50/70 via-slate-50/60 to-blue-100/40">
      <Helmet>
        <title>Reset Password | METALIC</title>
        <meta name="description" content="Reset your Metalic account password to regain access to your metal posters and order tracking." />
      </Helmet>

      {/* ব্যাকগ্রাউন্ড আইসি-ব্লু গ্লো অরা */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ফ্রস্টেড গ্লাস কার্ড (এক স্ক্রিনে ফিট) */}
      <div className="w-full max-w-md p-7 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-2xl border border-blue-200/70 shadow-[0_12px_40px_-10px_rgba(59,130,246,0.12)] relative text-left">
        
        {/* ব্যাক বাটন */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        {isSubmitted ? (
          // সাকসেস স্টেট
          <div className="flex flex-col items-center text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tight text-black">
              Check Your Email
            </h2>

            <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
              We have sent a secure password reset link to: <br />
              <strong className="text-black font-semibold">{email}</strong>
            </p>

            <p className="text-[11px] text-slate-400 max-w-xs">
              Didn&apos;t receive it? Please check your Spam folder or try requesting again.
            </p>

            <div className="pt-4 w-full flex flex-col space-y-2">
              <Button
                variant="outline"
                className="w-full border-slate-200 text-black hover:bg-slate-50 font-bold uppercase text-xs"
                onClick={() => setIsSubmitted(false)}
              >
                Try Another Email
              </Button>

              <Link to="/login" className="w-full">
                <Button
                  variant="primary"
                  className="w-full bg-black text-white hover:bg-neutral-800 font-bold uppercase text-xs"
                >
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // ইমেইল সাবমিশন ফর্ম
          <>
            {/* হেডারের মতো লোগো এবং ডানপাশে বড় কালো METALIC */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-black flex items-center justify-center shrink-0 shadow-sm">
                {!logoError ? (
                  <img
                    src="/logo.png"
                    alt="METALIC Logo"
                    onError={() => setLogoError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-2xl font-black tracking-widest uppercase text-black">
                METALIC
              </span>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-xl font-black uppercase tracking-tight text-black">
                Recover Password
              </h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                Enter your email to receive a secure reset link
              </p>
            </div>

            <form onSubmit={handleReset} className="flex flex-col space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                className="bg-white/90 border-slate-200 focus:border-black focus:bg-white h-10 text-xs"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full h-11 bg-black text-white hover:bg-neutral-800 font-bold uppercase tracking-widest text-xs mt-1 shadow-sm"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

ForgotPasswordPage.displayName = 'ForgotPasswordPage';