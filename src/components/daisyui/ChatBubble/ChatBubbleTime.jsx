import { forwardRef } from "react";

import { cn } from "@/helpers";

const ChatBubbleTime = forwardRef(({ className, ...props }, ref) => (
  <time {...props} className={cn("text-xs opacity-50", className)} ref={ref} />
));

ChatBubbleTime.displayName = "Chat Bubble Time";

export default ChatBubbleTime;
