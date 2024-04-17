"use client";
import Dropdown from "@/components/Dropdown";
import { setChains, setTokens } from "@/reducers/squidReducers";
import { RootState } from "@/store/store";
import { OptionType } from "@/types/global";
import { Squid } from "@0xsquid/sdk";
import { RouteRequest, RouteResponse } from "@0xsquid/sdk/dist/types";
import {
  MetaMaskButton,
  useAccount,
  useSDK,
  useBalance,
} from "@metamask/sdk-react-ui";
import { Button, Input } from "@nextui-org/react";
import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "dotenv/config";

function AppReady() {
  // Hooks
  const { isConnected, address } = useAccount();
  const { chainId } = useSDK();
  const { data: ballanceData } = useBalance({ address });

  const dispatch = useDispatch();
  const { tokens, chains } = useSelector((state: RootState) => state.squid);

  // useState
  const [chainSource, setChainSource] = useState<string>();
  const [tokenSource, setTokenSource] = useState<string>();
  const [chainTarget, setChainTarget] = useState<string>();
  const [tokenTarget, setTokenTarget] = useState<string>();
  const [amountSource, setAmountSource] = useState<string>();
  const [routeResponse, setRouteResponse] = useState<RouteResponse>();
  const [walletChainId, setWalletChainId] = useState<string>();

  // useMemo
  const showBallance = useMemo(
    () =>
      tokenSource !== undefined &&
      chainSource === walletChainId &&
      tokens.find(
        (e) =>
          e.address === tokenSource?.split(",")?.[0] &&
          e.chainId === tokenSource?.split(",")?.[1]
      )?.symbol === ballanceData?.symbol,
    [ballanceData?.symbol, chainSource, tokenSource, tokens, walletChainId]
  );

  const squid = useMemo(
    () =>
      new Squid({
        baseUrl: process.env.NEXT_PUBLIC_SQUID_BASE_URL,
        integratorId: process.env.NEXT_PUBLIC_INTEGRATOR_ID ?? "",
      }),
    []
  );

  const listChainSource: OptionType[] = useMemo(
    () =>
      chains.map((e) => ({
        label: e.networkName,
        value: e.chainId,
        icon: e.chainIconURI,
      })),
    [chains]
  );

  const listTokenSource: OptionType[] = useMemo(() => {
    if (chainSource) {
      const filtered = tokens.filter((e) => e.chainId === chainSource);
      return filtered.map((e) => ({
        label: e.name,
        value: `${e.address},${e.chainId}`,
        icon: e.logoURI,
      }));
    } else {
      return tokens.map((e) => ({
        label: e.name,
        value: `${e.address},${e.chainId}`,
        icon: e.logoURI,
      }));
    }
  }, [chainSource, tokens]);

  const listChainTarget: OptionType[] = useMemo(
    () =>
      chains.map((e) => ({
        label: e.networkName,
        value: e.chainId,
        icon: e.chainIconURI,
      })),
    [chains]
  );

  const listTokenTarget: OptionType[] = useMemo(() => {
    if (chainTarget) {
      const filtered = tokens.filter((e) => e.chainId === chainTarget);
      return filtered.map((e) => ({
        label: e.name,
        value: `${e.address},${e.chainId}`,
        icon: e.logoURI,
      }));
    } else {
      return tokens.map((e) => ({
        label: e.name,
        value: `${e.address},${e.chainId}`,
        icon: e.logoURI,
      }));
    }
  }, [chainTarget, tokens]);

  const params: RouteRequest = useMemo(() => {
    const tempTokenSource = tokenSource?.split(",");
    const tempTokenTarget = tokenTarget?.split(",");
    const sourceToken = tokens.find(
      (e) =>
        e.address === tempTokenSource?.[0] && e.chainId === tempTokenSource?.[1]
    );
    const decimals = sourceToken?.decimals ?? 0;
    return {
      fromAddress: address ?? "",
      fromChain: chainSource ?? "",
      fromToken: tempTokenSource?.[0] ?? "",
      fromAmount: (
        Number(amountSource ?? "") * Math.pow(10, decimals)
      ).toString(),
      toChain: chainTarget ?? "",
      toToken: tempTokenTarget?.[0] ?? "",
      toAddress: address ?? "",
      slippageConfig: {
        autoMode: 1,
      },
      quoteOnly: false,
      onChainQuoting: false,
      enableBoost: true,
    };
  }, [
    address,
    amountSource,
    chainSource,
    chainTarget,
    tokenSource,
    tokenTarget,
    tokens,
  ]);

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

  const getRoute = useCallback(() => {
    squid.getRoute(params).then((res) => setRouteResponse(res));
  }, [params, squid]);

  const executeRoute = useCallback(
    (signer: any) => {
      if (routeResponse) {
        squid
          .executeRoute({
            route: routeResponse?.route,
            signer,
          })
          .then((e) => console.log(e));
      }
    },
    [routeResponse, squid]
  );

  const handleSubmit = useCallback(() => {
    const rpc = chains?.find((e) => e.chainId === chainSource)?.rpc;
    if (rpc) {
      const provider = new ethers.JsonRpcProvider(rpc);
      const signer = new ethers.Wallet(
        process.env.NEXT_PUBLIC_PRIVATE_KEY ?? "",
        provider
      );
      executeRoute(signer);
    }
  }, [chainSource, chains, executeRoute]);

  // UseEffect
  useEffect(() => {
    squid.init().then(() => {
      dispatch(setTokens(squid?.tokens));
      dispatch(setChains(squid?.chains));
    });
  }, [dispatch, squid]);

  useEffect(() => {
    if (
      address &&
      chainSource &&
      chainTarget &&
      tokenSource &&
      tokenTarget &&
      Number(amountSource ?? "") > 0
    ) {
      getRoute();
    }
  }, [
    address,
    amountSource,
    chainSource,
    chainTarget,
    getRoute,
    tokenSource,
    tokenTarget,
  ]);

  useEffect(() => {
    if (chainId) {
      setWalletChainId(BigInt(chainId).toString());
    }
  }, [chainId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <header className="App-header">
        <MetaMaskButton theme={"light"} color="white"></MetaMaskButton>

        <div className="space-y-4 mt-8">
          <div className="space-y-2 bg-slate-50 border-2 rounded-xl p-2">
            <div className="text-md font-semibold px-2">From</div>

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

            <Input
              type="number"
              placeholder="0,00"
              min={0}
              step={0.001}
              value={amountSource ?? ""}
              onValueChange={setAmountSource}
            />

            <div className="flex justify-between px-2">
              <div className="text-xs font-light">
                ${routeResponse?.route?.estimate?.fromAmountUSD ?? 0}
              </div>
              <div className="text-xs font-light">
                {"Ballance:"}{" "}
                {showBallance
                  ? Number(ballanceData?.formatted ?? "").toFixed(5)
                  : (0).toFixed(5)}{" "}
                {
                  tokens.find(
                    (e) =>
                      e.address === tokenSource?.split(",")?.[0] &&
                      e.chainId === tokenSource?.split(",")?.[1]
                  )?.symbol
                }
              </div>
            </div>
          </div>

          <div className="space-y-2 bg-slate-50 border-2 rounded-xl p-2">
            <div className="text-md font-semibold px-2">To</div>

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

            <Input
              type="number"
              placeholder="0,00"
              min={0}
              step={0.001}
              value={
                (
                  Number(routeResponse?.route?.estimate?.toAmount ?? "") /
                  Math.pow(
                    10,
                    routeResponse?.route.estimate.toToken.decimals ?? 0
                  )
                )?.toString() ?? ""
              }
              readOnly
            />

            <div className="flex justify-between px-2">
              <div className="text-xs font-light">
                ${routeResponse?.route?.estimate?.toAmountUSD ?? 0}
              </div>
              <div className="text-xs font-light">
                {routeResponse?.route.estimate.aggregatePriceImpact}%
              </div>
            </div>
          </div>

          <div className="space-y-2 bg-slate-50 border-2 rounded-xl p-2">
            <div className="flex justify-between px-2">
              <div className="text-xs font-light">Estimated fee</div>
              <div className="text-xs font-light">Estimated time</div>
            </div>
          </div>

          <Button
            fullWidth
            color="primary"
            isDisabled={
              tokenSource === undefined ||
              tokenTarget === undefined ||
              !isConnected
            }
            onClick={handleSubmit}
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
