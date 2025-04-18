import arrowDownIcon from "@iconify/icons-lucide/arrow-down";
import arrowUpIcon from "@iconify/icons-lucide/arrow-up";

import { Card, CardBody } from "@/components/daisyui";

import { Icon } from "@/components/Icon";

import { useEcommerceDashboard } from "../use-ecommerce-dashboard";
import { DashboardVisitorChart } from "./VisitorChart";

const CustomerInteraction = ({ interaction }) => {
  const { title, amount, percent } = interaction;
  return (
    <div className="text-center">
      <p className="text-base font-medium">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{amount}</p>
      <div
        className={`mt-1 inline-flex items-center gap-1 ${
          percent > 0 ? "text-success" : "text-error"
        }`}
      >
        {percent >= 0 && <Icon icon={arrowUpIcon} fontSize={16} />}
        {percent < 0 && <Icon icon={arrowDownIcon} fontSize={16} />}
        <p className="text-sm">{percent}%</p>
      </div>
    </div>
  );
};

const DashboardVisitorWidget = () => {
  const { customerInteractions } = useEcommerceDashboard();

  return (
    <Card className="bg-base-100">
      <CardBody className="p-0">
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="font-medium">Customer Acquisition</span>
        </div>
        <div className="mt-2 border-y border-base-content/10 py-2">
          <div className="grid grid-cols-3 gap-5 divide-x divide-base-content/10">
            {customerInteractions.map((interaction, index) => (
              <CustomerInteraction interaction={interaction} key={index} />
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="overflow-hidden rounded-lg">
            <DashboardVisitorChart />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export { DashboardVisitorWidget };
