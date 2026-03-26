import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joel Telling - The 3D Printing Nerd",
  description:
    "Husband, father, and Pacific Northwest content creator. YouTube's 3D Printing Nerd - informing, educating, and advocating for 3D printing technology.",
  keywords: ["Joel Telling", "3D Printing Nerd", "3D printing", "YouTube", "content creator"],
  authors: [{ name: "Joel Telling" }],
  openGraph: {
    title: "Joel Telling - The 3D Printing Nerd",
    description:
      "YouTube's most trusted voice in 3D printing. Reviews, tips, tricks, and exceptional high fives.",
    url: "https://joeltelling.com",
    siteName: "Joel Telling",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@joeltelling",
    title: "Joel Telling - The 3D Printing Nerd",
    description:
      "YouTube's most trusted voice in 3D printing. Reviews, tips, tricks, and exceptional high fives.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
