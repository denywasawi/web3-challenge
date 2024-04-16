"use client";
import Dropdown from "@/components/Dropdown";
import { setChains, setTokens } from "@/reducers/squidReducers";
import { RootState } from "@/store/store";
import { Squid } from "@0xsquid/sdk";
import {
  MetaMaskButton,
  useAccount,
  useSDK,
  useSignMessage,
} from "@metamask/sdk-react-ui";
import { Button } from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AppReady() {
  const { isLoading: isSignLoading, signMessage } = useSignMessage({
    message: "sign",
  });

  const { isConnected } = useAccount();

  const dispatch = useDispatch();
  const { tokens, chains } = useSelector((state: RootState) => state.squid);

  const [chainSource, setChainSource] = useState<string>();
  const [tokenSource, setTokenSource] = useState<string>();
  const [chainTarget, setChainTarget] = useState<string>();
  const [tokenTarget, setTokenTarget] = useState<string>();

  const squid = useMemo(
    () =>
      new Squid({
        baseUrl: "https://v2.api.squidrouter.com",
        integratorId: "web3-challenge-9ecdf8ec-4e62-47c4-a580-e02ea3e19bbc",
      }),
    []
  );

  // initialize the Squid client
  useEffect(() => {
    squid.init().then(() => {
      dispatch(setTokens(squid?.tokens));
      dispatch(setChains(squid?.chains));
    });
  }, [dispatch, squid]);

  const listChainSource = useMemo(
    () =>
      chains.map((e) => ({
        label: e.networkName,
        value: e.chainId,
        icon: e.chainIconURI,
      })),
    [chains]
  );

  const listTokenSource = useMemo(() => {
    if (chainSource) {
      const filtered = tokens.filter((e) => e.chainId === chainSource);
      return filtered.map((e) => ({
        label: e.name,
        value: e.address,
        icon: e.logoURI,
      }));
    } else {
      return tokens.map((e) => ({
        label: e.name,
        value: e.address,
        icon: e.logoURI,
      }));
    }
  }, [chainSource, tokens]);

  const listChainTarget = useMemo(
    () =>
      chains.map((e) => ({
        label: e.networkName,
        value: e.chainId,
        icon: e.chainIconURI,
      })),
    [chains]
  );

  const listTokenTarget = useMemo(() => {
    if (chainTarget) {
      const filtered = tokens.filter((e) => e.chainId === chainTarget);
      return filtered.map((e) => ({
        label: e.name,
        value: e.address,
        icon: e.logoURI,
      }));
    } else {
      return tokens.map((e) => ({
        label: e.name,
        value: e.address,
        icon: e.logoURI,
      }));
    }
  }, [chainTarget, tokens]);

  const handleChangeChainSource = (val: string) => {
    setChainSource(val || undefined);
    setTokenSource(undefined);
  };

  const handleChangeTokenSource = (val: string) => {
    setTokenSource(val || undefined);
  };

  const handleChangeChainTarget = (val: string) => {
    setChainTarget(val || undefined);
    setTokenTarget(undefined);
  };

  const handleChangeTokenTarget = (val: string) => {
    setTokenTarget(val || undefined);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <header className="App-header">
        <MetaMaskButton theme={"light"} color="white"></MetaMaskButton>

        <div className="space-y-4 mt-8">
          <div>From</div>
          <div className="flex space-x-2 justify-start items-start">
            <Dropdown
              className="w-48"
              label="Select Chain"
              data={listChainSource}
              onChange={handleChangeChainSource}
              value={chainSource}
            />
            <Dropdown
              className="w-48"
              label="Select Token"
              data={listTokenSource}
              onChange={handleChangeTokenSource}
              value={tokenSource}
            />
          </div>

          <div>To</div>
          <div className="flex space-x-2 justify-start items-start">
            <Dropdown
              className="w-48"
              label="Select Chain"
              data={listChainTarget}
              onChange={handleChangeChainTarget}
              value={chainTarget}
            />
            <Dropdown
              className="w-48"
              label="Select Token"
              data={listTokenTarget}
              onChange={handleChangeTokenTarget}
              value={tokenTarget}
            />
          </div>

          <Button
            fullWidth
            color="primary"
            isDisabled={
              tokenSource === undefined ||
              tokenTarget === undefined ||
              !isConnected
            }
          >
            Submit
          </Button>
        </div>
      </header>
    </div>
  );
}

function App() {
  const { ready } = useSDK();

  if (!ready) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div>Loading...</div>
      </main>
    );
  }

  return <AppReady />;
}

export default App;
