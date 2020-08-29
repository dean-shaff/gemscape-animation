const path = require('path')
const fs = require('fs')

const express = require('express')

const app = express()
const port = 3000

const assetsDir = path.join(__dirname, 'assets')
const distDir = path.join(__dirname, 'dist')


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})


app.get('/list', (req, res) => {
  let filesList = fs.readdirSync(assetsDir)
  console.log(filesList)
  res.json({"files": filesList})
})


app.use('/assets', express.static(assetsDir))
app.use(express.static(distDir))


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
