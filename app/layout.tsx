import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import localFont from "next/font/local"

const geistSans = localFont({
  src: "./../public/fonts/Geist[wght].woff2",
  variable: "--font-geist-sans",
  weight: "100 900", // variable font weight range
});

const geistMono = localFont({
  src: "./../public/fonts/GeistMono[wght].woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Buzzword Counter",
  description: "Track and analyze buzzwords in presentations and lectures",
  openGraph: {
    title: "Buzzword Counter",
    description: "Track and analyze buzzwords in presentations and lectures",
    url: "https://buzzword-counter.vercel.app/",
    siteName: "Buzzword Counter",
    images: [
      {
        url: "/images/thumbnail.jpeg", // your thumbnail image
        alt: "Buzzword Counter Thumbnail",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buzzword Counter",
    description: "Track and analyze buzzwords in presentations and lectures",
    images: ["/images/thumbnail.jpeg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
