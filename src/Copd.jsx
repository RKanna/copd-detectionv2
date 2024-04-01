import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useUser } from "./Context";
import { useNavigate } from "react-router-dom";

const Copd = () => {
  const {
    calculateCOPDSeverity,
    formData,
    setFormData,
    records,
    setRecords,
    showRecords,
    setShowRecords,
  } = useUser();

  const {
    patientName,
    age,
    isSmoking,
    smokingYears,
    cigarettesPerDay,
    symptoms,
    alcoholConsumption,
    copdRisk,
    emailUser,
  } = formData;

  const [model, setModel] = useState(null);

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
      const docRef = await addDoc(collection(db, "patients"), {
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
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("userNameNew");
    localStorage.removeItem("UID");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <section className="pb-10 bg-yellow-100">
      <nav className="flex items-center justify-between p-4 text-white bg-gray-900">
        <div className="flex items-center">
          <span className="text-2xl font-bold">
            COPD Detection Using Tensorflow Feedforward Neural Network
          </span>
        </div>
        <div className="flex items-center">
          <button
            className="px-4 py-2 mr-2 bg-blue-500 rounded hover:bg-blue-700"
            // onClick={handleHome}
          >
            Home
          </button>

          <button
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

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
    </section>
  );
};

export default Copd;
