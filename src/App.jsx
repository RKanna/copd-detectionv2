import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import * as tf from "@tensorflow/tfjs";

const firebaseConfig = {
  apiKey: "AIzaSyBF5b7YimfHhbcl2jHlT3P7TpRDU4nxMbE",
  authDomain: "copd-61c11.firebaseapp.com",
  projectId: "copd-61c11",
  storageBucket: "copd-61c11.appspot.com",
  messagingSenderId: "301350173161",
  appId: "1:301350173161:web:418cb989c222ed29a3f378",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const App = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    isSmoking: false,
    smokingYears: "",
    cigarettesPerDay: "",
    symptoms: "",
    alcoholConsumption: "no",
    copdRisk: "",
  });
  const [records, setRecords] = useState([]);
  const [showRecords, setShowRecords] = useState(false);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      const snapshot = await db.collection("patients").get();
      const recordsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(recordsData);
    };

    fetchRecords();
  }, []);

  const calculateCOPDSeverity = (risk) => {
    if (risk >= 0.8) return "Very Severe";
    else if (risk >= 0.5) return "Severe";
    else if (risk >= 0.3) return "Intermediate";
    else return "Low";
  };

  const trainClassifier = async () => {
    const trainingData = [
      {
        input: {
          age: 50,
          symptoms: 1,
          alcohol: 1,
          smoking: 0,
          smokingYears: 20,
          cigarettesPerDay: 10,
        },
        output: { hasCOPD: 1 },
      },
      {
        input: {
          age: 60,
          symptoms: 0,
          alcohol: 0,
          smoking: 1,
          smokingYears: 30,
          cigarettesPerDay: 15,
        },
        output: { hasCOPD: 1 },
      },
      {
        input: {
          age: 45,
          symptoms: 1,
          alcohol: 0,
          smoking: 0,
          smokingYears: 0,
          cigarettesPerDay: 0,
        },
        output: { hasCOPD: 0 },
      },
    ];

    const xs = tf.tensor2d(
      trainingData.map((item) => [
        item.input.age,
        item.input.symptoms,
        item.input.alcohol,
        item.input.smoking,
        item.input.smokingYears,
        item.input.cigarettesPerDay,
      ])
    );
    const ys = tf.tensor2d(trainingData.map((item) => [item.output.hasCOPD]));

    const inputShape = [6];
    const outputShape = [1];

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 8, inputShape, activation: "relu" }));
    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

    model.compile({ optimizer: "adam", loss: "binaryCrossentropy" });

    await model.fit(xs, ys, { epochs: 100 });

    setModel(model);
    console.log(model);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const {
      patientName,
      age,
      isSmoking,
      smokingYears,
      cigarettesPerDay,
      symptoms,
      alcoholConsumption,
    } = formData;

    if (
      !patientName ||
      !age ||
      (isSmoking && (!smokingYears || !cigarettesPerDay))
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    let risk = "No";

    if (isSmoking) {
      const years = parseInt(smokingYears, 10);
      const cigarettes = parseInt(cigarettesPerDay, 10);
      risk = ((years * cigarettes) / age).toFixed(2);
    }

    setFormData({ ...formData, copdRisk: risk });
  };

  const predictCOPD = async () => {
    if (!model) {
      alert("Please train the classifier first.");
      return;
    }

    const {
      age,
      symptoms,
      alcoholConsumption,
      isSmoking,
      smokingYears,
      cigarettesPerDay,
    } = formData;

    const input = tf.tensor2d([
      [
        parseFloat(age),
        symptoms === "chronic cough" ? 1 : 0,
        alcoholConsumption === "yes" ? 1 : 0,
        isSmoking ? 1 : 0,
        parseFloat(smokingYears),
        parseFloat(cigarettesPerDay),
      ],
    ]);

    const result = model.predict(input).dataSync()[0];
    console.log(result);
    const hasCOPD = result >= 0.5 ? "Yes" : "No";
    const risk = isNaN(result) ? "0" : result.toFixed(3);
    const severity = calculateCOPDSeverity(result);

    // setFormData({ ...formData, copdRisk: risk });
    setFormData({ ...formData, copdRisk: result.toFixed(3), hasCOPD });

    try {
      await db.collection("patients").add({
        patientName: formData.patientName,
        age: parseInt(formData.age, 10),
        isSmoking: formData.isSmoking,
        smokingYears: parseInt(formData.smokingYears, 10),
        cigarettesPerDay: parseInt(formData.cigarettesPerDay, 10),
        symptoms: formData.symptoms === "chronic cough",
        alcoholConsumption: formData.alcoholConsumption === "yes",
        copdRisk: result,
        hasCOPD,
      });
      alert("Patient data added successfully!");
    } catch (error) {
      console.error("Error adding patient data: ", error);
      alert("Error adding patient data. Please try again later.");
    }
  };

  const handleTrainClassifier = () => {
    trainClassifier();
    alert("Classifier trained successfully!");
  };

  const handleViewRecords = () => {
    setShowRecords(true);
  };

  const handleClearForm = () => {
    setFormData({
      patientName: "",
      age: "",
      isSmoking: false,
      smokingYears: "",
      cigarettesPerDay: "",
      copdRisk: "",
    });
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await db.collection("patients").doc(recordId).delete();
      setRecords(records.filter((record) => record.id !== recordId));
      alert("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record: ", error);
      alert("Error deleting record. Please try again later.");
    }
  };

  return (
    <section className="bg-yellow-100">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-center">
          COPD Detection Using tensorflow Feedforward neural network
        </h1>
      </div>

      <div className="max-w-md p-6 mx-auto mt-10 bg-gray-100 rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-bold">Patient Information Form</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Patient Name:</label>
            <input
              className="block w-full px-4 py-2 border rounded-md"
              type="text"
              // value={patientName}
              // onChange={(e) => setPatientName(e.target.value)}
              value={formData.patientName}
              onChange={(e) =>
                setFormData({ ...formData, patientName: e.target.value })
              }
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Age:</label>
            <input
              className="block w-full px-4 py-2 border rounded-md"
              type="number"
              // value={age}
              // onChange={(e) => setAge(e.target.value)}
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="" className="block mb-2">
              Symptoms:
            </label>
            <select
              className="block w-full px-4 py-2 border rounded-md"
              value={formData.symptoms}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  symptoms: e.target.value,
                  copdRisk: "",
                })
              }
            >
              <option value="" disabled hidden>
                Choose here
              </option>
              <option value="chronic cough">Chronic Cough</option>
              <option value="shortness of breath">Shortness of Breath</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Alcohol consumption</label>
            <input
              type="radio"
              value="yes"
              checked={formData.alcoholConsumption === "yes"}
              onChange={() =>
                setFormData({ ...formData, alcoholConsumption: "yes" })
              }
              className="mr-2"
            />
            Yes
            <input
              type="radio"
              value="no"
              checked={formData.alcoholConsumption === "no"}
              onChange={() =>
                setFormData({ ...formData, alcoholConsumption: "no" })
              }
              className="ml-4 mr-2"
            />
            No
          </div>
          <div className="mb-4">
            <label className="block mb-2">Is Smoking:</label>
            <input
              type="radio"
              // checked={isSmoking}
              // onChange={() => setIsSmoking(true)}
              checked={formData.isSmoking}
              onChange={() => setFormData({ ...formData, isSmoking: true })}
              className="mr-2"
            />
            Yes
            <input
              type="radio"
              // checked={!isSmoking}
              // onChange={() => setIsSmoking(false)}
              checked={!formData.isSmoking}
              onChange={() => setFormData({ ...formData, isSmoking: false })}
              className="ml-4 mr-2"
            />
            No
          </div>

          {formData.isSmoking && (
            <>
              <div className="mb-4">
                <label className="block mb-2">Smoking Years:</label>
                <input
                  className="block w-full px-4 py-2 border rounded-md"
                  type="number"
                  value={formData.smokingYears}
                  // onChange={(e) => setSmokingYears(e.target.value)}
                  onChange={(e) =>
                    setFormData({ ...formData, smokingYears: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Cigarettes Per Day:</label>
                <input
                  className="block w-full px-4 py-2 border rounded-md"
                  type="number"
                  value={formData.cigarettesPerDay}
                  // onChange={(e) => setCigarettesPerDay(e.target.value)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cigarettesPerDay: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}
          <div className="flex gap-4">
            <button
              type="button"
              className="px-4 py-2 font-bold text-white bg-yellow-500 rounded hover:bg-yellow-700"
              onClick={handleTrainClassifier}
            >
              Train Classifier
            </button>
            <button
              type="button"
              className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
              onClick={predictCOPD}
            >
              Detect COPD
            </button>
            <button
              type="button"
              className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
              onClick={handleClearForm}
            >
              Clear
            </button>
          </div>
        </form>

        {formData.copdRisk && (
          <p className="mt-4">
            COPD Risk: {formData.copdRisk} - Severity:{" "}
            {calculateCOPDSeverity(parseFloat(formData.copdRisk))}
          </p>
        )}
      </div>
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={handleViewRecords}
        >
          View Earlier Records
        </button>
      </div>

      {showRecords && (
        <div className="mt-4">
          <ul className="divide-y divide-gray-200">
            {showRecords && (
              <div className="flex flex-col items-center justify-center mt-4 ">
                <h3 className="mb-2 text-xl font-bold text-center">
                  Earlier Records:
                </h3>
                <div className="flex justify-center w-full max-w-lg">
                  <table className="w-full overflow-hidden border border-collapse border-gray-300 rounded-md shadow-md">
                    <thead className="text-white bg-blue-500">
                      <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Age</th>
                        <th className="px-4 py-2">Smoking</th>
                        <th className="px-4 py-2">Symptoms</th>
                        <th className="px-4 py-2">COPD Risk</th>
                        <th className="px-4 py-2">Severity</th>
                        <th className="px-4 py-2">Has COPD</th>
                        <th className="px-4 py-2">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id} className="bg-white">
                          <td className="px-4 py-2">{record.patientName}</td>
                          <td className="px-4 py-2">{record.age}</td>
                          <td className="px-4 py-2">
                            {record.isSmoking ? "Yes" : "No"}
                          </td>
                          <td className="px-4 py-2">
                            {record.symptoms
                              ? "Chronic Cough"
                              : "Shortness of Breath"}
                          </td>

                          <td className="px-4 py-2">
                            {typeof record.copdRisk === "number" &&
                            !isNaN(record.copdRisk)
                              ? record.copdRisk.toFixed(3)
                              : "No"}
                          </td>
                          <td className="px-4 py-2">
                            {typeof record.copdRisk === "number" &&
                            !isNaN(record.copdRisk)
                              ? calculateCOPDSeverity(
                                  parseFloat(record.copdRisk)
                                )
                              : "N/A"}
                          </td>
                          <td className="px-4 py-2">{record.hasCOPD}</td>
                          <td className="px-4 py-2">
                            <button
                              className="px-2 py-1 text-white bg-red-500 rounded"
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </ul>
        </div>
      )}
    </section>
  );
};

export default App;
