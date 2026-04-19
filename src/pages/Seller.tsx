import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Clock, 
  ChevronRight, 
  LayoutDashboard,
  Box,
  IndianRupee,
  RefreshCcw,
  Star
} from "lucide-react";
import { toast } from "sonner";

type OrderStatus = "Pending" | "Accepted" | "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled";

export default function SellerPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"New" | "Processing" | "Shipped" | "Returns">("New");

  // Auth Guard: Only Admin/Seller can access
  if (!user || user.email !== 'rajaesakki1806@gmail.com') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      toast.success(`Order set to ${newStatus}`);
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case "New": return orders.filter(o => o.status === "Pending");
      case "Processing": return orders.filter(o => ["Accepted", "Processing", "Packed"].includes(o.status));
      case "Shipped": return orders.filter(o => o.status === "Shipped");
      case "Returns": return orders.filter(o => o.status === "Cancelled");
      default: return orders;
    }
  };

  const stats = {
    totalSales: orders.filter(o => o.status === "Delivered").reduce((acc, o) => acc + o.total, 0),
    newOrders: orders.filter(o => o.status === "Pending").length,
    processing: orders.filter(o => ["Accepted", "Processing", "Packed"].includes(o.status)).length,
    shipped: orders.filter(o => o.status === "Shipped").length
  };

  return (
    <div className="min-h-screen bg-rose-50/20 pt-24 pb-32">
       <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
             <div className="space-y-1">
                <h1 className="text-4xl font-serif font-black text-rose-950 flex items-center gap-3">
                   Vastra Seller <LayoutDashboard className="text-maroon" />
                </h1>
                <p className="text-xs text-rose-300 font-bold uppercase tracking-[0.2em]">Manage your heritage collection hub</p>
             </div>
             <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2">
                <StatCard icon={<IndianRupee size={18} />} label="Total Sales" value={`₹${stats.totalSales}`} color="bg-green-600" />
                <StatCard icon={<Clock size={18} />} label="New" value={stats.newOrders} color="bg-orange-500" />
                <StatCard icon={<Box size={18} />} label="Active" value={stats.processing} color="bg-blue-500" />
             </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 p-1.5 bg-white shadow-sm rounded-2xl mb-8 w-fit border border-rose-50 overflow-x-auto">
             {["New", "Processing", "Shipped", "Returns"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab ? "bg-maroon text-white shadow-lg" : "text-rose-900 hover:bg-rose-50"
                  }`}
                >
                  {tab}
                </button>
             ))}
          </div>

          {/* Orders list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="col-span-full h-64 flex items-center justify-center">
                     <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : getFilteredOrders().length === 0 ? (
                  <div className="col-span-full h-96 flex flex-col items-center justify-center space-y-4 opacity-30">
                     <Package size={64} />
                     <p className="font-serif italic text-xl">No orders in this universe...</p>
                  </div>
                ) : (
                  getFilteredOrders().map((order) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={order.id}
                      className="bg-white rounded-[2.5rem] shadow-xl shadow-rose-900/5 border border-rose-100 p-6 space-y-6 relative overflow-hidden group"
                    >
                       {/* Background decoration */}
                       <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform" />
                       
                       {/* Header Info */}
                       <div className="flex justify-between items-start relative z-10">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-rose-300">Order ID:</span>
                                <span className="text-xs font-bold text-maroon">{order.id.slice(-8).toUpperCase()}</span>
                             </div>
                             <h3 className="text-lg font-bold text-rose-950">{order.userName}</h3>
                             <p className="text-[10px] text-rose-400 font-bold uppercase">{order.paymentMethod} • {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                          </div>
                          <StatusBadge status={order.status} />
                       </div>

                       {/* Address preview */}
                       <div className="flex gap-3 p-4 bg-rose-50/50 rounded-2xl border border-rose-50">
                          <MapPin size={16} className="text-maroon flex-shrink-0" />
                          <p className="text-[10px] text-rose-900 leading-relaxed font-medium">
                             {order.address.houseNo}, {order.address.area}, {order.address.city}, {order.address.state} - {order.address.pincode}
                          </p>
                       </div>

                       {/* Products */}
                       <div className="space-y-3">
                          {order.items.map((item: any, idx: number) => (
                             <div key={idx} className="flex gap-4 items-center">
                                <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-rose-100">
                                   <img src={item.images[0]} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1">
                                   <p className="text-xs font-bold text-rose-950 truncate max-w-[150px]">{item.name}</p>
                                   <p className="text-[10px] text-rose-400 font-bold">Qty: {item.quantity} • {item.selectedSize}</p>
                                </div>
                                <p className="text-sm font-bold text-rose-950 font-sans">₹{item.price * item.quantity}</p>
                             </div>
                          ))}
                       </div>

                       {/* Action Buttons */}
                       <div className="pt-4 border-t border-rose-50 flex flex-wrap gap-2">
                          {order.status === "Pending" && (
                             <>
                                <button 
                                  onClick={() => updateStatus(order.id, "Accepted")}
                                  className="flex-1 py-3 bg-green-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
                                >
                                   <CheckCircle size={14} /> Accept
                                </button>
                                <button 
                                  onClick={() => updateStatus(order.id, "Cancelled")}
                                  className="flex-1 py-3 bg-white border border-rose-100 text-rose-300 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:text-maroon hover:border-maroon transition-all"
                                >
                                   <XCircle size={14} /> Reject
                                </button>
                             </>
                          )}
                          
                          {order.status === "Accepted" && (
                             <button 
                               onClick={() => updateStatus(order.id, "Packed")}
                               className="w-full py-4 bg-maroon text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                             >
                                <Package size={16} /> Mark as Packed
                             </button>
                          )}

                          {order.status === "Packed" && (
                             <button 
                               onClick={() => updateStatus(order.id, "Shipped")}
                               className="w-full py-4 bg-orange-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                             >
                                <Truck size={16} /> Ship to Customer
                             </button>
                          )}

                          {order.status === "Shipped" && (
                             <button 
                               onClick={() => updateStatus(order.id, "Delivered")}
                               className="w-full py-4 bg-green-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                             >
                                <CheckCircle size={16} /> Delivery Confirmed
                             </button>
                          )}
                       </div>
                    </motion.div>
                  ))
                )}
             </AnimatePresence>
          </div>
       </div>

       {/* Mobile Floating Menu for Navigation */}
       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 md:hidden flex justify-around p-4 z-[100]">
          <NavItem icon={<Box />} label="Orders" active={true} />
          <NavItem icon={<RefreshCcw />} label="Returns" />
          <NavItem icon={<Star />} label="Reviews" />
       </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="flex-shrink-0 min-w-[140px] bg-white p-4 rounded-3xl shadow-sm border border-rose-50 flex items-center gap-3">
       <div className={`p-2 rounded-xl text-white ${color} shadow-lg shadow-black/5`}>
          {icon}
       </div>
       <div>
          <p className="text-[9px] uppercase font-bold text-rose-300 tracking-tighter">{label}</p>
          <p className="text-sm font-black text-rose-950 font-sans">{value}</p>
       </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: any = {
    Pending: "bg-orange-100 text-orange-600",
    Accepted: "bg-blue-100 text-blue-600",
    Packed: "bg-rose-100 text-maroon",
    Shipped: "bg-purple-100 text-purple-600",
    Delivered: "bg-green-100 text-green-600",
    Cancelled: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase font-black tracking-[0.1em] ${styles[status] || "bg-rose-50 text-rose-300"}`}>
       {status}
    </span>
  );
}

function NavItem({ icon, label, active = false }: any) {
  return (
    <div className={`flex flex-col items-center gap-1 ${active ? "text-maroon" : "text-rose-300"}`}>
       {icon}
       <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
    </div>
  );
}
