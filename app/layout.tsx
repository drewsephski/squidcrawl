import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { FooterWrapper } from "@/components/footer-wrapper";
import { Providers } from "@/components/providers";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SquidCrawl - AI Brand Intelligence",
  description: "Monitor how AI models perceive and rank your brand. Track visibility across ChatGPT, Claude, Perplexity and more.",
  keywords: ["AI brand monitoring", "brand visibility", "AI search", "ChatGPT ranking", "brand intelligence"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0a0a0f] text-[#fafafa]`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen bg-[#0a0a0f]">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <FooterWrapper />
          </div>
        </Providers>
      </body>
    </html>
  );
}
