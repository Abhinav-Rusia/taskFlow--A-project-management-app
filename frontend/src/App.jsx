import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import Login from "./components/pages/Login";
import Dashboard from "./components/pages/Dashboard";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;
