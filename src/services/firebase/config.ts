import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// এনভায়রনমেন্ট ভেরিয়েবল (.env) থেকে Firebase কনফিগারেশন লোড করা
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// লোকাল ডেভেলপমেন্টে ক্রেডেনশিয়াল না থাকলে ওয়ার্নিং প্রদর্শন
if (!firebaseConfig.apiKey && import.meta.env.DEV) {
  console.warn(
    '[Metalic Security] Firebase API Key is not configured in .env. Please configure your Firebase environment variables.'
  );
}

// অ্যাপ ডুপ্লিকেট ইনিশিয়ালাইজেশন রোধ করার সেফ প্যাটার্ন
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase Authentication এবং Firestore Database ইনিশিয়ালাইজ ও এক্সপোর্ট
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// মাস্টার প্রম্পটের নিয়ম অনুযায়ী সব ইমেজ ও মিডিয়ার জন্য Cloudinary ব্যবহৃত হবে (Firebase Storage নিষিদ্ধ)
export default app;