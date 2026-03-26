// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import NurseFormPage from "./NurseFormPage"; // separate component
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/nurse-form/:token" element={<NurseFormPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();