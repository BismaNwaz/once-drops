"use client";
import { useSyncExternalStore } from "react";

/**
 * Current time, ticking every `interval` ms. Returns null during SSR/hydration
 * so countdowns never cause hydration mismatches.
 */
export function useNow(interval = 1000): number | null {
  return useSyncExternalStore(
    (onTick) => {
      const id = setInterval(onTick, interval);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / interval) * interval,
    () => null,
  );
}

const noop = () => () => {};
/** True once running in the browser (false in the server-rendered HTML). */
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}
