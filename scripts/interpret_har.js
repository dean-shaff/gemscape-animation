// interpret_har.js
const fs = require('fs')


const interpretHar = (filePath) => {
  const contents = fs.readFileSync(filePath, 'utf8')
  const obj = JSON.parse(contents)

  const entries = obj.log.entries
  // get the svg related entries
  const svgEntries = entries.filter(e => {
    let url = e.request.url
    return url.endsWith('.svg')
  })
  const relevantInfo = svgEntries.map(e => {
    return {
      'url': e.request.url,
      'responseHeadersSize': e.response.headersSize,
      'responseBodySize': e.response.bodySize
    }
  })
  let decomposedGems = []
  let gemscape = null

  for (let idx=0; idx<relevantInfo.length; idx++) {
    let match = relevantInfo[idx].url.match(/gem\.[0-9]+\.svg/)
    if (match === null) {
      gemscape = relevantInfo[idx]
    } else {
      decomposedGems.push(relevantInfo[idx])
    }
  }

  const gemscapeSize = gemscape.responseBodySize
  const decomposedGemsSize = decomposedGems.reduce((acc, cur) => {
    return acc + cur.responseBodySize
  }, 0)
  const increase = decomposedGemsSize/gemscapeSize
  console.log(`Decomposed Gemscapes approach results in ${increase.toFixed(2)} times more response data`)
}

const main = (filePaths) => {
  for (let idx=0; idx<filePaths.length; idx++) {
    interpretHar(filePaths[idx])
  }
}

main(process.argv.slice(2))
