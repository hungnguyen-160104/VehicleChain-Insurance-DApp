// scripts/verify.js
const { network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = network.name;
  console.log(`🔍 Verifying contract on ${networkName}...`);

  // Read deployment info
  const deploymentFile = path.join(
    __dirname,
    "..",
    "deployments",
    `${networkName}.json`
  );

  if (!fs.existsSync(deploymentFile)) {
    console.log("❌ Deployment file not found. Deploy the contract first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`📍 Contract address: ${contractAddress}`);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // No constructor arguments for this contract
    });

    console.log("✅ Contract verified successfully!");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);

    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  Contract is already verified");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
