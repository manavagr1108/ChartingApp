import "./App.css";
import Chart from "./screens/chart";
import Login from "./screens/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Chart />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
