import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useLayoutContext } from "@/contexts/layout";

import { adminMenuItems } from "./menu";
import { Leftbar } from "./slots/Leftbar";
import { Topbar } from "./slots/Topbar";

const AdminLayout = ({ children }) => {
  const { hideLeftbar, hideMobileLeftbar } = useLayoutContext();

  const { pathname } = useLocation();

  useEffect(() => {
    hideMobileLeftbar();
  }, [pathname]);

  return (
    <>
      {
        <div className="size-full">
          <div className="flex overflow-hidden">
            <Leftbar menuItems={adminMenuItems} />
            <div className="main-wrapper overflow-auto">
              <div className="flex h-full flex-col">
                <Topbar />
                <div className="content-wrapper">{children}</div>
              </div>
            </div>
          </div>
          <div className="leftbar-backdrop" onClick={() => hideLeftbar()}></div>
        </div>
      }
    </>
  );
};
export default AdminLayout;
