import type { Metadata } from "next";
import "../globals.css";
import { TransparentWrapper } from "./TransparentWrapper";

export const metadata: Metadata = {
  title: "🎯 OBS Wheel Mode - Twitch Wheel Giveaway",
  description: "Transparent wheel for OBS browser source",
};

export default function TransparentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TransparentWrapper>{children}</TransparentWrapper>;
}