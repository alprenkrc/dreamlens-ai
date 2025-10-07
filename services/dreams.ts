import { collection, addDoc, serverTimestamp, getDocs, orderBy, query, deleteDoc, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Dream } from '@/types/dream';

export type CreateDreamInput = {
  title: string;
  description: string;
  originalDreamText?: string; // Original text as entered by user
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
    originalDreamText: input.originalDreamText ?? '',
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
    
    
    // If userId is provided, only include dreams for that user
    // If userId is null/undefined, include all dreams (for guest mode)
    // Also include dreams with placeholder-user-id for backward compatibility
    if (userId !== null && data.userId !== userId && data.userId !== 'placeholder-user-id') {
      return;
    }
    
    items.push({
      id: doc.id,
      userId: data.userId ?? null,
      title: data.title ?? '',
      date: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      description: data.description ?? '',
      originalDreamText: data.originalDreamText ?? '',
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

/**
 * Migrates placeholder-user-id dreams to the current user
 * This is a one-time migration for backward compatibility
 */
export async function migratePlaceholderDreams(currentUserId: string): Promise<void> {
  try {
    const base = collection(db, 'dreams');
    const q = query(base, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const placeholderDreams = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === 'placeholder-user-id') {
        placeholderDreams.push({ id: doc.id, data });
      }
    });
    
    if (placeholderDreams.length === 0) {
      return;
    }
    
    
    
    // Try to update each dream individually to handle permissions better
    let successCount = 0;
    for (const dream of placeholderDreams) {
      try {
        const dreamRef = doc(db, 'dreams', dream.id);
        await updateDoc(dreamRef, { userId: currentUserId });
        
        successCount++;
      } catch (updateError) {
        console.warn('Failed to migrate dream:', dream.id, updateError);
        // Continue with other dreams even if one fails
      }
    }
    
    
  } catch (error) {
    console.error('Error migrating placeholder dreams:', error);
    // Don't throw the error, just log it so the app continues to work
  }
}


