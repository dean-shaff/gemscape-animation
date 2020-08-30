const path = require('path')
const fs = require('fs')

const express = require('express')

const app = express()
const PORT = process.env.PORT || 8000

const assetsDir = path.join(__dirname, 'assets')
const distDir = path.join(__dirname, 'dist')


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})


app.get('/list', (req, res) => {
  let filesList = fs.readdirSync(assetsDir)
  res.json({"files": filesList})
})


app.use('/assets/', express.static(assetsDir))
app.use(express.static(distDir))


app.listen(PORT, () => {
  console.log(`App listening at ${PORT}`)
})
