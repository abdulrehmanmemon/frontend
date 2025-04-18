import { forwardRef } from "react";

import { cn } from "@/helpers";

import { Avatar } from "../Avatar";

const ChatBubbleAvatar = forwardRef(
  ({ size = "xs", shape = "circle", className, ...props }, ref) => (
    <Avatar
      size={size}
      shape={shape}
      {...props}
      className={cn("chat-image", className)}
      ref={ref}
    />
  )
);

ChatBubbleAvatar.displayName = "Chat Bubble Avatar";

export default ChatBubbleAvatar;
