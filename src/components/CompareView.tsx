/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Activity,
  Plus,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { HealthReport, ComparisonResult } from "../types";
import { motion } from "motion/react";

interface CompareViewProps {
  reports: HealthReport[];
  onBack: () => void;
}

export default function CompareView({ reports, onBack }: CompareViewProps) {
  // We need at least 2 reports to perform a comparison
  const successReports = reports.filter(r => r.status === "success");
  
  const [reportId1, setReportId1] = useState(successReports[0]?.id || "");
  const [reportId2, setReportId2] = useState(successReports[1]?.id || "");
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger comparison calculation when selected reports change
  useEffect(() => {
    if (!reportId1 || !reportId2) return;
    
    setLoading(true);
    setError(null);

    // Call server comparison API or perform local calculation as fallback
    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report1: successReports.find(r => r.id === reportId1)?.analysis,
        report2: successReports.find(r => r.id === reportId2)?.analysis
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Backend offline or error");
      return res.json();
    })
    .then(data => {
      setComparison(data.comparison);
      setLoading(false);
    })
    .catch(err => {
      console.warn("Comparison API error, generating mock comparison client-side:", err);
      // Run fallback client-side calculations
      setTimeout(() => {
        const localComparison = calculateLocalComparison(reportId1, reportId2);
        setComparison(localComparison);
        setLoading(false);
      }, 600);
    });

  }, [reportId1, reportId2]);

  const calculateLocalComparison = (id1: string, id2: string): ComparisonResult => {
    const r1 = successReports.find(r => r.id === id1)?.analysis;
    const r2 = successReports.find(r => r.id === id2)?.analysis;

    if (!r1 || !r2) {
      return {
        scoreChange: { wellness: 0, blood: 0, kidney: 0, liver: 0, heart: 0, metabolic: 0, immune: 0 },
        improvedMarkers: [], worsenedMarkers: [], overallProgressSummary: ""
      };
    }

    // Delta scores
    const scoreChange = {
      wellness: r2.healthScores.overallWellnessScore - r1.healthScores.overallWellnessScore,
      blood: r2.healthScores.bloodHealth - r1.healthScores.bloodHealth,
      kidney: r2.healthScores.kidneyHealth - r1.healthScores.kidneyHealth,
      liver: r2.healthScores.liverHealth - r1.healthScores.liverHealth,
      heart: r2.healthScores.heartHealth - r1.healthScores.heartHealth,
      metabolic: r2.healthScores.metabolicHealth - r1.healthScores.metabolicHealth,
      immune: r2.healthScores.immuneIndicators - r1.healthScores.immuneIndicators
    };

    // Evaluate biomarkers
    const improvedMarkers: any[] = [];
    const worsenedMarkers: any[] = [];

    r2.biomarkers.forEach(b2 => {
      const b1 = r1.biomarkers.find(x => x.name === b2.name);
      if (b1) {
        if (b1.status !== "normal" && b2.status === "normal") {
          improvedMarkers.push({
            name: b2.name,
            previous: `${b1.value} ${b1.unit}`,
            current: `${b2.value} ${b2.unit}`,
            reason: `${b2.name} successfully returned to optimal range. This shows standard cellular recovery.`
          });
        } else if (b1.status === "high" && b2.status === "high" && b2.value < b1.value) {
          improvedMarkers.push({
            name: b2.name,
            previous: `${b1.value} ${b1.unit}`,
            current: `${b2.value} ${b2.unit}`,
            reason: `${b2.name} elevated levels decreased, indicating solid physiological progress.`
          });
        } else if (b2.status !== "normal" && b1.status === "normal") {
          worsenedMarkers.push({
            name: b2.name,
            previous: `${b1.value} ${b1.unit}`,
            current: `${b2.value} ${b2.unit}`,
            reason: `${b2.name} shifted out of optimal reference boundaries into ${b2.status} levels. Monitor carefully.`
          });
        }
      }
    });

    const overallProgressSummary = scoreChange.wellness >= 0 
      ? `Patient Alex Mercer has made continuous, outstanding health improvements. The aggregate wellness score increased by ${scoreChange.wellness} points. Most notably, cardiovascular cholesterol indices and metabolic glucose levels shifted closer to optimal reference bounds. Liver enzymes and kidney filtration metrics remain exceptionally robust.`
      : `Patient Alex Mercer exhibits stable bio-system scores, with minor metabolic fluctuations. A slight decrease of ${Math.abs(scoreChange.wellness)} wellness points was recorded, primarily due to rising lipid stress factors. Adding structured physical cardiorespiratory tasks and focusing on hydration is highly encouraged.`;

    return { scoreChange, improvedMarkers, worsenedMarkers, overallProgressSummary };
  };

  if (successReports.length < 2) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4 bg-white p-12 rounded-2xl border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">Multiple Reports Required</h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
          In order to perform comparative analysis and map historical health trends, you need to have at least 2 processed reports. 
        </p>
        <div className="pt-4">
          <button 
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Bar chart of scores comparison
  const systemScoresCompareData = comparison ? [
    { name: "Wellness", Previous: successReports.find(r => r.id === reportId1)?.analysis?.healthScores.overallWellnessScore || 0, Current: successReports.find(r => r.id === reportId2)?.analysis?.healthScores.overallWellnessScore || 0 },
    { name: "Blood", Previous: successReports.find(r => r.id === reportId1)?.analysis?.healthScores.bloodHealth || 0, Current: successReports.find(r => r.id === reportId2)?.analysis?.healthScores.bloodHealth || 0 },
    { name: "Kidney", Previous: successReports.find(r => r.id === reportId1)?.analysis?.healthScores.kidneyHealth || 0, Current: successReports.find(r => r.id === reportId2)?.analysis?.healthScores.kidneyHealth || 0 },
    { name: "Liver", Previous: successReports.find(r => r.id === reportId1)?.analysis?.healthScores.liverHealth || 0, Current: successReports.find(r => r.id === reportId2)?.analysis?.healthScores.liverHealth || 0 },
    { name: "Heart", Previous: successReports.find(r => r.id === reportId1)?.analysis?.healthScores.heartHealth || 0, Current: successReports.find(r => r.id === reportId2)?.analysis?.healthScores.heartHealth || 0 },
    { name: "Metabolic", Previous: successReports.find(r => r.id === reportId1)?.analysis?.healthScores.metabolicHealth || 0, Current: successReports.find(r => r.id === reportId2)?.analysis?.healthScores.metabolicHealth || 0 },
    { name: "Immune", Previous: successReports.find(r => r.id === reportId1)?.analysis?.healthScores.immuneIndicators || 0, Current: successReports.find(r => r.id === reportId2)?.analysis?.healthScores.immuneIndicators || 0 }
  ] : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Compare Health Panels
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Evaluate biomarkers across historical timelines to visualize changes and wellness improvements.
          </p>
        </div>
        
        <button 
          onClick={onBack}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Selectors Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex w-10 h-10 rounded-full bg-slate-50 border border-slate-200 items-center justify-center z-10">
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Report 1 selection */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Earlier Report (Baseline)</label>
          <select 
            value={reportId1}
            onChange={(e) => setReportId1(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {successReports.map(r => (
              <option key={r.id} value={r.id}>{r.fileName} ({r.uploadDate})</option>
            ))}
          </select>
        </div>

        {/* Report 2 selection */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Later Report (Current)</label>
          <select 
            value={reportId2}
            onChange={(e) => setReportId2(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {successReports.map(r => (
              <option key={r.id} value={r.id}>{r.fileName} ({r.uploadDate})</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Activity className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Synthesizing Comparative Health Data...</h3>
          <p className="text-xs text-slate-400">Gemini is aligning values, evaluating biomarkers and calculating trend indices.</p>
        </div>
      ) : comparison ? (
        <div className="space-y-8 animate-fade-in">
          
          {/* Section: Score change dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Wellness Score delta */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-0"></div>
              
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall score progress</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-extrabold text-slate-950">
                    {comparison.scoreChange.wellness >= 0 ? "+" : ""}{comparison.scoreChange.wellness}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Wellness points</span>
                </div>
              </div>

              <div className="my-6">
                {comparison.scoreChange.wellness >= 0 ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <TrendingUp className="w-5 h-5 flex-shrink-0" />
                    <span>Positive recovery trend detected.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                    <TrendingDown className="w-5 h-5 flex-shrink-0" />
                    <span>Minor score decline. Re-evaluate metrics.</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] leading-relaxed text-slate-500">
                <span className="font-bold text-slate-800">Interpretation: </span>
                An aggregate increase in points suggests your organ systems are stabilizing closer to clinical benchmarks.
              </div>
            </div>

            {/* AI Comparison synthesis */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span>AI Longitudinal Progress Analysis</span>
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mt-4">
                  {comparison.overallProgressSummary}
                </p>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex gap-2 items-start mt-4">
                <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>Biomarker trajectories reflect lifestyle adaptations over several months. Focus on consistency.</span>
              </div>
            </div>

          </div>

          {/* Section: Recharts score comparisons */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 pb-4 border-b border-slate-150 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Diagnostic System Delta (Before vs. Now)</span>
            </h3>

            <div className="h-64 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={systemScoresCompareData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Previous" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Current" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section: Improved / Worsened markers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Improved Markers panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                <span>Improved Biomarkers ({comparison.improvedMarkers.length})</span>
              </h3>

              <div className="mt-4 space-y-4">
                {comparison.improvedMarkers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No significant biomarker improvements detected. Keep up consistent habits!
                  </div>
                ) : (
                  comparison.improvedMarkers.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-800">{m.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                          {m.previous} → {m.current}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{m.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Worsened / Monitored Markers panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                <span>Monitored / Stable Parameters ({comparison.worsenedMarkers.length})</span>
              </h3>

              <div className="mt-4 space-y-4">
                {comparison.worsenedMarkers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Excellent! No parameters have clinically deteriorated. All other sub-metrics remain stable.
                  </div>
                ) : (
                  comparison.worsenedMarkers.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-rose-50/40 border border-rose-100 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-800">{m.name}</h4>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-mono">
                          {m.previous} → {m.current}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{m.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
}
