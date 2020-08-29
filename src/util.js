const loadSVG = async function (selector, url) {
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

const getFilesList = async function () {
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

export default {
  "loadSVG": loadSVG,
  "getFilesList": getFilesList
}
