import { createContext, useContext, useState, useEffect } from "react";
import { db } from "./firebase.jsx";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    isSmoking: false,
    smokingYears: "",
    cigarettesPerDay: "",
    symptoms: "",
    alcoholConsumption: "no",
    copdRisk: "",
    emailUser: "",
  });
  const [records, setRecords] = useState([]);
  const [showRecords, setShowRecords] = useState(false);
  const [model, setModel] = useState(null);
  const [userDetails, setUserDetails] = useState({
    userName: "",
    userEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [retriveUserName, setRetriveUserName] = useState(null);

  const getUserProfileInfoFromFirestore = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const { userName } = userDocSnapshot.data();
        console.log(userName);
        setRetriveUserName(userName);
        console.log(retriveUserName);
        localStorage.setItem("userNameNew", userName);
      } else {
        console.log("user document is not found in fs");
      }
    } catch (error) {
      console.error("firestore fetching error", error.message);
    }
  };

  const fetchRecords = async () => {
    try {
      const collectionRef = collection(db, "patients");
      const querySnapshot = await getDocs(collectionRef);

      const recordsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(recordsData);
    } catch (error) {
      console.error("Error fetching records:", error);
      // Handle error (e.g., display an error message to the user)
    }
  };

  fetchRecords();

  const calculateCOPDSeverity = (risk) => {
    if (risk >= 0.8) return "Very Severe";
    else if (risk >= 0.5) return "Severe";
    else if (risk >= 0.3) return "Intermediate";
    else return "Low";
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await deleteDoc(doc(db, "patients", recordId));
      setRecords(records.filter((record) => record.id !== recordId));
      alert("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record: ", error);
      alert("Error deleting record. Please try again later.");
    }
  };

  return (
    <UserContext.Provider
      value={{
        userDetails,
        setUserDetails,
        getUserProfileInfoFromFirestore,
        formData,
        setFormData,
        records,
        setRecords,
        showRecords,
        setShowRecords,
        model,
        setModel,
        fetchRecords,
        calculateCOPDSeverity,
        handleDeleteRecord,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
