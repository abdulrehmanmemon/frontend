import messagesSquareIcon from "@iconify/icons-lucide/messages-square";

import { Button, Card, CardBody, maskClassesFn } from "@/components/daisyui";

import { Icon } from "@/components/Icon";
import { cn, dateHelper } from "@/helpers";

import { useEcommerceDashboard } from "../use-ecommerce-dashboard";

const DashboardQuickChat = () => {
  const { recentMessages } = useEcommerceDashboard();

  return (
    <Card className="bg-base-100">
      <CardBody>
        <div className="flex items-center gap-3">
          <Icon
            icon={messagesSquareIcon}
            className="text-base-content/80"
            fontSize={16}
          />
          <span className="font-medium">Quick Chat</span>
        </div>
        <div className="mt-2">
          {recentMessages.slice(0, 4).map((chat, index) => (
            <div
              key={index}
              className="flex cursor-pointer gap-4 rounded-box bg-transparent p-2.5 transition-all hover:bg-base-content/10 active:scale-[.98] active:bg-base-content/15"
            >
              <img
                src={chat.image}
                alt={"chat image"}
                height={40}
                width={40}
                className={cn(
                  "size-10 bg-base-content/10 p-0.5",
                  maskClassesFn({ variant: "squircle" })
                )}
              />

              <div className="grow">
                <div className="flex">
                  <p className="grow font-medium">{chat.name}</p>
                  <span className="text-xs text-base-content/60">
                    {" "}
                    {dateHelper.formatted(chat.date, { format: "hh:mm A" })}
                  </span>
                </div>
                <p className="line-clamp-1 text-ellipsis text-sm/none text-base-content/80">
                  {chat.message}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <Button variant={"outline"} color={"ghost"} size={"sm"}>
            Go To Chat
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export { DashboardQuickChat };
