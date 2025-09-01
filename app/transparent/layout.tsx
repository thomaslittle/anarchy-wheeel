import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "🎯 OBS Wheel Mode - Twitch Wheel Giveaway",
  description: "Transparent wheel for OBS browser source",
};

export default function TransparentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="obs-transparent" style={{ background: 'transparent' }}>
      <body 
        className="obs-transparent antialiased" 
        style={{ 
          background: 'transparent',
          backgroundColor: 'transparent',
          backgroundImage: 'none'
        }}
      >
        {children}
      </body>
    </html>
  );
}