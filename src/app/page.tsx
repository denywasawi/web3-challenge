"use client";
import AppReady from "@/components/App";
import { useSDK } from "@metamask/sdk-react-ui";
import { Spinner } from "@nextui-org/react";

function App() {
  const { ready } = useSDK();

  if (!ready) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <Spinner />
      </main>
    );
  }

  return <AppReady />;
}

export default App;
