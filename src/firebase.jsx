// import firebase from "firebase/compat/app";
// import "firebase/compat/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBF5b7YimfHhbcl2jHlT3P7TpRDU4nxMbE",
  authDomain: "copd-61c11.firebaseapp.com",
  projectId: "copd-61c11",
  storageBucket: "copd-61c11.appspot.com",
  messagingSenderId: "301350173161",
  appId: "1:301350173161:web:418cb989c222ed29a3f378",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appAuth = getAuth(app);

//for Registration
const createAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;
  return createUserWithEmailAndPassword(appAuth, email, password);
};
//For Sign In
const signInAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;
  return signInWithEmailAndPassword(appAuth, email, password);
};

const createUserDocumentFromAuth = async (
  userAuth,
  additionalInformation = {}
) => {
  if (!userAuth) return;
  const userDocRef = doc(db, "users", userAuth.uid);
  const userSnapShot = await getDoc(userDocRef);
  console.log(userSnapShot);

  if (!userSnapShot.exists()) {
    // const { displayName, email } = userAuth;
    const { userName, userEmail } = userAuth;
    const createdAt = new Date();
    try {
      await setDoc(userDocRef, {
        // displayName,
        // userName,
        // email,
        createdAt,
        ...additionalInformation,
      });
    } catch (err) {
      console.log("Error creating User", err.message);
    }
  }
  return userDocRef;
};

const updateUserProfile = async (user, displayName) => {
  if (!user || !displayName) return;

  try {
    await updateProfile(user, { displayName });
    console.log("Profile updated successfully!");
  } catch (error) {
    console.error("Error updating profile:", error.message);
  }
};

export {
  db,
  createAuthUserWithEmailAndPassword,
  signInAuthUserWithEmailAndPassword,
  createUserDocumentFromAuth,
  createUserWithEmailAndPassword,
  appAuth,
  updateProfile,
  updateUserProfile,
};

///////////////////////////////////////////////////
