import { motion } from "motion/react";
import AuthForm from "./AuthForm";

export default function AuthPage({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-rose-950">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.weserv.nl/?url=images.unsplash.com/photo-1583391733956-6c78276477e2&w=2000" 
          alt="Silk Saree Background"
          className="w-full h-full object-cover opacity-30 blur-sm scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-maroon/80 via-transparent to-rose-950/90" />
        <div className="absolute inset-0 silk-overlay opacity-10" />
      </div>

      {/* Centered Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full md:max-w-[480px] h-full md:h-auto flex items-center justify-center p-0 md:p-4"
      >
        <div className="bg-white md:bg-white/95 backdrop-blur-md w-full h-full md:h-auto md:rounded-[2.5rem] shadow-2xl shadow-black/50 overflow-y-auto border-none md:border md:border-white/20 flex flex-col">
          {/* Decorative Top Border */}
          <div className="h-2 w-full bg-gradient-to-r from-gold via-maroon to-gold flex-shrink-0" />
          
          <div className="p-8 md:p-12 flex-grow flex flex-col justify-center">
            <div className="mb-10 text-center">
               <h1 className="text-5xl font-serif font-black text-maroon italic tracking-tighter mb-2">Vanakkam</h1>
               <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-rose-300">Welcome to Vastra Boutique</p>
            </div>
            <AuthForm initialMode={initialMode} />
          </div>
          
          {/* Subtle Bottom Pattern */}
          <div className="h-12 w-full temple-border opacity-5 flex-shrink-0 hidden md:block" />
        </div>
      </motion.div>
    </div>
  );
}
