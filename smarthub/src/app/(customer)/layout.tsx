import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartHub Store",
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
