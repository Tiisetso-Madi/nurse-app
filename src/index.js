// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ForgotPassword from "./ForgotPassword";
import App from "./App";
import NurseFormPage from "./NurseFormPage"; 
import ResetPassword from "./ResetPassword";
import AdminEdit from "./AdminEdit";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/nurse-form/:token" element={<NurseFormPage />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
         <Route path="/AdminEdit/:id" element={<AdminEdit />} /> 
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
