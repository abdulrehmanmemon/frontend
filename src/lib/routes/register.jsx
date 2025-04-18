import { lazy } from "react";

// Component Wrapper
const cw = (Component) => {
  return <Component />;
};

const dashboardRoutes = [
  {
    path: "/",
    name: "dashboard",
    element: cw(lazy(() => import("@/pages/admin/dashboards/ecommerce"))),
  },
];

const registerRoutes = {
  admin: [...dashboardRoutes],
};

export { registerRoutes };
