import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { userRoutes } from "./routes/userRoutes";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {userRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element}>
              {route.children}
            </Route>
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
