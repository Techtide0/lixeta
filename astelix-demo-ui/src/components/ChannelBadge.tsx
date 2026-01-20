import React from "react";
import { ChannelType } from "../types/demo";

const channelColors: Record<ChannelType, string> = {
  SMS: "badge-sms",
  EMAIL: "badge-email",
  PUSH: "badge-push",
  SYSTEM: "badge-system",
};

interface Props {
  channel?: ChannelType;
}

const ChannelBadge: React.FC<Props> = ({ channel = "SYSTEM" }) => {
  return (
    <span
      className={`channel-badge ${channelColors[channel]}`}
      title="Channel simulated — orchestration only"
    >
      {channel}
    </span>
  );
};

export default ChannelBadge;
