"use client";
import {
  MetaMaskButton,
  useAccount,
  useSDK,
  useSignMessage,
} from "@metamask/sdk-react-ui";

function AppReady() {
  const {
    data: signData,
    isError: isSignError,
    isLoading: isSignLoading,
    isSuccess: isSignSuccess,
    signMessage,
  } = useSignMessage({
    message: "sign",
  });

  const { isConnected, address  } = useAccount();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="App">
        <header className="App-header">
          <MetaMaskButton theme={"light"} color="white"></MetaMaskButton>
          {isConnected && (
            <div style={{ marginTop: 20 }}>
              <button disabled={isSignLoading} onClick={() => signMessage()}>
                Sign message
              </button>
              {isSignSuccess && <div>Signature: {signData}</div>}
              {isSignError && <div>Error signing message</div>}
              {address && <div>{address}</div>}
            </div>
          )}
        </header>
      </div>
    </main>
  );
}

function App() {
  const { ready } = useSDK();

  if (!ready) {
    return <div>Loading...</div>;
  }

  return <AppReady />;
}

export default App;
