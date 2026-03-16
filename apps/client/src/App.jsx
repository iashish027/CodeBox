import "./App.css";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="main-container min-w-fit w-9/10 mx-auto h-screen bg-white">
      <Header />
      <Navbar />
      <AppRoutes />
    </div>
  );
}

export default App;
