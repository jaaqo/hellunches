import React, { useEffect, useContext, createContext, useReducer } from "react";
import { getLunches } from "./lunches";
import moment from "moment";
import "./App.css";

const AppContext = createContext(null);

const initialState = {
  filter: "today",
  lunches: [],
  loading: true
};

const reducer = (state, action) => {
  switch (action.type) {
    case "filter":
      return { ...state, filter: action.value };
    case "lunches":
      return { ...state, lunches: action.value };
    case "loading":
      return { ...state, loading: true };
    case "ready":
      return { ...state, loading: false };
    default:
      return state;
  }
};

const FilterControls = props => {
  const {
    state: { filter },
    dispatch
  } = useContext(AppContext);

  return (
    <div className="Controls">
      <button
        onClick={() => dispatch({ type: "filter", value: "today" })}
        className={filter === "today" ? "button-primary" : ""}
      >
        Today
      </button>
      <button
        onClick={() => dispatch({ type: "filter", value: "tomorrow" })}
        className={filter === "tomorrow" ? "button-primary" : ""}
      >
        Tomorrow
      </button>
    </div>
  );
};

const Lunches = props => {
  const {
    state: { lunches, filter }
  } = useContext(AppContext);

  const today = moment.utc();
  const tomorrow = today.clone().add(1, "days");

  return (
    <div className="Lunches">
      {lunches.map((l, i) => {
        const lunches = l.lunches.filter(d => {
          if (filter === "today") {
            return today.isSame(d.date, "day");
          } else if (filter === "tomorrow") {
            return tomorrow.isSame(d.date, "day");
          }
        });
        const isLunches = lunches.length > 0;
        return (
          <div className="LunchMenu" key={i}>
            <h2>{l.bistro}</h2>
            <ul className="LunchMenu-Container">
              {isLunches ? (
                lunches.map((d, i) => {
                  return (
                    <li className="LunchMenu-Day" key={i}>
                      <h3 className="LunchMenu-Date">
                        {moment(d.date).format("LL")}
                      </h3>
                      <ul>
                        {d.menuLines.map((m, i) => (
                          <li key={i} className="LunchMenu-MenuLine">
                            {m}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
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
        );
      })}
    </div>
  );
};

const App = props => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchInitialData = async () => {
    dispatch({ type: "loading" });
    const lunches = await getLunches();
    dispatch({ type: "lunches", value: lunches });
    dispatch({ type: "ready" });
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
    </AppContext.Provider>
  );
};

export default App;
