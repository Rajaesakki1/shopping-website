import { motion, AnimatePresence } from "motion/react";
import { useAppContent } from "../lib/store";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function CartPage() {
  const { cart, removeFromCart, addToCart, clearCart } = useAppContent();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 1000 ? 0 : 99;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (!user || user.isGuest) {
      toast.error("Please login to proceed with checkout");
      navigate("/auth");
      return;
    }
    
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 px-8 flex flex-col items-center justify-center space-y-8 bg-rose-50/20">
        <div className="w-32 h-32 bg-rose-100 rounded-full flex items-center justify-center text-rose-300">
          <ShoppingBag size={48} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold text-rose-950">Your bag is empty</h2>
          <p className="text-rose-400 text-sm">Looks like you haven't added any items to your collection yet.</p>
        </div>
        <Link 
          to="/shop" 
          className="bg-maroon text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-maroon/20 hover:opacity-90 transition-all"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 px-4 md:px-8 bg-rose-50/20 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-rose-950 mb-12">Your Shopping Bag</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  key={item.id + item.selectedSize}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-rose-50 flex gap-6"
                >
                  <div className="w-24 h-32 rounded-2xl overflow-hidden bg-rose-50 flex-shrink-0">
                    <img src={item.images[0]} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-rose-950">{item.name}</h3>
                        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">{item.category}</p>
                        {item.selectedSize && (
                          <p className="text-[10px] bg-rose-50 text-rose-600 px-2 py-1 rounded inline-block mt-2 font-bold">Size: {item.selectedSize}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-rose-300 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-4 bg-rose-50 rounded-xl p-1 border border-rose-100">
                        <button className="p-2 text-rose-600 hover:bg-white rounded-lg transition-all" onClick={() => item.quantity > 1 && addToCart(item, -1, item.selectedSize)}><Minus size={14} /></button>
                        <span className="text-xs font-bold text-rose-950 w-4 text-center">{item.quantity}</span>
                        <button className="p-2 text-rose-600 hover:bg-white rounded-lg transition-all" onClick={() => addToCart(item, 1, item.selectedSize)}><Plus size={14} /></button>
                      </div>
                      <p className="text-lg font-bold text-rose-600 font-sans">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Price Summary */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-rose-50 space-y-6 sticky top-32">
              <h2 className="text-xl font-serif font-bold text-rose-950 underline decoration-rose-200 decoration-4 underline-offset-8 mb-8">Price Details</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-rose-400 font-medium">Bag Total</span>
                  <span className="text-rose-950 font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-rose-400 font-medium">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "text-rose-950 font-bold"}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="h-[1px] bg-rose-50 my-4" />
                <div className="flex justify-between text-xl">
                  <span className="text-rose-950 font-serif font-bold">Order Total</span>
                  <span className="text-maroon font-bold">₹{total}</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-green-200">
                  <ArrowRight size={14} />
                </div>
                <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">You are saving ₹{subtotal * 0.5} on this order</p>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-rose-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-2xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
              >
                {isCheckingOut ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard size={18} /> Proceed to Checkout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
