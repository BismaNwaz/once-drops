import { redirect } from "next/navigation";
import { getUser, getOwnerKey } from "@/lib/auth";
import { getBag } from "@/lib/bag";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata = { title: "Checkout · ONCE" };

export default async function CheckoutPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/checkout");
  const items = await getBag(await getOwnerKey({ create: false }));
  return <CheckoutForm user={user} initialItems={items} />;
}
