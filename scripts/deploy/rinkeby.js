const { utf8ToHex } = require('web3-utils')
const { injectWeb3, injectArtifacts, bn, ONE_DAY } = require('@aragon/contract-helpers-test')

const { hash } = require('eth-ens-namehash')
const createActions = require('./src/create-actions')
const createDao = require('./src/create-dao')
const installApps = require('./src/install-apps')
const installConvictionVoting = require('./src/install-conviction-voting')
const installAgreements = require('./src/install-agreements')
const Arapp = require("../../arapp.json")

const RINKEBY_ENS_REGISTRY_ADDRESS = Arapp.environments.rinkeby.registry
const ONE_HUNDRED_PERCENT = 1e18

const config = {
  kernelBase:             '0x4686292fE68E77B0a873b6fAE37bE5B95512CeBe', // Can be ''
  aclBase:                '0x5c0CAA2D840e42A64cF16F63aC643b09421129B9', // Can be ''
  evmScriptReg:           '0xB5062c5cA2e516Dd55847e33a8C7db28aFA59333', // Can be ''
  daoFact:                '0xCe4F0dD0c46D606Ce1a8dffb85795f12487Fbd9e', // Can be ''
  vaultBase:              '0x52Fd211801ff48aC67456bF846216094A12D48Ac', // Can be ''
  hookedTmBase:           '0x2467333f97da713663682Ac4FBB225D6D49931BE', // Can be ''

  // To create new DAO set all of the below app/proxy addresses to ''
  dao:                    '0xde5d2afff93dceff29e145c3f1eea21d2cf2afa1', // Can be ''
  vault:                  '0xfA35bD0309AC260fC7eeF003b65d7813B252D699', // Can be ''
  hookedTm:               '0x32D99E0ADC1e77C81592BeCaC6E01CF250E9EFc1', // Can be ''
  convictionVoting: {
    base:                 '0x67034E5020F9fbf9FF9aa87255B97457A5670eee', // Can be ''
    proxy:                '0xe8822e320692792d1fff9a5e288bdca6a7c98146', // Can be ''
    appId:                hash('disputable-conviction-voting.open.aragonpm.eth'),
    stakeToken:           '0xe612008fE3a2df8C5c01c069676CD4230016F15a', // Can be ''
    requestToken:         '0x2C82eAB07a48CC425c95Dba0252f80cf27A0F0A4', // Can be ''
    decay:                bn(9000000),
    maxRatio:             bn(2000000),
    weight:               bn(20000),
    minThresholdStakePercentage: bn((0.2 * ONE_HUNDRED_PERCENT)), // 20%
    actionCollateral:     bn(0),
    challengeCollateral:  bn(0),
    challengeDuration:    ONE_DAY * 3
  },

  arbitrator:     '0x52180af656a1923024d1accf1d827ab85ce48878',   // Aragon Court staging instance
  stakingFactory: '0x07429001eeA415E967C57B8d43484233d57F8b0B',   // Real StakingFactory instance on Rinkeby
  appFeesCashier: '0x0000000000000000000000000000000000000000',   // None
  feeToken:       '0x3af6b2f907f0c55f279e0ed65751984e6cdc4a42',   // DAI mock token used in Aragon Court staging
  agreement: {
    base:         '0xAC7bA031E2A598A01d823aa96fB25b6662721de6',    // Agreement base v4.0.0
    proxy:        '0xc2d5d062fC6124ea342F474cb3486072e081848d',    // Can be ''
    appId:        '0x34c62f3aec3073826f39c2c35e9a1297d9dbf3cc77472283106f09eee9cf47bf',
    title:        'Agreement Test v3',
    content:      utf8ToHex('ipfs:QmdLu3XXT9uUYxqDKXXsTYG77qNYNPbhzL27ZYT9kErqcZ')
  }
}

async function deploy() {
  let options = await loadConfig(config)
  options = await createDao(artifacts, options)
  options = await installApps(artifacts, options)
  options = await installConvictionVoting(artifacts, options)
  options = await installAgreements(artifacts, options)

  await createActions(options)
}

async function loadConfig(config) {

  const options = config

  options.owner = await getSender()

  options.kernelBase = await instanceOrEmpty(options.kernelBase, 'Kernel')
  options.aclBase = await instanceOrEmpty(options.aclBase, 'ACL')
  options.evmScriptReg = await instanceOrEmpty(options.evmScriptReg, 'EVMScriptRegistryFactory')
  options.daoFact = await instanceOrEmpty(options.daoFact, 'DAOFactory')
  options.dao = await instanceOrEmpty(options.dao, 'Kernel')
  options.acl = options.dao ? await getInstance('ACL', await options.dao.acl()) : ''

  options.vaultBase = await instanceOrEmpty(options.vaultBase, 'Vault')
  options.vault = await instanceOrEmpty(options.vault, 'Vault')
  options.hookedTmBase = await instanceOrEmpty(options.hookedTmBase, 'HookedTokenManager')
  options.hookedTm = await instanceOrEmpty(options.hookedTm, 'HookedTokenManager')
  options.convictionVoting.base = await instanceOrEmpty(options.convictionVoting.base, 'ConvictionVoting')
  options.convictionVoting.proxy = await instanceOrEmpty(options.convictionVoting.proxy, 'ConvictionVoting')
  options.convictionVoting.stakeToken = await instanceOrEmpty(options.convictionVoting.stakeToken, 'ERC20')
  options.convictionVoting.requestToken = await instanceOrEmpty(options.convictionVoting.requestToken, 'ERC20')

  options.agreement.base = await getInstance('Agreement', options.agreement.base)
  options.agreement.proxy = await instanceOrEmpty(options.agreement.proxy, 'Agreement')
  options.feeToken = await getInstance('MiniMeToken', options.feeToken)
  options.arbitrator = await getInstance('IArbitrator', options.arbitrator)
  options.stakingFactory = await getInstance('StakingFactory', options.stakingFactory)
  options.aragonAppFeesCashier = { address: options.appFeesCashier }

  return options
}

async function getSender() {
  const accounts = await web3.eth.getAccounts()
  return accounts[0]
}

const instanceOrEmpty = async (address, contractType) => {
  return address ? await getInstance(contractType, address) : ''
}

async function getInstance(contract, address) {
  return artifacts.require(contract).at(address)
}

module.exports = async (callback) => {
  injectWeb3(web3)
  injectArtifacts(artifacts)
  try {
    await deploy()
  } catch (error) {
    console.log(error)
  }
  callback()
}
