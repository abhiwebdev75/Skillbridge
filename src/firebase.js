import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAh_hb5DxFd3buHf73QyyOlVmfwvMrfkaE",
  authDomain: "skillbridge-7891b.firebaseapp.com",
  projectId: "skillbridge-7891b",
  storageBucket: "skillbridge-7891b.firebasestorage.app",
  messagingSenderId: "183567439025",
  appId: "1:183567439025:web:8ed07f2803eb25d6bd3e90",
  measurementId: "G-731H6MP2JV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;