import Chart from "../pages/user/chart";
import Login from "../pages/user/login";
import Register from "../pages/user/register";

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
