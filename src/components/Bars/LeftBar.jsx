import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

import { Menu, MenuItem } from "@/components/daisyui";
import { Icon } from "@/components/Icon";

const Leftbar = ({ hideLeftbar }) => {
  return (
    <div className={`leftmenu-wrapper ${hideLeftbar ? "hidden" : "block"}`}>
      {/* Logo */}
      <Link to="/" className="flex h-16 items-center justify-center">
        <h1 className="text-lg font-semibold">Quantuma</h1>
      </Link>

      {/* Navigation Menu */}
      <SimpleBar>
        <Menu>
          {/* Home */}
          <MenuItem className="mb-0.5">
            <Link to="/" className="flex items-center gap-2">
              Home
            </Link>
          </MenuItem>

          {/* Segments */}
          <MenuItem>
            <details className="collapse">
              <summary>
                Segments
              </summary>
              <div className="collapse-content">
                <MenuItem>
                  <Link to="/segments" className="flex items-center gap-2">
                    All Segments
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link to="/auto-segment" className="flex items-center gap-2">
                    Auto-Segment
                  </Link>
                </MenuItem>
              </div>
            </details>
          </MenuItem>

          {/* Actions */}
          <MenuItem className="mb-0.5">
            <Link to="/actions" className="flex items-center gap-2">
              Actions
            </Link>
          </MenuItem>
          
          {/* Agents Section */}
          <MenuItem>
            <details className="collapse">
              <summary>
                Agents
              </summary>
              <div className="collapse-content">
                <MenuItem>
                  <Link to="/chatbot" className="flex items-center gap-2">
                    Deal Chat
                  </Link>
                </MenuItem>

                <MenuItem>
                  <Link to="/companies" className="flex items-center gap-2">
                    Financial Analysis
                  </Link>
                </MenuItem>
              </div>
            </details>
          </MenuItem>
        </Menu>
      </SimpleBar>
    </div>
  );
};

export { Leftbar };
