import React from "react";
import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="mb-8 text-4xl">Welcome to COPD Detection System</h1>

      <div className="flex justify-center space-x-4">
        <Link
          to={`/Registration`}
          className="px-8 py-4 text-xl text-white bg-blue-500 rounded-lg"
        >
          New User Login
        </Link>
        <Link
          to={`/Login`}
          className="px-8 py-4 text-xl text-white bg-green-500 rounded-lg"
        >
          Existing User Login
        </Link>
      </div>
      <div className="m-10">
        <Link
          to={`/Records`}
          className="p-2 font-bold text-white bg-red-500 rounded-lg"
        >
          View Older Records
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
