/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Settings, 
  Moon, 
  Sun, 
  Languages, 
  BellRing, 
  Lock, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  X
} from "lucide-react";
import { AppSettings } from "../types";
import { motion } from "motion/react";

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  onDeleteAccount: () => void;
}

export default function SettingsView({ settings, onUpdateSettings, onDeleteAccount }: SettingsViewProps) {
  const [theme, setTheme] = useState(settings.theme);
  const [language, setLanguage] = useState(settings.language);
  const [emailNotif, setEmailNotif] = useState(settings.emailNotifications);
  const [smsNotif, setSmsNotif] = useState(settings.smsNotifications);
  const [weeklyRep, setWeeklyRep] = useState(settings.weeklyReports);
  const [privacyMode, setPrivacyMode] = useState(settings.privacyMode);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    onUpdateSettings({
      theme,
      language,
      emailNotifications: emailNotif,
      smsNotifications: smsNotif,
      weeklyReports: weeklyRep,
      privacyMode
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 relative">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Application configurations updated!</span>
        </div>
      )}

      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          SaaS Configurations
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Adjust security options, language localization, and scheduled notification vectors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left list of indicators */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Settings Shortcuts</h3>
            <ul className="space-y-2">
              <li className="text-xs text-indigo-600 font-semibold p-2 bg-indigo-50/50 rounded-lg">General Configurations</li>
              <li className="text-xs text-slate-500 hover:text-slate-800 p-2 rounded-lg transition-colors cursor-pointer">Security & Encryption</li>
              <li className="text-xs text-slate-500 hover:text-slate-800 p-2 rounded-lg transition-colors cursor-pointer">HIPAA Consent Form</li>
            </ul>
          </div>
        </div>

        {/* Configurations panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* General setup */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
              <Settings className="w-4.5 h-4.5 text-slate-600" />
              <span>General Configurations</span>
            </h3>

            {/* Theme Toggle */}
            <div className="flex justify-between items-center py-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Visual Application Theme</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Toggle interface aesthetics matching ambient light levels.</p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                <button 
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    theme === "light" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    theme === "dark" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex justify-between items-center py-2 border-t border-slate-100 pt-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Language Localization</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Select translation schemas for extracted medical values.</p>
              </div>

              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Spanish">Español (Spanish)</option>
                <option value="German">Deutsch (German)</option>
                <option value="French">Français (French)</option>
              </select>
            </div>
          </div>

          {/* Notifications setup */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
              <BellRing className="w-4.5 h-4.5 text-indigo-500" />
              <span>Notification Preferences</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Email Alerts</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Get instant reports when diagnostic analyses complete.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">SMS Reminders</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Receive text pings for upcoming checkup schedules.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={smsNotif}
                  onChange={(e) => setSmsNotif(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Weekly Health Trends Digest</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Subscribe to a summarized weekly analysis of body metrics.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={weeklyRep}
                  onChange={(e) => setWeeklyRep(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Encryption */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
              <Lock className="w-4.5 h-4.5 text-indigo-600" />
              <span>Security & Encryption Options</span>
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Strict Privacy Sandbox Mode</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Enforces automatic file wiping from servers immediately after analysis.</p>
              </div>
              <input 
                type="checkbox" 
                checked={privacyMode}
                onChange={(e) => setPrivacyMode(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-2">
            <button 
              type="button" 
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 rounded-lg hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account & Records</span>
            </button>

            <button 
              type="button" 
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              Save Configurations
            </button>
          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Are you absolutely sure?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will permanently delete your medical account profile, including your entire clinical biomarker history, uploaded PDFs, and visual wellness tracking statistics. This operation is irreversible.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => { setShowDeleteModal(false); onDeleteAccount(); }}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-all cursor-pointer shadow-md shadow-rose-600/10"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
