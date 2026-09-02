import { useEffect, useState } from "react";

interface TimerProps {
  startTime?: number | string;
  status?: string;
}

export default function Timer({ startTime, status }: TimerProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (status === "running" && startTime) {
      interval = setInterval(() => {
        const seconds = Math.floor(
          (Date.now() - new Date(startTime)) / 1000
        );
        setTime(seconds);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [startTime, status]);

  return <p>⏱ {time}s</p>;
}