// decompose_svg.js
// Decompose a gemscape into individual svgs, each containing a single gem
const path = require('path')
const fs = require('fs')

const convert = require('color-convert')
const xml2js = require('xml2js')

// const assetsDir = path.join(path.dirname(__dirname), 'assets')
// const fileName = 'Cicle_Vascule.5.svg'

const decomposeSVG = async (filePath, outputDir) => {
  if (! fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  const builder = new xml2js.Builder();

  const contents = fs.readFileSync(filePath, 'utf8')
  const parsed = await xml2js.parseStringPromise(contents)
  const common = JSON.parse(JSON.stringify(parsed))
  let tag = 'polygon'
  if (common.svg.g[0][tag] === undefined) {
    tag = 'path'
  }
  const gems = common.svg.g[0][tag]
  common.svg.g.splice(1, 1)
  console.log(common.svg.g)

  for (let idx=0; idx<gems.length; idx++) {
    let gemFilePath = path.join(outputDir, `gem.${idx}.svg`)
    let gemObj = Object.assign({}, common)
    let polygon = gems[idx]
    let fill = polygon['$']['fill']
    let hsl = convert.hex.hsl(fill)

    parsed.svg.g[0][tag][idx]['$']['fill-hsl'] = hsl.join(',')

    polygon['$']['filter'] = `drop-shadow(0px 0px 5px ${fill})`
    gemObj.svg.g[0][tag] = [gems[idx]]
    let gemXML = builder.buildObject(gemObj)
    fs.writeFileSync(gemFilePath, gemXML)
  }

  const gemXML = builder.buildObject(parsed)
  const outputFilePath = path.join(outputDir, path.basename(filePath))
  fs.writeFileSync(outputFilePath, gemXML)
}


const main = async (filePaths) => {
  await Promise.all(filePaths.map(filePath => {
    const parsed = path.parse(filePath)
    const outputDir = path.join(parsed.dir, parsed.name)
    return decomposeSVG(filePath, outputDir)
  }))

}

main(process.argv.slice(2))
