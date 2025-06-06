import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/Navbar";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Préstamos App",
  description: "Sistema de gestión de préstamos en pesos argentinos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Navbar />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
