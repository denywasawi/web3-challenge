"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { MetaMaskUIProvider } from "@metamask/sdk-react-ui";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MetaMaskUIProvider
          sdkOptions={{
            dappMetadata: {
              name: "Example React UI Dapp",
              url: typeof window !== "undefined" ? window?.location?.host : "",
            },
            infuraAPIKey: "14bb0a14eddb4c89a0aa332c23ba1f68",
          }}
        >
          {children}
        </MetaMaskUIProvider>
      </body>
    </html>
  );
}
