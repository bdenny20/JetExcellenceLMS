import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JETEXCELLENCE LMS",
  description: "JETEXCELLENCE Learning Management System",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body>{children}</body>
      </html>
  );
}