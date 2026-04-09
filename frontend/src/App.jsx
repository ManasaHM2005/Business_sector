import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import CanteenDashboard from "./pages/CanteenDashboard";
import PlacementDashboard from "./pages/PlacementDashboard";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/canteen" element={<CanteenDashboard />} />
        <Route path="/placement" element={<PlacementDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
