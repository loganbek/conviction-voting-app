import { useAragonApi } from '@aragon/api-react'
import BN from 'bn.js'
import { calculateThreshold, getMaxConviction } from '../lib/conviction'

export function getStakesAndThreshold(proposal = {}) {
  const { appState } = useAragonApi()
  const {
    convictionStakes,
    stakeToken,
    requestToken,
    globalParams: { alpha, maxRatio, weight },
  } = appState

  const { requestedAmount } = proposal
  const stakes = convictionStakes.filter(
    stake => stake.proposal === parseInt(proposal.id)
  )

  const { totalTokensStaked } = [...stakes].pop() || {
    totalTokensStaked: new BN('0'),
  }

  const threshold = calculateThreshold(
    requestedAmount,
    requestToken.amount || 0,
    stakeToken.tokenSupply || 0,
    alpha,
    maxRatio,
    weight
  )

  const max = getMaxConviction(stakeToken.tokenSupply || 0, alpha)
  return { stakes, totalTokensStaked, threshold, max }
}
