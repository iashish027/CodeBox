import { Routes, Route } from "react-router-dom";
import SignUp from "../pages/SignUp/SignUp";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
