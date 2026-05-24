// scripts/test-deployment.js
const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(
    `🧪 Testing Health Insurance DApp deployment on ${network.name}...`
  );

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

  console.log(`📍 Testing contract at: ${contractAddress}`);

  try {
    // Test 1: Check if contract is deployed correctly
    console.log("\n1️⃣ Checking contract deployment...");
    const owner = await healthInsurance.owner();
    console.log(`✅ Contract owner: ${owner}`);

    // Test 2: Check insurance plans
    console.log("\n2️⃣ Checking insurance plans...");
    const basicPlan = await healthInsurance.insurancePlans(0);
    const premiumPlan = await healthInsurance.insurancePlans(1);
    const platinumPlan = await healthInsurance.insurancePlans(2);

    console.log(
      `✅ Basic Plan: ${ethers.utils.formatEther(
        basicPlan.oneTimePrice
      )} ETH annual`
    );
    console.log(
      `✅ Premium Plan: ${ethers.utils.formatEther(
        premiumPlan.oneTimePrice
      )} ETH annual`
    );
    console.log(
      `✅ Platinum Plan: ${ethers.utils.formatEther(
        platinumPlan.oneTimePrice
      )} ETH annual`
    );

    // Test 3: Check counters
    console.log("\n3️⃣ Checking counters...");
    const totalPolicies = await healthInsurance.getTotalPolicies();
    const totalClaims = await healthInsurance.getTotalClaims();
    console.log(`✅ Total policies: ${totalPolicies}`);
    console.log(`✅ Total claims: ${totalClaims}`);

    // Test 4: Try purchasing a policy (if on localhost)
    if (network.name === "localhost" || network.name === "hardhat") {
      console.log("\n4️⃣ Testing policy purchase...");
      const [deployer, user] = await ethers.getSigners();

      const basicPlanPrice = basicPlan.oneTimePrice;
      const ipfsHash = "QmTestPolicyHash123456789";

      console.log(
        `💰 Purchasing basic plan for ${ethers.utils.formatEther(
          basicPlanPrice
        )} ETH...`
      );

      const purchaseTx = await healthInsurance.connect(user).purchasePolicy(
        0, // PlanType.BASIC
        0, // PaymentType.ONE_TIME
        ipfsHash,
        { value: basicPlanPrice }
      );

      await purchaseTx.wait();
      console.log("✅ Policy purchased successfully!");

      const newTotalPolicies = await healthInsurance.getTotalPolicies();
      console.log(`✅ New total policies: ${newTotalPolicies}`);

      // Check user policies
      const userPolicies = await healthInsurance.getUserPolicies(user.address);
      console.log(`✅ User policies: ${userPolicies.length} policy(ies)`);
    }

    console.log("\n✨ All tests passed!");
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
