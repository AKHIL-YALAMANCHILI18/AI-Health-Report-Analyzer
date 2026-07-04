/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { motion } from "motion/react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile 
} from "firebase/auth";
import { auth } from "../firebase";

interface AuthPageProps {
  onAuthSuccess: (name: string, email: string) => void;
  onBackToLanding: () => void;
  initialMode?: "login" | "signup";
}

type AuthMode = "login" | "signup" | "forgot" | "verify";

export default function AuthPage({ onAuthSuccess, onBackToLanding, initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      onAuthSuccess(user.displayName || "User", user.email || "");
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.message?.includes("popup-closed-by-user") || err.code === "auth/popup-closed-by-user") {
        setError("Sign-In popup was closed before completing authentication.");
      } else {
        setError(err.message || "Failed to authenticate with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in all credentials.");
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      onAuthSuccess(user.displayName || name || "User", user.email || "");
    } catch (err: any) {
      console.error("Email Login Error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again or sign in using Google.");
      } else if (err.code === "auth/configuration-not-found") {
        setError("Email/Password Auth provider is not enabled in Firebase Console yet. Please use the Google Sign-In option!");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError("Please fill in all requested fields.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      await updateProfile(user, { displayName: name });
      setSuccessMsg("Account successfully created! Loading dashboard...");
      setTimeout(() => {
        onAuthSuccess(name, email);
      }, 1000);
    } catch (err: any) {
      console.error("Signup Error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters long.");
      } else if (err.code === "auth/configuration-not-found") {
        setError("Email/Password Auth is not enabled in Firebase Console. Please sign in using Google!");
      } else {
        setError(err.message || "Failed to register account.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("We have sent a secure password reset link to your email.");
    } catch (err: any) {
      console.error("Forgot Password Error:", err);
      setError(err.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!verificationCode || verificationCode.length < 4) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess(name, email);
    }, 1200);
  };


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-30 -z-10"></div>
      
      {/* Navigation Brand Header */}
      <div className="absolute top-8 left-8">
        <button 
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-700"></div>

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          
          {mode === "login" && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to your private healthcare analyzer.</p>
            </>
          )}

          {mode === "signup" && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900">Create Your Account</h2>
              <p className="text-slate-500 text-sm mt-1">Get instant AI-driven medical report breakdowns.</p>
            </>
          )}

          {mode === "forgot" && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900">Reset Password</h2>
              <p className="text-slate-500 text-sm mt-1">Recover secure access to your clinical reports.</p>
            </>
          )}

          {mode === "verify" && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900">Verify Email</h2>
              <p className="text-slate-500 text-sm mt-1">We sent a 6-digit verification code to {email || "your inbox"}.</p>
            </>
          )}
        </div>

        {/* Action Error Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Success Alerts */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex gap-2 items-start animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.mercer@gmail.com" 
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setMode("forgot"); setError(null); setSuccessMsg(null); }}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Securing Environment...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">Or security gate</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 text-slate-700 font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.46 1.64l2.42-2.42C17.27 1.83 14.87 1 12.24 1c-5.52 0-10 4.48-10 10s4.48 10 10 10c5.8 0 9.64-4.08 9.64-9.8 0-.58-.06-1.14-.17-1.64h-9.47z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="text-center pt-4 border-t border-slate-100 text-slate-500 text-xs">
              Don't have an account?{" "}
              <button 
                type="button" 
                onClick={() => { setMode("signup"); setError(null); setSuccessMsg(null); }}
                className="text-indigo-600 hover:text-indigo-500 font-semibold cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === "signup" && (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer" 
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.mercer@gmail.com" 
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">Or security gate</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 text-slate-700 font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.46 1.64l2.42-2.42C17.27 1.83 14.87 1 12.24 1c-5.52 0-10 4.48-10 10s4.48 10 10 10c5.8 0 9.64-4.08 9.64-9.8 0-.58-.06-1.14-.17-1.64h-9.47z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="text-center pt-4 border-t border-slate-100 text-slate-500 text-xs">
              Already have an account?{" "}
              <button 
                type="button" 
                onClick={() => { setMode("login"); setError(null); setSuccessMsg(null); }}
                className="text-indigo-600 hover:text-indigo-500 font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.mercer@gmail.com" 
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Sending token..." : "Send Reset Link"}
            </button>

            <div className="text-center pt-4 border-t border-slate-100 text-slate-500 text-xs">
              Remember your password?{" "}
              <button 
                type="button" 
                onClick={() => { setMode("login"); setError(null); setSuccessMsg(null); }}
                className="text-indigo-600 hover:text-indigo-500 font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* EMAIL VERIFICATION FORM */}
        {mode === "verify" && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">6-Digit Verification Code</label>
              <input 
                type="text" 
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="047812" 
                className="w-full py-4 text-center text-2xl font-bold tracking-[0.5em] rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify & Launch"}
            </button>

            <div className="text-center pt-4 border-t border-slate-100 text-slate-500 text-xs">
              Didn't receive a code?{" "}
              <button 
                type="button" 
                onClick={() => { setSuccessMsg("A fresh 6-digit passcode has been re-routed to your mailbox."); }}
                className="text-indigo-600 hover:text-indigo-500 font-semibold cursor-pointer"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
