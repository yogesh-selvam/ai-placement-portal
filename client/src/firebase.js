import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAeUMIBcSpOrbrrWfAKSov8ewLWuBST5mA",
  authDomain: "careerconnect-ai-2cdd7.firebaseapp.com",
  projectId: "careerconnect-ai-2cdd7",
  storageBucket: "careerconnect-ai-2cdd7.firebasestorage.app",
  messagingSenderId: "878503782210",
  appId: "1:878503782210:web:e8abcac676981aa32ccadb",
  measurementId: "G-LWGBNS04M2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
