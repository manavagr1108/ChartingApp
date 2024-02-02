import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chart from "./screens/chart";
import Login from "./screens/login";
import Register from "./screens/register";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Chart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
