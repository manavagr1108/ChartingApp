import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { userRoutes } from "./routes/userRoutes";
import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
function App() {
  return (
    <MantineProvider>
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
    </MantineProvider>
  );
}

export default App;
