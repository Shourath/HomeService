import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/components/common/AuthContext";
import { ToastProvider } from "@/components/common/ToastContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { EmergencyButton } from "@/components/common/EmergencyButton";

export const metadata: Metadata = {
  title: "HOMEService | Cooperative Digital Service Marketplace",
  description: "Worker-owned labour cooperative service marketplace connecting verified artisans and households across Tamil Nadu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#F7F8DC]">
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <Header />
              <main className="flex-1 w-full">{children}</main>
              <Footer />
              <EmergencyButton />
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
