import React, { useEffect, useState } from "react";
import "./App.css";
import { getLunches } from "./lunches";
import moment from "moment";

const fetchInitialData = async next => {
  const lunches = await getLunches();
  next(lunches);
};

const App = props => {
  const [lunches, setLunches] = useState([]);
  const [filter, setFilter] = useState("today");

  const today = moment.utc();
  const tomorrow = today.clone().add(1, "days");

  useEffect(() => {
    fetchInitialData(setLunches);
  }, []);

  return (
    <div className="App">
      <div className="Controls">
        <button
          onClick={() => setFilter("today")}
          className={filter === "today" ? "button-primary" : ""}
        >
          Today
        </button>
        <button
          onClick={() => setFilter("tomorrow")}
          className={filter === "tomorrow" ? "button-primary" : ""}
        >
          Tomorrow
        </button>
      </div>
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
    </div>
  );
};

export default App;
