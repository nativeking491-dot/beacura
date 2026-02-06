import React from "react";
import { MEDICAL_FAQS } from "../constants";
import {
  ShieldAlert,
  AlertCircle,
  Phone,
  HeartPulse,
  Pill,
  CheckCircle,
} from "lucide-react";

const Medical: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Medical Guidance</h1>
        <p className="text-slate-500">
          Essential information for a safe and healthy recovery process.
        </p>
      </header>

      {/* Urgent Alert */}
      <div className="bg-rose-50 border-2 border-rose-200 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6">
        <div className="bg-rose-100 p-5 rounded-full">
          <ShieldAlert size={48} className="text-rose-600" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-rose-900 mb-2">
            Emergency? Don't Wait.
          </h2>
          <p className="text-rose-800 mb-4 max-w-xl">
            If you experience seizures, loss of consciousness, hallucinations,
            or severe chest pain, seek immediate professional medical attention.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <a
              href="tel:911"
              className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-rose-200"
            >
              <Phone size={18} />
              <span>Call Emergency (911)</span>
            </a>
            <button className="bg-white text-rose-600 border border-rose-200 px-6 py-3 rounded-xl font-bold flex items-center space-x-2">
              <AlertCircle size={18} />
              <span>Crisis Hotline</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Do's and Don'ts */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <CheckCircle className="text-emerald-500" />
            <span>The Daily Guide</span>
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-emerald-700 font-bold mb-3 flex items-center">
                <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs mr-2">
                  ✓
                </span>
                DO'S
              </p>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li>• Maintain a consistent sleep schedule (7-9 hours).</li>
                <li>
                  • Communicate your symptoms to a trusted medical professional.
                </li>
                <li>• Practice deep breathing exercises when cravings peak.</li>
                <li>• Surround yourself with positive, clean influences.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-50">
              <p className="text-rose-700 font-bold mb-3 flex items-center">
                <span className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-xs mr-2">
                  ✕
                </span>
                DON'TS
              </p>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li>
                  • Avoid "cold turkey" without medical supervision if using
                  high-risk substances.
                </li>
                <li>• Don't self-medicate with other substances or alcohol.</li>
                <li>
                  • Avoid isolating yourself when feelings of withdrawal arise.
                </li>
                <li>• Don't skip meals or neglect hydration.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Common Symptoms */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <HeartPulse className="text-indigo-500" />
            <span>Withdrawal Knowledge</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                title: "Sleep Disturbance",
                icon: Pill,
                desc: "Insomnia or vivid dreams are common as your brain recalibrates.",
              },
              {
                title: "Physical Aches",
                icon: AlertCircle,
                desc: "Muscle tension and flu-like symptoms are typical early on.",
              },
              {
                title: "Emotional Swings",
                icon: HeartPulse,
                desc: "Anxiety and irritability often peak within the first 72 hours.",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start space-x-4"
              >
                <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm">
                  <s.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl text-white">
            <h4 className="font-bold mb-2">Need a Doctor?</h4>
            <p className="text-indigo-100 text-sm mb-4">
              We can help you find addiction-specialized clinics in your area.
            </p>
            <button className="bg-white text-indigo-600 w-full py-2.5 rounded-xl font-bold text-sm">
              Search Nearby Clinics
            </button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-8 text-center">
          Frequently Asked Medical Questions
        </h3>
        <div className="space-y-8 max-w-3xl mx-auto">
          {MEDICAL_FAQS.map((faq, i) => (
            <div
              key={i}
              className="border-b border-slate-50 pb-6 last:border-0"
            >
              <h4 className="font-bold text-slate-800 mb-2 flex items-start">
                <span className="text-teal-600 mr-2">Q:</span> {faq.q}
              </h4>
              <p className="text-slate-600 text-sm pl-6 leading-relaxed">
                <span className="text-indigo-600 font-bold mr-2">A:</span>{" "}
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Official Disclaimer */}
      <div className="text-center text-slate-400 text-xs px-8 italic">
        Disclaimer: Recovery provides information for educational purposes only.
        We are not doctors, and this content should not be considered
        professional medical advice, diagnosis, or treatment. Always seek the
        advice of your physician or other qualified health provider with any
        questions regarding a medical condition.
      </div>
    </div>
  );
};

export default Medical;
