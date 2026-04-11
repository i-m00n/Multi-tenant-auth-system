import { useState, useEffect } from "react";
import { getsdk } from "../sdk";

export function useTokenCountdown() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [justRefreshed, setJustRefreshed] = useState(false);

  useEffect(() => {
    const tick = () => {
      const expiresAt = getsdk().tokenExpiresAt;
      if (!expiresAt) {
        setSecondsLeft(null);
        return;
      }

      const prev = secondsLeft;
      const next = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsLeft(next);

      if (prev !== null && next > prev + 5) {
        setJustRefreshed(true);
        setTimeout(() => setJustRefreshed(false), 3000);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  return { secondsLeft, justRefreshed };
}
