import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { motion } from "motion/react";
import { User as UserIcon, LogOut, Package, Heart, MapPin, Shield, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/auth");
      else setUser(u);
    });
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "orders"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!user) return null;

  const isAdmin = user.email === 'rajaesakki1806@gmail.com';

  return (
    <div className="pt-32 pb-32 px-4 md:px-8 min-h-screen bg-rose-50/10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-xl shadow-rose-900/5 overflow-hidden border border-rose-50">
          {/* Header */}
          <div className="h-48 bg-maroon relative">
            <div className="absolute inset-0 temple-border opacity-20" />
            <div className="absolute -bottom-12 left-12 flex items-end gap-6 text-white translate-y-4">
              <div className="w-24 h-24 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-rose-50 flex items-center justify-center text-rose-300">
                    <UserIcon size={40} />
                  </div>
                )}
              </div>
              <div className="pb-4">
                <h1 className="text-3xl font-serif font-bold drop-shadow-md">Vanakkam, {user.displayName || "Shopper"}</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gold text-center md:text-left">{user.email}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="absolute top-6 right-6">
                <Link to="/seller" className="bg-gold text-rose-950 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-white transition-all flex items-center gap-2">
                   <Shield size={14} /> Seller Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="pt-24 pb-12 px-8 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-12">
              {/* Order History */}
              <div className="space-y-6">
                <h2 className="text-xl font-serif font-bold text-rose-950 flex items-center gap-2 underline decoration-rose-100 underline-offset-8">
                  <Package size={20} className="text-maroon" /> Your Orders
                </h2>
                
                {loading ? (
                   <div className="h-32 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
                   </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-rose-100 rounded-3xl text-center">
                    <p className="text-sm text-rose-300 font-medium">You haven't placed any orders yet.</p>
                    <Link to="/shop" className="inline-block mt-4 text-xs font-bold uppercase tracking-widest text-maroon hover:underline">Shop Now</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6 bg-white border border-rose-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <p className="text-[10px] uppercase font-bold text-rose-300 tracking-widest">ID: {order.id.slice(-8).toUpperCase()}</p>
                              <h4 className="text-sm font-bold text-rose-950 mt-1">{order.items[0].name} {order.items.length > 1 ? `+ ${order.items.length - 1} more` : ""}</h4>
                           </div>
                           <StatusBadge status={order.status} />
                        </div>
                        <div className="flex justify-between items-end">
                           <div className="text-xs text-rose-400 font-medium">
                              <p>Total: <span className="text-rose-900 font-bold">₹{order.total}</span></p>
                              <p className="mt-1">Ordered on: {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                           </div>
                           <Link to={`/checkout`} className="text-[10px] uppercase font-bold text-maroon flex items-center gap-1">View Details <ChevronRight size={14} /></Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Saved Addresses (Preview) */}
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-rose-950 flex items-center gap-2 underline decoration-rose-100 underline-offset-8">
                  <MapPin size={20} className="text-maroon" /> Delivery Address
                </h2>
                <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 text-rose-900">
                  <p className="text-[10px] uppercase font-bold text-rose-400 mb-2">Default Address</p>
                  <p className="text-sm font-medium">Manage your delivery profiles in checkout.</p>
                </div>
              </div>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
              <div className="p-8 bg-rose-50/50 rounded-3xl border border-rose-100 space-y-6">
                <h3 className="text-xs uppercase font-bold text-rose-300 tracking-widest">Account Settings</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center gap-3 text-sm font-bold text-rose-900 hover:text-maroon transition-colors">
                    <UserIcon size={18} /> Edit Profile
                  </button>
                  <button className="w-full flex items-center gap-3 text-sm font-bold text-rose-900 hover:text-maroon transition-colors">
                    <Heart size={18} /> Wishlist
                  </button>
                  {isAdmin && (
                    <Link to="/admin" className="w-full flex items-center gap-3 text-sm font-bold text-maroon hover:opacity-80 transition-colors">
                      <Shield size={18} /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="w-full flex items-center gap-3 text-sm font-bold text-rose-400 hover:text-rose-600 transition-colors pt-4 border-t border-rose-100">
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Pending: "bg-orange-50 text-orange-600 border border-orange-100",
    Accepted: "bg-blue-50 text-blue-600 border border-blue-100",
    Processing: "bg-blue-50 text-blue-600 border border-blue-100",
    Packed: "bg-rose-50 text-maroon border border-rose-100",
    Shipped: "bg-purple-50 text-purple-600 border border-purple-100",
    Delivered: "bg-green-50 text-green-600 border border-green-100",
    Cancelled: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${styles[status] || "bg-rose-50 text-rose-300"}`}>
       {status}
    </span>
  );
}
