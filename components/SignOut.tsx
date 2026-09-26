"use client";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { api } from "@/lib/client";

export function SignOut() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  return (
    <button
      onClick={async () => {
        await api("/api/auth/logout", { method: "POST" });
        await Promise.all([mutate("/api/auth/me"), mutate("/api/bag")]);
        router.push("/");
        router.refresh();
      }}
      className="label text-muted underline-offset-4 hover:text-ink hover:underline"
    >
      Sign out
    </button>
  );
}
