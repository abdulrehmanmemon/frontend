import { forwardRef } from "react";

import { cn } from "@/helpers";

const ChatBubbleHeader = forwardRef(({ className, ...props }, ref) => (
  <div {...props} className={cn("chat-header", className)} ref={ref} />
));

ChatBubbleHeader.displayName = "Chat Bubble Header";

export default ChatBubbleHeader;
