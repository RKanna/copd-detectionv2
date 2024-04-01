import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Copd from "./Copd";
import LoginPage from "./Login";
import RegisterPage from "./Registration";
import Welcome from "./Welcome";
import PostLogin from "./PostLogin";
import EarlierRecords from "./EarlierRecords";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/Copd" element={<Copd />} />
          <Route path="/" element={<Welcome />} />
          <Route path="/Registration" element={<RegisterPage />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/PostLogin" element={<PostLogin />} />
          <Route path="/Records" element={<EarlierRecords />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
