import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blockfuse Vintage — Admin",
  description: "Blockfuse Vintage admin dashboard.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
