import { LayoutContextProvider } from "@/contexts/layout";

import AdminLayout from "./(layout)";

const AdminLayoutWrapper = ({ children }) => {
  return (
    <LayoutContextProvider>
      <AdminLayout>{children}</AdminLayout>
    </LayoutContextProvider>
  );
};

export { AdminLayoutWrapper };
