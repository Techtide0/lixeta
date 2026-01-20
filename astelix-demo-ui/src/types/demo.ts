export type ChannelType = "SMS" | "EMAIL" | "PUSH" | "SYSTEM";

export interface TimelineEvent {
  relativeTime: string;
  message: string;
  type: "info" | "action" | "rule" | "warning" | "error";
  channel?: ChannelType;
}

export interface MessageLifecycle {
  id: string;
  utcTime: string;
  senderLocal: string;
  receiverLocal: string;
  status: string;
}
