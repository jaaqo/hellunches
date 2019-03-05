import axios from "axios";

const base = "http://localhost:3001/api";

export const getLunches = async () => {
  const { data: lunches } = await axios.get(`${base}/lunches`);
  return lunches;
};
