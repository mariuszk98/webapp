import React, { useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { SwapPage } from './SwapPage/SwapPage'
import { useDispatch, useSelector } from 'react-redux'
import { ListPage } from './ListPage/ListPage'
import { toBlur } from '@consts/uiUtils'
import { NewPositionPage } from './NewPositionPage/NewPositionPage'
import { Status } from '@reducers/solanaWallet'
import EventsHandlers from '@containers/EventsHandlers'
import HeaderWrapper from '@containers/HeaderWrapper/HeaderWrapper'
import solanaConnectionSelector from '@selectors/solanaConnection'
import { actions as solanaConnectionActions } from '@reducers/solanaConnection'
import Footer from '@components/Footer/Footer'

export const PagesRouter: React.FC = () => {
  const dispatch = useDispatch()
  const signerStatus = useSelector(solanaConnectionSelector.status)

  useEffect(() => {
    // dispatch(providerActions.initProvider())
    dispatch(solanaConnectionActions.initSolanaConnection())
  }, [dispatch])
  return (
    <Router>
      {signerStatus === Status.Initialized && <EventsHandlers />}
      <div id={toBlur}>
        <HeaderWrapper />
        <Switch>
          <Route path='/swap' component={SwapPage} />
          <Route path={'/newPosition'} component={NewPositionPage} />
          <Route path={'/pool'} component={ListPage} />
          <Route path='*'>
            <Redirect to='/swap'>
              <SwapPage />
            </Redirect>
          </Route>
        </Switch>
        <Footer />
      </div>
    </Router>
  )
}

export default PagesRouter
