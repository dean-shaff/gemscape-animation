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

export const processTransformStr = function (transform) {
  let returnVal = {}

  if (transform.includes('translate')) {
    let translateStr = getBetween(transform, 'translate(', ')')
    let delim = ','
    if (!translateStr.includes(',')) {
      delim = ' '
    }
    let translate = translateStr.split(delim).map(val => parseFloat(val))
    returnVal['translate'] = translate
  }

  if (transform.includes('scale')) {
    let scaleStr = getBetween(transform, 'scale(', ')')
    let scale = parseFloat(scaleStr)
    returnVal['scale'] = scale
  }

  return returnVal
}
