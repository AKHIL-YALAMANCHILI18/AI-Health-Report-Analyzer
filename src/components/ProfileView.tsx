/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User, 
  Dna, 
  HeartHandshake, 
  Activity, 
  ShieldAlert, 
  Pill, 
  Camera, 
  CheckCircle2, 
  Sparkles,
  Info
} from "lucide-react";
import { UserProfile } from "../types";
import { motion } from "motion/react";

interface ProfileViewProps {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

export default function ProfileView({ profile, onSave }: ProfileViewProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup);
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact);
  const [medicalConditions, setMedicalConditions] = useState(profile.medicalConditions);
  const [allergies, setAllergies] = useState(profile.allergies);
  const [currentMedications, setCurrentMedications] = useState(profile.currentMedications);
  const [lifestyle, setLifestyle] = useState(profile.lifestyle);
  const [avatar, setAvatar] = useState(profile.avatarUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      onSave({
        name,
        email,
        age,
        gender,
        height,
        weight,
        bloodGroup,
        emergencyContact,
        medicalConditions,
        allergies,
        currentMedications,
        lifestyle,
        avatarUrl: avatar
      });
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const triggerAvatarUpload = () => {
    // Generate a random high quality premium healthcare avatar from unsplash as simulation
    const randIds = [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=250",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
    ];
    const picked = randIds[Math.floor(Math.random() * randIds.length)];
    setAvatar(picked);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 relative">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Profile changes synchronized successfully!</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          My Health Profile
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure body metrics and historical parameters to optimize standard reference bounds for AI.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: Avatar Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <img 
                src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"} 
                alt="Profile Avatar" 
                className="w-full h-full rounded-full object-cover border-4 border-slate-50 shadow-md"
                referrerPolicy="no-referrer"
              />
              <button 
                type="button" 
                onClick={triggerAvatarUpload}
                className="absolute bottom-1 right-1 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg transition-all cursor-pointer border border-white"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-slate-800">{name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{email}</p>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-900 text-left flex gap-1.5 leading-relaxed">
              <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
              <span>SaaS health sub-scores adapt to age, gender, and weight metrics. Keep values accurate for balanced evaluations.</span>
            </div>
          </div>
        </div>

        {/* Right column: Form fields */}
        <div className="md:col-span-2 space-y-6">
          
          {/* General metrics */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
              <Dna className="w-4.5 h-4.5 text-indigo-600" />
              <span>Demographics & Body Metrics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Age (Years)</label>
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Height (e.g. cm)</label>
                <input 
                  type="text" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Weight (e.g. kg)</label>
                <input 
                  type="text" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Blood Group Type</label>
                <input 
                  type="text" 
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Emergency Contact Details</label>
                <input 
                  type="text" 
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Medical history */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
              <span>Clinical Conditions & Sensitivities</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Known Medical Conditions</label>
                <textarea 
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Known Allergies & Intolerances</label>
                <input 
                  type="text" 
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Active Medications & Supplements</label>
                <input 
                  type="text" 
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lifestyle, Diet & Habits Description</label>
                <textarea 
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/10 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving Metrics..." : "Save Health profile"}
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
