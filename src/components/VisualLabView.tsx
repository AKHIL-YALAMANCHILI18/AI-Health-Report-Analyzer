import React, { useState, useRef } from "react";
import { Camera, Upload, AlertCircle, Sparkles, HelpCircle, CheckCircle2 } from "lucide-react";

interface ImageAnalysisResult {
  title: string;
  description: string;
  insights: {
    parameter: string;
    observation: string;
    clinicalImplication: string;
  }[];
  recommendations: string[];
  disclaimer: string;
}

export default function VisualLabView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<"food" | "prescription" | "general">("food");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAnalysis(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!previewUrl) return;
    setIsLoading(true);
    setWarningMessage(null);

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: previewUrl,
          mimeType: selectedFile?.type || "image/jpeg",
          category,
          customPrompt
        })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      if (data.warning) {
        setWarningMessage(data.warning);
      }
    } catch (err: any) {
      console.error("Image analysis error:", err);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setWarningMessage(null);
  };

  return (
    <div id="visual-lab" className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
          <Camera className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight">AI Multimodal Visual Lab</h2>
          <p className="text-xs text-slate-500">Scan fitness meals, supplement labels, or active symptom logs for instant wellness feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Upload Lifestyle Photo</h3>

            {/* Drag & Drop Upload Zone */}
            {!previewUrl ? (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
                    : "border-slate-200 hover:border-indigo-400 dark:border-slate-750 dark:hover:border-indigo-600"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-2xs">
                  <Upload className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Drag & Drop Image</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">JPEG, PNG, WEBP up to 10MB</span>
                </div>
                <button
                  type="button"
                  className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer"
                >
                  Or browse files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-250/80 dark:border-slate-800 shadow-xs">
                <img
                  src={previewUrl}
                  alt="Upload Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
                >
                  Change Image
                </button>
              </div>
            )}

            {/* Config inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Image Category</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCategory("food")}
                    className={`text-xs font-bold py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                      category === "food"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/30 dark:text-indigo-400"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-750 dark:text-slate-400 dark:hover:bg-slate-850"
                    }`}
                  >
                    Food Plate
                  </button>
                  <button
                    onClick={() => setCategory("prescription")}
                    className={`text-xs font-bold py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                      category === "prescription"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/30 dark:text-indigo-400"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-750 dark:text-slate-400 dark:hover:bg-slate-850"
                    }`}
                  >
                    Label Scan
                  </button>
                  <button
                    onClick={() => setCategory("general")}
                    className={`text-xs font-bold py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                      category === "general"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/30 dark:text-indigo-400"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-750 dark:text-slate-400 dark:hover:bg-slate-850"
                    }`}
                  >
                    General
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1.5">Custom Query Focus (Optional)</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Estimate nutritional macros, or check if Vitamin D concentration is high..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!previewUrl || isLoading}
                className="w-full bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Multimodal Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Scan with Multimodal Vision</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs h-full flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 dark:border-indigo-950/50 border-t-indigo-600 animate-spin" />
                <Sparkles className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Gemini Vision Pipeline Engaged</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Analyzing photo geometry, isolating text elements, evaluating calorie distributions, and computing micronutrient ratios.
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Warning label */}
              {warningMessage && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl p-4 flex items-center gap-2.5 text-xs dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse shrink-0" />
                  <span>{warningMessage}</span>
                </div>
              )}

              {/* Main Analysis card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full">Vision Scan Complete</span>
                    <span className="text-xs text-slate-400 font-mono">Multimodal Pro</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight">{analysis.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">{analysis.description}</p>
                </div>

                {/* Insights block */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Identified Parameter Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.insights.map((ins, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-850 border border-slate-150/80 dark:border-slate-800 p-4 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">{ins.parameter}</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                          <strong className="font-bold text-slate-900 dark:text-white">Observed:</strong> {ins.observation}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          <strong className="font-semibold text-slate-500">Implication:</strong> {ins.clinicalImplication}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action recommendations */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Actionable Lifestyle Suggestions</h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 p-4 rounded-xl flex gap-2.5 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{analysis.disclaimer}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs h-full flex flex-col items-center justify-center">
              <Camera className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Visual Output Terminal</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Upload or drop your dietary plate, prescription bottle, or exercise metrics ledger in the left column to start.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
