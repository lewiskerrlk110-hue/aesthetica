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
  Monoton,
  Michroma,
  Mrs_Saint_Delafield,
  Yellowtail,
  Bungee,
  Righteous,
  VT323,
  Special_Elite,
  Rajdhani,
  Share_Tech_Mono,
  Quicksand,
  Cormorant_Garamond,
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

// ————— Genre fonts (Studio packs) —————
// Retro chrome & script — the "retrowave logo" pairing: wide chrome
// block-caps display + a fluid pink script for accents.
const monoton = Monoton({ variable: "--font-monoton", subsets: ["latin"], weight: "400" });
const michroma = Michroma({ variable: "--font-michroma", subsets: ["latin"], weight: "400" });
const mrsSaintDelafield = Mrs_Saint_Delafield({
  variable: "--font-mrs-saint-delafield",
  subsets: ["latin"],
  weight: "400",
});
const yellowtail = Yellowtail({ variable: "--font-yellowtail", subsets: ["latin"], weight: "400" });

// Y2K chrome-bubble era.
const bungee = Bungee({ variable: "--font-bungee", subsets: ["latin"], weight: "400" });
const righteous = Righteous({ variable: "--font-righteous", subsets: ["latin"], weight: "400" });

// Eerie / terminal — backrooms notes and dead monitors.
const vt323 = VT323({ variable: "--font-vt323", subsets: ["latin"], weight: "400" });
const specialElite = Special_Elite({ variable: "--font-special-elite", subsets: ["latin"], weight: "400" });

// Cyberpunk — condensed techno + terminal mono.
const rajdhani = Rajdhani({ variable: "--font-rajdhani", subsets: ["latin"], weight: ["500", "700"] });
const shareTechMono = Share_Tech_Mono({ variable: "--font-share-tech-mono", subsets: ["latin"], weight: "400" });

// Frutiger Aero — glossy humanist rounds.
const quicksand = Quicksand({ variable: "--font-quicksand", subsets: ["latin"], weight: ["400", "600", "700"] });

// Dreamcore — soft storybook serif.
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
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
        className={`antialiased bg-background text-foreground ${orbitron.variable} ${audiowide.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable} ${ibmPlexSans.variable} ${fraunces.variable} ${caveat.variable} ${outfit.variable} ${monoton.variable} ${michroma.variable} ${mrsSaintDelafield.variable} ${yellowtail.variable} ${bungee.variable} ${righteous.variable} ${vt323.variable} ${specialElite.variable} ${rajdhani.variable} ${shareTechMono.variable} ${quicksand.variable} ${cormorantGaramond.variable}`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
