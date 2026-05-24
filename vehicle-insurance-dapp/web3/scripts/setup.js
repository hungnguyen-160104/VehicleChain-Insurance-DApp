// scripts/setup.js
const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`🛠️  Setting up Health Insurance DApp on ${network.name}...`);

  // Read deployment info
  const deploymentFile = path.join(
    __dirname,
    "..",
    "deployments",
    `${network.name}.json`
  );

  if (!fs.existsSync(deploymentFile)) {
    console.log("❌ Deployment file not found. Deploy the contract first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  // Get contract instance
  const HealthInsuranceDApp = await ethers.getContractFactory(
    "HealthInsuranceDApp"
  );
  const healthInsurance = HealthInsuranceDApp.attach(contractAddress);

  console.log(`📍 Contract address: ${contractAddress}`);

  // Example setup operations
  console.log("\n🔧 Performing setup operations...");

  try {
    // Example: Authorize a doctor address (replace with actual doctor address)
    const [deployer] = await ethers.getSigners();
    const doctorAddress = "0x742d35Cc6634C0532925a3b8D5c9E5C5E6b75F7F"; // Example address

    console.log("👨‍⚕️ Authorizing doctor address...");
    const authorizeTx = await healthInsurance.authorizeDoctorAddress(
      doctorAddress,
      true
    );
    await authorizeTx.wait();
    console.log(`✅ Doctor authorized: ${doctorAddress}`);

    // Example: Update plan metadata with IPFS hashes (replace with actual IPFS hashes)
    console.log("📋 Updating plan metadata...");

    const basicPlanHash = "QmBasicPlanHashExample123456789";
    const premiumPlanHash = "QmPremiumPlanHashExample123456789";
    const platinumPlanHash = "QmPlatinumPlanHashExample123456789";

    await healthInsurance.updatePlanMetadata(0, basicPlanHash); // BASIC
    await healthInsurance.updatePlanMetadata(1, premiumPlanHash); // PREMIUM
    await healthInsurance.updatePlanMetadata(2, platinumPlanHash); // PLATINUM

    console.log("✅ Plan metadata updated with IPFS hashes");

    console.log("\n✨ Setup completed successfully!");
  } catch (error) {
    console.log("❌ Setup failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
