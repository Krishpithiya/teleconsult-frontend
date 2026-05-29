import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import NavbarWrapper from "@/components/layout/NavbarWrapper";

export const metadata: Metadata = {
  title: "TeleConsult — Doctor–Patient Platform",
  description: "Book appointments and consult doctors online",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#f0fdfa", minHeight: "100vh" }}>
        <AuthProvider>
          <NavbarWrapper />
          <main>{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#0f172a",
                border: "1px solid #d1fae5",
                boxShadow: "0 8px 24px rgba(13,148,136,0.12)",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500,
                padding: "12px 16px",
              },
              success: { iconTheme: { primary: "#0d9488", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
