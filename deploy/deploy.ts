import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedConfidentialStorage = await deploy("ConfidentialStorage", {
    from: deployer,
    log: true,
  });

  console.log(`ConfidentialStorage contract: `, deployedConfidentialStorage.address);
};
export default func;
func.id = "deploy_confidential_storage"; // id required to prevent reexecution
func.tags = ["ConfidentialStorage"];
