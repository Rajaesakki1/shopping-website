import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "motion/react";
import { Search, Filter, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "../types";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [fabric, setFabric] = useState("All");
  const [occasion, setOccasion] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        if (data.length === 0) {
          const placeholders: Product[] = [
            { id: '1', name: 'Yellow Silk Heritage', price: 4999, originalPrice: 9999, category: 'Silk Sarees', fabric: 'Pure Silk', occasion: 'Wedding', images: ['/yellowsaree.jpeg'], description: 'Traditional yellow silk saree with rich gold borders.' },
            { id: '2', name: 'Royal Blue Kanchipuram', price: 5500, originalPrice: 8500, category: 'Silk Sarees', fabric: 'Pure Silk', occasion: 'Festive', images: ['/1silksaree,1st pic.webp'], description: 'Premium blue kanchipuram silk with intricate zari.' },
            { id: '3', name: 'Classic Tamil Vesti', price: 1899, originalPrice: 2999, category: 'Traditional Vesti', fabric: 'Pure Silk', occasion: 'Festive', images: ['/1silksaree,3rd pic.webp'], description: 'Traditional white silk vesti with premium gold border.' },
            { id: '4', name: 'Maroon Border Silk', price: 4800, originalPrice: 7500, category: 'Silk Sarees', fabric: 'Silk Mix', occasion: 'Wedding', images: ['/1stsilksaree,2ndic.webp'], description: 'Elegant maroon silk with traditional temple borders.' },
            { id: '5', name: 'Rustic Olive Saree', price: 3500, originalPrice: 6000, category: 'Cotton Sarees', fabric: 'Linen Silk', occasion: 'Festive', images: ['/saree5.jpg'], description: 'Earthy olive tones for festive elegance.' },
            { id: '6', name: 'Heritage Vesti Set', price: 2499, originalPrice: 3999, category: 'Traditional Vesti', fabric: 'Pure Silk', occasion: 'Wedding', images: ['/1silksaree,1st pic-1.webp'], description: 'Complete traditional vesti set for special occasions.' },
            { id: '7', name: 'Deep Red Cotton', price: 2100, originalPrice: 4200, category: 'Cotton Sarees', fabric: 'Cotton', occasion: 'Office', images: ['/saree2.jpg'], description: 'Daily wear cotton elegance.' },
            { id: '8', name: 'Royal Green Saree', price: 3200, originalPrice: 5800, category: 'Silk Sarees', fabric: 'Art Silk', occasion: 'Festive', images: ['/saree3.jpg'], description: 'Vibrant green silk for festive glow.' },
          ];
          setProducts(placeholders);
          setFilteredProducts(placeholders);
        } else {
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === "All" || p.category === category;
      const matchesFabric = fabric === "All" || p.fabric === fabric;
      const matchesOccasion = occasion === "All" || p.occasion === occasion;
      return matchesSearch && matchesCategory && matchesFabric && matchesOccasion;
    });
    setFilteredProducts(filtered);
  }, [searchQuery, category, fabric, occasion, products]);

  const categories = ["All", "Silk Sarees", "Cotton Sarees", "Traditional Vesti"];
  const fabrics = ["All", "Pure Silk", "Cotton", "Linen", "Velvet", "Chiffon"];
  const occasions = ["All", "Wedding", "Festive", "Casual", "Office"];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 px-4 md:px-8 pb-32 bg-cream/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Search & Main Filter */}
        <div className="sticky top-16 z-40 bg-white shadow-xl shadow-rose-900/5 rounded-2xl p-4 mb-12 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
              <input 
                type="text"
                placeholder="Search Sarees, Vesti, Silk Collection..."
                className="w-full pl-10 pr-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all ${
                    category === cat ? "bg-maroon text-white shadow-lg" : "bg-white text-rose-900 border border-rose-100 hover:bg-rose-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-4 border-t border-rose-50">
            <div className="flex items-center gap-2 group cursor-pointer">
              <span className="text-[10px] uppercase font-bold text-rose-300">Fabric:</span>
              <select 
                className="text-xs font-bold text-rose-900 bg-transparent outline-none cursor-pointer"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
              >
                {fabrics.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer">
              <span className="text-[10px] uppercase font-bold text-rose-300">Occasion:</span>
              <select 
                className="text-xs font-bold text-rose-900 bg-transparent outline-none cursor-pointer"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
              >
                {occasions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
            <h1 className="text-3xl font-serif font-bold text-rose-950">{category} Collection</h1>
            <p className="text-rose-400 text-xs font-bold uppercase tracking-widest">{filteredProducts.length} items found</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[3/4] bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="group cursor-pointer bg-white p-2 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-rose-900/10 transition-all duration-500 overflow-hidden border border-rose-50"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.8rem] mb-4 bg-maroon/5 ring-1 ring-black/5 min-h-[200px]">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[8px] font-bold text-maroon uppercase tracking-widest shadow-sm">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="px-3 pb-4 space-y-1">
                  <h3 className="text-sm font-bold text-rose-950 truncate">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-maroon font-sans">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-rose-200 line-through font-sans">₹{product.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase">
                    Free Delivery
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
