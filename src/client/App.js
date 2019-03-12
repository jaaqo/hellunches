import React, {useEffect, useContext, createContext, useReducer} from 'react'
import moment from 'moment'
import {I18nProvider} from '@lingui/react'
import {Trans} from '@lingui/macro'
import fiMessages from './locales/fi/messages'
import enMessages from './locales/en/messages'
import {getLunches} from './lunches'
import './App.css'

const catalogs = {fi: fiMessages, en: enMessages}

const AppContext = createContext(null)

const initialState = {
  filter: 'today',
  restaurants: [],
  loading: true,
  i18n: {
    currentLanguage: 'fi',
    catalogs
  }
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'filter':
      return {...state, filter: action.payload}
    case 'restaurants':
      return {...state, restaurants: action.payload}
    case 'loading':
      return {...state, loading: true}
    case 'ready':
      return {...state, loading: false}
    case 'language':
      return {...state, i18n: {...state.i18n, currentLanguage: action.payload}}
    default:
      return state
  }
}

const FilterControls = () => {
  const {
    state: {filter},
    dispatch
  } = useContext(AppContext)

  return (
    <div className="Controls">
      <button
        onClick={() => dispatch({type: 'filter', payload: 'today'})}
        className={filter === 'today' ? 'button-primary' : ''}
      >
        <Trans>Today</Trans>
      </button>
      <button
        onClick={() => dispatch({type: 'filter', payload: 'tomorrow'})}
        className={filter === 'tomorrow' ? 'button-primary' : ''}
      >
        <Trans>Tomorrow</Trans>
      </button>
    </div>
  )
}

const Lunches = () => {
  const {
    state: {restaurants, filter}
  } = useContext(AppContext)

  const today = moment.utc()
  const tomorrow = today.clone().add(1, 'days')

  return (
    <div className="Lunches">
      {restaurants.map((r, i) => {
        const lunches = r.lunches.filter(d => {
          if (filter === 'today') {
            return today.isSame(d.date, 'day')
          } else if (filter === 'tomorrow') {
            return tomorrow.isSame(d.date, 'day')
          } else {
            return false
          }
        })

        const isLunches = lunches.length > 0

        return (
          <div className="LunchMenu" key={i}>
            <h2>{r.name}</h2>
            <ul className="LunchMenu-Container">
              {isLunches ? (
                lunches.map((d, i) => {
                  return (
                    <li className="LunchMenu-Day" key={i}>
                      <h3 className="LunchMenu-Date">
                        {moment(d.date).format('LL')}
                      </h3>
                      <ul>
                        {d.menuLines.map((m, i) => (
                          <li key={i} className="LunchMenu-MenuLine">
                            {m}
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                })
              ) : (
                <li className="LunchMenu-Day">
                  <h3 className="LunchMenu-Date NoLunch">
                    <i>No lunch</i>
                  </h3>
                </li>
              )}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchInitialData = async () => {
    dispatch({type: 'loading'})
    const lunches = await getLunches()
    dispatch({type: 'restaurants', payload: lunches})
    dispatch({type: 'ready'})
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  return (
    <AppContext.Provider value={{state, dispatch}}>
      <I18nProvider
        language={state.i18n.currentLanguage}
        catalogs={state.i18n.catalogs}
      >
        <div className="App">
          {state.loading ? (
            <div className="App-Loader">...</div>
          ) : (
            <>
              <FilterControls />
              <Lunches />
            </>
          )}
        </div>
      </I18nProvider>
    </AppContext.Provider>
  )
}

export default App
