import React, { useState } from 'react'
import SinglePositionInfo from '@components/PositionDetails/SinglePositionInfo/SinglePositionInfo'
import SinglePositionPlot from '@components/PositionDetails/SinglePositionPlot/SinglePositionPlot'
import { Button, Grid, Hidden, Typography } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'
import backIcon from '@static/svg/back-arrow.svg'
import useStyles from './style'
import { PlotTickData } from '@reducers/positions'
import { TickPlotPositionData } from '@components/PriceRangePlot/PriceRangePlot'
import { ILiquidityToken } from './SinglePositionInfo/consts'

interface IProps {
  detailsData: PlotTickData[]
  leftRange: TickPlotPositionData
  rightRange: TickPlotPositionData
  midPrice: TickPlotPositionData
  currentPrice: number
  tokenX: ILiquidityToken
  tokenY: ILiquidityToken
  onClickClaimFee: () => void
  closePosition: () => void
  ticksLoading: boolean
  tickSpacing: number
  fee: number
  min: number
  max: number
  initialIsDiscreteValue: boolean
  onDiscreteChange: (val: boolean) => void
}

const PositionDetails: React.FC<IProps> = ({
  detailsData,
  leftRange,
  rightRange,
  midPrice,
  currentPrice,
  tokenY,
  tokenX,
  onClickClaimFee,
  closePosition,
  ticksLoading,
  tickSpacing,
  fee,
  min,
  max,
  initialIsDiscreteValue,
  onDiscreteChange
}) => {
  const classes = useStyles()

  const history = useHistory()

  const [xToY, setXToY] = useState<boolean>(true)

  return (
    <Grid container className={classes.wrapperContainer} wrap='nowrap'>
      <Grid className={classes.positionDetails} container item direction='column'>
        <Link to='/pool' style={{ textDecoration: 'none' }}>
          <Grid className={classes.back} container item alignItems='center'>
            <img className={classes.backIcon} src={backIcon} />
            <Typography className={classes.backText}>Back to Liquidity Positions List</Typography>
          </Grid>
        </Link>

        <SinglePositionInfo
          fee={fee}
          onClickClaimFee={onClickClaimFee}
          closePosition={closePosition}
          tokenX={tokenX}
          tokenY={tokenY}
          xToY={xToY}
          swapHandler={() => setXToY(!xToY)}
        />
      </Grid>
      <Grid
        container
        item
        direction='column'
        alignItems='flex-end'
        className={classes.right}
        wrap='nowrap'>
        <Hidden xsDown>
          <Button
            className={classes.button}
            variant='contained'
            onClick={() => {
              history.push('/newPosition')
            }}>
            <span className={classes.buttonText}>+ Add Liquidity</span>
          </Button>
        </Hidden>

        <SinglePositionPlot
          data={
            detailsData.length
              ? xToY
                ? detailsData
                : detailsData.map(tick => ({ ...tick, x: 1 / tick.x })).reverse()
              : Array(100)
                  .fill(1)
                  .map((_e, index) => ({ x: index, y: index, index }))
          }
          leftRange={xToY ? leftRange : { ...rightRange, x: 1 / rightRange.x }}
          rightRange={xToY ? rightRange : { ...leftRange, x: 1 / leftRange.x }}
          midPrice={{
            ...midPrice,
            x: midPrice.x ** (xToY ? 1 : -1)
          }}
          currentPrice={currentPrice ** (xToY ? 1 : -1)}
          tokenY={tokenY}
          tokenX={tokenX}
          ticksLoading={ticksLoading}
          tickSpacing={tickSpacing}
          min={xToY ? min : 1 / max}
          max={xToY ? max : 1 / min}
          xToY={xToY}
          initialIsDiscreteValue={initialIsDiscreteValue}
          onDiscreteChange={onDiscreteChange}
        />
      </Grid>
    </Grid>
  )
}

export default PositionDetails
