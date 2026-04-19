import React, { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthForm({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  const { signInWithGoogle, skipAuth } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success("Vanakkam! Welcome back to Vastra.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Please check your inbox.");
      setIsForgotMode(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        toast.error("Password should be at least 6 characters");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Vanakkam! Signed in successfully.");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          displayName,
          email,
          createdAt: new Date().toISOString(),
          isAdmin: email === 'rajaesakki1806@gmail.com'
        });
        
        toast.success("Welcome to the Vastra Boutique!");
      }
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    skipAuth();
    toast.info("Exploring as Guest. Login later for checkout and reviews.");
    navigate("/");
  };

  if (isForgotMode) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <button 
          onClick={() => setIsForgotMode(false)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-rose-400 hover:text-maroon font-bold transition-colors"
        >
          <ArrowLeft size={14} /> Back to Login
        </button>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-serif text-maroon font-bold italic tracking-tighter">Reset Password</h2>
          <p className="text-xs text-rose-300 font-medium tracking-[0.1em] uppercase">
            Heavenly help is on the way. Enter your email.
          </p>
        </div>
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-rose-950 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-rose-50/50 border border-rose-100 rounded-2xl pl-12 pr-4 py-4 focus:border-gold focus:ring-4 focus:ring-gold/5 outline-none transition-all text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-maroon text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-maroon/20 hover:bg-rose-900 transition-all disabled:opacity-50 flex justify-center items-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-maroon/5 flex items-center justify-center border border-maroon/10">
            <span className="text-3xl font-serif font-black text-maroon italic">V</span>
          </div>
        </div>
        <h2 className="text-4xl font-serif text-maroon font-bold italic tracking-tighter">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-xs text-rose-300 font-bold tracking-[0.2em] uppercase">
          {isLogin ? "Resuming your boutique journey" : "Joining the legacy of handlooms"}
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-rose-950 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-rose-50/50 border border-rose-100 rounded-2xl pl-12 pr-4 py-4 focus:border-gold focus:ring-4 focus:ring-gold/5 outline-none transition-all text-sm"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-rose-950 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-rose-50/50 border border-rose-100 rounded-2xl pl-12 pr-4 py-4 focus:border-gold focus:ring-4 focus:ring-gold/5 outline-none transition-all text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-rose-950">Password</label>
              {isLogin && (
                <button 
                  type="button"
                  onClick={() => setIsForgotMode(true)}
                  className="text-[9px] uppercase tracking-widest font-bold text-gold hover:text-maroon transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-rose-50/50 border border-rose-100 rounded-2xl pl-12 pr-12 py-4 focus:border-gold focus:ring-4 focus:ring-gold/5 outline-none transition-all text-sm"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-300 hover:text-maroon transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-rose-950 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-rose-50/50 border border-rose-100 rounded-2xl pl-12 pr-4 py-4 focus:border-gold focus:ring-4 focus:ring-gold/5 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-maroon text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-maroon/20 hover:bg-rose-900 transition-all disabled:opacity-50 flex justify-center items-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? "Sign In" : "Register")}
          </button>
        </form>

        <div className="relative flex items-center gap-4 py-2">
          <div className="h-[1px] flex-1 bg-rose-100/50" />
          <span className="text-[10px] uppercase tracking-widest text-rose-200 font-bold">Divine Connection</span>
          <div className="h-[1px] flex-1 bg-rose-100/50" />
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full py-4 px-4 bg-white border border-rose-100 rounded-2xl hover:bg-rose-50 transition-all font-bold text-[10px] uppercase tracking-widest text-rose-950 shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Sign in with Google
        </button>

        <div className="space-y-4 pt-4">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-xs text-rose-400 font-medium hover:text-maroon transition-colors"
          >
            {isLogin ? "New to Vastra? Create an account" : "Already have an account? Sign in"}
          </button>
          
          <button 
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-[10px] uppercase tracking-[0.2em] font-bold text-gold hover:text-rose-950 transition-colors py-3 border border-dashed border-gold/30 rounded-xl"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
