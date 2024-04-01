import React, { useEffect } from "react";
import { useUser } from "./Context";

const EarlierRecords = () => {
  const {
    records,
    showRecords,
    setShowRecords,
    fetchRecords,
    calculateCOPDSeverity,
    handleDeleteRecord,
  } = useUser();

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="mt-4">
      <ul className="divide-y divide-gray-200">
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
                        ? calculateCOPDSeverity(parseFloat(record.copdRisk))
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
      </ul>
    </div>
  );
};

export default EarlierRecords;
