import * as React from "react";
import "./App.css";
import { useContract, useWeb3 } from "./hooks/useWeb3";

export default function App() {
  const { account, provider, connect } = useWeb3();
  const { wave, getAllWaves } = useContract(provider);
  const [waves, setWaves] = React.useState([]);
  const [inputText, setInputText] = React.useState("");

  React.useEffect(() => {
    const getData = async () => {
      if (account) {
        const data = await getAllWaves();
        setWaves(data);
      }
    };
    getData();
  }, [account, getAllWaves]);

  const onInput = (e) => {
    setInputText(e.target.value);
  };
  const onSubmit = async () => {
    if (inputText.length > 0) {
      await wave(inputText);
      setInputText("");
    }
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          Connect your Ethereum wallet and wave to anyone!
        </div>
        <input
          type="text"
          value={inputText}
          onChange={onInput}
          style={{
            backgroundColor: "OldLace",
            marginTop: "16px",
            padding: "8px",
          }}
        />

        <button className="waveButton" onClick={onSubmit}>
          Wave!
        </button>
        {!account && (
          <button className="waveButton" onClick={connect}>
            Connect Wallet
          </button>
        )}

        {waves.map((w, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>Address: {w.address}</div>
              <div>Time: {w.timestamp.toString()}</div>
              <div>Message: {w.message} </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
