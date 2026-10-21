import type { Metadata } from "next";
import {
  Orbitron,
  Audiowide,
  Space_Grotesk,
  DM_Sans,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Fraunces,
  Caveat,
  Outfit,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: ["400"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["SOFT", "WONK"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
});

export const metadata: Metadata = {
  title: "AESTHETICA — A Living Museum of Internet Aesthetics",
  description:
    "Eight interconnected worlds of art, nostalgia and digital subculture: Retrowave, Synthwave, Vaporwave, Y2K, Dreamcore, Cyberpunk, Liminal Spaces and the Backrooms. Galleries, archives and community.",
  keywords: [
    "aesthetics",
    "retrowave",
    "synthwave",
    "vaporwave",
    "y2k",
    "dreamcore",
    "cyberpunk",
    "liminal spaces",
    "backrooms",
    "digital art",
  ],
  openGraph: {
    title: "AESTHETICA — A Living Museum of Internet Aesthetics",
    description:
      "Eight interconnected worlds of art, nostalgia and digital subculture. Explore the archive.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`antialiased bg-background text-foreground ${orbitron.variable} ${audiowide.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable} ${ibmPlexSans.variable} ${fraunces.variable} ${caveat.variable} ${outfit.variable}`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
