"use client";
import useSWR from "swr";
import type { BagItem } from "./bag";
import type { User } from "./auth";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError(res.status, (data as { error?: string }).error ?? "Request failed");
  return data as T;
}

export const fetcher = <T,>(url: string) => api<T>(url);

export function useBag() {
  return useSWR<{ items: BagItem[] }>("/api/bag", fetcher, { refreshInterval: 30_000 });
}

export function useMe() {
  return useSWR<{ user: User | null }>("/api/auth/me", fetcher);
}
