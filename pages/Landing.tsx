import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  Sparkles,
  PhoneCall,
  Heart,
  Award,
  ShieldAlert,
} from "lucide-react";

const Landing: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-pulse">
          <Heart size={16} fill="currentColor" />
          <span>There is hope for a better tomorrow</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
          Your Journey to <span className="text-teal-600">Beacura</span> <br />{" "}
          Starts Here.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Beacura provides a compassionate community, professional guidance, and
          AI-powered tools to help you reclaim your life from addiction.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Link
            to="/auth"
            className="bg-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-all shadow-xl hover:shadow-teal-200"
          >
            Start Your Journey
          </Link>
          <a
            href="#features"
            className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Stats/Proof */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl my-16">
        {[
          { icon: Users, label: "5,000+", sub: "Active Community Members" },
          { icon: Sparkles, label: "85%", sub: "Progressive Success Rate" },
          { icon: PhoneCall, label: "24/7", sub: "Instant AI Support" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center"
          >
            <div className="bg-teal-50 text-teal-600 w-12 h-12 flex items-center justify-center rounded-xl mx-auto mb-4">
              <stat.icon size={24} />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {stat.label}
            </div>
            <div className="text-slate-500">{stat.sub}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="py-20 w-full bg-slate-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            We've combined technology and human empathy to create the ultimate
            recovery ecosystem.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {[
            {
              title: "Peer Counseling",
              desc: "Connect with mentors who have walked the path you're on.",
              icon: Users,
            },
            {
              title: "AI Companion",
              desc: "24/7 conversational AI to help with cravings and motivation.",
              icon: Sparkles,
            },
            {
              title: "Health Plans",
              desc: "Science-backed nutrition to help your body heal.",
              icon: Shield,
            },
            {
              title: "Daily Rewards",
              desc: "Stay motivated with badges, levels, and streak tracking.",
              icon: Award,
            },
            {
              title: "Medical Guidance",
              desc: "Expert tips for managing withdrawal symptoms safely.",
              icon: ShieldAlert,
            },
            {
              title: "Private & Secure",
              desc: "Your data is encrypted. Optional anonymous mode.",
              icon: Shield,
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100"
            >
              <div className="bg-slate-50 text-teal-600 w-10 h-10 flex items-center justify-center rounded-lg mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {f.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Disclaimer */}
      <footer className="w-full bg-slate-900 text-slate-400 py-12 px-8 text-center mt-auto">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4 text-sm uppercase tracking-widest font-bold text-slate-500">
            Emergency Support
          </p>
          <p className="text-white text-lg font-medium mb-6">
            If you are in immediate danger or experiencing a medical emergency,
            please call your local emergency services (e.g., 911 in the US) or a
            crisis hotline immediately.
          </p>
          <div className="text-xs">
            &copy; 2024 Beacura Platform. Not a replacement for professional
            medical advice.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
