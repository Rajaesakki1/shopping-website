import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Product, Review } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit, Trash2, Check, X, Shield, Package, MessageSquare, Image as ImageIcon } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    images: ["", "", "", ""],
    category: "Silk Sarees",
    description: "",
    fabric: "",
    occasion: ""
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const prodSnapshot = await getDocs(collection(db, "products"));
        setProducts(prodSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        
        // This is a simplified approach, in real app we'd fetch reviews for all products
        setReviews([]); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editProduct.id) {
        await updateDoc(doc(db, "products", editProduct.id), editProduct);
      } else {
        await addDoc(collection(db, "products"), {
          ...editProduct,
          rating: 0,
          reviewCount: 0
        });
      }
      setIsEditing(false);
      // Refresh list
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter(p => p.id !== id));
    }
  };

  if (loading) return <div className="p-32 text-center text-maroon">Loading Dashboard...</div>;

  return (
    <div className="pt-24 min-h-screen bg-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-maroon text-white rounded-2xl shadow-xl shadow-maroon/20">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-rose-950">Admin Dashboard</h1>
              <p className="text-xs text-rose-400 font-bold uppercase tracking-widest">Manage your Vastra empire</p>
            </div>
          </div>

          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-rose-100">
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'products' ? "bg-rose-600 text-white shadow-md shadow-rose-200" : "text-rose-900 hover:bg-rose-50"
              }`}
            >
              <Package size={16} /> Products
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'reviews' ? "bg-rose-600 text-white shadow-md shadow-rose-200" : "text-rose-900 hover:bg-rose-50"
              }`}
            >
              <MessageSquare size={16} /> Reviews
            </button>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
              <p className="text-sm font-bold text-rose-950">Current Inventory ({products.length})</p>
              <button 
                onClick={() => {
                  setEditProduct({ name: "", price: 0, images: ["", "", "", ""], category: "Silk Sarees", description: "" });
                  setIsEditing(true);
                }}
                className="bg-maroon text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-rose-950 transition-all shadow-xl shadow-maroon/20"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-3xl shadow-sm border border-rose-50 flex gap-4">
                  <img src={product.images[0]} className="w-24 h-24 rounded-2xl object-cover" alt="" referrerPolicy="no-referrer" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-rose-950 line-clamp-1">{product.name}</h3>
                      <p className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">{product.category}</p>
                      <p className="text-sm font-bold text-rose-600 mt-1">₹{product.price}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => { setEditProduct(product); setIsEditing(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-rose-950/40 backdrop-blur-sm"
                onClick={() => setIsEditing(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-8 border-b border-rose-100 flex justify-between items-center bg-rose-50/50">
                  <h2 className="text-2xl font-serif font-bold text-rose-950">{editProduct.id ? "Edit Product" : "New Collection Item"}</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="p-8 space-y-8 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-rose-300 tracking-widest ml-1">Product Name</label>
                        <input 
                          required
                          className="w-full bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm focus:border-rose-400 outline-none transition-colors"
                          value={editProduct.name}
                          onChange={e => setEditProduct({...editProduct, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-rose-300 tracking-widest ml-1">Price (₹)</label>
                          <input 
                            type="number"
                            required
                            className="w-full bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm focus:border-rose-400 outline-none transition-colors"
                            value={editProduct.price}
                            onChange={e => setEditProduct({...editProduct, price: Number(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-rose-300 tracking-widest ml-1">Original Price (₹)</label>
                          <input 
                            type="number"
                            className="w-full bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm focus:border-rose-400 outline-none transition-colors"
                            value={editProduct.originalPrice}
                            onChange={e => setEditProduct({...editProduct, originalPrice: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-rose-300 tracking-widest ml-1">Category</label>
                        <select 
                          className="w-full bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm focus:border-rose-400 outline-none transition-colors"
                          value={editProduct.category}
                          onChange={e => setEditProduct({...editProduct, category: e.target.value})}
                        >
                          <option>Silk Sarees</option>
                          <option>Cotton Sarees</option>
                          <option>Traditional Vesti</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-rose-300 tracking-widest ml-1 flex items-center gap-2">
                          <ImageIcon size={14} /> Image URLs (Paste Link)
                        </label>
                        <p className="text-[9px] text-rose-400 mb-2 italic">Tip: Upload your own photos to the "public" folder and use paths like /my-photo.jpg</p>
                        <div className="space-y-2">
                          {editProduct.images?.map((url, i) => (
                            <input 
                              key={i}
                              placeholder={`Image URL ${i+1}`}
                              className="w-full bg-rose-50 border border-rose-100 rounded-xl px-4 py-2 text-[11px] focus:border-rose-400 outline-none transition-colors"
                              value={url}
                              onChange={e => {
                                const newImgs = [...(editProduct.images || [])];
                                newImgs[i] = e.target.value;
                                setEditProduct({...editProduct, images: newImgs});
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-rose-300 tracking-widest ml-1">Description</label>
                    <textarea 
                      className="w-full h-32 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm focus:border-rose-400 outline-none transition-colors"
                      value={editProduct.description}
                      onChange={e => setEditProduct({...editProduct, description: e.target.value})}
                    />
                  </div>

                  <div className="pt-8 border-t border-rose-100 flex justify-end gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-rose-600 text-white px-12 py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all"
                    >
                      Save Collection Item
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
