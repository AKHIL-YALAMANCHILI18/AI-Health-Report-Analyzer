/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2,
  HelpCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { HealthReport } from "../types";
import { motion } from "motion/react";

interface UploadViewProps {
  onUploadStart: (file: File, mockMode: boolean) => void;
  reports: HealthReport[];
  onSelectReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
}

export default function UploadView({ 
  onUploadStart, 
  reports, 
  onSelectReport, 
  onDeleteReport 
}: UploadViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    
    if (!validTypes.includes(file.type)) {
      setError("Unsupported file format. Please upload a PDF, PNG, JPG, or JPEG file.");
      return;
    }

    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeInBytes) {
      setError("File is too large. Maximum supported size is 10 MB.");
      return;
    }

    setSelectedFile(file);
    simulateProgress(file);
  };

  const simulateProgress = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);
        onUploadStart(file, false);
      } else {
        setUploadProgress(currentProgress);
      }
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const triggerSampleReportAnalysis = () => {
    setError(null);
    // Create a dummy mock file
    const sampleFile = new File(["sample_blood_test"], "comprehensive_blood_jun2026.pdf", { type: "application/pdf" });
    setIsUploading(true);
    setUploadProgress(0);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);
        onUploadStart(sampleFile, true);
      } else {
        setUploadProgress(currentProgress);
      }
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          Upload Health Report
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Our advanced multimodal AI parses clinical lab panels, matches reference ranges, and structures data automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upload Zone */}
        <div className="md:col-span-2 space-y-6">
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragActive 
                ? "border-indigo-500 bg-indigo-50/50" 
                : "border-slate-200 hover:border-indigo-400 bg-white"
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileInput}
            />

            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">Drag & Drop Your Report</h3>
              <p className="text-xs text-slate-400 mt-1">Supports PDF or High-Resolution blood test photos (PNG, JPG, JPEG up to 10MB)</p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button 
                  onClick={onButtonClick}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  Browse Files
                </button>
                <button 
                  onClick={triggerSampleReportAnalysis}
                  className="px-5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200/50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Sample Blood Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {isUploading && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>{selectedFile?.name || "Processing report..."}</span>
                </div>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                <span>Scanning document structure, resolving metadata, and mapping biomarker coordinates...</span>
              </p>
            </div>
          )}

          {/* Error Feedbacks */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex gap-2 items-start">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex gap-2 items-start">
            <HelpCircle className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Security Guard: </span>
              All clinical records are parsed server-side. File data remains completely encapsulated inside this browser instance unless persistent sync is requested. You retain absolute ownership.
            </div>
          </div>
        </div>

        {/* Previous Uploads list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Upload History ({reports.length})</span>
            </h3>

            <div className="mt-4 space-y-3">
              {reports.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No previous uploads found. Use the zone to begin scanning.
                </div>
              ) : (
                reports.map(rep => (
                  <div 
                    key={rep.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all flex justify-between items-center group relative"
                  >
                    <div 
                      onClick={() => onSelectReport(rep.id)}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700">{rep.fileName}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{rep.uploadDate} • {rep.fileSize}</div>
                    </div>
                    <button 
                      onClick={() => onDeleteReport(rep.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer ml-2 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {reports.length > 0 && (
            <button 
              onClick={() => onSelectReport(reports[0].id)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Explore Latest Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
