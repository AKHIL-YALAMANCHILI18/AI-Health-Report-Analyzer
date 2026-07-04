/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  TrendingUp, 
  Plus, 
  Clock, 
  ShieldCheck, 
  Heart, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Calendar, 
  Bell, 
  ChevronRight, 
  ArrowRight,
  Zap,
  CheckCircle,
  Database,
  ArrowUpRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from "recharts";
import { HealthReport, UserProfile } from "../types";
import { motion } from "motion/react";

interface DashboardViewProps {
  reports: HealthReport[];
  profile: UserProfile;
  onNavigateToUpload: () => void;
  onNavigateToCompare: () => void;
  onSelectReport: (id: string) => void;
}

export default function DashboardView({ 
  reports, 
  profile, 
  onNavigateToUpload, 
  onNavigateToCompare,
  onSelectReport 
}: DashboardViewProps) {
  
  // Active report is the most recent one
  const activeReport = reports.find(r => r.status === "success") || reports[0];
  const analysis = activeReport?.analysis;

  // Calculate stats based on active report
  const overallScore = analysis?.healthScores?.overallWellnessScore || 70;
  const abnormalCount = analysis?.biomarkers?.filter(b => b.status === "high" || b.status === "low" || b.status === "critical").length || 0;
  const criticalCount = analysis?.biomarkers?.filter(b => b.status === "critical").length || 0;
  const riskLevel = analysis?.riskIndicators?.[0]?.riskLevel || "Low";

  // System subscores for the radar map
  const subscoresData = [
    { name: "Blood Health", score: analysis?.healthScores?.bloodHealth || 80 },
    { name: "Kidneys", score: analysis?.healthScores?.kidneyHealth || 80 },
    { name: "Liver", score: analysis?.healthScores?.liverHealth || 80 },
    { name: "Heart", score: analysis?.healthScores?.heartHealth || 80 },
    { name: "Metabolic", score: analysis?.healthScores?.metabolicHealth || 80 },
    { name: "Immune System", score: analysis?.healthScores?.immuneIndicators || 80 }
  ];

  // Historical trend data compiled from loaded reports
  const trendData = reports
    .filter(r => r.status === "success")
    .map(r => ({
      date: r.uploadDate,
      wellness: r.analysis?.healthScores?.overallWellnessScore || 70,
      heart: r.analysis?.healthScores?.heartHealth || 60,
      metabolic: r.analysis?.healthScores?.metabolicHealth || 50,
      blood: r.analysis?.healthScores?.bloodHealth || 70,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Reminders
  const reminders = [
    { title: "Follow-up Lipid Assessment", date: "Jul 20, 2026", desc: "A routine panel with Dr. Vance to verify cholesterol progress.", priority: "high" },
    { title: "Annual Physical checkup", date: "Aug 15, 2026", desc: "Full checkup at City Diagnostics.", priority: "medium" },
    { title: "Glucose Check (Fasting)", date: "Sep 02, 2026", desc: "In-home blood glucose strip testing.", priority: "low" }
  ];

  // System Notifications
  const notifications = [
    { text: "AI successfully generated comparative analytics report", time: "1 hour ago", icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
    { text: "ALT liver markers stabilized compared to Jan 2026", time: "1 day ago", icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
    { text: "Lp(a) sub-parameter flagged for educational review", time: "2 days ago", icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Premium Header Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Hello, {profile.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back. Here is your synthesized wellness overview, supercharged by Gemini.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onNavigateToCompare}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>Compare Reports</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </button>
          
          <button 
            onClick={onNavigateToUpload}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Report</span>
          </button>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Reports Tracked</span>
            <div className="text-2xl font-extrabold text-slate-900">{reports.length}</div>
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
              <span>Stable History</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Abnormal Biomarkers</span>
            <div className="text-2xl font-extrabold text-slate-900">{abnormalCount}</div>
            <span className="text-xs text-slate-500 mt-0.5 block font-medium">
              {criticalCount > 0 ? `${criticalCount} Critical` : "Highly modifiable"}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl">
            <Heart className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Active Risk Status</span>
            <div className="text-2xl font-extrabold text-slate-900">{riskLevel}</div>
            <span className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
              <span>Cardiovascular stress</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Clock className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Last Upload Date</span>
            <div className="text-xl font-extrabold text-slate-900">
              {activeReport?.uploadDate || "N/A"}
            </div>
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OCR Complete</span>
            </span>
          </div>
        </div>

      </div>

      {/* Grid: Health score breakdown (circular gauge + radar chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gauge card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-0"></div>
          <div>
            <div className="flex items-center gap-1 text-slate-800 font-bold text-sm">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Educational Wellness score</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Sass aggregate calculated from raw biological blood levels.</p>
          </div>

          <div className="my-8 flex justify-center relative">
            {/* SVG circle gauge */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
              <circle cx="80" cy="80" r="70" stroke="url(#indigo-gradient)" strokeWidth="12" fill="transparent" 
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * overallScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="indigo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-900">{overallScore}</span>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Optimal Tier</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs leading-relaxed text-slate-600">
            <span className="font-bold text-slate-900">Summary: </span>
            {analysis?.summary || "No active report uploaded yet."}
          </div>
        </div>

        {/* Radar wellness subscores chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <Database className="w-4 h-4 text-indigo-500" />
                <span>Biological Sub-System Wellness Scores</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">Scores out of 100</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Visualizing physiological health systems mapped from biomarkers.</p>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subscoresData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar 
                  name="Wellness score" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.25} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            {subscoresData.slice(0, 3).map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-slate-400 text-[10px] font-semibold truncate uppercase">{item.name}</div>
                <div className="text-lg font-bold text-slate-950 mt-0.5">{item.score}%</div>
              </div>
            ))}
            {subscoresData.slice(3, 6).map((item, i) => (
              <div key={i} className="text-center border-l border-slate-100">
                <div className="text-slate-400 text-[10px] font-semibold truncate uppercase">{item.name}</div>
                <div className="text-lg font-bold text-slate-950 mt-0.5">{item.score}%</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Historical timeline analytics + recent reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Historical line chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Historical Biomarker Trend Chart</span>
              </div>
              <span className="text-[10px] text-slate-400">Jan 2026 − Jun 2026</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Multi-series evaluation tracking heart, metabolic system and overall wellness indices.</p>
          </div>

          <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line type="monotone" dataKey="wellness" stroke="#4f46e5" strokeWidth={3} name="Overall Wellness" dot={{ r: 5 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="heart" stroke="#a78bfa" strokeWidth={2} name="Cardiovascular index" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="metabolic" stroke="#f59e0b" strokeWidth={2} name="Metabolic health" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent reports list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Recent Uploads ({reports.length})</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              {reports.map((rep) => (
                <div 
                  key={rep.id}
                  onClick={() => onSelectReport(rep.id)}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{rep.fileName}</div>
                    <div className="flex gap-2 items-center text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{rep.uploadDate}</span>
                      <span>•</span>
                      <span>{rep.fileSize}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase font-mono ${
                      rep.status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {rep.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={onNavigateToUpload}
            className="mt-6 w-full py-3 rounded-xl border border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 text-slate-600 hover:text-indigo-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Process New Diagnostic</span>
          </button>
        </div>

      </div>

      {/* Grid: Notifications & Calendar Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm pb-4 border-b border-slate-100">
            <Bell className="w-4.5 h-4.5 text-indigo-500" />
            <span>System Analytics Feed</span>
          </div>

          <div className="mt-4 space-y-4">
            {notifications.map((notif, i) => (
              <div key={i} className="flex gap-3 items-start text-xs">
                <div className="p-1.5 bg-slate-50 rounded-lg mt-0.5">
                  {notif.icon}
                </div>
                <div>
                  <p className="text-slate-700 font-medium">{notif.text}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reminders list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm pb-4 border-b border-slate-100">
            <Calendar className="w-4.5 h-4.5 text-rose-500" />
            <span>Diagnostic Checkup Schedules</span>
          </div>

          <div className="mt-4 space-y-4">
            {reminders.map((rem, i) => (
              <div key={i} className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{rem.title}</h4>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      rem.priority === "high" ? "bg-rose-500" : rem.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                    }`}></span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{rem.desc}</p>
                </div>
                <div className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200/80 rounded-lg px-2 py-1 flex items-center gap-1 shadow-xs shrink-0 font-mono">
                  <span>{rem.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
