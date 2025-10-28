import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const testSohneSchmal = localFont({
  src: "../public/fonts/TestSohneSchmal-Dreiviertelfett.woff2",
  variable: "--font-test-sohne-schmal",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Net & Connect - Membres & Événements",
  description:
    "Hub Padel pour gérer vos matchs, vos clients et la croissance de votre activité",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${testSohneSchmal.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
