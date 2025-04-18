import eyeIcon from "@iconify/icons-lucide/eye";
import globe2Icon from "@iconify/icons-lucide/globe-2";

import { Button, Card, CardBody } from "@/components/daisyui";

import { Icon } from "@/components/Icon";

import { DashboardTopCountryChart } from "./TopCountryChart";

const DashboardTopCountry = () => {
  return (
    <Card className="bg-base-100">
      <CardBody className="gap-0 p-0">
        <div className="flex items-center gap-3 px-5 pt-5">
          <Icon
            icon={globe2Icon}
            className="text-base-content/80"
            fontSize={16}
          />
          <span className="grow font-medium">Top Countries (% in Sales)</span>
          <Button
            startIcon={<Icon icon={eyeIcon} fontSize={16} />}
            color="ghost"
            className={"bg-base-content/5"}
            size={"sm"}
          >
            Overview
          </Button>
        </div>
        <div className="mb-3 me-5">
          <DashboardTopCountryChart />
        </div>
      </CardBody>
    </Card>
  );
};

export { DashboardTopCountry };
