const hre = require("hardhat");

async function main() {
  console.log("Deploying PopAIGenesis to", hre.network.name, "...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ZETA\n");

  // Your metadata API endpoint - UPDATE THIS TO YOUR VERCEL DOMAIN
  const BASE_URI = "https://landing-page-demo-mvp-8bcu.vercel.app/api/nft/metadata/";
  
  // Deploy the contract
  const PopAIGenesis = await hre.ethers.getContractFactory("PopAIGenesis");
  const contract = await PopAIGenesis.deploy(BASE_URI);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ PopAIGenesis deployed to:", contractAddress);
  console.log("\n-------------------------------------------");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", contractAddress);
  console.log("Owner:", deployer.address);
  console.log("-------------------------------------------\n");

  // Wait for a few blocks before verification
  console.log("Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

  // Verify the contract
  console.log("\nVerifying contract on explorer...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [BASE_URI],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }

  console.log("\n===========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("===========================================");
  console.log("\nNext steps:");
  console.log("1. Set minter address: contract.setMinter(BACKEND_WALLET)");
  console.log("2. Update your backend with contract address:", contractAddress);
  console.log("3. Test minting: contract.mint(USER_WALLET)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
