import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Star } from "lucide-react";
import { useState, useEffect } from "react";

const banners = [
  {
    title: "Vastra's Finest",
    subtitle: "Authentic Silk Sarees",
    image: "/yellowsaree.jpeg",
    color: "bg-maroon"
  },
  {
    title: "Tamil Heritage",
    subtitle: "Traditional Vesti Collection",
    image: "/1silksaree,3rd pic.webp",
    color: "bg-dark-green"
  },
  {
    title: "Royal Silk",
    subtitle: "Kanchipuram Heritage",
    image: "/1silksaree,1st pic.webp",
    color: "bg-rose-900"
  }
];

const categories = [
  { name: "Silk Sarees", image: "/yellowsaree.jpeg", count: "120+ Items" },
  { name: "Cotton Sarees", image: "/saree4.jpeg", count: "80+ Items" },
  { name: "Traditional Vesti", image: "/1silksaree,3rd pic.webp", count: "60+ Items" }
];

export default function LandingPage() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-rose-50/20 overflow-hidden">
      {/* Hero Carousel */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />
            <img 
               src={banners[currentBanner].image} 
               className="w-full h-full object-cover scale-105" 
               alt=""
               referrerPolicy="no-referrer"
               crossOrigin="anonymous"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-24 max-w-4xl text-white">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] uppercase tracking-[0.4em] font-bold text-gold mb-4"
              >
                {banners[currentBanner].subtitle}
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-7xl md:text-9xl font-serif font-bold leading-none mb-8"
              >
                {banners[currentBanner].title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? "italic text-gold" : ""}>{word} </span>
                ))}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link to="/shop" className="group flex items-center gap-4 bg-white text-rose-950 px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all shadow-2xl">
                  Explore Collection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-12 left-24 z-30 flex gap-3">
          {banners.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentBanner(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${currentBanner === i ? "w-12 bg-gold" : "w-4 bg-white/30"}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="text-5xl font-serif font-bold text-rose-950">Curated Categories</h2>
            <div className="h-1 w-24 bg-maroon rounded-full" />
          </div>
          <p className="max-w-md text-sm text-rose-900/60 font-medium">From heritage weaves to celebratory modern silhouettes, discover the craft in every thread.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {categories.map((cat, i) => (
            <Link to={`/shop?category=${cat.name}`} key={i} className="group text-center space-y-4">
              <div className="aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl border-4 border-white group-hover:-translate-y-2 transition-all duration-700 relative">
                <img 
                  src={cat.image} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                  alt="" 
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-maroon/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wider">{cat.name}</h3>
                <p className="text-[10px] text-rose-400 font-bold">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending / Festive Grid */}
      <section className="py-24 bg-rose-950 text-white overflow-hidden relative">
         {/* Decorative Pattern Background */}
         <div className="absolute inset-0 opacity-5 pointer-events-none temple-border opacity-20" />
         
         <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center mb-24 text-center md:text-left gap-8">
              <div className="space-y-2">
                <span className="text-[12px] uppercase tracking-[0.5em] text-gold font-bold">Most Loved Pieces</span>
                <h2 className="text-6xl font-serif font-bold">The Festive Edit</h2>
              </div>
              <Link to="/shop" className="bg-gold text-rose-950 px-12 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-2xl">
                Shop All Trends
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                  { id: "1", name: "Yellow Heritage Silk", price: 4999, originalPrice: 9999, cat: "Silk Sarees", img: "/yellowsaree.jpeg" },
                  { id: "2", name: "Royal Blue Silk", price: 5500, originalPrice: 8500, cat: "Silk Sarees", img: "/1silksaree,1st pic.webp" },
                  { id: "3", name: "Classic Tamil Vesti", price: 1899, originalPrice: 2999, cat: "Traditional Vesti", img: "/1silksaree,3rd pic.webp" },
                  { id: "4", name: "Maroon Border Silk", price: 6200, originalPrice: 12000, cat: "Silk Sarees", img: "/1stsilksaree,2ndic.webp" }
              ].map((item, i) => (
                <Link to={`/product/${item.id}`} key={i}>
                  <motion.div 
                    whileHover={{ y: -10 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-[2.5rem] group h-full"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-[2rem] mb-6 relative">
                      <img src={item.img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                      <div className="absolute top-4 right-4 bg-maroon text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Star size={16} fill="currentColor" />
                      </div>
                    </div>
                    <div className="space-y-2 px-2">
                      <p className="text-[10px] uppercase font-bold text-gold tracking-widest">{item.cat}</p>
                      <h3 className="text-lg font-serif font-bold text-white truncate">{item.name}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold font-sans">₹{item.price}</span>
                        <span className="text-xs text-white/30 line-through font-sans">₹{item.originalPrice}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
         </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 border-y border-rose-50 py-16">
          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-rose-50 rounded-full mx-auto flex items-center justify-center text-rose-600">
               <Star size={32} />
             </div>
             <h4 className="text-lg font-bold text-rose-950">Authentic Handloom</h4>
             <p className="text-sm text-rose-400">Direct from weavers across India. 100% purity guaranteed.</p>
          </div>
          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-rose-50 rounded-full mx-auto flex items-center justify-center text-rose-600">
               <ArrowRight size={32} />
             </div>
             <h4 className="text-lg font-bold text-rose-950">Easy Exchanges</h4>
             <p className="text-sm text-rose-400">Not the right fit? Exchange within 7 days of delivery.</p>
          </div>
          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-rose-50 rounded-full mx-auto flex items-center justify-center text-rose-600">
               <ChevronRight size={32} />
             </div>
             <h4 className="text-lg font-bold text-rose-950">Pan India Delivery</h4>
             <p className="text-sm text-rose-400">We deliver tradition to your doorstep, anywhere in India.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
