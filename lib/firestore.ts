import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export async function fetchFeedsFromFirestore() {
  try {
    console.log('Connecting to Firestore...');
    const feedsRef = collection(db, 'feeds');
    const q = query(feedsRef, orderBy('lastUpdated', 'desc'), limit(50));
    
    console.log('Executing Firestore query...');
    const snapshot = await getDocs(q);
    console.log('Got Firestore response, document count:', snapshot.size);
    
    const articles: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        ...data,
        id: doc.id,
      });
    });
    
    if (articles.length === 0) {
      console.warn('No articles found in Firestore');
    }
    
    return articles;
  } catch (error: any) {
    console.error('Firestore fetch error:', error?.message || error);
    if (error?.code) {
      console.error('Firestore error code:', error.code);
    }
    throw error; // Re-throw to handle in the component
  }
}
