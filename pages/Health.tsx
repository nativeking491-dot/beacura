
import React, { useState, useEffect } from 'react';
import { FOOD_TIPS, WEEKLY_MEAL_PLAN } from '../constants';
import {
  Utensils, Droplets, Apple, Coffee,
  CheckCircle2, Info, ChevronRight, Sparkles,
  Sun, Sunset, Moon, Brain, RefreshCcw, Loader2,
  Sparkle, Calendar
} from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';

const Health: React.FC = () => {
  // Get current day of week (0-6)
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Map Sun-Sat to Mon-Sun
  const [activeDayIdx, setActiveDayIdx] = useState(todayIdx);
  const [glasses, setGlasses] = useState(4);
  const [isGeneratingSnack, setIsGeneratingSnack] = useState(false);
  const [aiSnack, setAiSnack] = useState<string | null>(null);

  const currentPlan = WEEKLY_MEAL_PLAN[activeDayIdx];

  const handleDrinkWater = () => {
    if (glasses < 12) setGlasses(prev => prev + 1);
  };

  const getCustomSnack = async () => {
    setIsGeneratingSnack(true);
    const instruction = "You are a recovery nutritionist. Suggest a quick, healthy snack that specifically helps reduce drug cravings and supports brain chemistry (dopamine/serotonin). Keep it under 2 sentences.";
    const response = await generateChatResponse("What's a good snack for a craving right now?", instruction);
    setAiSnack(response);
    setIsGeneratingSnack(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Health & Diet</h1>
          <p className="text-slate-500">Science-backed nutrition to restore your brain and body.</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100">
          <Brain size={20} className="animate-pulse" />
          <span className="font-bold text-sm">Brain Recovery Active</span>
        </div>
      </header>

      {/* Today's Highlight Card */}
      <div className="bg-gradient-to-r from-teal-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles size={20} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-100">Today's Nutritional Goal</span>
          </div>
          <h2 className="text-4xl font-black mb-2">{currentPlan.theme}</h2>
          <p className="text-teal-50 text-sm max-w-xl mb-6 leading-relaxed">
            Today's diet is specifically designed to: <span className="font-bold italic">{currentPlan.meals.benefit}</span>
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-teal-700 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform">
              View Full Details
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Utensils size={180} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hydration Tracker */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <Droplets className="text-blue-500" />
              <span>Hydration Tracker</span>
            </h3>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{glasses}/12 Glasses</span>
          </div>
          <div className="grid grid-cols-6 gap-2 mb-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`h-16 rounded-xl transition-all border-2 ${i < glasses
                  ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-100'
                  : 'bg-slate-50 border-slate-100'
                  }`}
              />
            ))}
          </div>
          <button
            onClick={handleDrinkWater}
            disabled={glasses === 12}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Droplets size={18} />
            <span>Drink a Glass (+5 XP)</span>
          </button>
        </div>

        {/* AI Quick Suggestion */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <Sparkle className="text-indigo-500" />
              <span>AI Craving Fighter</span>
            </h3>
          </div>
          <div className="flex-1 bg-slate-50 rounded-2xl p-4 mb-4 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            {isGeneratingSnack ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
                <p className="text-xs text-slate-500">Consulting nutrition database...</p>
              </div>
            ) : aiSnack ? (
              <p className="text-sm text-slate-700 italic leading-relaxed">"{aiSnack}"</p>
            ) : (
              <div className="text-slate-400">
                <Apple size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">Need a quick snack to fight a craving? Ask our AI nutritionist.</p>
              </div>
            )}
          </div>
          <button
            onClick={getCustomSnack}
            className="w-full py-4 border-2 border-indigo-600 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCcw size={18} />
            <span>Ask for Recovery Snack</span>
          </button>
        </div>
      </div>

      {/* Weekly Diet Calendar */}
      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="text-teal-600" size={24} />
              7-Day Recovery Plan
            </h2>
            <p className="text-slate-500 text-sm">Click a day to view its specialized recovery diet.</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
            {WEEKLY_MEAL_PLAN.map((item, idx) => (
              <button
                key={item.day}
                onClick={() => setActiveDayIdx(idx)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex flex-col items-center ${activeDayIdx === idx
                  ? 'bg-white text-teal-600 shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <span className="text-[10px] opacity-60 uppercase">{item.day.substring(0, 3)}</span>
                <span>{item.day === WEEKLY_MEAL_PLAN[todayIdx].day ? 'TODAY' : item.day.substring(0, 3)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 bg-slate-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                    <Sun size={20} />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Breakfast</h4>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{currentPlan.meals.breakfast}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-4">
                    <Sunset size={20} />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lunch</h4>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{currentPlan.meals.lunch}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Moon size={20} />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dinner</h4>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{currentPlan.meals.dinner}</p>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-start space-x-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 mb-1">Site Integrated Nutrition Tip</h4>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    This meal plan is specifically cross-referenced with your recovery streak.
                    Eating <span className="font-bold underline">Proteins</span> today will help stabilize your mood, reducing the
                    "Day {activeDayIdx + 1}" irritability commonly reported by our community.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Info className="text-teal-400" />
                    Recovery Why
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed mb-8">
                    {currentPlan.meals.benefit}
                  </p>
                </div>
                <button className="w-full bg-teal-500 text-white py-4 rounded-2xl font-bold hover:bg-teal-600 transition-all flex items-center justify-center space-x-2">
                  <CheckCircle2 size={18} />
                  <span>Log All Meals (+20 XP)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nutritional Recovery Science */}
      <section className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 px-2">Recovery Science Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FOOD_TIPS.map((tip, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
                <Utensils size={28} className="text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{tip.title}</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">{tip.description}</p>
              <div className="pt-4 border-t border-slate-50 flex items-start space-x-3">
                <div className="bg-teal-600 p-1.5 rounded-lg text-white mt-1">
                  <Brain size={14} />
                </div>
                <p className="text-[11px] font-bold text-teal-700 leading-tight uppercase tracking-tight">
                  Recovery Link: <span className="font-medium text-slate-500 normal-case">{tip.benefits}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Health;
