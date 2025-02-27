import React, { useEffect, useState } from 'react'
import Header from '@components/Header/Header'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { WalletType } from '@web3/wallet'
import { DEFAULT_PUBLICKEY } from '@consts/static'
import { actions as walletActions, Status } from '@reducers/solanaWallet'
import { address, status } from '@selectors/solanaWallet'
import { actions } from '@reducers/solanaConnection'
import { network } from '@selectors/solanaConnection'

export const HeaderWrapper: React.FC = () => {
  const dispatch = useDispatch()
  const walletAddress = useSelector(address)
  const walletStatus = useSelector(status)
  const currentNetwork = useSelector(network)
  const location = useLocation()
  const [typeOfWallet, setTypeOfWallet] = useState<WalletType>(WalletType.PHANTOM)
  useEffect(() => {
    let enumWallet = WalletType.PHANTOM
    const sessionWallet = localStorage.getItem('INVARIANT_SESSION_WALLET')
    if (
      sessionWallet === 'phantom' ||
      sessionWallet === 'sollet' ||
      sessionWallet === 'math' ||
      sessionWallet === 'solflare' ||
      sessionWallet === 'coin98' ||
      sessionWallet === 'slope' ||
      sessionWallet === 'clover'
    ) {
      switch (sessionWallet) {
        case 'phantom':
          enumWallet = WalletType.PHANTOM
          break
        case 'sollet':
          enumWallet = WalletType.SOLLET
          break
        case 'math':
          enumWallet = WalletType.MATH
          break
        case 'solflare':
          enumWallet = WalletType.SOLFLARE
          break
        case 'coin98':
          enumWallet = WalletType.COIN98
          break
        case 'slope':
          enumWallet = WalletType.SLOPE
          break
        case 'clover':
          enumWallet = WalletType.CLOVER
          break
        default:
          enumWallet = WalletType.PHANTOM
      }
      setTypeOfWallet(enumWallet)
      dispatch(walletActions.connect(enumWallet))
    }
  }, [])

  return (
    <Header
      address={walletAddress}
      onNetworkSelect={chosen => {
        if (chosen !== currentNetwork) {
          dispatch(actions.setNetwork(chosen))
        }
      }}
      onWalletSelect={chosen => {
        if (walletAddress.equals(DEFAULT_PUBLICKEY)) {
          setTypeOfWallet(chosen)
        }
        dispatch(walletActions.connect(chosen))
      }}
      landing={location.pathname.substr(1)}
      walletConnected={walletStatus === Status.Initialized}
      onFaucet={() => {
        dispatch(walletActions.airdrop())
      }}
      onDisconnectWallet={() => {
        dispatch(walletActions.disconnect())
      }}
      typeOfNetwork={currentNetwork}
      typeOfWallet={typeOfWallet}
    />
  )
}

export default HeaderWrapper
