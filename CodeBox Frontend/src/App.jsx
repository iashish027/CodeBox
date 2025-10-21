import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
function App() {
  return (
    <div className="main-container w-9/10 md:w-9/10 mx-auto h-screen bg-white k">
      <Header />
      <Navbar/>
    </div>
  );
}

export default App;
