import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, SubscriptionPlan } from '../types';

/**
 * Collection reference for user profiles.
 * Structure: /users/{userId}
 */
const usersCollection = 'users';

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docRef = doc(db, usersCollection, userId);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }
  return null;
};

export const upsertUserProfile = async (
  userId: string, 
  data: Partial<UserProfile>
): Promise<void> => {
  const docRef = doc(db, usersCollection, userId);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    await updateDoc(docRef, { ...data });
  } else {
    // Default initial user structure
    const newUser: UserProfile = {
      uid: userId,
      plan: 'free',
      activeTriggersCount: 0,
      createdAt: Date.now(),
      ...data
    };
    await setDoc(docRef, newUser);
  }
};
