import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { CartItem, Product } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

interface AppContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const initialLoad = useRef(true);

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      if (user && !user.isGuest) {
        // Authenticated User: Load from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const localCart = JSON.parse(localStorage.getItem("vastra_cart") || "[]");
          const firestoreCart = userData.cart || [];
          
          // Merge Logic: Combine local items into firestore
          let mergedCart = [...firestoreCart];
          localCart.forEach((lItem: CartItem) => {
            const exists = mergedCart.find(fItem => fItem.id === lItem.id && fItem.selectedSize === lItem.selectedSize);
            if (!exists) {
              mergedCart.push(lItem);
            }
          });
          
          setCart(mergedCart);
          setWishlist(userData.wishlist || []);
          
          // Clear local cart after merge
          localStorage.removeItem("vastra_cart");
          localStorage.removeItem("vastra_wishlist");
        }
      } else {
        // Guest User: Load from Local Storage
        const savedCart = localStorage.getItem("vastra_cart");
        const savedWishlist = localStorage.getItem("vastra_wishlist");
        setCart(savedCart ? JSON.parse(savedCart) : []);
        setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
      }
      initialLoad.current = false;
    };

    loadData();
  }, [user]);

  // Sync Data
  useEffect(() => {
    if (initialLoad.current) return;

    const syncData = async () => {
      if (user && !user.isGuest) {
        // Auth User: Sync to Firestore
        await updateDoc(doc(db, "users", user.uid), {
          cart,
          wishlist
        });
      } else {
        // Guest: Sync to LocalStorage
        localStorage.setItem("vastra_cart", JSON.stringify(cart));
        localStorage.setItem("vastra_wishlist", JSON.stringify(wishlist));
      }
    };

    syncData();
  }, [cart, wishlist, user]);

  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === selectedSize);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === selectedSize)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedSize }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const clearCart = () => setCart([]);

  return (
    <AppContext.Provider value={{ cart, wishlist, addToCart, removeFromCart, toggleWishlist, updateQuantity, clearCart }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContent() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContent must be used within an AppProvider");
  return context;
}
