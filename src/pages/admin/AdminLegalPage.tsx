import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import JoditEditor from 'jodit-react';
import { LegalPageSlug, DEFAULT_LEGAL_PAGES } from '@/types/legal';
import { getLegalPageContent, saveLegalPageContent } from '@/services/legal/legalService';
import { 
  FileText, 
  AlertTriangle, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const POLICY_TABS: { slug: LegalPageSlug; label: string }[] = [
  { slug: 'privacy', label: 'PRIVACY POLICY' },
  { slug: 'terms', label: 'TERMS & CONDITIONS' },
  { slug: 'refund', label: 'REFUND POLICY' },
  { slug: 'shipping', label: 'SHIPPING POLICY' },
];

export const AdminLegalPage: React.FC = () => {
  const editor = useRef(null);
  const [selectedSlug, setSelectedSlug] = useState<LegalPageSlug>('privacy');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // পলিসি কনটেন্ট লোড করা
  useEffect(() => {
    let isMounted = true;
    const loadPolicy = async () => {
      setIsLoading(true);
      try {
        const data = await getLegalPageContent(selectedSlug);
        if (isMounted) {
          setTitle(data.title);
          setSubtitle(data.subtitle);
          setContentHtml(data.contentHtml);
        }
      } catch (error) {
        console.error('Failed to load legal content:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPolicy();
    return () => {
      isMounted = false;
    };
  }, [selectedSlug]);

  // Jodit রিচ টেক্সট এডিটর কনফিগারেশন
  const editorConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Type policy documentation here...',
      height: 480,
      toolbarButtonSize: 'middle' as any,
      buttons: [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'ul',
        'ol',
        '|',
        'paragraph',
        'fontsize',
        '|',
        'link',
        'align',
        'undo',
        'redo',
        'eraser',
      ],
      style: {
        background: '#FFFFFF',
        color: '#000000',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
      },
    }),
    []
  );

  // পলিসি রিলোড / রিসেট করা
  const handleReset = () => {
    const defaultData = DEFAULT_LEGAL_PAGES[selectedSlug];
    if (defaultData) {
      setTitle(defaultData.title);
      setSubtitle(defaultData.subtitle);
      setContentHtml(defaultData.contentHtml);
      toast.success('Restored to default documentation template.');
    }
  };

  // Firestore-এ সরাসরি ডিপ্লয় করা
  const handleDeploy = async () => {
    if (!title.trim() || !contentHtml.trim()) {
      toast.error('দয়া করে পলিসির শিরোনাম ও কনটেন্ট পূরণ করুন।');
      return;
    }

    setIsSaving(true);
    try {
      await saveLegalPageContent(selectedSlug, title, subtitle, contentHtml);
      toast.success(`"${title}" successfully deployed to live website!`);
    } catch (error: any) {
      toast.error(error.message || 'ডিপ্লয় ব্যর্থ হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 text-left">
      <Helmet>
        <title>Legal Control | METALIC Admin</title>
      </Helmet>

      {/* স্ক্রিনশট ১৭ অনুযায়ী হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans">
            LEGAL CONTROL
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mt-1">
            POLICY DOCUMENTATION & COMPLIANCE HUB
          </p>
        </div>

        <a
          href={`/legal/${selectedSlug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue-600 hover:underline self-start sm:self-auto"
        >
          <span>View Live Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* বাম পাশের কলাম: স্ক্রিনশট ১৭ অনুযায়ী DOCUMENTATION পলিসি ট্যাব */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-subtle flex flex-col space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-500 pb-3 border-b border-slate-100">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>DOCUMENTATION</span>
            </div>

            {/* পলিসি সিলেকশন বাটনসমূহ */}
            <div className="space-y-2 pt-1">
              {POLICY_TABS.map((tab) => {
                const isActive = selectedSlug === tab.slug;
                return (
                  <button
                    key={tab.slug}
                    type="button"
                    onClick={() => setSelectedSlug(tab.slug)}
                    className={cn(
                      'w-full py-3.5 px-4 rounded-2xl text-xs font-bold font-mono uppercase tracking-wider transition-all text-left cursor-pointer flex items-center justify-between',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-2 border-blue-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                    )}
                  >
                    <span>{tab.label}</span>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* স্ক্রিনশট ১৭ ও ১৮ এর সতর্কতা কার্ড */}
          <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 flex items-start space-x-3.5 text-left">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                GLOBAL BROADCAST
              </span>
              <p className="text-[11px] text-amber-800 font-mono mt-0.5 leading-relaxed">
                Deploying changes will overwrite global policy data and customer documents instantly.
              </p>
            </div>
          </div>
        </div>

        {/* ডান পাশের কলাম: স্ক্রিনশট ১৮ অনুযায়ী JODIT RICH TEXT EDITOR */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col space-y-5">
            
            {/* পলিসি টাইটেল ও সাবটাইটেল ইনপুট */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Privacy Policy"
                  className="w-full h-11 px-4 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-black"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Policy Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. How Metalic protects your information in Bangladesh"
                  className="w-full h-10 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-black"
                />
              </div>
            </div>

            {/* Jodit রিচ টেক্সট এডিটর */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              {isLoading ? (
                <div className="py-24 text-center text-slate-400 font-mono text-xs uppercase">
                  Loading Documentation Editor...
                </div>
              ) : (
                <JoditEditor
                  ref={editor}
                  value={contentHtml}
                  config={editorConfig}
                  onBlur={(newContent) => setContentHtml(newContent)}
                />
              )}
            </div>

            {/* স্ক্রিনশট ১৮ অনুযায়ী RESET এবং DEPLOY POLICY বাটন */}
            <div className="pt-3 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 h-12 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleDeploy}
                className="px-8 h-12 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'DEPLOYING...' : 'DEPLOY POLICY'}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

AdminLegalPage.displayName = 'AdminLegalPage';