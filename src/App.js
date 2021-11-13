import * as React from "react";
import "./App.css";
import { useContract, useWeb3 } from "./hooks/useWeb3";

export default function App() {
  const { account, provider, connect } = useWeb3();
  const { wave } = useContract(provider);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          Connect your Ethereum wallet and wave to anyone!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave!
        </button>
        {!account && (
          <button className="waveButton" onClick={connect}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
