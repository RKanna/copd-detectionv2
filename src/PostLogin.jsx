import React from "react";
import { Link } from "react-router-dom";

const PostLogin = () => {
  //   const storedEmail = localStorage.getItem("userEmail");
  const storedUserName = localStorage.getItem("userNameNew");
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Welcome Back!</h1>
        <h2 className="mb-6 text-3xl font-bold text-gray-800">
          {storedUserName}
        </h2>
        <p className="mb-6 text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
          scelerisque magna sed est accumsan, nec bibendum ex pellentesque.
        </p>
        <Link
          to={`/Copd`}
          className="px-4 py-2 text-white bg-blue-500 rounded-md shadow-md hover:bg-blue-600"
        >
          Detect COPD
        </Link>
        <button className="px-4 py-2 ml-4 text-gray-800 bg-gray-300 rounded-md shadow-md hover:bg-gray-400">
          Logout
        </button>
      </div>
    </div>
  );
};

export default PostLogin;
