import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, addDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Product, Review } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Share2, Star, ShoppingBag, ArrowLeft, Camera, Send, Check } from "lucide-react";
import { useAppContent } from "../lib/store";

import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [success, setSuccess] = useState(false);

  const { addToCart, toggleWishlist, wishlist } = useAppContent();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const prodDoc = await getDoc(doc(db, "products", id));
        if (prodDoc.exists()) {
          setProduct({ id: prodDoc.id, ...prodDoc.data() } as Product);
          
          // Fetch reviews
          const reviewsSnapshot = await getDocs(query(collection(db, `products/${id}/reviews`), orderBy("createdAt", "desc")));
          setReviews(reviewsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
        } else {
          // Mock data for demo if not in Firestore
          const placeholders: Record<string, Product> = {
            '1': { id: '1', name: 'Yellow Silk Heritage', price: 4999, originalPrice: 9999, category: 'Silk Sarees', fabric: 'Pure Silk', occasion: 'Wedding', images: ['/yellowsaree.jpeg', '/1silksaree,1st pic.webp', '/1stsilksaree,2ndic.webp'], description: 'Traditional yellow silk saree with rich gold borders. A masterpiece of Kanchipuram heritage.', rating: 4.8, reviewCount: 24, sizes: ['One Size'] },
            '2': { id: '2', name: 'Royal Blue Kanchipuram', price: 5500, originalPrice: 8500, category: 'Silk Sarees', fabric: 'Pure Silk', occasion: 'Festive', images: ['/1silksaree,1st pic.webp', '/yellowsaree.jpeg', '/1stsilksaree,2ndic.webp'], description: 'Premium blue kanchipuram silk with intricate gold zari work.', rating: 4.9, reviewCount: 18, sizes: ['One Size'] },
            '3': { id: '3', name: 'Classic Tamil Vesti', price: 1899, originalPrice: 2999, category: 'Traditional Vesti', fabric: 'Pure Silk', occasion: 'Festive', images: ['/1silksaree,3rd pic.webp', '/1silksaree,1st pic-1.webp'], description: 'Traditional white silk vesti with premium gold border. Perfect for spiritual ceremonies.', rating: 4.7, reviewCount: 15, sizes: ['3.6m', '4.0m'] },
            '4': { id: '4', name: 'Maroon Border Silk', price: 4800, originalPrice: 7500, category: 'Silk Sarees', fabric: 'Silk Mix', occasion: 'Wedding', images: ['/1stsilksaree,2ndic.webp', '/yellowsaree.jpeg'], description: 'Elegant maroon silk with traditional temple borders and rich pallu.', rating: 4.6, reviewCount: 32, sizes: ['One Size'] },
            '5': { id: '5', name: 'Rustic Olive Saree', price: 3500, originalPrice: 6000, category: 'Cotton Sarees', fabric: 'Linen Silk', occasion: 'Festive', images: ['/saree5.jpg', '/saree4.jpeg'], description: 'Earthy olive tones for festive elegance. Comfortable for long durations.', rating: 4.5, reviewCount: 12, sizes: ['One Size'] },
            '6': { id: '6', name: 'Heritage Vesti Set', price: 2499, originalPrice: 3999, category: 'Traditional Vesti', fabric: 'Pure Silk', occasion: 'Wedding', images: ['/1silksaree,1st pic-1.webp', '/1silksaree,3rd pic.webp'], description: 'Complete traditional vesti set for special occasions with matching angavastram.', rating: 4.9, reviewCount: 8, sizes: ['4.0m'] },
            '7': { id: '7', name: 'Deep Red Cotton', price: 2100, originalPrice: 4200, category: 'Cotton Sarees', fabric: 'Cotton', occasion: 'Office', images: ['/saree2.jpg', '/saree3.jpg'], description: 'Daily wear cotton elegance. Breathable and stays crisp all day.', rating: 4.4, reviewCount: 20, sizes: ['One Size'] },
            '8': { id: '8', name: 'Royal Green Saree', price: 3200, originalPrice: 5800, category: 'Silk Sarees', fabric: 'Art Silk', occasion: 'Festive', images: ['/saree3.jpg', '/saree2.jpg'], description: 'Vibrant green silk for a festive glow. Lightweight and easy to drape.', rating: 4.7, reviewCount: 14, sizes: ['One Size'] },
          };
          const mockProduct = id && placeholders[id] ? placeholders[id] : placeholders['1'];
          setProduct(mockProduct);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.isGuest) {
      toast.error("Please login to post reviews");
      navigate("/auth");
      return;
    }
    if (!product) return;
    
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, `products/${product.id}/reviews`), {
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || "Anonymous User",
        rating: userReview.rating,
        comment: userReview.comment,
        createdAt: Timestamp.now(),
        approved: true
      });
      setUserReview({ rating: 5, comment: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleToggleWishlist = () => {
    if (!user || user.isGuest) {
      toast.error("Please login to save to wishlist");
      navigate("/auth");
      return;
    }
    if (product) toggleWishlist(product.id);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast.error("Please select a size first");
      return;
    }
    addToCart(product, 1, selectedSize);
    navigate("/checkout");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return <div>Product not found</div>;

  const isInWishlist = wishlist.includes(product.id);

  return (
    <div className="pt-24 pb-32 bg-cream/10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-rose-900 font-bold text-sm">
          <ArrowLeft size={16} /> Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl border border-rose-100 bg-white">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[activeImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === i ? "border-maroon shadow-lg" : "border-transparent opacity-60"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-maroon font-bold text-xs uppercase tracking-widest">{product.category}</span>
                <div className="flex gap-4">
                  <button 
                    onClick={handleToggleWishlist}
                    className={`p-2 rounded-full border transition-all ${
                      isInWishlist ? "bg-rose-600 border-rose-600 text-white" : "border-rose-100 text-rose-300 hover:text-rose-600"
                    }`}
                  >
                    <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
                  </button>
                  <button className="p-2 rounded-full border border-rose-100 text-rose-300 hover:text-rose-600 transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
              <h1 className="text-4xl font-serif font-bold text-rose-950">{product.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex text-gold">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill={i <= (product.rating || 0) ? "currentColor" : "none"} />)}
                </div>
                <span className="text-xs text-rose-400 font-bold">{product.rating} (from {product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-end gap-4">
                <span className="text-3xl font-bold text-rose-600 font-sans">₹{product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-rose-300 line-through font-sans">₹{product.originalPrice}</span>
                    <span className="text-sm font-bold text-green-600 uppercase">({Math.round((1 - product.price/product.originalPrice) * 100)}% off)</span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-rose-400 font-bold uppercase">Inclusive of all taxes</p>
            </div>

            <div className="space-y-4">
              <label className="text-xs uppercase font-bold text-rose-900 tracking-wider">Select Size</label>
              <div className="flex gap-4">
                {product.sizes?.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[4rem] px-4 py-2 border rounded-full text-xs font-bold transition-all ${
                      selectedSize === size ? "bg-rose-950 text-white border-rose-950 shadow-lg" : "border-rose-100 text-rose-900 hover:border-rose-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => addToCart(product, 1, selectedSize)}
                className="flex-1 bg-white border-2 border-rose-600 text-rose-600 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-rose-50 transition-all shadow-lg active:scale-95"
              >
                <ShoppingBag size={18} /> Add To Bag
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-rose-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
              >
                Buy Now
              </button>
            </div>

            <div className="pt-8 border-t border-rose-100">
              <h3 className="text-sm font-bold text-rose-950 uppercase mb-4">Product Description</h3>
              <p className="text-sm text-rose-800/70 leading-relaxed font-sans">{product.description}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-rose-50">
                  <p className="text-[10px] uppercase text-rose-300 font-bold">Fabric</p>
                  <p className="text-sm font-bold text-rose-900">{product.fabric}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-rose-50">
                  <p className="text-[10px] uppercase text-rose-300 font-bold">Occasion</p>
                  <p className="text-sm font-bold text-rose-900">{product.occasion}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Interaction Section */}
        <section className="mt-24 pt-16 border-t border-rose-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
             {/* Left: Review List */}
             <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-serif font-bold text-rose-950 underline decoration-rose-200 underline-offset-8">Customer Reviews</h2>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-rose-600">{product.rating}</p>
                    <p className="text-[10px] uppercase text-rose-300 font-bold">{product.reviewCount} Ratings</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-rose-50 text-center text-rose-300">
                      Be the first to share your experience
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="p-6 bg-white rounded-2xl shadow-sm border border-rose-50 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs uppercase">
                              {review.userName[0]}
                            </div>
                            <span className="text-xs font-bold text-rose-900">{review.userName}</span>
                          </div>
                          <div className="flex text-gold">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill={i <= review.rating ? "currentColor" : "none"} />)}
                          </div>
                        </div>
                        <p className="text-sm text-rose-800/80 italic">"{review.comment}"</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2">
                            {review.images.map((img, i) => (
                              <img key={i} src={img} className="w-16 h-16 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
             </div>

             {/* Right: Write Review */}
             <div className="bg-rose-950 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
                
                <h3 className="text-xl font-serif font-bold text-white mb-6">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-rose-200/50 font-bold tracking-widest">Rate the product</label>
                    <div className="flex gap-2 text-rose-200">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button 
                          key={i} 
                          type="button" 
                          onClick={() => setUserReview({ ...userReview, rating: i })}
                          className={`transition-all ${userReview.rating >= i ? "text-gold" : "text-white/20"}`}
                        >
                          <Star size={24} fill={userReview.rating >= i ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase text-rose-200/50 font-bold tracking-widest">Your Review</label>
                    <textarea 
                      placeholder="Explain your experience..."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-gold transition-colors text-sm"
                      value={userReview.comment}
                      onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      type="button"
                      className="flex items-center justify-center gap-2 py-4 border border-white/10 rounded-xl text-[10px] uppercase font-bold text-rose-200 hover:bg-white/5 transition-all"
                    >
                      <Camera size={16} /> Upload Photo
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-gold text-rose-950 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gold/90 transition-all disabled:opacity-50"
                    >
                      {isSubmittingReview ? "Submitting..." : (user && !user.isGuest ? "Post Review" : "Sign in to post")}
                      <Send size={14} />
                    </button>
                  </div>
                </form>

                <AnimatePresence>
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gold flex flex-col items-center justify-center text-rose-950 text-center p-8"
                    >
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4">
                        <Check size={32} />
                      </div>
                      <h4 className="text-xl font-serif font-bold">Review Submitted!</h4>
                      <p className="text-sm">Thank you for sharing your feedback.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
