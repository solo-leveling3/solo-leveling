// lib/firebase.ts
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA_wi4rDvous2rMXKGpzXoBwBVuPK3Ed5Y',
  authDomain: 'tech2news-2120f.firebaseapp.com',
  projectId: 'tech2news-2120f',
  storageBucket: 'tech2news-2120f.appspot.com',
  messagingSenderId: '556884994565',
  appId: '1:556884994565:web:xxxxxx', // optional
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
