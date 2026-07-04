/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  HelpCircle, 
  Star, 
  Users, 
  Lock, 
  Check 
} from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-500" />,
      title: "AI-Powered Medical OCR",
      description: "Our vision model automatically extracts biomarkers, reference ranges, and patient metadata with over 99% accuracy."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
      title: "Interactive Health Visuals",
      description: "Track your biological metrics over time with modern line, bar, and radar charts that reveal subtle wellness trends."
    },
    {
      icon: <Activity className="w-6 h-6 text-pink-500" />,
      title: "Comprehensive Health Scores",
      description: "Get personalized, animated sub-scores for your Liver, Kidneys, Heart, Metabolic systems, and overall immunity."
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-amber-500" />,
      title: "Educational Explanations",
      description: "No more confusing clinical jargon. Receive simple translations of what each marker does and why it matters."
    },
    {
      icon: <Users className="w-6 h-6 text-cyan-500" />,
      title: "Compare Historical Panels",
      description: "Load any two historical health reports side-by-side to visualize exactly what has improved or worsened."
    },
    {
      icon: <Lock className="w-6 h-6 text-purple-500" />,
      title: "HIPAA-Grade Security",
      description: "Your health records are heavily encrypted. You retain complete sovereignty over your data with direct export/delete controls."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Report",
      description: "Drag & drop your PDF or blood test image. Standard lab panels (Quest, Labcorp, etc.) are fully supported."
    },
    {
      number: "02",
      title: "AI Biomarker Extraction",
      description: "The AI performs intelligent OCR parsing to translate paper reports into interactive digital values."
    },
    {
      number: "03",
      title: "Explore SaaS Dashboard",
      description: "Interact with elegant health gauges, read physician-grade summaries, and access lifestyle recommendations."
    }
  ];

  const testimonials = [
    {
      quote: "AI Health Report Analyzer converted my confusing 5-page PDF into an incredibly clear, visual dashboard. For the first time, I actually understand my lipid levels and what to change.",
      author: "Marcus Aurelius",
      role: "Athlete & Wellness Enthusiast",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      quote: "The ability to compare my blood tests from last year side-by-side with my recent checkup is spectacular. My doctor was genuinely impressed by the clean trend charts I brought to our appointment.",
      author: "Dr. Clara Sterling",
      role: "Ph.D. in Cellular Biology",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  const faqs = [
    {
      q: "Is this report analyzer a medical diagnostic tool?",
      a: "Absolutely not. This platform is strictly an educational analysis tool. It extracts clinical data from your documents, explains complex jargon in simple English, and provides general, research-backed lifestyle guidelines. It does not diagnose, treat, or prevent any disease. Always consult with a licensed primary physician."
    },
    {
      q: "What file formats does the upload tool accept?",
      a: "We support PDF documents, as well as PNG, JPG, and JPEG images. The tool works best when documents are well-lit, flat, and legible."
    },
    {
      q: "How does the AI analyze my biomarker values?",
      a: "Our backend integrates with state-of-the-art Google Gemini 3.5 Flash multimodal intelligence. The AI reads the image directly, recognizes the specific lab standard, compares your values against the reference range printed on the report, and structures them into highly accurate wellness sub-scores."
    },
    {
      q: "Is my personal medical data safe?",
      a: "Yes. Data privacy is our highest priority. All uploads are processed securely. Unlike other free consumer tools, we do not monetize or sell your biomarker logs. You can delete your account and entire upload history permanently from the Settings page at any time."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -z-10 animate-pulse"></div>
      <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-violet-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-pulse delay-1000"></div>
 
      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-850 text-xs font-semibold mb-6 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Supercharged by Gemini 3.5 Multimodal AI</span>
        </motion.div>
 
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight font-sans"
        >
          Understand Your Blood Panels with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Precision AI</span>
        </motion.h1>
 
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          Upload your blood tests and medical checkups. Instantly extract biomarkers, highlight abnormalities, visualize historical trends, and receive clean, simple explanations.
        </motion.p>
 
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Analyze Report Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={onLogin}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-850 font-semibold border border-slate-200 transition-all cursor-pointer shadow-xs"
          >
            <span>Sign In to Dashboard</span>
          </button>
        </motion.div>
 
        {/* Floating Mock Graphic */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-200/80 bg-white/60 p-4 shadow-2xl backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600"></div>
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 text-left">
            <span className="w-3 h-3 rounded-full bg-rose-400"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
            <span className="text-xs text-slate-400 ml-2 font-mono">https://health-analyzer.io/dashboard</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left p-2">
            <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-800 tracking-wider uppercase">Overall Health Score</span>
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">78 <span className="text-sm font-normal text-slate-500">/ 100</span></div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-600 h-full w-[78%]"></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Up 6% from previous laboratory panel.</p>
            </div>
 
            <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-800 tracking-wider uppercase">Attention Needed</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">2 <span className="text-sm font-normal text-slate-500">Markers</span></div>
              <div className="flex gap-1.5 mt-3">
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-semibold font-mono">LDL: 142 (High)</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold font-mono">GLU: 104 (High)</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Responsive to active fiber & light cardio.</p>
            </div>
 
            <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-800 tracking-wider uppercase">Biomarker Trend</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">-12 <span className="text-xs font-normal text-indigo-600 font-semibold">mg/dL LDL</span></div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-500 h-full w-[60%]"></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Demonstrating positive recovery curve.</p>
            </div>
          </div>
        </motion.div>
      </header>
 
      {/* Educational Disclaimer Banner */}
      <section className="bg-indigo-50 border-y border-indigo-100 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
          <ShieldAlert className="w-8 h-8 text-indigo-600 flex-shrink-0" />
          <div className="max-w-4xl text-sm text-indigo-900 leading-relaxed">
            <span className="font-bold uppercase tracking-wider text-[11px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded mr-2">Educational Only</span>
            AI-generated summaries, biomarker normal ranges, and lifestyle suggestions do not represent professional clinical diagnosis or medical therapy advice. Always present reports to a medical practitioner.
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Everything You Need for Lab Analysis</h2>
          <p className="text-slate-600 mt-4 text-lg">We deliver a premium healthcare analytics SaaS layout engineered to provide immediate visual clarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-xl transition-all group duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-3xl -z-10 group-hover:bg-emerald-50 transition-colors"></div>
              <div className="p-3 bg-slate-50 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-900 text-white py-24 md:py-32 relative overflow-hidden">
        {/* Glow dots */}
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">How the Analyzer Works</h2>
            <p className="text-slate-400 mt-4 text-lg">Three straightforward steps to completely demystify your personal medical paperwork.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-0.5 border-t border-dashed border-slate-800 -z-0"></div>
            
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center relative z-10 group">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-mono text-xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/10">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">User Testimonials</h2>
          <p className="text-slate-600 mt-4 text-lg font-normal">Read about how we assist users in tracking biological metrics and wellness changes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, index) => (
            <div key={index} className="p-8 rounded-2xl bg-white border border-slate-100 shadow-md relative flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 italic leading-relaxed text-sm">"{test.quote}"</p>
              </div>
              <div className="flex items-center gap-4 mt-8 pt-4 border-t border-slate-100">
                <img src={test.avatar} alt={test.author} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{test.author}</h4>
                  <p className="text-xs text-slate-500">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section (Demo) */}
      <section className="bg-slate-50 border-t border-slate-200/60 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-indigo-600 tracking-widest uppercase">Pricing (Demo Mode)</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">Transparent, Simple Pricing</h2>
            <p className="text-slate-600 mt-4 text-lg font-normal">All interactive features are completely free during our preview launch.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Lite Trial</h3>
                <p className="text-slate-500 text-xs mt-1">Perfect for a single test analysis.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="text-slate-500 text-xs ml-1">/ forever</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Upload 1 test panel (Image or PDF)</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Standard AI analysis & OCR table</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 text-slate-400 line-through">
                    <Check className="w-4 h-4 flex-shrink-0 text-slate-300" />
                    <span>Historical trend tracking charts</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={onGetStarted}
                className="mt-8 w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-all cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-white p-8 rounded-2xl border-2 border-indigo-600 shadow-xl relative flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-650 text-white text-[10px] uppercase font-bold tracking-wider py-1 px-4 rounded-bl-xl shadow-md">
                Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pro Health</h3>
                <p className="text-slate-500 text-xs mt-1">Full-stack access for lifelong tracking.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="text-slate-500 text-xs ml-1">/ month (Demo active)</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Unlimited biomarker report uploads</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Advanced Gemini 3.5 AI diagnostics</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Historical trend line & radar charts</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>PDF, CSV, & JSON export utilities</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={onGetStarted}
                className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
              >
                Join Pro Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center mb-16">
          <HelpCircle className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-500 mt-2 text-sm">Have queries about privacy or OCR accuracy? Find standard guidance below.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full text-left p-6 font-bold text-slate-800 hover:text-indigo-600 flex justify-between items-center transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-xl font-mono text-slate-400">{activeFaq === index ? "−" : "+"}</span>
              </button>
              {activeFaq === index && (
                <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-slate-100 border-t border-slate-200/60 py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950">Ready to visualize your medical health?</h2>
          <p className="text-slate-600 mt-2 text-sm">Get immediate answers and learn to manage your personal markers cleanly.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
            <button 
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all whitespace-nowrap cursor-pointer"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <span className="font-extrabold text-white font-sans tracking-tight">AI Health Report Analyzer</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <span className="text-slate-800">|</span>
            <span className="text-xs text-slate-500">Demo Active - No Real Credit Card Needed</span>
          </div>
          <div>
            <p className="text-xs text-slate-600">© 2026 AI Health Report Analyzer. Built securely. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
