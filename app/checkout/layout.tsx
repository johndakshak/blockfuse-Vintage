import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blockfuse Vintage — Checkout",
  description: "Complete your Blockfuse Vintage order.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
