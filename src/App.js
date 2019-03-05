import React, { useEffect, useContext, createContext, useReducer } from "react";
import { getLunches } from "./lunches";
import moment from "moment";
import "./App.css";

const AppContext = createContext(null);

const initialState = {
  filter: "today",
  restaurants: [],
  loading: true
};

const reducer = (state, action) => {
  switch (action.type) {
    case "filter":
      return { ...state, filter: action.payload };
    case "restaurants":
      return { ...state, restaurants: action.payload };
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
        onClick={() => dispatch({ type: "filter", payload: "today" })}
        className={filter === "today" ? "button-primary" : ""}
      >
        Today
      </button>
      <button
        onClick={() => dispatch({ type: "filter", payload: "tomorrow" })}
        className={filter === "tomorrow" ? "button-primary" : ""}
      >
        Tomorrow
      </button>
    </div>
  );
};

const Lunches = props => {
  const {
    state: { restaurants, filter }
  } = useContext(AppContext);

  const today = moment.utc();
  const tomorrow = today.clone().add(1, "days");

  return (
    <div className="Lunches">
      {restaurants.map((r, i) => {
        const lunches = r.lunches.filter(d => {
          if (filter === "today") {
            return today.isSame(d.date, "day");
          } else if (filter === "tomorrow") {
            return tomorrow.isSame(d.date, "day");
          } else {
            return false;
          }
        });

        const isLunches = lunches.length > 0;

        return (
          <div className="LunchMenu" key={i}>
            <h2>{r.name}</h2>
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
    dispatch({ type: "restaurants", payload: lunches });
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
