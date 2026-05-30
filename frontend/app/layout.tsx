import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Диплом хамгаалалтын систем",
  description: "Дипломын бүртгэл, хуваарь, оноо, шүүмжийн удирдлагын систем.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn">
      <body>
        <div className="aurora" />
        <div className="grid-mask" />
        {children}
      </body>
    </html>
  );
}
