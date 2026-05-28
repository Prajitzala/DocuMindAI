import { Geist, Open_Sans, Poppins } from "next/font/google";
import ClientWrapper from "../components/ClientWrapper.jsx";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata = {
  title: "DocuMind AI",
  description: "Ask questions about PDFs and your company knowledge base",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={cn("dark", "font-sans", geist.variable, poppins.variable, openSans.variable)}
    >
      <body
        className={cn(
          "min-h-screen bg-background font-[family-name:var(--font-body)] text-foreground antialiased",
        )}
      >
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
