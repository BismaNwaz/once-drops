"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SWRConfig } from "swr";
import { fetcher } from "@/lib/client";

type UI = { bagOpen: boolean; openBag: () => void; closeBag: () => void; toast: (msg: string) => void };
const UIContext = createContext<UI | null>(null);

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <Providers>");
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [bagOpen, setBagOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const toast = useCallback((msg: string) => setMessage(msg), []);
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3200);
    return () => clearTimeout(id);
  }, [message]);

  useEffect(() => {
    document.body.style.overflow = bagOpen ? "hidden" : "";
  }, [bagOpen]);

  return (
    <SWRConfig value={{ fetcher, revalidateOnFocus: true }}>
      <UIContext.Provider value={{ bagOpen, openBag: () => setBagOpen(true), closeBag: () => setBagOpen(false), toast }}>
        {children}
        {message && (
          <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 animate-rise rounded-full bg-ink px-5 py-3 text-sm text-paper shadow-2xl">
            {message}
          </div>
        )}
      </UIContext.Provider>
    </SWRConfig>
  );
}
