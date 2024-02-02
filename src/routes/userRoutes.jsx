import Chart from "../pages/User/chart";
import Login from "../pages/User/login";
import Register from "../pages/User/register";

export const userRoutes = [
  {
    path: "/",
    element: <Chart />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
];
