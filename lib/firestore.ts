import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export async function fetchFeedsFromFirestore() {
  const feedsRef = collection(db, 'feeds');
  const q = query(feedsRef, orderBy('lastUpdated', 'desc'), limit(50)); // 🆕 Sort and limit
  const snapshot = await getDocs(q);
  
  const articles: any[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    articles.push({
      ...data,
      id: doc.id, // in case 'id' isn't in the document fields
    });
  });
  return articles;
}
