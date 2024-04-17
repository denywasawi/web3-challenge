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
  useSignMessage,
} from "@metamask/sdk-react-ui";
import { Button, Card, CardBody, Chip, Input } from "@nextui-org/react";
import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "dotenv/config";
import ModalAddress from "@/components/Modals/ModalAddress";
import { FaCheck, FaCopy, FaEdit } from "react-icons/fa";

export default function AppReady() {
  // Hooks
  const {
    isSuccess: isSuccessSign,
    signMessage,
    reset: resetSign,
  } = useSignMessage({
    message: "sign to process",
  });
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
  const [isFetchingRoute, setIsFetchingRoute] = useState<boolean>(false);
  const [isFetchingExecuteRoute, setIsFetchingExecuteRoute] =
    useState<boolean>(false);
  const [addressTarget, setAddressTarget] = useState<string>("");
  const [openModalAddress, setOpenModalAddress] = useState<boolean>(false);
  const [isHoverTarget, setIsHoverTarget] = useState<boolean>(false);
  const [isHoverSource, setIsHoverSource] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // useMemo
  const showBallance = useMemo(
    () =>
      tokenSource &&
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

  const amountTarget = useMemo(
    () =>
      Number(routeResponse?.route?.estimate?.toAmount ?? "") /
      Math.pow(10, routeResponse?.route.estimate.toToken.decimals ?? 0),
    [
      routeResponse?.route.estimate?.toAmount,
      routeResponse?.route.estimate.toToken.decimals,
    ]
  );

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
      toAddress: addressTarget || (address ?? ""),
      slippageConfig: {
        autoMode: 1,
      },
      quoteOnly: false,
      onChainQuoting: false,
      enableBoost: true,
    };
  }, [
    address,
    addressTarget,
    amountSource,
    chainSource,
    chainTarget,
    tokenSource,
    tokenTarget,
    tokens,
  ]);

  const gasFee = useMemo(() => {
    if (routeResponse) {
      const amount = routeResponse.route.estimate.gasCosts[0].amount;
      const decimals = routeResponse.route.estimate.gasCosts[0].token.decimals;
      const symbol = routeResponse.route.estimate.gasCosts[0].token.symbol;
      return `${(Number(amount) / Math.pow(10, decimals)).toFixed(
        5
      )} ${symbol}`;
    }

    return "0,00000";
  }, [routeResponse]);

  const estimatedTime = useMemo(() => {
    return routeResponse?.route.estimate.estimatedRouteDuration ?? 0;
  }, [routeResponse?.route.estimate.estimatedRouteDuration]);

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
    setIsFetchingRoute(true);
    squid
      .getRoute(params)
      .then((res) => {
        setRouteResponse(res);
      })
      .catch(() => setRouteResponse(undefined))
      .finally(() => setIsFetchingRoute(false));
  }, [params, squid]);

  const executeRoute = useCallback(() => {
    const rpc = chains?.find((e) => e.chainId === chainSource)?.rpc;
    if (rpc) {
      const provider = new ethers.JsonRpcProvider(rpc);
      const signer = new ethers.Wallet(
        process.env.NEXT_PUBLIC_PRIVATE_KEY ?? "",
        provider
      );
      if (routeResponse) {
        setIsFetchingExecuteRoute(true);
        squid
          .executeRoute({
            route: routeResponse?.route,
            signer: signer as any,
          })
          .then((res) => console.log(res))
          .catch((err) => console.log(err))
          .finally(() => {
            setIsFetchingExecuteRoute(false);
            resetSign();
          });
      }
    }
  }, [chainSource, chains, resetSign, routeResponse, squid]);

  const handleSubmit = useCallback(() => {
    signMessage();
  }, [signMessage]);

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

  useEffect(() => {
    if (isSuccessSign) {
      executeRoute();
    }
  }, [executeRoute, isSuccessSign]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <header className="App-header">
        <MetaMaskButton theme={"dark"} color="orange"></MetaMaskButton>

        <div className="space-y-4 mt-8">
          <Card>
            <CardBody className="space-y-2">
              <div className="flex justify-between px-2">
                <div className="text-md font-semibold">From</div>
                {isConnected && (
                  <Chip
                    size="sm"
                    color="primary"
                    variant="flat"
                    onClick={() => {
                      navigator.clipboard.writeText(address ?? "");
                      setIsCopied(true);
                      setTimeout(() => {
                        setIsCopied(false);
                      }, 1000);
                    }}
                    onMouseEnter={() => setIsHoverSource(true)}
                    onMouseLeave={() => setIsHoverSource(false)}
                    className="hover:cursor-pointer "
                  >
                    {isHoverSource ? (
                      <div className="w-24 space-x-2 flex items-center justify-center">
                        <div className="text-xs font-bold truncate">
                          {isCopied ? "Copied!" : "Copy"}
                        </div>
                        {isCopied ? (
                          <FaCheck size={10} />
                        ) : (
                          <FaCopy size={10} />
                        )}
                      </div>
                    ) : (
                      <div className="text-xs font-normal truncate w-24">
                        {address}
                      </div>
                    )}
                  </Chip>
                )}
              </div>

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
                onValueChange={(val) => {
                  setAmountSource(val);
                  if (!val || !Number(val)) {
                    setRouteResponse(undefined);
                  }
                }}
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
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-2">
              <div className="flex justify-between px-2">
                <div className="text-md font-semibold">To</div>
                {isConnected && (
                  <Chip
                    size="sm"
                    color="primary"
                    variant="flat"
                    onClick={() => setOpenModalAddress(true)}
                    onMouseEnter={() => setIsHoverTarget(true)}
                    onMouseLeave={() => setIsHoverTarget(false)}
                    className="hover:cursor-pointer "
                  >
                    {isHoverTarget ? (
                      <div className="w-24 space-x-2 flex items-center justify-center">
                        <div className="text-xs font-bold truncate ">Add</div>
                        <FaEdit size={10} />
                      </div>
                    ) : (
                      <div className="text-xs font-normal truncate w-24">
                        {addressTarget || address}
                      </div>
                    )}
                  </Chip>
                )}
              </div>
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
                value={amountTarget ? amountTarget.toString() : ""}
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
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex justify-between px-2">
                <div className="text-xs font-bold">Estimated fee: {gasFee}</div>
                <div className="text-xs font-bold">
                  Estimated time: {estimatedTime}s
                </div>
              </div>
            </CardBody>
          </Card>

          <Button
            fullWidth
            color="primary"
            isDisabled={
              !chainSource ||
              !chainTarget ||
              !tokenSource ||
              !tokenTarget ||
              Number(amountSource ?? "") <= 0 ||
              !isConnected
            }
            onClick={handleSubmit}
            isLoading={isFetchingRoute || isFetchingExecuteRoute}
          >
            {isFetchingRoute ? "Fetching" : "Submit"}
          </Button>
        </div>

        <ModalAddress
          isOpen={openModalAddress}
          onClose={() => setOpenModalAddress(false)}
          address={addressTarget || address}
          setAddress={setAddressTarget}
        />
      </header>
    </div>
  );
}
