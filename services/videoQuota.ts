import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface VideoQuota {
  userId: string;
  monthlyVideosUsed: number;
  lastResetDate: string; // YYYY-MM format
  totalVideosUsed: number;
}

export interface VideoQuotaUsage {
  remainingVideos: number;
  usedVideos: number;
  resetDate: string;
  isLimitReached: boolean;
}

const MONTHLY_VIDEO_LIMIT = 4;

/**
 * Gets current video quota usage for a user by counting videos created this month
 */
export async function getVideoQuotaUsage(userId: string): Promise<VideoQuotaUsage> {
  try {
    // Get or create user quota document
    const quotaRef = doc(db, 'videoQuotas', userId);
    const quotaDoc = await getDoc(quotaRef);
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    if (!quotaDoc.exists()) {
      // Create new quota document for user
      const newQuota: VideoQuota = {
        userId,
        monthlyVideosUsed: 0,
        lastResetDate: currentMonth,
        totalVideosUsed: 0,
      };
      await setDoc(quotaRef, newQuota);
      
      return {
        remainingVideos: MONTHLY_VIDEO_LIMIT,
        usedVideos: 0,
        resetDate: getNextResetDate(),
        isLimitReached: false,
      };
    }
    
    const quotaData = quotaDoc.data() as VideoQuota;
    
    // Check if we need to reset monthly quota
    if (quotaData.lastResetDate !== currentMonth) {
      // Reset monthly quota
      const updatedQuota: VideoQuota = {
        ...quotaData,
        monthlyVideosUsed: 0,
        lastResetDate: currentMonth,
      };
      await setDoc(quotaRef, updatedQuota);
      
      return {
        remainingVideos: MONTHLY_VIDEO_LIMIT,
        usedVideos: 0,
        resetDate: getNextResetDate(),
        isLimitReached: false,
      };
    }
    
    const remainingVideos = Math.max(0, MONTHLY_VIDEO_LIMIT - quotaData.monthlyVideosUsed);
    const isLimitReached = quotaData.monthlyVideosUsed >= MONTHLY_VIDEO_LIMIT;
    
    return {
      remainingVideos,
      usedVideos: quotaData.monthlyVideosUsed,
      resetDate: getNextResetDate(),
      isLimitReached,
    };
  } catch (error: any) {
    console.error('Error getting video quota usage:', error);
    
    // If it's a permission error, return unlimited quota for now
    if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
      return {
        remainingVideos: MONTHLY_VIDEO_LIMIT,
        usedVideos: 0,
        resetDate: getNextResetDate(),
        isLimitReached: false,
      };
    }
    
    // Return default values if there's any other error
    return {
      remainingVideos: MONTHLY_VIDEO_LIMIT,
      usedVideos: 0,
      resetDate: getNextResetDate(),
      isLimitReached: false,
    };
  }
}

/**
 * Consumes one video generation credit for a user
 */
export async function consumeVideoQuota(userId: string): Promise<void> {
  try {
    const quotaRef = doc(db, 'videoQuotas', userId);
    const quotaDoc = await getDoc(quotaRef);
    
    if (!quotaDoc.exists()) {
      throw new Error('User quota not found');
    }
    
    const quotaData = quotaDoc.data() as VideoQuota;
    
    // Check if user has remaining quota
    if (quotaData.monthlyVideosUsed >= MONTHLY_VIDEO_LIMIT) {
      throw new Error('Monthly video quota exceeded');
    }
    
    // Increment video usage
    const updatedQuota: VideoQuota = {
      ...quotaData,
      monthlyVideosUsed: quotaData.monthlyVideosUsed + 1,
      totalVideosUsed: quotaData.totalVideosUsed + 1,
    };
    
    await setDoc(quotaRef, updatedQuota);
  } catch (error: any) {
    console.error('Error consuming video quota:', error);
    
    // If it's a permission error, allow video generation anyway
    if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
      return; // Allow video generation to proceed
    }
    
    // For other errors, still throw to prevent video generation
    throw error;
  }
}

// Video URLs are stored in FAL AI, not in Firebase
// This function is no longer needed

/**
 * Gets the next reset date for quota
 */
function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Checks if user has premium access
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  try {
    // For now, we'll assume all authenticated users have premium
    // You can replace this with your actual premium check logic
    // This could check a 'premium' field in user document or use Adapty
    return !!userId;
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
}
