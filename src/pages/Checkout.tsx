import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContent } from "../lib/store";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  MapPin, 
  ShoppingBag, 
  ChevronRight, 
  Plus, 
  Ticket, 
  Check, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Truck,
  RotateCcw,
  ShieldCheck,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

type Step = "Cart" | "Address" | "Payment";

interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  houseNo: string;
  area: string;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useAppContent();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("Address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    houseNo: "",
    area: ""
  });
  
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI" | "CARD" | "NETBANKING">("COD");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 499 ? 0 : 70;
  const platformFee = 5;
  const total = subtotal + shippingFee + platformFee - discount;

  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      navigate("/shop");
    }
    
    // Fetch user addresses
    async function fetchAddresses() {
      if (user && !user.isGuest) {
        const q = query(collection(db, `users/${user.uid}/addresses`));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
        setAddresses(data);
        if (data.length > 0) setSelectedAddressId(data[0].id);
      }
    }
    fetchAddresses();
  }, [user, cart.length, isSuccess, navigate]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.isGuest) {
       // Mock for guest
       const mockId = Math.random().toString(36).substr(2, 9);
       const address = { id: mockId, ...newAddress };
       setAddresses([...addresses, address]);
       setSelectedAddressId(mockId);
       setShowAddressForm(false);
       return;
    }
    
    try {
      const docRef = await addDoc(collection(db, `users/${user!.uid}/addresses`), newAddress);
      const address = { id: docRef.id, ...newAddress };
      setAddresses([...addresses, address]);
      setSelectedAddressId(docRef.id);
      setShowAddressForm(false);
      toast.success("Address added successfully");
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select or add a delivery address");
      setStep("Address");
      return;
    }
    
    setIsPlacingOrder(true);
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    
    try {
      const orderData = {
        userId: user!.uid,
        userName: selectedAddress?.name,
        userEmail: user?.email || "Guest",
        address: selectedAddress,
        items: cart,
        subtotal,
        shippingFee,
        platformFee,
        discount,
        total,
        paymentMethod,
        status: "Pending",
        createdAt: serverTimestamp(),
      };
      
      const res = await addDoc(collection(db, "orders"), orderData);
      setOrderId(res.id);
      setIsSuccess(true);
      clearCart();
      toast.success("Order Placed Successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "VASTRA20") {
      setDiscount(Math.floor(subtotal * 0.2));
      toast.success("20% Discount Applied!");
    } else {
      toast.error("Invalid Coupon Code");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center bg-white space-y-8 animate-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-green-600">
          <Check size={48} strokeWidth={3} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-black text-rose-950">Order Confirmed!</h2>
          <p className="text-rose-400 text-sm font-medium">Order ID: <span className="font-bold text-rose-900">{orderId}</span></p>
          <p className="text-gray-500 text-sm max-w-xs mx-auto pt-4">Your heritage collection is being prepared. We'll notify you when it's shipped.</p>
        </div>
        <div className="flex flex-col w-full max-w-xs gap-3">
          <Link to="/profile" className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center">Track Order</Link>
          <Link to="/shop" className="w-full py-4 bg-rose-50 text-maroon rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50/30">
      {/* Header */}
      <header className="sticky top-0 bg-white z-[100] border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 text-rose-950">
              <ChevronLeft size={24} />
            </button>
            <Link to="/" className="text-2xl font-serif font-black tracking-tighter text-maroon italic">Vastra</Link>
          </div>
          <div className="flex flex-col items-center gap-1">
             <div className="flex items-center gap-2">
                <StepIndicator step="Cart" active={step === "Cart"} passed={step !== "Cart"} />
                <div className={`w-8 h-[2px] ${step !== "Cart" ? "bg-maroon" : "bg-rose-100"}`} />
                <StepIndicator step="Address" active={step === "Address"} passed={step === "Payment"} />
                <div className={`w-8 h-[2px] ${step === "Payment" ? "bg-maroon" : "bg-rose-100"}`} />
                <StepIndicator step="Payment" active={step === "Payment"} passed={false} />
             </div>
             <p className="text-[9px] uppercase font-bold text-rose-300 tracking-[0.2em]">{step} Step</p>
          </div>
          <div className="p-2 text-rose-950">
            <ShoppingBag size={20} />
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6 pb-32">
        {/* Step: Address */}
        {step === "Address" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-lg font-serif font-bold text-rose-950 px-2">Select Delivery Address</h2>
            
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div 
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer relative ${
                    selectedAddressId === addr.id 
                      ? "border-maroon ring-1 ring-maroon shadow-xl shadow-maroon/5" 
                      : "border-rose-100 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-xl border ${selectedAddressId === addr.id ? "bg-maroon/5 border-maroon/20 text-maroon" : "bg-rose-50 border-rose-100 text-rose-300"}`}>
                        <MapPin size={18} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-rose-950">{addr.name}</p>
                        <p className="text-xs text-rose-400 font-medium">{addr.phone}</p>
                        <p className="text-xs text-rose-800 leading-relaxed pt-1">
                          {addr.houseNo}, {addr.area}<br/>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </div>
                    {selectedAddressId === addr.id && (
                      <div className="w-5 h-5 rounded-full bg-maroon text-white flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!showAddressForm ? (
                <button 
                  onClick={() => setShowAddressForm(true)}
                  className="w-full py-4 bg-white border-2 border-dashed border-rose-200 rounded-3xl text-maroon text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-50 transition-all"
                >
                  <Plus size={18} /> Add New Address
                </button>
              ) : (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  onSubmit={handleAddAddress} 
                  className="bg-white p-6 rounded-3xl border border-rose-100 shadow-lg space-y-4"
                >
                  <h3 className="text-md font-bold text-rose-950 mb-2">New Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="Full Name"
                      className="col-span-2 p-3 bg-rose-50 rounded-xl outline-none text-sm border border-transparent focus:border-maroon/20 transition-all"
                      value={newAddress.name}
                      onChange={e => setNewAddress({...newAddress, name: e.target.value})}
                      required
                    />
                    <input 
                      placeholder="Phone Number"
                      className="p-3 bg-rose-50 rounded-xl outline-none text-sm border border-transparent focus:border-maroon/20 transition-all"
                      value={newAddress.phone}
                      onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                      required
                    />
                    <input 
                      placeholder="Pincode"
                      className="p-3 bg-rose-50 rounded-xl outline-none text-sm border border-transparent focus:border-maroon/20 transition-all"
                      value={newAddress.pincode}
                      onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                      required
                    />
                    <input 
                      placeholder="House/Flat No."
                      className="col-span-2 p-3 bg-rose-50 rounded-xl outline-none text-sm border border-transparent focus:border-maroon/20 transition-all"
                      value={newAddress.houseNo}
                      onChange={e => setNewAddress({...newAddress, houseNo: e.target.value})}
                      required
                    />
                    <input 
                      placeholder="Area/Street"
                      className="col-span-2 p-3 bg-rose-50 rounded-xl outline-none text-sm border border-transparent focus:border-maroon/20 transition-all"
                      value={newAddress.area}
                      onChange={e => setNewAddress({...newAddress, area: e.target.value})}
                      required
                    />
                    <input 
                      placeholder="City"
                      className="p-3 bg-rose-50 rounded-xl outline-none text-sm border border-transparent focus:border-maroon/20 transition-all"
                      value={newAddress.city}
                      onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                      required
                    />
                    <input 
                      placeholder="State"
                      className="p-3 bg-rose-50 rounded-xl outline-none text-sm border border-transparent focus:border-maroon/20 transition-all"
                      value={newAddress.state}
                      onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 py-3 text-rose-400 font-bold text-sm">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-maroon text-white rounded-xl font-bold text-sm shadow-lg shadow-maroon/20">Save & Use</button>
                  </div>
                </motion.form>
              )}
            </div>

            {/* Next Button */}
            <div className="sticky bottom-4 left-0 right-0 px-2 mt-auto">
                <button 
                  onClick={() => selectedAddressId && setStep("Payment")}
                  disabled={!selectedAddressId}
                  className="w-full py-5 bg-rose-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-2xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  Continue to Payment <ChevronRight size={18} />
                </button>
            </div>
          </div>
        )}

        {/* Step: Payment */}
        {step === "Payment" && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {/* Selected Address Preview */}
            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex justify-between items-center">
               <div className="flex gap-3">
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-rose-950">Delivering to: <span className="font-medium text-rose-400 ml-1">{addresses.find(a => a.id === selectedAddressId)?.name}</span></h3>
                    <p className="text-[10px] text-rose-400 truncate max-w-[180px]">{addresses.find(a => a.id === selectedAddressId)?.houseNo}, {addresses.find(a => a.id === selectedAddressId)?.city}</p>
                  </div>
               </div>
               <button onClick={() => setStep("Address")} className="text-[10px] uppercase font-bold text-rose-600 border-b border-rose-600">Change</button>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-0 rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
               <div className="p-5 border-b border-rose-50 flex justify-between items-center bg-rose-50/20">
                  <h3 className="font-serif font-bold text-rose-950">Order Summary</h3>
                  <span className="text-[10px] font-bold text-rose-400 uppercase">{cart.length} Items</span>
               </div>
               <div className="divide-y divide-rose-50">
                  {cart.map((item) => (
                    <div key={item.id + item.selectedSize} className="p-5 flex gap-4">
                      <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.images[0]} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs font-bold text-rose-950">{item.name}</h4>
                        <div className="flex gap-4 text-[10px] text-rose-400 font-bold uppercase">
                           <span>Size: {item.selectedSize}</span>
                           <span>Qty: {item.quantity}</span>
                        </div>
                        <p className="text-sm font-bold text-maroon font-sans pt-1">₹{item.price * item.quantity}</p>
                      </div>
                      <Link to={`/product/${item.id}`} className="text-[10px] uppercase font-bold text-rose-300 self-center border border-rose-100 px-3 py-1.5 rounded-full hover:bg-rose-50">View</Link>
                    </div>
                  ))}
               </div>
            </div>

            {/* Coupons */}
            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
               <div className="flex items-center gap-2 text-rose-950">
                  <Ticket size={20} className="text-gold" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Apply Coupon</h3>
               </div>
               <div className="flex gap-3">
                  <input 
                    placeholder="Enter Code (e.g. VASTRA20)"
                    className="flex-1 p-3 bg-rose-50 rounded-xl outline-none text-xs font-bold border border-transparent focus:border-maroon/20 uppercase"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                  />
                  <button onClick={applyCoupon} className="px-6 py-3 bg-rose-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-maroon transition-all">Apply</button>
               </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-6">
               <h3 className="font-serif font-bold text-rose-950 text-lg">Payment Options</h3>
               <div className="space-y-3">
                  <PaymentCard 
                    id="COD" 
                    icon={<Banknote size={24} />} 
                    title="Cash on Delivery" 
                    desc="Pay when your order arrives"
                    selected={paymentMethod === "COD"} 
                    onSelect={() => setPaymentMethod("COD")} 
                  />
                  <PaymentCard 
                    id="UPI" 
                    icon={<Smartphone size={24} />} 
                    title="UPI (GPAY / PHONEPE)" 
                    desc="Fast & Secure online payment"
                    selected={paymentMethod === "UPI"} 
                    onSelect={() => setPaymentMethod("UPI")} 
                  />
                  <PaymentCard 
                    id="CARD" 
                    icon={<CreditCard size={24} />} 
                    title="Debit / Credit Card" 
                    desc="Visa, Master, Rupay"
                    selected={paymentMethod === "CARD"} 
                    onSelect={() => setPaymentMethod("CARD")} 
                  />
               </div>
            </div>

            {/* Price Details */}
            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-bold text-rose-300 tracking-[0.2em] mb-4">Pricing Breakdown</h3>
              <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-rose-400">Total MRP</span>
                    <span className="text-rose-950 font-bold">₹{subtotal}</span>
                 </div>
                 {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-rose-400">Coupon Discount</span>
                    <span className="text-green-600 font-bold">-₹{discount}</span>
                  </div>
                 )}
                 <div className="flex justify-between text-sm">
                    <span className="text-rose-400">Delivery Fee</span>
                    <span className={shippingFee === 0 ? "text-green-600 font-bold" : "text-rose-950 font-bold"}>
                      {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                    </span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-rose-400">Security & Platform Fee</span>
                    <span className="text-rose-950 font-bold">₹{platformFee}</span>
                 </div>
                 <div className="h-[1px] bg-rose-50 my-2" />
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-serif font-bold text-rose-950">Total Amount</span>
                    <span className="text-2xl font-bold text-maroon">₹{total}</span>
                 </div>
              </div>
            </div>

            {/* Extra Benefits */}
            <div className="grid grid-cols-3 gap-3">
                <BenefitCard icon={<RotateCcw size={16} />} text="7 Days Return" />
                <BenefitCard icon={<ShieldCheck size={16} />} text="Secure Payment" />
                <BenefitCard icon={<Package size={16} />} text="Authentic" />
            </div>

            {/* Estimated Delivery */}
            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 flex items-center gap-3">
               <Truck size={20} className="text-green-600" />
               <p className="text-xs font-bold text-green-700">Estimated Delivery: <span className="underline ml-1">Wed, 23rd April</span></p>
            </div>

            {/* Sticky Place Order */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 p-4 flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-[100] max-w-xl mx-auto">
               <div className="pl-4">
                  <p className="text-lg font-bold text-maroon">₹{total}</p>
                  <p className="text-[10px] text-green-600 font-bold uppercase truncate max-w-[100px]">You saved ₹{discount + (shippingFee === 0 ? 70 : 0)}</p>
               </div>
               <button 
                 onClick={handlePlaceOrder}
                 disabled={isPlacingOrder}
                 className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
               >
                 {isPlacingOrder ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                  <>
                    {paymentMethod === "COD" ? "Place Order (COD)" : "Pay & Place Order"}
                    <ChevronRight size={18} />
                  </>
                 )}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step, active, passed }: { step: string, active: boolean, passed: boolean }) {
  return (
    <div className={`relative flex flex-col items-center gap-1`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
        active ? "bg-maroon scale-125 border-4 border-maroon/20" : 
        passed ? "bg-green-600" : "bg-rose-100"
      }`}>
        {passed && <Check size={8} className="text-white" strokeWidth={4} />}
      </div>
    </div>
  );
}

function PaymentCard({ id, icon, title, desc, selected, onSelect }: any) {
  return (
    <div 
      onClick={onSelect}
      className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all ${
        selected ? "border-maroon bg-maroon/5 ring-1 ring-maroon" : "border-rose-100 hover:border-rose-400"
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-maroon" : "border-rose-200"}`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-maroon" />}
      </div>
      <div className={`p-2 rounded-xl border ${selected ? "bg-white border-maroon/20 text-maroon" : "bg-rose-50 border-rose-100 text-rose-300"}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-bold text-rose-950">{title}</h4>
        <p className="text-[10px] text-rose-400">{desc}</p>
      </div>
    </div>
  );
}

function BenefitCard({ icon, text }: any) {
  return (
    <div className="p-3 bg-white rounded-2xl border border-rose-100 flex flex-col items-center gap-2 text-center shadow-sm">
       <div className="text-maroon opacity-50">{icon}</div>
       <span className="text-[9px] uppercase font-bold text-rose-800 tracking-tighter">{text}</span>
    </div>
  );
}
