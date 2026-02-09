import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Check,
  Heart,
  Brain,
  Users,
  Award,
  Shield,
  Zap,
  ArrowRight,
  BookOpen,
} from "lucide-react";

const LearnMore: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-amber-100 hover:text-white mb-6 transition"
          >
            <span>← Back to Home</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Understanding Beacura
          </h1>
          <p className="text-xl text-amber-100">
            Learn about our comprehensive approach to recovery support
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Our Mission</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200">
              <Heart className="text-rose-500 mb-4" size={32} />
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Compassionate Support
              </h3>
              <p className="text-slate-600 leading-relaxed">
                We believe recovery is a journey, not a destination. Our platform combines
                the warmth of human connection with the power of technology to provide
                judgment-free support 24/7.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200">
              <Brain className="text-indigo-500 mb-4" size={32} />
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Evidence-Based Methods
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Our tools and guidance are built on scientific research and proven
                addiction recovery methodologies. We combine cognitive behavioral therapy
                principles with modern wellness practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">How Beacura Works</h2>
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                desc: "Join as a recovering individual or a mentor. Share your story and set personal goals.",
                icon: Users,
              },
              {
                step: "2",
                title: "Connect with Community",
                desc: "Access peer counseling with mentors who've recovered. Join support groups and share experiences.",
                icon: Users,
              },
              {
                step: "3",
                title: "Use AI Support",
                desc: "Chat with our 24/7 AI companion for immediate help with cravings, motivation, and wellness tips.",
                icon: Zap,
              },
              {
                step: "4",
                title: "Track Progress",
                desc: "Monitor your recovery with daily streaks, badges, and personalized health metrics.",
                icon: Award,
              },
              {
                step: "5",
                title: "Build Healthy Habits",
                desc: "Follow science-backed health plans for nutrition, exercise, meditation, and sleep.",
                icon: Heart,
              },
              {
                step: "6",
                title: "Celebrate Milestones",
                desc: "Earn rewards, unlock achievements, and celebrate your progress with the community.",
                icon: Award,
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-white font-bold">
                    {item.step}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Deep Dive */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">
            Core Features Explained
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "AI Companion",
                features: [
                  "Real-time emotional support",
                  "Coping strategy suggestions",
                  "Motivation and encouragement",
                  "Available 24/7 without judgment",
                  "Learning from your patterns",
                  "Personalized wellness recommendations",
                ],
              },
              {
                title: "Peer Counseling",
                features: [
                  "Connect with recovered mentors",
                  "Share experiences safely",
                  "One-on-one support sessions",
                  "Group recovery circles",
                  "Accountability partnerships",
                  "Real people, real stories",
                ],
              },
              {
                title: "Health & Wellness",
                features: [
                  "Personalized nutrition plans",
                  "Exercise routines for recovery",
                  "Sleep improvement guides",
                  "Stress management techniques",
                  "Medical guidance resources",
                  "Symptom tracking tools",
                ],
              },
              {
                title: "Progress Tracking",
                features: [
                  "Daily streak tracking",
                  "Achievement badges system",
                  "Personal milestones",
                  "Statistical progress reports",
                  "Community leaderboards",
                  "Customizable goals",
                ],
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  {feature.title}
                </h3>
                <ul className="space-y-3">
                  {feature.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">
            Why Choose Beacura
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Holistic Approach",
                desc: "We address physical, mental, emotional, and social aspects of recovery in one integrated platform.",
              },
              {
                title: "Proven Results",
                desc: "Our users report 85% progressive success rate with sustained recovery and improved quality of life.",
              },
              {
                title: "Safe & Private",
                desc: "Military-grade encryption protects your data. Anonymous mode available for those who need privacy.",
              },
              {
                title: "No Judgment Zone",
                desc: "Everyone here understands the struggle. Share openly without fear of stigma or criticism.",
              },
              {
                title: "Expert Support",
                desc: "Guidance from addiction specialists, health professionals, and people in recovery like you.",
              },
              {
                title: "Always Available",
                desc: "Need help at 3 AM? Our AI companion and crisis support are available whenever you need them.",
              },
            ].map((benefit, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is Beacura a replacement for professional treatment?",
                a: "No. Beacura complements professional medical treatment, not replaces it. We recommend working with healthcare providers alongside using our platform. For medical emergencies, please contact emergency services.",
              },
              {
                q: "How private is my information?",
                a: "Your privacy is paramount. All data is encrypted end-to-end. You can use the anonymous mode if you prefer. We never share personal information without your explicit consent.",
              },
              {
                q: "Who can become a mentor?",
                a: "Anyone with sustained recovery experience (typically 6+ months sober) can apply to be a mentor. We verify their commitment to the recovery process and community guidelines.",
              },
              {
                q: "What if I'm having a crisis?",
                a: "If you're in immediate danger, call emergency services (911 in US). For crisis support, dial 988 (Suicide & Crisis Lifeline) or text 'HELLO' to 741741 (Crisis Text Line).",
              },
              {
                q: "How does the AI companion work?",
                a: "Our AI uses machine learning to provide personalized emotional support, coping strategies, and motivational messages based on your recovery goals and patterns.",
              },
              {
                q: "Can I stay anonymous?",
                a: "Yes! Our anonymous mode allows you to access most features without revealing your identity. However, peer counseling requires basic verification for safety.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === idx ? null : idx)
                  }
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <h3 className="text-lg font-semibold text-slate-900 text-left">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    size={24}
                    className={`text-amber-600 transition ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 pb-6 bg-slate-50 border-t border-slate-200">
                    <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recovery Tips */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">
            Recovery Tips & Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Build a Support Network",
                tips: [
                  "Join our community groups",
                  "Find an accountability partner",
                  "Connect with mentors",
                  "Attend support meetings",
                ],
              },
              {
                title: "Healthy Lifestyle",
                tips: [
                  "Exercise regularly (30 min/day)",
                  "Eat balanced meals",
                  "Get 7-9 hours of sleep",
                  "Manage stress with meditation",
                ],
              },
              {
                title: "Mental Wellness",
                tips: [
                  "Practice mindfulness",
                  "Journal daily",
                  "Set achievable goals",
                  "Celebrate small wins",
                ],
              },
            ].map((section, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2" />
                      <span className="text-slate-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            You're not alone. Thousands of people have found hope and healing through
            Beacura. Your recovery story starts today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="bg-white text-amber-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all inline-flex items-center justify-center space-x-2"
            >
              <span>Start Your Recovery</span>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/"
              className="bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center border-t-4 border-rose-500">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-widest font-bold text-rose-400 mb-3">
            ⚠️ Emergency Support
          </p>
          <p className="text-white font-medium mb-4">
            If you're in danger, call 911 (US) | Crisis Text Line: Text HELLO to 741741
          </p>
          <p className="text-xs text-slate-500">
            &copy; 2024 Beacura. Not a replacement for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LearnMore;
