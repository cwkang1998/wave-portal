import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import WavePortalABI from "../abi/WavePortal.json";

const CONTRACT_ADDR = "0xbF052AA688272c95923F3E53ab7af189d3574481";

const checkIfWalletConnected = () => {
  const { ethereum } = window;

  if (!ethereum) {
    console.log("Make sure you have metamask");
    return false;
  } else {
    console.log("Metamask found: ", ethereum);
    return true;
  }
};

export const useWeb3 = () => {
  const [ethereum, setEthereum] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (checkIfWalletConnected()) {
        setEthereum(window.ethereum);
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);

        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setAccount(account);
          } else {
            console.log("No authorized account found");
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    init();
  }, []);

  const connect = useCallback(async () => {
    if (!ethereum) {
      alert("Get Metamask!");
      return;
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected to: ", accounts[0]);
      setAccount(accounts);
    } catch (err) {
      console.error("Failed to connect: ", err);
    }
  }, [ethereum]);

  return { account, provider, connect };
};

export const useContract = (provider) => {
  const [contract, setContract] = useState(null);
  useEffect(() => {
    if (provider) {
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        CONTRACT_ADDR,
        WavePortalABI.abi,
        signer
      );
      setContract(wavePortalContract);
      console.log("Succesfully setup contract.");
    } else {
      console.log("Ethereum contract does not exists.");
    }
  }, [provider]);

  const wave = useCallback(
    async (content) => {
      if (contract) {
        try {
          let count = await contract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());

          const waveTxn = await contract.wave(content, { gasLimit: 300000 });
          console.log("Mining...", waveTxn.hash);

          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);

          count = await contract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
        } catch (err) {
          console.error("Transaction failed: ", err);
        }
      }
    },
    [contract]
  );

  const getAllWaves = useCallback(async () => {
    if (contract) {
      const waves = await contract.getAllWaves();
      const wavesCleaned = waves.map((wave) => ({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message,
      }));
      return wavesCleaned;
    }
    return [];
  }, [contract]);

  const subscribeNewWave = useCallback(
    async (fn) => {
      if (contract) {
        contract.on("NewWave", fn);
      }
      return [];
    },
    [contract]
  );

  const unSubscribeNewWave = useCallback(
    async (fn) => {
      if (contract) {
        contract.off("NewWave", fn);
      }
      return [];
    },
    [contract]
  );

  return { wave, getAllWaves, subscribeNewWave,unSubscribeNewWave };
};
