import React from "react";
import { MEDICAL_FAQS, COMMON_SYMPTOMS, RECOVERY_DOS, RECOVERY_DONTS } from "../constants";
import * as Icons from "lucide-react";
import {
  ShieldAlert,
  AlertCircle,
  Phone,
  HeartPulse,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const Medical: React.FC = () => {
  const handleCrisisHotline = () => {
    window.open("tel:988", "_self");
  };

  return (
    <div className="space-y-6 animate-in pb-8">

      {/* =================== HEADER =================== */}
      <header className="relative overflow-hidden bento-card rounded-2xl p-6">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-rose-300 rounded-full blur-3xl opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-glow-pulse" />
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Safety First</span>
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Medical <span className="gradient-text-amber">Guidance</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Essential information for a safe and healthy recovery process.
          </p>
        </div>
      </header>

      {/* =================== CRISIS BANNER =================== */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b, #7f1d1d)' }}>
        <div className="absolute top-0 right-0 w-56 h-56 bg-red-400 rounded-full blur-[100px] opacity-15" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500 rounded-full blur-[80px] opacity-15" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-xl">
            <ShieldAlert size={32} className="text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-white mb-1">
              Emergency? Don't Wait.
            </h2>
            <p className="text-red-200 text-sm mb-4 max-w-xl leading-relaxed">
              Seizures, loss of consciousness, hallucinations, or severe chest pain require
              <strong className="text-white"> immediate professional medical attention</strong>.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <a href="tel:911" className="btn-primary flex items-center space-x-2 px-5 py-2.5 text-sm">
                <Phone size={15} />
                <span>Call 911</span>
              </a>
              <button
                onClick={handleCrisisHotline}
                className="btn-glass flex items-center space-x-2 px-5 py-2.5 text-sm"
              >
                <AlertCircle size={15} />
                <span>Crisis Hotline (988)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================== DOS / SYMPTOMS GRID =================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Do's and Don'ts */}
        <div className="bento-card rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
              <CheckCircle size={18} className="text-white" />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-900 dark:text-slate-100 text-base">The Daily Guide</h3>
          </div>

          <div className="space-y-5">
            {/* DOs */}
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-50 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-[10px]">✓</span>
                Do's
              </p>
              <ul className="space-y-2">
                {RECOVERY_DOS.map((item: any, i: number) => {
                  const Icon = (Icons as any)[item.icon] || Icons.Check;
                  return (
                    <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-300 group">
                      <div className="mr-2.5 mt-0.5 w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon size={12} />
                      </div>
                      <span className="leading-relaxed">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-rose-50 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-[10px]">✕</span>
                Don'ts
              </p>
              <ul className="space-y-2">
                {RECOVERY_DONTS.map((item: any, i: number) => {
                  const Icon = (Icons as any)[item.icon] || Icons.X;
                  return (
                    <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-300 group">
                      <div className="mr-2.5 mt-0.5 w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon size={12} />
                      </div>
                      <span className="leading-relaxed">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Common Symptoms */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <HeartPulse size={18} className="text-white" />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-900 dark:text-slate-100 text-base">Withdrawal Knowledge</h3>
          </div>

          <div className="space-y-3">
            {COMMON_SYMPTOMS.map((s: any, i: number) => {
              const IconComponent = (Icons as any)[s.icon] || Icons.HelpCircle;
              return (
                <div key={i} className="bento-card rounded-2xl p-4 flex items-start space-x-3 group hover-lift">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/15 dark:to-violet-500/15 flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform border border-indigo-100 dark:border-indigo-500/20">
                    <IconComponent size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-0.5">{s.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-1.5">{s.desc}</p>
                    {s.tip && (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                        💡 {s.tip}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Find Doctor CTA */}
          <div className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #4338ca, #6d28d9)' }}>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative z-10">
              <h4 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold mb-1 text-sm">Need a Doctor?</h4>
              <p className="text-indigo-100 text-xs mb-3 leading-relaxed">
                Find addiction-specialized clinics in your area.
              </p>
              <button className="btn-glass text-xs px-4 py-2 flex items-center space-x-1.5">
                <Sparkles size={12} />
                <span>Search Nearby Clinics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================== FAQ =================== */}
      <section className="bento-card rounded-2xl p-6 md:p-8">
        <div className="text-center mb-6">
          <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Frequently Asked Medical Questions
          </h3>
        </div>
        <div className="space-y-0 max-w-3xl mx-auto divide-y divide-slate-100 dark:divide-slate-800">
          {MEDICAL_FAQS.map((faq: any, i: number) => (
            <div key={i} className="py-5 first:pt-0 last:pb-0 group">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-2 flex items-start gap-2">
                <span className="text-xs font-extrabold text-teal-500 bg-teal-50 dark:bg-teal-500/10 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">Q</span>
                {faq.q}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm pl-7 leading-relaxed">
                <span className="font-bold text-indigo-500 mr-1">A:</span>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =================== DISCLAIMER =================== */}
      <div className="glass-subtle rounded-2xl px-6 py-4 border border-slate-200/50 dark:border-white/5 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed italic">
          ⚕️ <strong>Disclaimer:</strong> Beacura provides information for educational purposes only. We are not doctors,
          and this content should not be considered professional medical advice, diagnosis, or treatment. Always seek
          the advice of your physician or other qualified health provider with any questions regarding a medical condition.
        </p>
      </div>
    </div>
  );
};

export default Medical;
