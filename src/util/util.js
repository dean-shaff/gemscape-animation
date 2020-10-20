import hsluv from 'hsluv'

export const isFunction = (obj) => {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

export const calcCursorFactory = function (svgRef) {
  return (x, y) => {
    // const svg = gemscapeRef.current.svg
    let point = svgRef.createSVGPoint()
    point.x = x
    point.y = y
    const cursor = point.matrixTransform(svgRef.getScreenCTM().inverse())
    return cursor
    // return [cursor.x, cursor.y]
  }
}

export const getCursorFactory = calcCursorFactory


export const calcTransformFactory = function (svgObj, xScale, yScale) {
  const [width, height] = [svgObj.svg['width'], svgObj.svg['height']]
  return (x, y) => {
    let xPos = (x - width/2)
    let yPos = (y - height/2)
    let translateStr = `translate(${xPos*xScale}, ${yPos*yScale})`
    return translateStr
  }
}

export const loadSVG = async function (selector, url) {
  let target = document.querySelector(selector)
  let ajax = new XMLHttpRequest();
  ajax.open("GET", `${window.location.href}${url}`, true);
  ajax.send();
  // Append the SVG to the target
  return new Promise((resolve, reject) => {
    ajax.onload = function() {
      if (this.status === 200) {
        target.innerHTML = ajax.responseText;
        resolve()
      } else {
        reject()
      }
    }
  })
}

export const getSVG = async function (fileName) {
  let ajax = new XMLHttpRequest();
  ajax.open("GET", `${window.location.href}assets/${fileName}`, true);
  ajax.send();

  return new Promise((resolve, reject) => {
    ajax.onload = function() {
      if (this.status === 200) {
        resolve(ajax.responseText)
      } else {
        reject()
      }
    }
  })
}


export const getFilesList = async function () {
  let ajax = new XMLHttpRequest()
  ajax.open("GET", `${window.location.href}list`, true)
  ajax.send()

  return new Promise((resolve, reject) => {
    ajax.onload = function () {
      if (this.status === 200) {
        resolve(JSON.parse(this.responseText)['files'])
      } else {
        reject()
      }
    }
  })
}

export const getBetween = function (str, start, end) {
  let startIdx = str.indexOf(start) + start.length
  let endIdx = str.slice(startIdx).indexOf(end) + startIdx

  return str.slice(startIdx, endIdx)
}

export const scale = function(domain, range) {
  const domainRange = domain[1] - domain[0]
  const rangeRange = range[1] - range[0]
  const ratio = rangeRange / domainRange
  return domainVal => {
    let diff = domainVal - domain[0]
    return range[0] + diff*ratio
  }
}

/**
 *
 * @param  {[type]} paths array of path objects, as returned from parseGemscapeXML
 * @return {[type]}       [description]
 */
export const sortIntoLayers = function (paths) {
  let layers = {}
  for (let idx=0; idx<paths.length; idx++) {
    let path = paths[idx]
    let layer = path.layer
    if (layers[layer] === undefined) {
      layers[layer] = [path]
    } else {
      layers[layer].push(path)
    }
  }
  return layers
}


export const parseGemscapeXML = function (gemTags) {
  if (gemTags == null) {
    gemTags = ['polygon', 'path']
  }

  // console.log(`parseGemscapeXML: gemTaps=${gemTags}`)
  return function (contents) {

    const get = (elem, name) => {
      if (elem === undefined) {
        return null
      } else {
        if (Array.isArray(name)) {
          return name.reduce((acc, cur) => {
            acc[cur] = get(elem, cur)
            return acc
          }, {})
        } else {
          return elem.getAttribute(name)
        }
      }
    }

    const parser = new DOMParser()
    const xml = parser.parseFromString(contents, "text/xml")
    let rect = xml.getElementsByTagName('rect')[0]
    let g = xml.getElementsByTagName('g')[0]
    let svg = xml.getElementsByTagName('svg')[0]
    let paths = []
    if (g !== undefined) {
      paths = g.children
    }
    let parsed = {
      'paths': [],
      'rect': get(rect, ['fill', 'width', 'height', 'x', 'y']),
      'g': {
        'transform': get(g, 'transform')
      },
      'svg': get(svg, ['height', 'width', 'xmlns', 'version', 'preserveAspectRatio'])
    }
    for (let path of paths) {
      if (! gemTags.includes(path.tagName)) {
        continue
      }
      let data = get(path, 'd')
      if (path.tagName === 'polygon') {
        data = get(path, 'points')
      }
      parsed.paths.push({
        'data': data,
        'fillOpacity': get(path, 'fill-opacity'),
        '__fillopacity': get(path, 'fill-opacity'),
        'fill': get(path, 'fill'),
        '__fillgreyscale': greyscale(get(path, 'fill')),
        '__fill': get(path, 'fill'),
        'layer': get(path, 'layer'),
        'label': get(path, 'label'),
        'fill-hsl': get(path, 'fill-hsl'),
        'type': path.tagName
      })
    }
    return parsed
  }
}

export const calcOffset = (pos, len, scaleFactor) =>  {
  // console.log(`calcOffset: ${pos}, ${len}, ${scaleFactor}`)
  // let center = pos + len/2
  // let offset1 = (1.0 - scaleFactor)*center
  // console.log(`calcOffset: offset1=${offset1}`)
  // return offset1

  let scale = scaleFactor - 1.0
  let offset = pos*scale + len*scale/2
  // offset /= scaleFactor
  // console.log(`calcOffset: offset=${offset}`)
  return offset
}


export const calcDist = ([x0, y0], [x1, y1]) => {
  return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2))
}

export const greyscale = function (color) {
  const colorHSLuv = hsluv.hexToHsluv(color)
  colorHSLuv[1] = 0
  return hsluv.hsluvToHex(colorHSLuv)
}


// export const setHSLuvSaturation = function (color, val) => {
//   const hslColor = hsluv.hexToHsluv(color)
//
// }
