import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { DrawerMenu } from "@/components/ui/drawer-menu";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartHub | Premium Tech & Lifestyle",
  description:
    "Access your premium ecosystem of electronics and fashion. One account, limitless possibilities.",
  keywords: ["electronics", "fashion", "ecommerce", "smarthub"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-sans antialiased min-h-screen">
        <ThemeProvider>
          <DrawerMenu />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
