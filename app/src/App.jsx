import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

import RahmanCoinABI from './RahmanCoin.json';

function App() {
  // STATE
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [networkName, setNetworkName] = useState('');
  
  // TOKEN STATE
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState({ name: '', symbol: '', totalSupply: '' });
  const [balance, setBalance] = useState('0');
  
  // FORM INPUTS
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // CONNECT WALLET ON LOAD
  useEffect(() => {
    connectWallet();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        } else {
          setAccount('');
          setSigner(null);
          setNetworkName('');
          setBalance('0');
          setLoading(false);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', connectWallet);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      }
    };
  }, []);
  
  async function requestNetworkSwitch() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia: 11155111
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                rpcUrls: ['https://rpc.sepolia.org'],
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              }],
            });
          } catch (addError) {
            console.error("Failed to add network:", addError);
          }
        }
      }
    }
  }

  async function connectWallet() {
    if (window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        const browserSigner = await browserProvider.getSigner();
        setSigner(browserSigner);
        setAccount(accounts[0]);

        const network = await browserProvider.getNetwork();
        let name = network.name;
        if (network.chainId === 11155111n) name = "Sepolia";
        else if (network.chainId === 31337n) name = "Hardhat Local";
        setNetworkName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  // Load token data if address is provided
  async function loadTokenData() {
    console.log("Attempting to load token data for:", tokenAddress);
    if (!signer || !tokenAddress || !ethers.isAddress(tokenAddress)) {
      setTokenInfo({ name: '', symbol: '', totalSupply: '' });
      setBalance('0');
      return;
    }

    try {
      const token = new ethers.Contract(tokenAddress, RahmanCoinABI.abi, signer);
      const name = await token.name();
      const symbol = await token.symbol();
      const totalSupply = await token.totalSupply();
      const userBalance = await token.balanceOf(account);

      setTokenInfo({
        name,
        symbol,
        totalSupply: ethers.formatUnits(totalSupply, 18)
      });
      setBalance(ethers.formatUnits(userBalance, 18));
      console.log("Token data loaded successfully");
    } catch (error) {
      console.error("Error loading token data:", error);
      setTokenInfo({ name: '', symbol: '', totalSupply: '' });
      setBalance('0');
      if (networkName !== 'Sepolia') {
        alert("Failed to load token. You are on " + networkName + " but the token is likely on Sepolia. Click 'Switch to Sepolia' at the top!");
      } else {
        alert("Failed to load token. Please double check the contract address.");
      }
    }
  }

  useEffect(() => {
    if (signer && tokenAddress && ethers.isAddress(tokenAddress)) {
      loadTokenData();
    }
  }, [signer, tokenAddress, account, networkName]);

  async function transferTokens() {
    console.log("Transfer initiating...", { recipient, amount });
    if (!signer || !tokenAddress || !recipient || !amount) {
      alert("Please fill all fields!");
      return;
    }

    if (!ethers.isAddress(recipient)) {
      alert("Invalid recipient address!");
      return;
    }

    setLoading(true);
    try {
      const token = new ethers.Contract(tokenAddress, RahmanCoinABI.abi, signer);
      const tx = await token.transfer(recipient, ethers.parseUnits(amount, 18));
      
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      alert("✅ Transfer complete!");
      
      loadTokenData();
      setAmount('');
      setRecipient('');
    } catch (error) {
      console.error("Transfer failed:", error);
      alert("Transfer failed! Check if you have enough balance and are on the Sepolia network.");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="App">
      <header>
        <div className="header-top">
          <h1>Rahman Coin Dash</h1>
          <div className="connection-pill-container">
            <div className={`connection-pill ${account ? 'active' : ''}`}>
              {account 
                ? `${networkName}: ${account.slice(0, 6)}...${account.slice(-4)}` 
                : "Not Connected"}
            </div>
            {account && networkName !== 'Sepolia' && (
              <button onClick={requestNetworkSwitch} className="switch-network-btn">
                Switch to Sepolia
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main>
        <section className="deploy-section">
          <h2>Token Lookup</h2>
          <p className="role-info">Enter your Rahman Coin address (from deployment) to see your balance.</p>
          
          <div className="input-group">
            <label>Token Contract Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
          </div>

          {tokenInfo.name ? (
            <div className="token-details-card">
              <div className="detail-item"><strong>Name:</strong> {tokenInfo.name}</div>
              <div className="detail-item"><strong>Symbol:</strong> {tokenInfo.symbol}</div>
              <div className="detail-item"><strong>Total Supply:</strong> {tokenInfo.totalSupply}</div>
              <div className="balance-display">
                <span className="balance-label">Your Balance</span>
                <span className="balance-amount">{balance} {tokenInfo.symbol}</span>
              </div>
            </div>
          ) : tokenAddress && ethers.isAddress(tokenAddress) && (
            <div className="status-message error">
              Cannot find token on {networkName}. Click "Switch to Sepolia" above!
            </div>
          )}
        </section>
        
        <section className="escrows-section">
          <h2>Send Tokens</h2>
          <p className="role-info">Send {tokenInfo.symbol || 'tokens'} to a friend on the network.</p>
          
          <div className="input-group">
            <label>Recipient Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label>Amount</label>
            <input
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <button 
            onClick={transferTokens} 
            disabled={!tokenInfo.name || loading}
            className="action-button"
          >
            {loading ? "Transmitting..." : `Transfer ${tokenInfo.symbol || 'Tokens'}`}
          </button>

          <div className="metamask-guide">
            <h3>Add to MetaMask Guide</h3>
            <ol>
              <li>Ensure MetaMask is on <strong>Sepolia</strong></li>
              <li>In MetaMask, click <strong>"Import tokens"</strong></li>
              <li>Paste: <code style={{wordBreak: 'break-all'}}>{tokenAddress || 'Token Address'}</code></li>
              <li>It should auto-fill RHM and 18 decimals!</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
