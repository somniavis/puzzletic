import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBsJcO5VWW18hTz9-yLGjxLa0AeR1SxIXo",
    authDomain: "grogro-jello-4a53a.firebaseapp.com",
    projectId: "grogro-jello-4a53a",
    storageBucket: "grogro-jello-4a53a.firebasestorage.app",
    messagingSenderId: "446942822900",
    appId: "1:446942822900:web:5c2adc16a33bf9b54a79a1",
    measurementId: "G-5NZ351FRHB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
