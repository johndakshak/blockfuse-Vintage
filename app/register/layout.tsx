import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blockfuse Vintage — Create Account",
  description: "Create your Blockfuse Vintage account.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
