import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "@/app/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./components/AuthProvider";

export const metadata: Metadata = {
  title: "Reddie",
  description: "Reddit clone with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
