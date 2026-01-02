import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Define fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Add more weights if needed
  variable: "--font-poppins",
  display: "swap",
});

// Metadata
export const metadata: Metadata = {
  title: "Your App Title",
  description: "Your App Description",
};

// RootLayout Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable}`}
    >
      <body className="antialiased">
        <GoogleOAuthProvider clientId='758387304210-s411pfs6olncid3o8f35shrpka65n4bh.apps.googleusercontent.com'>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
