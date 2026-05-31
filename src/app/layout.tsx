import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CKDu Water Risk Screening",
  description: "A model-integrated community website for environmental water-quality risk screening."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
