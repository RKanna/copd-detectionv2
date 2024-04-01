import React from "react";
import { useUser } from "./Context";
import {
  signInAuthUserWithEmailAndPassword,
  createUserDocumentFromAuth,
  updateProfile,
} from "./firebase";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "./firebase";
import { useState } from "react";

const LoginPage = () => {
  const { userDetails, setUserDetails, getUserProfileInfoFromFirestore } =
    useUser();
  const { userEmail, password, confirmPassword } = userDetails;

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("hit");
    if (userEmail && password) {
      try {
        const { user } = await signInAuthUserWithEmailAndPassword(
          userEmail,
          password
        );
        console.log({ user });
        setUserDetails({ userEmail: "", password: "", confirmPassword: "" });

        if (user) {
          //   const { uid, userName, userEmail } = user;

          const { userName } = userDetails;
          user.displayName = userName;
          await updateUserProfile(user, userName);

          const { uid, displayName, email } = user;
          localStorage.setItem("UID", uid);
          localStorage.setItem("userName", displayName);
          localStorage.setItem("userEmail", email);
          getUserProfileInfoFromFirestore(uid);
          //   navigate("/PostLogin");
          setTimeout(() => {
            setLoading(false); // Set loading state back to false after 2 seconds
            navigate("/PostLogin");
          }, 2000);
        }
      } catch (err) {
        console.log("Error Occurd while Login", err.message);
        console.log(err.code);
        if (err.code === "auth/invalid-credential") {
          alert("Invalid Credentials");
        }
        setLoading(false);
      }
    }
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 bg-white rounded shadow-md w-80">
        <h1 className="mb-6 text-2xl font-bold">Login</h1>
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="userEmail"
              onChange={changeHandler}
              placeholder="Enter your email"
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={changeHandler}
              placeholder="Enter your password"
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {/* Sign in */}
            {loading ? (
              <svg
                className="w-5 h-5 mr-3 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"
                viewBox="0 0 24 24"
              ></svg>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
