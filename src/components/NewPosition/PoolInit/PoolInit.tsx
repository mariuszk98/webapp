import { Button, Grid, Typography } from '@material-ui/core'
import React, { useState, useEffect } from 'react'
import RangeInput from '@components/Inputs/RangeInput/RangeInput'
import {
  calcPrice,
  spacingMultiplicityGte,
  spacingMultiplicityLte,
  nearestTickIndex,
  formatNumbers,
  showPrefix
} from '@consts/utils'
import { MIN_TICK } from '@invariant-labs/sdk'
import { MAX_TICK } from '@invariant-labs/sdk/src'
import SimpleInput from '@components/Inputs/SimpleInput/SimpleInput'
import useStyles from './style'
import AnimatedNumber from '@components/AnimatedNumber'

export interface IPoolInit {
  tokenASymbol: string
  tokenBSymbol: string
  onChangeRange: (leftIndex: number, rightIndex: number) => void
  isXtoY: boolean
  xDecimal: number
  yDecimal: number
  tickSpacing: number
  midPrice: number
  onChangeMidPrice: (mid: number) => void
}

export const PoolInit: React.FC<IPoolInit> = ({
  tokenASymbol,
  tokenBSymbol,
  onChangeRange,
  isXtoY,
  xDecimal,
  yDecimal,
  tickSpacing,
  midPrice,
  onChangeMidPrice
}) => {
  const classes = useStyles()

  const [leftRange, setLeftRange] = useState(MIN_TICK)
  const [rightRange, setRightRange] = useState(MAX_TICK)

  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')

  const [midPriceInput, setMidPriceInput] = useState('')
  useEffect(() => {
    onChangeMidPrice(nearestTickIndex(+midPriceInput, tickSpacing, isXtoY, xDecimal, yDecimal))
  }, [midPriceInput])

  const changeRangeHandler = (left: number, right: number) => {
    setLeftRange(left)
    setRightRange(right)

    setLeftInput(calcPrice(left, isXtoY, xDecimal, yDecimal).toString())
    setRightInput(calcPrice(right, isXtoY, xDecimal, yDecimal).toString())

    onChangeRange(left, right)
  }

  const resetRange = () => {}

  return (
    <Grid container className={classes.wrapper}>
      <Typography className={classes.header}>Starting price</Typography>
      <Grid container className={classes.innerWrapper} direction='column'>
        <Grid className={classes.infoWrapper}>
          <Typography className={classes.info}>
            This pool does not exist yet. Select a pair of tokens, then choose a fee. Enter the
            amount of Token A, then Token B and press the button.
          </Typography>
        </Grid>

        <SimpleInput
          setValue={setMidPriceInput}
          value={midPriceInput}
          decimal={isXtoY ? xDecimal : yDecimal}
          className={classes.midPrice}
          placeholder='0.0'
        />

        <Grid
          className={classes.priceWrapper}
          container
          justifyContent='space-between'
          alignItems='center'>
          <Typography className={classes.priceLabel}>{tokenBSymbol} starting price: </Typography>

          <Typography className={classes.priceValue}>
            <AnimatedNumber
              value={calcPrice(midPrice, isXtoY, xDecimal, yDecimal).toFixed(
                isXtoY ? xDecimal : yDecimal
              )}
              duration={300}
              formatValue={formatNumbers()}
            />
            {showPrefix(calcPrice(midPrice, isXtoY, xDecimal, yDecimal))} {tokenASymbol}
          </Typography>
        </Grid>

        <Typography className={classes.subheader}>Set price range</Typography>
        <Grid container className={classes.inputs}>
          <RangeInput
            className={classes.input}
            label='Min price'
            tokenFromSymbol={tokenASymbol}
            tokenToSymbol={tokenBSymbol}
            currentValue={leftInput}
            setValue={setLeftInput}
            decreaseValue={() => {
              const newLeft = isXtoY
                ? Math.max(spacingMultiplicityGte(MIN_TICK, tickSpacing), leftRange - tickSpacing)
                : Math.min(spacingMultiplicityLte(MAX_TICK, tickSpacing), leftRange + tickSpacing)
              changeRangeHandler(newLeft, rightRange)
            }}
            increaseValue={() => {
              const newLeft = isXtoY
                ? Math.min(rightRange - tickSpacing, leftRange + tickSpacing)
                : Math.max(rightRange + tickSpacing, leftRange - tickSpacing)

              changeRangeHandler(newLeft, rightRange)
            }}
            onBlur={() => {
              const newLeft = isXtoY
                ? Math.min(
                    rightRange - tickSpacing,
                    nearestTickIndex(+leftInput, tickSpacing, isXtoY, xDecimal, yDecimal)
                  )
                : Math.max(
                    rightRange + tickSpacing,
                    nearestTickIndex(+leftInput, tickSpacing, isXtoY, xDecimal, yDecimal)
                  )

              changeRangeHandler(newLeft, rightRange)
            }}
          />
          <RangeInput
            className={classes.input}
            label='Max price'
            tokenFromSymbol={tokenASymbol}
            tokenToSymbol={tokenBSymbol}
            currentValue={rightInput}
            setValue={setRightInput}
            decreaseValue={() => {
              const newRight = isXtoY
                ? Math.max(rightRange - tickSpacing, leftRange + tickSpacing)
                : Math.min(rightRange + tickSpacing, leftRange - tickSpacing)
              changeRangeHandler(leftRange, newRight)
            }}
            increaseValue={() => {
              const newRight = isXtoY
                ? Math.min(spacingMultiplicityLte(MAX_TICK, tickSpacing), rightRange + tickSpacing)
                : Math.max(spacingMultiplicityGte(MIN_TICK, tickSpacing), rightRange - tickSpacing)
              changeRangeHandler(leftRange, newRight)
            }}
            onBlur={() => {
              const newRight = isXtoY
                ? Math.max(
                    leftRange + tickSpacing,
                    nearestTickIndex(+rightInput, tickSpacing, isXtoY, xDecimal, yDecimal)
                  )
                : Math.min(
                    leftRange - tickSpacing,
                    nearestTickIndex(+rightInput, tickSpacing, isXtoY, xDecimal, yDecimal)
                  )
              changeRangeHandler(leftRange, newRight)
            }}
          />
        </Grid>
        <Grid container className={classes.buttons}>
          <Button className={classes.button} onClick={resetRange}>
            Reset range
          </Button>
          <Button
            className={classes.button}
            onClick={() => {
              changeRangeHandler(
                isXtoY
                  ? spacingMultiplicityGte(MIN_TICK, tickSpacing)
                  : spacingMultiplicityLte(MAX_TICK, tickSpacing),
                isXtoY
                  ? spacingMultiplicityLte(MAX_TICK, tickSpacing)
                  : spacingMultiplicityGte(MIN_TICK, tickSpacing)
              )
            }}>
            Set full range
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PoolInit