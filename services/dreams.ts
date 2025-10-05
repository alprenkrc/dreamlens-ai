import { collection, addDoc, serverTimestamp, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Dream } from '@/types/dream';

export type CreateDreamInput = {
  title: string;
  description: string;
  imageUrl: string;
  vividness?: number;
  symbols?: string[];
  emotions?: string[];
  fortune?: string;
};

export async function addDream(userId: string | null, input: CreateDreamInput): Promise<string> {
  const docRef = await addDoc(collection(db, 'dreams'), {
    userId: userId ?? null,
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl,
    vividness: input.vividness ?? null,
    symbols: input.symbols ?? [],
    emotions: input.emotions ?? [],
    fortune: input.fortune ?? '',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function listDreams(userId?: string | null): Promise<Dream[]> {
  const base = collection(db, 'dreams');
  const q = query(base, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const items: Dream[] = [];
  snapshot.forEach((doc) => {
    const data: any = doc.data();
    if (userId && data.userId !== userId) return;
    items.push({
      id: doc.id,
      title: data.title ?? '',
      date: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      description: data.description ?? '',
      imageUrl: data.imageUrl ?? '',
      symbols: data.symbols ?? [],
      emotions: data.emotions ?? [],
      fortune: data.fortune ?? '',
      vividness: data.vividness ?? 5, // Default to 5 if not set
      views: data.views ?? 0, // Add views field
      createdAt: data.createdAt?.toDate?.().toISOString?.(),
      updatedAt: data.updatedAt?.toDate?.().toISOString?.(),
    });
  });
  return items;
}

export async function deleteDream(dreamId: string): Promise<void> {
  await deleteDoc(doc(db, 'dreams', dreamId));
}


