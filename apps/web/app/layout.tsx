import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { ToastProvider } from "./components/ToastProvider";

export const metadata: Metadata = {
  title: "Agent Knowledge",
  description: "Company brain for AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthKitProvider>
          <ConvexClientProvider>
            <ToastProvider>{children}</ToastProvider>
          </ConvexClientProvider>
        </AuthKitProvider>
      </body>
    </html>
  );
}
