import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDN-aAggSuMRdeAo3ccRkO3pMW0OefXL_M",
  authDomain: "staging-tree.firebaseapp.com",
  projectId: "staging-tree",
  storageBucket: "staging-tree.appspot.com",
  messagingSenderId: "689243728831",
  appId: "1:689243728831:web:5accfb830f012fbac30f0a",
  measurementId: "G-JQMPXHJZR4"
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
