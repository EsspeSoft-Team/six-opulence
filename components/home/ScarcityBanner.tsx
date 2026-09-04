"use client";

import { useEffect, useState } from "react";

export default function ScarcityBanner({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    function updateTimer() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <section className="scarcity-banner">
      <div>
        <p style={{ fontWeight: 600, margin: 0 }}>Only 2,000 pieces ever made.</p>
        <p style={{ fontSize: 14, color: "#666", margin: "4px 0 0" }}>
          When each design sells out, it will not be restocked.
        </p>
      </div>
      <div className="countdown">
        {units.map((unit) => (
          <div className="countdown-unit" key={unit.label}>
            <div className="value">{String(unit.value).padStart(2, "0")}</div>
            <div className="label">{unit.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
