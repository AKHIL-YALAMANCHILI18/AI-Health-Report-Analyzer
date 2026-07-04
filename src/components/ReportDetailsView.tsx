/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  Calendar, 
  Building, 
  User, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Lightbulb, 
  ShieldCheck,
  Stethoscope,
  TrendingDown,
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
  Cell 
} from "recharts";
import { HealthReport, Biomarker } from "../types";
import { motion } from "motion/react";

interface ReportDetailsViewProps {
  report: HealthReport;
  onBack: () => void;
}

export default function ReportDetailsView({ report, onBack }: ReportDetailsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedBiomarker, setExpandedBiomarker] = useState<string | null>(null);

  // Intelligence State
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [intelligenceResult, setIntelligenceResult] = useState<any | null>(null);
  const [isIntelligenceLoading, setIsIntelligenceLoading] = useState(false);

  const handleGenerateIntelligence = async (taskName: string) => {
    setActiveTask(taskName);
    setIsIntelligenceLoading(true);
    setIntelligenceResult(null);

    try {
      const response = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: taskName,
          reportData: report.analysis,
          profileData: {
            name: report.analysis?.metadata?.patientName,
            age: report.analysis?.metadata?.age,
            gender: report.analysis?.metadata?.gender,
            healthGoals: "Optimize cardio and glycemic indicators"
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate intelligence document");
      }

      const data = await response.json();
      setIntelligenceResult(data.result);
    } catch (err) {
      console.error("Intelligence error:", err);
      alert("Failed to compile AI clinical intelligence report.");
    } finally {
      setIsIntelligenceLoading(false);
    }
  };

  const analysis = report.analysis;
  if (!analysis) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">Analysis Not Loaded</h2>
        <p className="text-slate-500 text-sm">Please choose a valid successfully-analyzed report from history.</p>
        <button onClick={onBack} className="px-4 py-2 rounded bg-slate-900 text-white font-semibold text-xs">
          Go Back
        </button>
      </div>
    );
  }

  // Filter biomarkers
  const filteredBiomarkers = analysis.biomarkers.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || b.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesStatus = selectedStatus === "all" || b.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Extract categories dynamically
  const categories = ["all", ...new Set(analysis.biomarkers.map(b => b.category))];

  // Helper colors
  const getStatusStyle = (status: Biomarker["status"]) => {
    switch (status) {
      case "critical":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "high":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "low":
        return "bg-indigo-100 text-indigo-900 border-indigo-300";
      default:
        return "bg-emerald-100 text-emerald-950 border-emerald-300";
    }
  };

  // Prepare chart data: Devise ratio of value against nominal limits to construct clean visual graphs
  const chartData = analysis.biomarkers.map(b => ({
    name: b.name,
    value: b.value,
    unit: b.unit,
    status: b.status,
  }));

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = "Biomarker Name,Category,Value,Unit,Normal Range,Status\n";
    const rows = analysis.biomarkers.map(b => 
      `"${b.name}","${b.category}",${b.value},"${b.unit}","${b.normalRange}","${b.status}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${report.fileName.replace(".pdf", "")}_biomarkers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Exporter
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${report.fileName.replace(".pdf", "")}_analysis.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Exporter (Simple PDF Simulation)
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 print:bg-white print:p-0">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <button 
          onClick={onBack}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          
          <button 
            onClick={handleExportJSON}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button 
            onClick={handlePrintPDF}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Header Cards: Metadata */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-700"></div>
        
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full mb-3 border border-indigo-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI OCR Confidence score: {analysis.metadata.confidenceScore}%</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
              {report.fileName}
            </h1>
            <p className="text-slate-400 text-xs mt-1">Processed securely using Gemini 3.5 Flash vision scanning systems.</p>
          </div>

          {/* Demographic grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Patient Name</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">{analysis.metadata.patientName}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Age / Gender</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">{analysis.metadata.age} y/o • {analysis.metadata.gender}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Laboratory Center</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5 truncate max-w-[120px]">{analysis.metadata.hospital}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Test / Report Date</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">{analysis.metadata.testDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Executive summary + risk indexes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Summary card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5 pb-3 border-b border-slate-100">
              <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
              <span>AI Executive Synthesis Summary</span>
            </h2>
            <div className="text-slate-600 text-sm leading-relaxed mt-4 space-y-3">
              <p>{analysis.summary}</p>
            </div>
          </div>
          
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex gap-2 items-start mt-6">
            <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>This clinical pathology breakdown utilizes standard diagnostic ranges. Values fluctuate based on diet, hydration, sleep cycles, and daily physiological cycles. Always reference raw diagnostics with your clinical care physician.</span>
          </div>
        </div>

        {/* Risk Indicators card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
            <span>Identified Risk Indicators</span>
          </h2>

          <div className="mt-4 space-y-4">
            {analysis.riskIndicators.map((risk, index) => (
              <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-150 relative overflow-hidden">
                <span className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[9px] uppercase font-bold ${
                  risk.riskLevel === "High" ? "bg-rose-100 text-rose-800" : risk.riskLevel === "Moderate" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {risk.riskLevel} Risk
                </span>
                
                <h4 className="text-xs font-bold text-slate-800">{risk.condition}</h4>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recharts Section: Value Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5 pb-3 border-b border-slate-100 mb-6">
          <TrendingDown className="w-4.5 h-4.5 text-indigo-500" />
          <span>Biomarker Value Overview</span>
        </h2>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(val: any, name: any, props: any) => [`${val} ${props.payload.unit}`, "Value"]}
              />
              <Bar dataKey="value" fill="#6366f1">
                {chartData.map((entry, index) => {
                  let barColor = "#6366f1"; // normal (indigo)
                  if (entry.status === "high") barColor = "#f59e0b";
                  if (entry.status === "low") barColor = "#818cf8";
                  if (entry.status === "critical") barColor = "#f43f5e";
                  return <Cell key={`cell-${index}`} fill={barColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BIOMARKERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Table header with filters */}
        <div className="p-6 border-b border-slate-150 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/60 print:hidden">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Extracted Lab Parameters</h2>
            <p className="text-xs text-slate-500 mt-1">Found {filteredBiomarkers.length} biomarkers. Click any parameter to read full AI descriptions.</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search biomarker..." 
                className="pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-full sm:w-44"
              />
            </div>

            {/* Category Filter */}
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Systems</option>
              {categories.filter(c => c !== "all").map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Table itself */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-150">
                <th className="py-4 px-6">Biomarker</th>
                <th className="py-4 px-6">System Category</th>
                <th className="py-4 px-6">Value / Metric</th>
                <th className="py-4 px-6">Standard Limits</th>
                <th className="py-4 px-6">Clinical Status</th>
                <th className="py-4 px-6 text-right print:hidden">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBiomarkers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No biomarkers matched the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredBiomarkers.map((b, i) => {
                  const isExpanded = expandedBiomarker === b.name;
                  return (
                    <React.Fragment key={i}>
                      {/* Standard row */}
                      <tr 
                        onClick={() => setExpandedBiomarker(isExpanded ? null : b.name)}
                        className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${isExpanded ? "bg-slate-50/30" : ""}`}
                      >
                        <td className="py-4 px-6">
                          <div className="text-xs font-bold text-slate-900">{b.name}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[10px] text-slate-500 font-semibold">{b.category}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-bold text-slate-900 font-mono">{b.value}</span>{" "}
                          <span className="text-[10px] text-slate-400 font-mono">{b.unit}</span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                          {b.normalRange}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider font-mono border ${getStatusStyle(b.status)}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right print:hidden">
                          {isExpanded ? <ChevronUp className="w-4 h-4 inline text-slate-400" /> : <ChevronDown className="w-4 h-4 inline text-slate-400" />}
                        </td>
                      </tr>

                      {/* Expandable description row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50/40 p-6 border-b border-slate-150">
                            <motion.div 
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs"
                            >
                              {/* Left block */}
                              <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <div className="font-extrabold text-slate-800 flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Educational Explanation</span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed">{b.explanation}</p>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="font-extrabold text-slate-800 flex items-center gap-1">
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Why This Metric Matters</span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed">{b.whyItMatters}</p>
                                </div>
                              </div>

                              {/* Right block */}
                              <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <div className="font-extrabold text-slate-800 flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Common Non-Clinical Causes</span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed">{b.possibleCauses}</p>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="font-extrabold text-slate-800 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Modifiable Lifestyle suggestions</span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed">{b.lifestyleSuggestions}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-150 text-[11px] text-emerald-950 flex gap-2">
                                  <Stethoscope className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                                  <div>
                                    <span className="font-bold">Follow-Up Discussion Questions: </span>
                                    {b.followUpQuestions}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI CLINICAL INTELLIGENCE MODULE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6 print:hidden">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">AI Clinical Intelligence Module</h3>
            <p className="text-xs text-slate-500">Synthesize customized secondary guidance logs, draft clinical physician requests, or generate targeted lifestyle plans.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleGenerateIntelligence("doctor_letter")}
            className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
              activeTask === "doctor_letter"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/15"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Draft Physician Letter</span>
          </button>

          <button
            onClick={() => handleGenerateIntelligence("meal_plan")}
            className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
              activeTask === "meal_plan"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/15"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Targeted 1-Day Meal Plan</span>
          </button>

          <button
            onClick={() => handleGenerateIntelligence("workout_plan")}
            className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
              activeTask === "workout_plan"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/15"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Targeted Workout Protocol</span>
          </button>
        </div>

        {/* Intelligence Loader / Output */}
        {isIntelligenceLoading && (
          <div className="bg-slate-50 p-12 rounded-xl text-center space-y-3 border border-slate-150 animate-pulse">
            <Sparkles className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Compiling AI Pathology Intelligence...</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Evaluating biomarker gaps, modeling anti-inflammatory nutrition complexes, and preparing professional physician correspondence formats.
            </p>
          </div>
        )}

        {/* Output blocks */}
        {intelligenceResult && activeTask === "doctor_letter" && (
          <div className="bg-slate-50 border border-slate-150 p-6 rounded-xl space-y-5 animate-fade-in">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject Line Suggestion</span>
              <span className="text-xs font-bold text-slate-800">{intelligenceResult.subject}</span>
            </div>
            
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Letter Body Suggestion</span>
              <p className="text-xs font-bold text-slate-800 leading-normal">{intelligenceResult.salutation}</p>
              <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{intelligenceResult.body}</p>
              <p className="text-xs text-slate-800 leading-normal">{intelligenceResult.closing}</p>
            </div>

            {intelligenceResult.questions && intelligenceResult.questions.length > 0 && (
              <div className="border-t border-slate-200 pt-4 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Physician Questions</span>
                <ul className="space-y-2">
                  {intelligenceResult.questions.map((q: string, i: number) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-650 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {intelligenceResult && activeTask === "meal_plan" && (
          <div className="bg-slate-50 border border-slate-150 p-6 rounded-xl space-y-6 animate-fade-in">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Core Nutritional Focus</span>
              <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg inline-block">{intelligenceResult.focus}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(intelligenceResult.meals || {}).map(([mealKey, meal]: [string, any]) => (
                <div key={mealKey} className="bg-white border border-slate-150 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{mealKey}</span>
                  <span className="text-xs font-bold text-slate-900 block">{meal.name}</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <strong className="font-semibold">Ingredients:</strong> {meal.ingredients?.join(", ")}
                  </p>
                  <p className="text-[11px] text-slate-650 bg-slate-50/70 p-2 rounded-lg border border-slate-100 leading-relaxed mt-2 font-sans">
                    <strong className="font-bold text-slate-800 font-sans">Biochemical Impact:</strong> {meal.biomarkerImpact}
                  </p>
                </div>
              ))}
            </div>

            {intelligenceResult.nutritionalRules && (
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pathology Dietary Rules</span>
                <ul className="space-y-1.5">
                  {intelligenceResult.nutritionalRules.map((rule: string, i: number) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-650 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {intelligenceResult && activeTask === "workout_plan" && (
          <div className="bg-slate-50 border border-slate-150 p-6 rounded-xl space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Protocol Title</span>
                <span className="text-xs font-extrabold text-slate-900">{intelligenceResult.planName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Weekly Schedule</span>
                <span className="text-xs font-semibold text-slate-600">{intelligenceResult.weeklyStructure}</span>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Structured Training Blocks</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intelligenceResult.sessions?.map((session: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-150 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900">{session.name}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">{session.type}</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-500">
                      {session.exercises?.map((ex: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-slate-650 bg-indigo-50/30 p-2 rounded-lg border border-indigo-100/50 leading-relaxed mt-2.5">
                      <strong className="font-bold text-slate-800">Biomarker Benefit:</strong> {session.physiologicalFocus}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {intelligenceResult.safetyGuidelines && (
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Physiological Safety Guidelines</span>
                <ul className="space-y-1.5">
                  {intelligenceResult.safetyGuidelines.map((guideline: string, i: number) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
