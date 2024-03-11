export const firebaseConfig = {
  apiKey: "AIzaSyBeN3g1ei89NZNTz9LQ2-yzUnRp43LO39E",
  authDomain: "menu-maker-11370.firebaseapp.com",
  projectId: "menu-maker-11370",
  storageBucket: "menu-maker-11370.appspot.com",
  messagingSenderId: "202075158247",
  appId: "1:202075158247:web:66ce2278ab41dee2a7d442"
};


import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
import { getFirestore,getCountFromServer, collection, query, where, getDocs,getDoc, setDoc, updateDoc, addDoc, doc,deleteDoc,onSnapshot,orderBy, limit,startAt, startAfter,endAt } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js';


let docName = "menu-maker";

export {docName,initializeApp,getFirestore,getCountFromServer, collection, query, where, getDocs,getDoc, setDoc, updateDoc, addDoc, doc,deleteDoc,onSnapshot,orderBy, limit,startAt, startAfter,endAt};

