import { DashboardCounterWidget } from "./components/CounterWidget";
import { DashboardQuickChat } from "./components/QuickChat";
import { DashboardRecentOrder } from "./components/RecentOrder";
import { DashboardRevenueStatistic } from "./components/RevenueStatistic";
import { DashboardTopCountry } from "./components/TopCountry";
import { DashboardVisitorWidget } from "./components/VisitorWidget";

const EcommerceDashboard = () => {
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        <DashboardCounterWidget />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <DashboardRevenueStatistic />
        </div>
        <div className="xl:col-span-5">
          <DashboardVisitorWidget />
        </div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-5 2xl:grid-cols-12">
        {/*TODO: Hide recent order in small screen due to responsive issue*/}
        <div className="hidden sm:block xl:col-span-3 2xl:col-span-5">
          <DashboardRecentOrder />
        </div>
        <div className="xl:order-3 xl:col-span-3 2xl:col-span-4">
          <DashboardTopCountry />
        </div>
        <div className="xl:order-2 xl:col-span-2 2xl:col-span-3">
          <DashboardQuickChat />
        </div>
      </div>
    </>
  );
};

export { EcommerceDashboard };
