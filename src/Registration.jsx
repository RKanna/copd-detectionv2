import React from "react";
import { useUser } from "./Context";
import {
  createAuthUserWithEmailAndPassword,
  createUserDocumentFromAuth,
} from "./firebase";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { userDetails, setUserDetails } = useUser();

  const { userName, userEmail, password, confirmPassword } = userDetails;

  const navigate = useNavigate();
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Password do not Match");
      return;
    }
    try {
      const { user } = await createAuthUserWithEmailAndPassword(
        userEmail,
        password
      );

      const userDocRef = await createUserDocumentFromAuth(user, {
        userName,
        userEmail,
      });

      if (userDocRef) {
        alert("SignUp Success");
        navigate("/Login");
      }
    } catch (err) {
      console.log("Something Happened", err.message);
      console.log(err.code);
      if (err.code === "auth/email-already-in-use") {
        alert("Email Already Exists Please use alternate Email");
      } else if (err.code === "auth/weak-password") {
        alert("Password must be at least 6 characters long");
      }
    }
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="mb-8 text-4xl">Register New User</h1>

      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col">
          <label htmlFor="username" className="text-lg">
            Username
          </label>
          <input
            type="text"
            id="userName"
            name="userName"
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter your username"
            onChange={changeHandler}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="text-lg">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="userEmail"
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter your email"
            onChange={changeHandler}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="text-lg">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter your password"
            onChange={changeHandler}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="confirmpassword" className="text-lg">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Confirm your password"
            onChange={changeHandler}
          />
        </div>

        <div className="flex justify-center">
          <button
            className="px-8 py-4 text-xl text-white bg-blue-500 rounded-lg"
            onClick={submitHandler}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
