import React, { useEffect, useState } from "react";
import { TimelineEvent } from "../types/demo";
import ChannelBadge from "./ChannelBadge";

interface Props {
  events: TimelineEvent[];
}

const TimelineWithDelay: React.FC<Props> = ({ events }) => {
  const [visibleEvents, setVisibleEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    setVisibleEvents([]);

    events.forEach((event, index) => {
      setTimeout(() => {
        setVisibleEvents((prev) => [...prev, event]);
      }, index * 700);
    });
  }, [events]);

  return (
    <div className="timeline-container">
      {visibleEvents.map((event, idx) => (
        <div key={idx} className={`timeline-event event-${event.type}`}>
          <span className="timeline-time">[{event.relativeTime}]</span>

          <ChannelBadge channel={event.channel} />

          <span className="timeline-message">{event.message}</span>
        </div>
      ))}
    </div>
  );
};

export default TimelineWithDelay;
