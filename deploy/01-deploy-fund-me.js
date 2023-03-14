const { network } = require("hardhat")
const {verify } = require("../utils/verify")

//const helperConfig = require("../helper-hardhat-config")
//const networkConfig = helperConfig.networkConfig
// also same as
 const { networkConfig, developmentChains } = require("../helper-hardhat-config")
module.exports = async ({ getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId


    //if chainId is A use Y
    //if chainId is b use Z

    let ethUsdPriceFeedAddress //= networkConfig[chainId]["ethUsdPriceFeed"]
    if(developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
        
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }


    const args = [ethUsdPriceFeedAddress]

    //when deploying to tetnet or hardhat we want to use mock

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        //wait blockconfirmations before verifying

        waitConfirmations: network.config.blockConfirmations || 1,

    })

    //if the name of the network is not development chain 
    //we should go on and verify
    if(!developmentChains.includes(network.name) && 
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("------------------------------------")
}
module.exports.tags = ["all", "fundme"] 