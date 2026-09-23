import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Estate Price Intelligence & Prediction Platform",
  description:
    "Enterprise property valuation platform powered by real transaction data and reproducible machine learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="relative min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
