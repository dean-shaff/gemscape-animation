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
        return elem.getAttribute(name)
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
      'rect': {
        'fill': get(rect, 'fill'),
        'height': get(rect, 'height'),
        'width': get(rect, 'width'),
        'x': get(rect, 'x'),
        'y': get(rect, 'y')
      },
      'g': {
        'transform': get(g, 'transform')
      },
      'svg': {
        'height': get(svg, 'height'),
        'width': get(svg, 'width')
      }
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
  let scale = scaleFactor - 1.0
  // let offset = -((scaledPos - pos) + (scaledLen - len)/2)
  // let offset = -(scaledPos - pos)
  // let offset = (scaledLen - len)/2
  let offset = pos*scale + len*scale/2
  offset /= scaleFactor
  return offset
}


export const calcDist = ([x0, y0], [x1, y1]) => {
  return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2))
}
