import { db, auth } from '@/config/firebase';
import { doc, setDoc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';

export interface UserProfile {
  isPremium?: boolean;
  name?: string;
  email?: string;
}

export function getUserDocRef(userId: string) {
  return doc(db, 'users', userId);
}

export async function ensureUserDoc(userId: string, data?: Partial<UserProfile>) {
  const ref = getUserDocRef(userId);
  const snap = await getDoc(ref);
  
  // Filter out undefined values to prevent Firebase errors
  const filteredData = data ? Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  ) as Partial<UserProfile> : {};
  
  const initial: UserProfile = { isPremium: false, ...filteredData };
  if (!snap.exists()) {
    await setDoc(ref, initial, { merge: true });
    return;
  }
  // If exists, backfill missing fields (e.g., name/email) without overwriting existing values
  const current = snap.data() as UserProfile | undefined;
  const toMerge: Partial<UserProfile> = {};
  if (filteredData?.name && !current?.name) toMerge.name = filteredData.name;
  if (filteredData?.email && !current?.email) toMerge.email = filteredData.email;
  if (Object.keys(toMerge).length) await setDoc(ref, toMerge, { merge: true });
}

export async function setUserPremium(userId: string, isPremium: boolean) {
  const ref = getUserDocRef(userId);
  await setDoc(ref, { isPremium }, { merge: true });
}

export async function setUserName(userId: string, name: string) {
  const ref = getUserDocRef(userId);
  await setDoc(ref, { name }, { merge: true });
}

export function observeUserPremium(
  userId: string,
  onChange: (isPremium: boolean) => void
) {
  const ref = getUserDocRef(userId);
  return onSnapshot(ref, (snap) => {
    const data = snap.data() as UserProfile | undefined;
    onChange(Boolean(data?.isPremium));
  });
}


