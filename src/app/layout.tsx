"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { MetaMaskUIProvider } from "@metamask/sdk-react-ui";
import React from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { NextUIProvider } from "@nextui-org/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <React.StrictMode>
          <Provider store={store}>
            <NextUIProvider>
              <MetaMaskUIProvider
                sdkOptions={{
                  dappMetadata: {
                    name: "Example React UI Dapp",
                    url:
                      typeof window !== "undefined"
                        ? window?.location?.href
                        : "",
                  },
                  infuraAPIKey: "14bb0a14eddb4c89a0aa332c23ba1f68",
                }}
              >
                {children}
              </MetaMaskUIProvider>
            </NextUIProvider>
          </Provider>
        </React.StrictMode>
      </body>
    </html>
  );
}
