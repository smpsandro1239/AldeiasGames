import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aldeias Games - Jogos Tradicionais Portugueses",
  description: "Plataforma SaaS multi-tenant para angariação de fundos através de jogos tradicionais portugueses.",
  keywords: ["Aldeias", "Jogos", "Rifa", "Tombola", "Poio da Vaca", "Portugal", "Angariação de fundos"],
  authors: [{ name: "Sandro Pereira" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Aldeias Games",
    description: "Jogos tradicionais portugueses para angariação de fundos",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
