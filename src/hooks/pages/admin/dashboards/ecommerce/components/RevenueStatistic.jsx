import { Card, CardBody, Tab, Tabs } from "@/components/daisyui";

import { currencyHelper, stringHelper } from "@/helpers";

import { useEcommerceDashboard } from "../use-ecommerce-dashboard";
import { DashboardRevenueChart } from "./RevenueChart";

const DashboardRevenueStatistic = () => {
  const { setOverviewDuration, overviewDuration, overviewStat } =
    useEcommerceDashboard();

  return (
    <Card className="bg-base-100">
      <CardBody className="px-0 pb-0">
        <div className="px-6">
          <div className="flex items-center justify-between">
            <span className="font-medium">Revenue Statistics</span>
            <Tabs variant="boxed" size={"sm"}>
              <Tab
                onClick={() => setOverviewDuration("day")}
                active={overviewDuration == "day"}
              >
                Day
              </Tab>
              <Tab
                onClick={() => setOverviewDuration("month")}
                active={overviewDuration == "month"}
              >
                Month
              </Tab>
              <Tab
                onClick={() => setOverviewDuration("year")}
                active={overviewDuration == "year"}
              >
                Year
              </Tab>
            </Tabs>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-4xl/none font-semibold">
              {currencyHelper.sign}
              {stringHelper.convertToCurrency(overviewStat.amount)}K
            </span>
            <span className="text-sm font-medium text-success">
              +{overviewStat.percent}%
            </span>
          </div>
          <span className="text-sm text-base-content/70">
            Total income in this {overviewDuration}
          </span>
        </div>
        <div className="overflow-hidden rounded-xl">
          <DashboardRevenueChart />
        </div>
      </CardBody>
    </Card>
  );
};

export { DashboardRevenueStatistic };
