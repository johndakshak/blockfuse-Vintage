import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blockfuse Vintage — Sign In",
  description: "Sign in to your Blockfuse Vintage account.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
