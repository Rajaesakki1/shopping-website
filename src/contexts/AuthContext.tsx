import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  isGuest?: false;
}

interface GuestData {
  uid: string;
  isGuest: true;
}

export type AuthUser = UserData | GuestData | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  skipAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for guest in local storage first
    const savedGuest = localStorage.getItem("vastra_guest") === "true";
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Clear guest status if they log in
        localStorage.removeItem("vastra_guest");
        
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            isGuest: false,
            ...userDoc.data()
          } as UserData);
        } else {
          // Create user doc if it doesn't exist
          const newUserData = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            createdAt: new Date().toISOString(),
            isAdmin: firebaseUser.email === 'rajaesakki1806@gmail.com'
          };
          await setDoc(doc(db, "users", firebaseUser.uid), newUserData);
          setUser({ ...newUserData, isGuest: false } as UserData);
        }
      } else if (savedGuest) {
        setUser({ uid: "guest_session", isGuest: true });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    localStorage.removeItem("vastra_guest");
    await firebaseSignOut(auth);
    setUser(null);
  };

  const skipAuth = () => {
    localStorage.setItem("vastra_guest", "true");
    setUser({ uid: "guest_" + Math.random().toString(36).substr(2, 9), isGuest: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, skipAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
