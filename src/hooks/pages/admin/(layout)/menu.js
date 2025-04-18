import airplayIcon from "@iconify/icons-lucide/airplay";
import barChartBigIcon from "@iconify/icons-lucide/bar-chart-big";
import fileIcon from "@iconify/icons-lucide/file";
import fileTextIcon from "@iconify/icons-lucide/file-text";
import messagesSquareIcon from "@iconify/icons-lucide/messages-square";
import packageIcon from "@iconify/icons-lucide/package";
import serverIcon from "@iconify/icons-lucide/server";
import shieldCheckIcon from "@iconify/icons-lucide/shield-check";
import storeIcon from "@iconify/icons-lucide/store";

import { routes } from "@/lib/routes";

export const adminMenuItems = [
  {
    key: "dashboard",
    icon: airplayIcon,
    label: "Dashboard",
    url: routes.home,
  },
  {
    key: "apps-label",
    isTitle: true,
    label: "Apps",
  },
  {
    key: "apps-ecommerce",
    icon: storeIcon,
    label: "Ecommerce",
    children: [
      {
        key: "apps-ecommerce-orders",
        label: "Orders",
      },
      {
        key: "apps-ecommerce-products",
        label: "Products",
      },
      {
        key: "apps-ecommerce-sellers",

        label: "Sellers",
      },
      {
        key: "apps-ecommerce-customers",

        label: "Customers",
      },
      {
        key: "apps-ecommerce-shops",
        label: "Shops",
      },
    ],
  },
  {
    key: "apps-file-manager",
    icon: serverIcon,
    label: "File Manager",
  },
  {
    key: "apps-chat",
    icon: messagesSquareIcon,
    label: "Chat",
  },

  {
    key: "label-pages",
    isTitle: true,
    label: "Pages",
  },
  {
    key: "landing",
    icon: fileIcon,
    label: "Landing",
  },
  {
    key: "auth",
    icon: shieldCheckIcon,
    label: "Auth",
    children: [
      {
        key: "auth-login",
        label: "Login",
      },
      {
        key: "auth-register",
        label: "Register",
      },
      {
        key: "auth-forgot-password",
        label: "Forgot Password",
      },
      {
        key: "auth-reset-password",
        label: "Reset Password",
      },
    ],
  },
  {
    key: "label-ui-showcase",
    isTitle: true,
    label: "UI Showcase",
  },
  {
    key: "components",
    icon: packageIcon,
    label: "Components",
    children: [
      {
        key: "components-accordion",
        label: "Accordion",
      },
      {
        key: "components-alert",
        label: "Alert",
      },
      {
        key: "components-avatar",
        label: "Avatar",
      },
      {
        key: "components-badge",
        label: "Badge",
      },
      {
        key: "components-breadcrumb",
        label: "Breadcrumb",
      },
      {
        key: "components-button",
        label: "Button",
      },
      {
        key: "components-countdown",
        label: "Countdown",
      },
      {
        key: "components-drawer",
        label: "Drawer",
      },
      {
        key: "components-dropdown",
        label: "Dropdown",
      },

      {
        key: "components-loading",
        label: "Loading",
      },
      {
        key: "components-menu",
        label: "Menu",
      },
      {
        key: "components-modal",
        label: "Modal",
      },

      {
        key: "components-pagination",
        label: "Pagination",
      },
      {
        key: "components-progress",
        label: "Progress",
      },
      {
        key: "components-step",
        label: "Step",
      },
      {
        key: "components-tab",
        label: "Tab",
      },
      {
        key: "components-timeline",
        label: "Timeline",
      },
      {
        key: "components-toast",
        label: "Toast",
      },

      {
        key: "components-tooltip",
        label: "Tooltip",
      },
    ],
  },
  {
    key: "ui-forms",
    icon: fileTextIcon,
    label: "Forms",
    children: [
      {
        key: "ui-forms-checkbox",
        label: "Checkbox",
      },

      {
        key: "ui-forms-file",
        label: "File",
      },

      {
        key: "ui-forms-input",
        label: "Input",
      },

      {
        key: "ui-forms-radio",
        label: "Radio",
      },

      {
        key: "ui-forms-range",
        label: "Range",
      },

      {
        key: "ui-forms-rating",
        label: "Rating",
      },

      {
        key: "ui-forms-toggle",
        label: "Toggle",
      },
    ],
  },
  {
    key: "charts",
    icon: barChartBigIcon,
    label: "Charts",
    children: [
      {
        key: "charts-apex",
        label: "Apex",
        children: [
          {
            key: "charts-apex-area",
            label: "Area",
          },
          {
            key: "charts-apex-bar",
            label: "Bar",
          },
          {
            key: "charts-apex-column",
            label: "Column",
          },
          {
            key: "charts-apex-line",
            label: "Line",
          },
          {
            key: "charts-apex-pie",
            label: "Pie",
          },
        ],
      },
    ],
  },
];
