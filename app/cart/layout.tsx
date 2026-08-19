import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blockfuse Vintage — Your Cart",
  description: "Review your Blockfuse Vintage cart.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
