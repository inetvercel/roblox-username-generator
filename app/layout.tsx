import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react" // Import React

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Roblox Username Generator - Create Unique Roblox Usernames (2024)",
  description: "Generate fun, creative Roblox-style usernames instantly. Free AI-powered Roblox username generator with 8+ styles. Create cool, funny, aesthetic, and tryhard usernames for Roblox!",
  keywords: "roblox username generator, roblox names, cool roblox usernames, roblox username ideas, aesthetic roblox usernames, tryhard roblox names, funny roblox usernames",
  generator: 'v0.app',
  openGraph: {
    title: "Roblox Username Generator - Free & Instant",
    description: "Generate unique Roblox usernames with AI. 8+ styles: Cool, Funny, Aesthetic, Tryhard & more!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roblox Username Generator",
    description: "Generate creative Roblox usernames instantly with AI",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

