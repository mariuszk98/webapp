import React, { useState, useMemo, useEffect } from 'react'
import NewPosition from '@components/NewPosition/NewPosition'
import { actions } from '@reducers/positions'
import { useDispatch, useSelector } from 'react-redux'
import { SwapToken, swapTokens, status, swapTokensDict } from '@selectors/solanaWallet'
import { DECIMAL, FEE_TIERS } from '@invariant-labs/sdk/lib/utils'
import { calcPrice, createPlaceholderLiquidityPlot, printBN } from '@consts/utils'
import { pools } from '@selectors/pools'
import { getLiquidityByX, getLiquidityByY } from '@invariant-labs/sdk/src/math'
import { Decimal } from '@invariant-labs/sdk/lib/market'
import { initPosition, plotTicks } from '@selectors/positions'
import { BN } from '@project-serum/anchor'
import { bestTiers } from '@consts/static'
import { Status, actions as walletActions } from '@reducers/solanaWallet'
import { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import { network } from '@selectors/solanaConnection'

export const NewPositionWrapper = () => {
  const dispatch = useDispatch()

  const tokens = useSelector(swapTokens)
  const tokensDict = useSelector(swapTokensDict)
  const walletStatus = useSelector(status)
  const allPools = useSelector(pools)
  const { success, inProgress } = useSelector(initPosition)
  const { data: ticksData, loading: ticksLoading } = useSelector(plotTicks)
  const currentNetwork = useSelector(network)

  const [poolIndex, setPoolIndex] = useState<number | null>(null)

  const [liquidity, setLiquidity] = useState<Decimal>({ v: new BN(0) })

  const [progress, setProgress] = useState<ProgressState>('none')

  useEffect(() => {
    setProgress('none')
  }, [poolIndex])

  useEffect(() => {
    if (!inProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 1500)

      setTimeout(() => {
        setProgress('none')
      }, 3000)
    }
  }, [success, inProgress])

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)

  const isXtoY = useMemo(() => {
    if (poolIndex !== null && tokenAIndex !== null && tokenBIndex !== null) {
      return allPools[poolIndex].tokenX.equals(tokens[tokenAIndex].assetAddress)
    }
    return true
  }, [poolIndex, tokenAIndex])

  const xDecimal = useMemo(() => {
    if (poolIndex !== null && tokenAIndex !== null && tokenBIndex !== null) {
      return allPools[poolIndex].tokenX.equals(tokens[tokenAIndex].assetAddress)
        ? tokens[tokenAIndex].decimals
        : tokens[tokenBIndex].decimals
    }
    return 0
  }, [poolIndex, tokenAIndex])

  const yDecimal = useMemo(() => {
    if (poolIndex !== null && tokenAIndex !== null && tokenBIndex !== null) {
      return allPools[poolIndex].tokenX.equals(tokens[tokenAIndex].assetAddress)
        ? tokens[tokenBIndex].decimals
        : tokens[tokenAIndex].decimals
    }
    return 0
  }, [poolIndex, tokenAIndex])

  const tickSpacing = useMemo(() => {
    if (poolIndex !== null) {
      return allPools[poolIndex].tickSpacing
    }

    return 1
  }, [poolIndex])

  const midPrice = useMemo(() => {
    if (poolIndex !== null) {
      return {
        index: allPools[poolIndex].currentTickIndex,
        x: calcPrice(allPools[poolIndex].currentTickIndex, isXtoY, xDecimal, yDecimal)
      }
    }

    return {
      index: 0,
      x: 0
    }
  }, [poolIndex, isXtoY, xDecimal, yDecimal])

  const tokensB = useMemo(() => {
    if (tokenAIndex === null) {
      return []
    }

    const poolsForTokenA = allPools.filter(
      pool =>
        pool.tokenX.equals(tokens[tokenAIndex].assetAddress) ||
        pool.tokenY.equals(tokens[tokenAIndex].assetAddress)
    )

    const notUnique = poolsForTokenA.map(
      pool =>
        tokensDict[
          pool.tokenX.equals(tokens[tokenAIndex].assetAddress)
            ? pool.tokenY.toString()
            : pool.tokenX.toString()
        ]
    )

    const unique: Record<string, SwapToken> = notUnique.reduce((prev, token) => {
      return {
        [token.assetAddress.toString()]: token,
        ...prev
      }
    }, {})

    return Object.values(unique)
  }, [tokenAIndex, allPools.length])

  const [currentPairReversed, setCurrentPairReversed] = useState<boolean | null>(null)

  const data = useMemo(() => {
    if (ticksLoading) {
      return createPlaceholderLiquidityPlot(isXtoY, 10, tickSpacing, xDecimal, yDecimal)
    }

    if (currentPairReversed === true) {
      return ticksData.map(tick => ({ ...tick, x: 1 / tick.x })).reverse()
    }

    return ticksData
  }, [ticksData, ticksLoading, isXtoY, tickSpacing, xDecimal, yDecimal, currentPairReversed])

  const [feeTier, setFeeTier] = useState(-1)

  const initialIsDiscreteValue = localStorage.getItem('IS_PLOT_DISCRETE') === 'true'

  const setIsDiscreteValue = (val: boolean) => {
    localStorage.setItem('IS_PLOT_DISCRETE', val ? 'true' : 'false')
  }

  return (
    <NewPosition
      tokens={tokens}
      tokensB={tokensB}
      onChangePositionTokens={(tokenA, tokenB, fee) => {
        if (
          tokenA !== null &&
          tokenB !== null &&
          !(tokenAIndex === tokenA && tokenBIndex === tokenB && fee === feeTier)
        ) {
          const index = allPools.findIndex(
            pool =>
              pool.fee.v.eq(FEE_TIERS[fee].fee) &&
              ((pool.tokenX.equals(tokens[tokenA].assetAddress) &&
                pool.tokenY.equals(tokens[tokenB].assetAddress)) ||
                (pool.tokenX.equals(tokens[tokenB].assetAddress) &&
                  pool.tokenY.equals(tokens[tokenA].assetAddress)))
          )

          if (index !== poolIndex) {
            setPoolIndex(index !== -1 ? index : null)
            setCurrentPairReversed(null)
          } else {
            setCurrentPairReversed(currentPairReversed === null ? true : !currentPairReversed)
          }

          if (index !== -1 && index !== poolIndex) {
            dispatch(
              actions.getCurrentPlotTicks({
                poolIndex: index,
                isXtoY: allPools[index].tokenX.equals(tokens[tokenA].assetAddress)
              })
            )
          }
        }

        setTokenAIndex(tokenA)
        setTokenBIndex(tokenB)
        setFeeTier(fee)
      }}
      feeTiers={FEE_TIERS.map(tier => +printBN(tier.fee, DECIMAL - 2))}
      data={data}
      midPrice={midPrice}
      addLiquidityHandler={(leftTickIndex, rightTickIndex, xAmount, yAmount) => {
        if (poolIndex === null) {
          return
        }

        if (progress === 'none') {
          setProgress('progress')
        }

        const lowerTick = Math.min(leftTickIndex, rightTickIndex)
        const upperTick = Math.max(leftTickIndex, rightTickIndex)

        dispatch(
          actions.initPosition({
            poolIndex,
            lowerTick,
            upperTick,
            liquidityDelta: liquidity,
            xAmount,
            yAmount
          })
        )
      }}
      isCurrentPoolExisting={poolIndex !== null}
      calcAmount={(amount, left, right, tokenAddress) => {
        if (poolIndex === null || isNaN(left) || isNaN(right)) {
          return new BN(0)
        }

        const byX = tokenAddress.equals(allPools[poolIndex].tokenX)
        const lowerTick = Math.min(left, right)
        const upperTick = Math.max(left, right)

        console.log('liquidity calc by:', tokenAddress.toString())
        console.log('pool token x:', allPools[poolIndex].tokenX.toString())

        try {
          if (byX) {
            const result = getLiquidityByX(
              amount,
              lowerTick,
              upperTick,
              allPools[poolIndex].sqrtPrice,
              true
            )
            setLiquidity(result.liquidity)

            console.log(
              'x:',
              amount.toString(),
              'y:',
              result.y.toString(),
              'ticks:',
              lowerTick,
              upperTick,
              'liquidity',
              result.liquidity.v.toString()
            )

            return result.y
          }

          const result = getLiquidityByY(
            amount,
            lowerTick,
            upperTick,
            allPools[poolIndex].sqrtPrice,
            true
          )
          setLiquidity(result.liquidity)

          console.log(
            'y:',
            amount.toString(),
            'x:',
            result.x.toString(),
            'ticks:',
            lowerTick,
            upperTick,
            'liquidity',
            result.liquidity.v.toString()
          )

          return result.x
        } catch (error) {
          const result = (byX ? getLiquidityByY : getLiquidityByX)(
            amount,
            lowerTick,
            upperTick,
            allPools[poolIndex].sqrtPrice,
            true
          )
          setLiquidity(result.liquidity)

          console.log(
            'err',
            byX ? 'x:' : 'y:',
            amount.toString(),
            'ticks:',
            lowerTick,
            upperTick,
            'liquidity:',
            result.liquidity.v.toString()
          )
        }

        return new BN(0)
      }}
      ticksLoading={ticksLoading}
      showNoConnected={walletStatus !== Status.Initialized}
      noConnectedBlockerProps={{
        onConnect: type => {
          dispatch(walletActions.connect(type))
        },
        onDisconnect: () => {
          dispatch(walletActions.disconnect())
        },
        descCustomText: 'Cannot add any liquidity.'
      }}
      progress={progress}
      isXtoY={isXtoY}
      tickSpacing={tickSpacing}
      xDecimal={xDecimal}
      yDecimal={yDecimal}
      poolIndex={poolIndex}
      currentPairReversed={currentPairReversed}
      bestTiers={bestTiers[currentNetwork]}
      initialIsDiscreteValue={initialIsDiscreteValue}
      onDiscreteChange={setIsDiscreteValue}
    />
  )
}

export default NewPositionWrapper
