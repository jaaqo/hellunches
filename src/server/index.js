const express = require('express')
const cors = require('cors')
const {getLunches} = require('./lunches')

let app = express()
app.use(cors())

app.get('/', (_, res) => {
  res.send('ok')
})

app.get('/v1/lunches', async function (req, res) {
  const lunches = await getLunches()
  res.json(lunches)
})

app.listen(process.env.PORT || 3001)
