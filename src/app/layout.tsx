import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Bakso Kalijogo Surabaya - Order Online",
  description:
    "Pesan Bakso Kalijogo Surabaya secara online. Bakso daging sapi segar pilihan, kenyal sempurna, khas Surabaya sejak 1995.",
  keywords: ["bakso", "bakso surabaya", "bakso kalijogo", "order bakso online"],
  openGraph: {
    title: "Bakso Kalijogo Surabaya",
    description: "Bakso daging sapi segar pilihan, khas Surabaya sejak 1995.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
