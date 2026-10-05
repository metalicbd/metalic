import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LegalPageSlug, LegalPageContent } from '@/types/legal';
import { getLegalPageContent } from '@/services/legal/legalService';
import { 
  ShieldCheck, 
  FileText, 
  RefreshCw, 
  Truck, 
  ArrowLeft, 
  Clock 
} from 'lucide-react';
import { cn } from '@/utils/cn';

const POLICIES: { slug: LegalPageSlug; label: string; icon: any }[] = [
  { slug: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
  { slug: 'terms', label: 'Terms & Conditions', icon: FileText },
  { slug: 'refund', label: 'Refund Policy', icon: RefreshCw },
  { slug: 'shipping', label: 'Shipping & Delivery', icon: Truck },
];

export const LegalPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = (slug as LegalPageSlug) || 'privacy';

  const [policyData, setPolicyData] = useState<LegalPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore থেকে পলিসি ডেটা লোড করা
  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const data = await getLegalPageContent(activeSlug);
        if (isMounted) setPolicyData(data);
      } catch (error) {
        console.error('Error fetching legal page content:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchContent();
    return () => {
      isMounted = false;
    };
  }, [activeSlug]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-left">
      <Helmet>
        <title>{`${policyData?.title || 'Policy Documentation'} | METALIC`}</title>
        <meta name="description" content={policyData?.subtitle || 'Metalic legal compliance and customer policies.'} />
      </Helmet>

      {/* টপ ব্যানার */}
      <section className="w-full bg-slate-50/80 border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
            {policyData?.title || 'Legal Documentation'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {policyData?.subtitle || 'Official consumer rights & guidelines in Bangladesh'}
          </p>
        </div>
      </section>

      {/* পলিসি নেভিগেশন পিলস */}
      <div className="border-b border-slate-200 bg-white sticky top-18 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto no-scrollbar flex items-center space-x-2">
          {POLICIES.map((p) => {
            const Icon = p.icon;
            const isActive = activeSlug === p.slug;
            return (
              <Link
                key={p.slug}
                to={`/legal/${p.slug}`}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0',
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-black hover:bg-slate-200'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* মূল পলিসি কনটেন্ট রেন্ডারিং এরিয়া */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase">
            Loading Documentation...
          </div>
        ) : policyData ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-subtle">
            {/* ফায়ারস্টোর থেকে আসা রিচ টেক্সট HTML রেন্ডারিং */}
            <article
              className="prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:text-black prose-p:text-slate-600 prose-p:text-xs prose-p:sm:text-sm prose-p:leading-relaxed prose-li:text-xs prose-li:text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: policyData.contentHtml }}
            />

            <div className="border-t border-slate-100 pt-6 mt-8 flex items-center justify-between text-[11px] text-slate-400 font-mono uppercase">
              <span>Metalic Bangladesh Compliance</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Live Cloud Sync
              </span>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

LegalPage.displayName = 'LegalPage';