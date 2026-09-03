import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blockfuse Vintage — Payment Return",
  description: "Returning from payment.",
};

export default function PaymentCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
