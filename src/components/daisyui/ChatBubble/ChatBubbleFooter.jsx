import { forwardRef } from "react";

import { cn } from "@/helpers";

const ChatBubbleFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    className={cn("chat-footer opacity-50", className)}
    ref={ref}
  />
));

ChatBubbleFooter.displayName = "Chat Bubble Footer";

export default ChatBubbleFooter;
