// decompose_svg.js
// Decompose a gemscape into individual svgs, each containing a single gem
const path = require('path')
const fs = require('fs')

const convert = require('color-convert')
const xml2js = require('xml2js')

const assetsDir = path.join(path.dirname(__dirname), 'assets')
const fileName = 'Cicle_Vascule.5.svg'

const decomposeSVG = async (filePath, outputDir) => {
  if (! fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  const builder = new xml2js.Builder();

  const contents = fs.readFileSync(filePath, 'utf8')
  const parsed = await xml2js.parseStringPromise(contents)
  const common = JSON.parse(JSON.stringify(parsed))
  const polygons = common.svg.g[0].polygon
  delete common.svg.g[0].polygon

  for (let idx=0; idx<polygons.length; idx++) {
    let gemFilePath = path.join(outputDir, `gem.${idx}.svg`)
    let gemObj = Object.assign({}, common)
    let polygon = polygons[idx]
    let fill = polygon['$']['fill']
    let hsl = convert.hex.hsl(fill)

    parsed.svg.g[0].polygon[idx]['$']['fill-hsl'] = hsl.join(',')

    polygon['$']['filter'] = `drop-shadow(0px 0px 5px ${fill})`
    gemObj.svg.g[0].polygon = [polygons[idx]]
    let gemXML = builder.buildObject(gemObj)
    fs.writeFileSync(gemFilePath, gemXML)
  }

  const gemXML = builder.buildObject(parsed)
  const outputFilePath = path.join(outputDir, path.basename(filePath))
  fs.writeFileSync(outputFilePath, gemXML)
}



const main = async () => {
  const filePath = path.join(assetsDir, fileName)
  const outputDir = path.join(assetsDir, 'Cicle_Vascule.5')
  await decomposeSVG(filePath, outputDir)
}

main()
