"use client";
import { longDate, openingTime } from "@/lib/format";
import { useMounted } from "./hooks";

const formats = { opening: openingTime, long: longDate };

/** Renders a date in the viewer's own timezone (client-only, so server and client HTML match). */
export function LocalTime({ iso, format }: { iso: string; format: keyof typeof formats }) {
  return <span>{useMounted() ? formats[format](iso) : " "}</span>;
}
