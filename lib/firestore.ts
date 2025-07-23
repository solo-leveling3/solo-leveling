// lib/firestore.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function fetchFeedsFromFirestore() {
  const snapshot = await getDocs(collection(db, 'feeds'));
  return snapshot.docs.map(doc => doc.data());
}
