import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// adding firebase credentials in order to connect to firebase
const config = {
  apiKey: "AIzaSyA5W6qRHJAQd2o-66wUPfwPh5ffebdGt6E",
  authDomain: "chat-app-84415.firebaseapp.com",
  projectId: "chat-app-84415",
  storageBucket: "chat-app-84415.appspot.com",
  messagingSenderId: "661010178685",
  appId: "1:661010178685:web:dd0837b84101e6e2c8c714",
  measurementId: "G-HXTYY4PXES",
};

// Initialize Firebase
const app = initializeApp(config);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);
