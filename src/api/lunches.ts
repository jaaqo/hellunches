const base = process.env.REACT_APP_API_URL_BASE

export const getLunches = async () => {
  const {data, error} = await fetch(`${base}/lunches`)
    .then(res => res.json())
    .then(data => ({
      data,
      error: null
    }))
    .catch(() => ({data: null, error: Error('Fetching lunches failed')}))

  return {data, error}
}
