import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD8D_Tb8Bo2uxoQyorA2j7kiITs9dJO7tA",
  authDomain: "matvienko-tree.firebaseapp.com",
  databaseURL: "https://matvienko-tree-default-rtdb.firebaseio.com",
  projectId: "matvienko-tree",
  storageBucket: "matvienko-tree.appspot.com",
  messagingSenderId: "424591339780",
  appId: "1:424591339780:web:7a2778923eb84b94aea051"
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
