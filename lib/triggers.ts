import { collection, doc, query, where, getDocs, setDoc, deleteDoc, serverTimestamp, OrderByDirection, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Trigger, TriggerFormData } from '../types';

/**
 * Collection reference for user triggers.
 * Structure: /triggers/{triggerId}
 */
const triggersRef = collection(db, 'triggers');

export const createTrigger = async (userId: string, data: TriggerFormData): Promise<Trigger> => {
  const newDocRef = doc(triggersRef);
  const now = Date.now();
  
  const trigger: Trigger = {
    id: newDocRef.id,
    userId,
    symbol: data.symbol.toUpperCase(),
    companyName: data.companyName,
    exchange: data.exchange,
    conditionType: data.conditionType,
    targetValue: parseFloat(data.targetValue),
    isActive: true,
    isTriggered: false,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, trigger);
  return trigger;
};

export const getUserTriggers = async (userId: string): Promise<Trigger[]> => {
  const q = query(
    triggersRef, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const triggers: Trigger[] = [];
  
  snapshot.forEach((doc) => {
    triggers.push(doc.data() as Trigger);
  });
  
  return triggers;
};

export const deleteTrigger = async (triggerId: string): Promise<void> => {
  const docRef = doc(db, 'triggers', triggerId);
  await deleteDoc(docRef);
};
