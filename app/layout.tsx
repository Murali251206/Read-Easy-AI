import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ReadEasy AI - Educational Reading & Language Assistant",
  description:
    "Extract text with local OCR, read aloud in the original language, and get clear, simple AI explanations in your preferred language using local Ollama.",
  keywords: [
    "ReadEasy AI",
    "reading assistant",
    "OCR",
    "Tesseract.js",
    "Ollama",
    "text to speech",
    "multilingual reader",
    "Tamil",
    "Hindi",
    "English",
  ],
  authors: [{ name: "ReadEasy AI" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
