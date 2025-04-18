import avatar1 from "@/assets/images/avatars/1.png";
import menuIcon from "@iconify/icons-lucide/menu";
import userIcon from "@iconify/icons-lucide/user";
import signOutIcon from "@iconify/icons-lucide/log-out";  // Import sign-out icon

import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Navbar, NavbarCenter, NavbarEnd, NavbarStart } from "@/components/daisyui";
import { Icon } from "@/components/Icon";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { useLayoutContext } from "@/contexts/layout";
import { useNavigate } from "react-router-dom";  // Import useNavigate for redirect
import { signOutUser } from "../../utils/supabaseAuth";

const Topbar = () => {
  const { hideLeftbar, state } = useLayoutContext();
  const navigate = useNavigate();  // Hook to navigate to other pages

  const toggleLeftbar = () => {
    hideLeftbar(!state.leftbar.hide); // Toggle the hideLeftbar state
  };

  const handleSignOut = async () => {
    try {
      await signOutUser(); // Call your sign out logic here
      console.log('User signed out.');
      navigate('/display');  // Redirect to the desired route after sign out
    } catch (error) {
      console.error('Error during sign out:', error.message);
    }
  };

  return (
    <div>
      <Navbar className="topbar-wrapper z-10 border-b border-base-200 px-3">
        {/* Left Side: Menu Toggle and Logo */}
        <NavbarStart className="gap-3">
          {/* Toggle Leftbar */}
          <Button
            shape="square"
            color="ghost"
            size="sm"
            aria-label="Leftmenu toggle"
            onClick={toggleLeftbar} // On click, toggle Leftbar visibility
          >
            <Icon icon={menuIcon} className="inline-block" fontSize={20} />
          </Button>
        </NavbarStart>

        {/* Center: Optional Title or Empty */}
        <NavbarCenter>
          <h1 className="text-lg font-semibold">Quantuma</h1>
        </NavbarCenter>

        {/* Right Side: Theme, Notifications, User Avatar */}
        <NavbarEnd className="gap-1.5">
          {/* Theme Toggle */}
          <ThemeToggleButton shape="circle" color="ghost" size="sm" />

          <Button onClick={handleSignOut}  size="sm" color="secondary" variant="outline" className="rounded-lg">
          Sign Out    <Icon icon={signOutIcon} fontSize={16}/> 
                </Button>
        </NavbarEnd>
      </Navbar>
    </div>
  );
};

export { Topbar };
