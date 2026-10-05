import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string | null;
  photoURL?: string | null;
  role: 'customer' | 'admin';
  createdAt: any;
  updatedAt: any;
}

/**
 * ইউজারের প্রোফাইল Firestore 'users' কালেকশনে তৈরি বা আপডেট করা
 * ইউজারের আসল নাম প্রাধান্য পাবে (কখনো জেনেরিক 'Customer' দেখাবে না)
 */
export async function createOrUpdateUserDoc(
  user: FirebaseUser,
  additionalData?: { displayName?: string; phoneNumber?: string; role?: 'customer' | 'admin' }
): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  // ইউজারের আসল নাম নির্ধারণ
  const resolvedName =
    additionalData?.displayName ||
    user.displayName ||
    user.email?.split('@')[0] ||
    'Metalic Member';

  if (!userSnap.exists()) {
    const newUserProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: resolvedName,
      phoneNumber: additionalData?.phoneNumber || user.phoneNumber || '',
      photoURL: user.photoURL || '',
      role: additionalData?.role || 'customer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, newUserProfile);
    return newUserProfile;
  }

  // যদি ডকুমেন্ট আগে থেকেই থাকে, কিন্তু নাম খালি বা 'Customer' ছিল, তবে আসল নাম দিয়ে আপডেট করা
  const existingData = userSnap.data() as UserProfile;
  if (
    (!existingData.displayName || existingData.displayName === 'Customer') &&
    (user.displayName || additionalData?.displayName)
  ) {
    await updateDoc(userRef, {
      displayName: resolvedName,
      updatedAt: serverTimestamp(),
    });
    existingData.displayName = resolvedName;
  }

  return existingData;
}

// ইমেইল এবং পাসওয়ার্ড দিয়ে নতুন অ্যাকাউন্ট তৈরি
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  phoneNumber?: string
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Firebase Auth প্রোফাইলে আসল নাম আপডেট
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    const userProfile = await createOrUpdateUserDoc(user, {
      displayName,
      phoneNumber,
      role: 'customer',
    });

    return { user, userProfile };
  } catch (error: any) {
    throw new Error(getFriendlyAuthErrorMessage(error.code));
  }
}

// ইমেইল এবং পাসওয়ার্ড দিয়ে লগইন
export async function loginWithEmail(email: string, pass: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    const userProfile = await createOrUpdateUserDoc(user);
    return { user, userProfile };
  } catch (error: any) {
    throw new Error(getFriendlyAuthErrorMessage(error.code));
  }
}

// গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // গুগলের প্রোফাইল নাম সংরক্ষণ
    const userProfile = await createOrUpdateUserDoc(user, {
      displayName: user.displayName || user.email?.split('@')[0],
    });

    return { user, userProfile };
  } catch (error: any) {
    throw new Error(getFriendlyAuthErrorMessage(error.code));
  }
}

// লগআউট
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(getFriendlyAuthErrorMessage(error.code));
  }
}

// পাসওয়ার্ড রিসেট লিংক পাঠানো
export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getFriendlyAuthErrorMessage(error.code));
  }
}

// কাস্টমার-ফ্রেন্ডলি বাংলা এরর মেসেজ
function getFriendlyAuthErrorMessage(code?: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে। দয়া করে লগইন করুন।';
    case 'auth/invalid-email':
      return 'ইমেইল অ্যাড্রেসটি সঠিক নয়।';
    case 'auth/operation-not-allowed':
      return 'এই লগইন মেথডটি বর্তমানে নিষ্ক্রিয় রয়েছে।';
    case 'auth/weak-password':
      return 'পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।';
    case 'auth/user-disabled':
      return 'এই অ্যাকাউন্টটি অ্যাডমিন কর্তৃক সাময়িকভাবে বন্ধ রাখা হয়েছে।';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'ইমেইল অথবা পাসওয়ার্ড ভুল দেওয়া হয়েছে।';
    case 'auth/too-many-requests':
      return 'অতিরিক্ত ভুল চেষ্টার কারণে অ্যাকাউন্টটি সাময়িক লক হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।';
    case 'auth/popup-closed-by-user':
      return 'লগইন উইন্ডোটি বন্ধ করে দেওয়া হয়েছে।';
    default:
      return 'একটি ত্রুটি হয়েছে। দয়া করে আবার চেষ্টা করুন।';
  }
}