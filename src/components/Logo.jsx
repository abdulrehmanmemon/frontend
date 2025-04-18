// NOTE: If you using svg logo
import logoDark from "@/assets/images/logo/logo-dark.svg";
import logoLight from "@/assets/images/logo/logo-light.svg";

// NOTE: If you need png/jpeg logo then uncomment, this 2 lines
// import logoDark from "@/assets/images/logo/logo-dark.png";
// import logoLight from "@/assets/images/logo/logo-light.png";

const Logo = ({ size = 24 }) => {
  return (
    <div className="inline">
      <img
        src={logoDark}
        height={size}
        alt="logo-dark"
        className="hidden dark:inline"
        style={{ height: size + "px" }}
      />
      <img
        src={logoLight}
        height={size}
        alt="logo-light"
        className="inline dark:hidden"
        style={{ height: size + "px" }}
      />
    </div>
  );
};

export { Logo };
