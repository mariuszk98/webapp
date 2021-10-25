import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    padding: '0 150px',
    height: 70,
    justifyContent: 'space-between'
  },
  logo: {
    minWidth: 150,
    height: 40
  },

  routers: {
    background: 'radial-gradient(140% 140% at 50.43% 0%, #18161D 0%, rgba(24, 22, 29, 0) 100%)',
    borderRadius: '10px'
  },
  connectedWalletIcon: {
    minWidth: 21,
    height: 21,
    marginRight: 0
  },

  left: {
    display: 'flex',
    flexDirection: 'row'
  },

  buttons: {
    justifyContent: 'flex-end'
  },
  link: {
    textDecoration: 'none'
  }
}))

export default useStyles