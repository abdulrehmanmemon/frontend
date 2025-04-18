import { Helmet } from "react-helmet-async";

const PageMetaData = ({ title }) => {
  return (
    <Helmet>
      <title> {title} | Nexus, Client & Admin React Dashboard</title>
    </Helmet>
  );
};

export { PageMetaData };
