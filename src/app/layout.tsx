import type { Metadata, Viewport } from "next";
import { Saira } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

// Bahnschrift is a Windows-only font (DIN 1451 based). We load Saira from
// Google Fonts as a near-identical fallback for non-Windows users.
const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shubh Samay — Auspicious Timing for Gujarat",
  description:
    "Find the best Muhurat, Choghadiya, Hora, Tithi & Nakshatra timings for marriage, house warming, vehicle purchase and more. Live panchang for Gujarat, India.",
  keywords: [
    "Shubh Samay",
    "Muhurat",
    "Choghadiya",
    "Hora",
    "Panchang",
    "Tithi",
    "Nakshatra",
    "Gujarat",
    "Gujarati",
    "Auspicious Time",
  ],
  authors: [{ name: "Rutambh" }],
  applicationName: "Shubh Samay",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shubh Samay",
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "512x512" }],
  },
  openGraph: {
    title: "Shubh Samay",
    description: "Auspicious timing app for Gujarat",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#C8553D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${saira.variable} antialiased bg-background text-foreground`}
        style={{
          fontFamily:
            '"Bahnschrift", var(--font-saira), "DIN Alternate", "Segoe UI", system-ui, sans-serif',
        }}
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
