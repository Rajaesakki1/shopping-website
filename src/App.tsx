/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, User, Menu, X, ArrowRight, Search, Heart, Shield } from "lucide-react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { AppProvider, useAppContent } from "./lib/store";
import { Toaster } from "sonner";

// Pages
import LandingPage from "./pages/Landing";
import ShopPage from "./pages/Shop";
import AuthPage from "./components/Auth/AuthPage";
import ProfilePage from "./pages/Profile";
import ProductDetailPage from "./pages/ProductDetail";
import CartPage from "./pages/Cart";
import AdminPage from "./pages/Admin";
import CheckoutPage from "./pages/Checkout";
import SellerPage from "./pages/Seller";

import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Components
function ProtectedRoute({ children, requireAuth = false }: { children: React.ReactNode, requireAuth?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  
  // If NO session at all, or if page requires AUTH but user is only GUEST
  if (!user || (requireAuth && user.isGuest)) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, wishlist } = useAppContent();
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[80] bg-white/90 backdrop-blur-xl border-b border-rose-100 text-rose-950 px-6 py-4 flex justify-between items-center transition-all duration-500 shadow-sm">
        <div className="flex items-center gap-8">
          <button onClick={() => setIsMenuOpen(true)} className="lg:hidden">
            <Menu size={20} />
          </button>
          <Link to="/" className="text-3xl font-serif tracking-tighter font-black text-rose-950 flex items-center gap-2">
            VASTRA
          </Link>
          <div className="hidden lg:flex items-center gap-10 font-sans text-[11px] uppercase tracking-[0.2em] font-bold">
            <Link to="/shop?category=Silk Sarees" className="hover:text-rose-600 transition-colors">Silk Sarees</Link>
            <Link to="/shop?category=Cotton Sarees" className="hover:text-rose-600 transition-colors">Cotton Sarees</Link>
            <Link to="/shop?category=Traditional Vesti" className="hover:text-rose-600 transition-colors">Vesti Collection</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center bg-rose-50 border border-rose-100 rounded-full px-4 py-1.5 w-64 group focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
            <Search size={14} className="text-rose-300" />
            <input 
              type="text" 
              placeholder="Sarees, Vesti Sets..." 
              className="bg-transparent border-none outline-none text-[11px] ml-2 w-full placeholder:text-rose-300 font-bold"
            />
          </div>
          
          <div className="flex items-center gap-5">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest font-bold text-rose-300">
                {user?.isGuest ? "Guest Mode" : "Vanakkam"}
              </span>
              <span className="text-[11px] font-bold text-maroon max-w-[100px] truncate">
                {user?.isGuest ? "Welcome" : (user?.displayName || user?.email?.split('@')[0])}
              </span>
            </div>
            
            <Link to="/cart" className="relative group">
              <ShoppingBag size={20} className="group-hover:text-rose-600 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>
              )}
            </Link>
            <Link to={user?.isGuest ? "/auth" : "/profile"} className="flex items-center gap-2 p-1 md:px-3 md:py-1.5 rounded-full border border-rose-100 hover:border-rose-400 transition-all group">
              <User size={18} className="group-hover:text-maroon transition-colors" />
              {user?.isGuest && (
                <span className="hidden md:inline text-[9px] uppercase tracking-widest font-bold text-maroon">Login</span>
              )}
            </Link>
            {!user?.isGuest && user && (
              <button 
                onClick={() => signOut()}
                className="text-[9px] uppercase tracking-widest font-bold text-rose-300 hover:text-maroon transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-rose-950/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm z-[110] bg-white shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-2xl font-serif font-bold text-maroon">Vastra</span>
                <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold text-rose-300 tracking-[0.3em]">Collections</p>
                  <Link to="/shop" className="block text-2xl font-serif font-bold" onClick={() => setIsMenuOpen(false)}>All Categories</Link>
                  <Link to="/shop?category=Silk Sarees" className="block text-xl font-serif" onClick={() => setIsMenuOpen(false)}>Silk Sarees</Link>
                  <Link to="/shop?category=Cotton Sarees" className="block text-xl font-serif" onClick={() => setIsMenuOpen(false)}>Cotton Sarees</Link>
                  <Link to="/shop?category=Traditional Vesti" className="block text-xl font-serif" onClick={() => setIsMenuOpen(false)}>Traditional Vesti</Link>
                </div>
                <div className="pt-8 border-t border-rose-50">
                  {user?.email === 'rajaesakki1806@gmail.com' && (
                    <div className="pt-4 space-y-4">
                      <Link to="/admin" className="flex items-center gap-3 text-maroon font-bold text-sm" onClick={() => setIsMenuOpen(false)}>
                        <Shield size={18} /> Admin Panel
                      </Link>
                      <Link to="/seller" className="flex items-center gap-3 text-rose-600 font-bold text-sm" onClick={() => setIsMenuOpen(false)}>
                        <Package size={18} /> Seller Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MainApp() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isAuthPath = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/auth";

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin shadow-2xl shadow-gold/20" />
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-bold text-white tracking-widest uppercase italic">Vanakkam</h2>
          <p className="text-xs text-rose-300 font-bold uppercase tracking-[0.3em]">Preparing your collection...</p>
        </div>
      </div>
    );
  }

  // Entry Gate: Force all unauthenticated users to Login/Register first
  if (!user && !isAuthPath) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If session active, don't allow going back to login/auth
  if (user && isAuthPath) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-700">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/seller" element={<SellerPage />} />
            <Route path="/profile" element={<ProtectedRoute requireAuth><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAuth><AdminPage /></ProtectedRoute>} />
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="/register" element={<AuthPage initialMode="register" />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      
      <footer className="bg-rose-950 text-white py-24 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-black tracking-tighter text-white">VASTRA</h2>
            <p className="text-sm text-rose-300 leading-relaxed font-sans">
              Authentic Indian marketplace for heritage handlooms and traditional festive wear. Weaving stories of tradition in every thread.
            </p>
          </div>
          <div>
            <h3 className="text-xs uppercase font-bold tracking-widest text-gold mb-6">Collections</h3>
            <div className="flex flex-col gap-3 text-sm text-rose-200 font-medium">
              <Link to="/shop" className="hover:text-gold transition-colors">Silk Sarees</Link>
              <Link to="/shop" className="hover:text-gold transition-colors">Cotton Sarees</Link>
              <Link to="/shop" className="hover:text-gold transition-colors">Traditional Vesti</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase font-bold tracking-widest text-gold mb-6">Support</h3>
            <div className="flex flex-col gap-3 text-sm text-rose-200 font-medium">
              <Link to="/about" className="hover:text-gold transition-colors">Our Story</Link>
              <Link to="/shipping" className="hover:text-gold transition-colors">Shipping Info</Link>
              <Link to="/returns" className="hover:text-gold transition-colors">Returns & Exchanges</Link>
              <Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-xs uppercase font-bold tracking-widest text-gold mb-6">Join Vastra</h3>
            <p className="text-sm text-rose-200 opacity-80">Subscribe for early access to festive collections.</p>
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 focus-within:ring-2 focus-within:ring-gold/20 transition-all">
              <input type="email" placeholder="Email address" className="bg-transparent border-none outline-none px-4 flex-1 text-sm text-white placeholder:text-rose-300/50" />
              <button className="bg-gold text-rose-950 px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gold/90 transition-all">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase font-bold tracking-widest text-rose-400">&copy; 2026 Vastra Marketplace. All rights reserved.</p>
          <div className="flex gap-8 text-[10px] uppercase font-bold tracking-widest text-rose-400">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Toaster position="top-center" richColors />
          <MainApp />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

