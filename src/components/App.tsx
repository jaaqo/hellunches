import React, {useEffect, useContext, createContext, useReducer} from 'react'
import moment from 'moment'
import {getLunches} from '../api/lunches'
import styles from './App.module.css'
import classNames from 'classnames'

const AppContext = createContext(null)

const initialState = {
  filter: 'today',
  restaurants: [],
  loading: true
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'filter':
      return {...state, filter: action.payload}
    case 'restaurants':
      return {
        ...state,
        restaurants: action.payload.data || [],
        error: action.payload.error
      }
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
    <div className={styles.Controls}>
      <button
        onClick={() => dispatch({type: 'filter', payload: 'today'})}
        className={filter === 'today' ? 'button-primary' : ''}
      >
        Today
      </button>
      <button
        onClick={() => dispatch({type: 'filter', payload: 'tomorrow'})}
        className={filter === 'tomorrow' ? 'button-primary' : ''}
      >
        Tomorrow
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
    <div className={styles.lunches}>
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
          <div className={styles.lunchMenu} key={i}>
            <h2>{r.name}</h2>
            <ul className={styles.lunchMenuContainer}>
              {isLunches ? (
                lunches.map((d, i) => {
                  return (
                    <li className={styles.lunchMenuDay} key={i}>
                      <h3 className={styles.lunchMenuDate}>
                        {moment(d.date).format('LL')}
                      </h3>
                      <ul>
                        {d.menuLines.map((m, i) => (
                          <li key={i} className={styles.lunchMenuMenuLine}>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                })
              ) : (
                <li className={styles.lunchMenuDay}>
                  <h3
                    className={classNames(styles.lunchMenuDate, styles.noLunch)}
                  >
                    No lunch
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
      <div className={styles.app}>
        {state.loading ? (
          <div className={styles.appLoader}>...</div>
        ) : (
          <>
            <FilterControls />
            <Lunches />
          </>
        )}
      </div>
    </AppContext.Provider>
  )
}

export default App
