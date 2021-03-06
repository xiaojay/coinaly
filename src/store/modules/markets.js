import axios from '../../axios'
import Vue from 'vue'
import VueCookie from 'vue-cookie'
Vue.use(VueCookie)

const selectedMarketCookie = Vue.cookie.get('selectedMarket') || null
const initialSelectedMarket = (selectedMarketCookie === 'null' ? null : selectedMarketCookie)

function filterMarkets (array, currency) {
  return array.filter(market => {
    return market.symbol.includes(`/${currency}`) // Symbol is something like: XRP/BTC or ETH/BTC (where /BTC is the main market)
  })
}

function reduceQuoteVolume (array) {
  return array.reduce((total, number) => {
    return total + number.quoteVolume
  }, 0)
}

export default {
  namespaced: true,
  state: {
    markets: [],
    isLoading: true,
    selectedMarket: initialSelectedMarket
  },
  mutations: {
    addAllMarkets (state, items) {
      state.markets = Object.values(items)
    },
    startLoading (state) {
      state.isLoading = true
    },
    stopLoading (state) {
      state.isLoading = false
    },
    setSelectedMarket (state, market) {
      Vue.cookie.set('selectedMarket', market, { expires: '99Y' })
      state.selectedMarket = market
    },
    removeSelectedMarket (state) {
      state.selectedMarket = null
      Vue.cookie.delete('selectedMarket')
    }
  },
  getters: {
    selectedMarket (state) {
      return state.selectedMarket
    },
    allMarkets: state => {
      return state.markets
    },
    allBtcMarkets: state => {
      return filterMarkets(state.markets, 'BTC')
    },
    allEthMarkets: state => {
      return filterMarkets(state.markets, 'ETH')
    },
    allUsdMarkets: state => {
      return filterMarkets(state.markets, 'USDT')
    },
    totalVolume: state => {
      if (state.markets.length) {
        return reduceQuoteVolume(state.markets)
      } else {
        return null
      }
    },
    totalBtcVolume: state => {
      if (state.markets.length) {
        const filteredMarkets = filterMarkets(state.markets, 'BTC')
        return reduceQuoteVolume(filteredMarkets)
      } else {
        return null
      }
    },
    totalEthVolume: state => {
      if (state.markets.length) {
        const filteredMarkets = filterMarkets(state.markets, 'ETH')
        return reduceQuoteVolume(filteredMarkets)
      } else {
        return null
      }
    },
    totalUsdVolume: state => {
      if (state.markets.length) {
        const filteredMarkets = filterMarkets(state.markets, 'USDT')
        return reduceQuoteVolume(filteredMarkets)
      } else {
        return null
      }
    },
    isLoading: state => {
      return state.isLoading
    }
  },
  actions: {
    getAll (context) {
      context.commit('startLoading')
      return axios.get(`api/tickers`)
      .then(response => {
        context.commit('addAllMarkets', response.data)
      })
      .catch(error => {
        console.error('Failed to get the markets.', error)
      })
      .finally(() => {
        context.commit('stopLoading')
      })
    }
  }
}
