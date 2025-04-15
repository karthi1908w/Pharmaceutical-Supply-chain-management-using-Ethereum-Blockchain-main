import { Web3Provider, utils } from "ethers";  // Import Web3Provider and utils directly

// Function to initialize the provider and signer from Metamask
export const getEthereumProvider = async () => {
  if (window.ethereum) {
    try {
      // Request access to the user's Metamask account
      await window.ethereum.request({ method: "eth_requestAccounts" });
      
      // Create a provider and signer
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      return { provider, signer };
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
      throw new Error("Please connect your wallet.");
    }
  } else {
    throw new Error("Metamask is not installed.");
  }
};

// Function to send a transaction
export const sendTransaction = async (recipient, amount) => {
  try {
    const { signer } = await getEthereumProvider();

    const tx = await signer.sendTransaction({
      to: recipient,
      value: utils.parseEther(amount.toString()), // Use utils.parseEther here
    });

    await tx.wait();  // Wait for the transaction to be mined
    console.log("Transaction successful:", tx);
    return tx;
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw new Error("Transaction failed.");
  }
};

// Function to get the user's Ethereum address
export const getUserAddress = async () => {
  try {
    const { signer } = await getEthereumProvider();
    const address = await signer.getAddress();
    return address;
  } catch (error) {
    console.error("Error getting user address:", error);
    throw new Error("Failed to get address.");
  }
};
