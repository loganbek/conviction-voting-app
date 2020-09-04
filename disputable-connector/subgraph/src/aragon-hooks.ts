import { Address, log } from '@graphprotocol/graph-ts'
import { loadAppConfig } from './helpers'


const CONVICTION_APP_IDS: string[] = [
  '0xca60629a22f03bcad7738fee1a6f0c5863eb89463621b40566a6799b82cbe184',  // disputable-conviction-voting.open.aragonpm.eth
]   

const AGREEMENT_APP_ID = '0x34c62f3aec3073826f39c2c35e9a1297d9dbf3cc77472283106f09eee9cf47bf' // agreement.open.aragonpm.eth
/*
 * Called when an app proxy is detected.
 *
 * Return the name of a data source template if you would like to create it for a given appId.
 * Return null otherwise.
 *
 * The returned name is used to instantiate a template declared in the subgraph manifest file,
 * which must have the same name.
 */
export function getTemplateForApp(appId: string): string | null {
  if (
    CONVICTION_APP_IDS.includes(appId)
  ) {
    return 'ConvictionVoting'
  } else if (appId == AGREEMENT_APP_ID){
    return 'Agreement'
  } else {
    return null
  }
}

export function onOrgTemplateCreated(orgAddress: Address): void {}
export function onAppTemplateCreated(appAddress: Address, appId: string): void {
  loadAppConfig(appAddress)
}
export function onTokenTemplateCreated(tokenAddress: Address): void {}
