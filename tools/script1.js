
// ==================== Firebase v12 Modular SDK ====================
// GitHub Pages + Firebase 무료 플랜용 정적 웹앱 설정입니다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
import {
    getAuth,
    signInAnonymously,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDDXIaFpwPZPI_YKvZ8E0nxjTea1813Ij4",
    authDomain: "fishing-game-71e8b.firebaseapp.com",
    projectId: "fishing-game-71e8b",
    storageBucket: "fishing-game-71e8b.firebasestorage.app",
    messagingSenderId: "576322657158",
    appId: "1:576322657158:web:024fd944576af07131ea07",
    measurementId: "G-P6PRSGCK1L"
};

try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });

    let analytics = null;
    isAnalyticsSupported().then((supported) => {
        if (supported) analytics = getAnalytics(app);
    }).catch(() => {});

    window.AquaFirebase = {
        app,
        analytics,
        auth,
        db,
        googleProvider,
        signInAnonymously,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signInWithPopup,
        onAuthStateChanged,
        signOut,
        doc,
        getDoc,
        setDoc,
        collection,
        query,
        orderBy,
        limit,
        onSnapshot,
        serverTimestamp
    };
    window.dispatchEvent(new CustomEvent("aqua-firebase-ready"));
} catch (error) {
    console.error("Firebase init error:", error);
    window.dispatchEvent(new CustomEvent("aqua-firebase-error", { detail: error }));
}
