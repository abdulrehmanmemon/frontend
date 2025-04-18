import { Route, Routes } from "react-router-dom";

import { AdminLayoutWrapper } from "@/pages/admin/layout";

import { registerRoutes } from "./register";

const Router = (props) => {
  return (
    <Routes>
      <Route>
        {registerRoutes.admin.map((route, index) => (
          <Route
            key={"admin-" + index}
            path={route.path}
            element={
              <AdminLayoutWrapper {...props}>
                {route.element}
              </AdminLayoutWrapper>
            }
          />
        ))}
      </Route>
    </Routes>
  );
};

export { Router };
