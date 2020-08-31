import * as d3 from 'd3'

import { ParallaxByGroup } from './sandbox/Parallax.js'
import { BPM } from './sandbox/BPM.js'
import { HoverEffect } from './sandbox/HoverEffect.js'
import { DropShadow } from './sandbox/DropShadow.js'
import { getFilesList, loadSVG } from './util.js'


function App () {

  const dropDownId = 'files'
  const ids = ['parallax', 'bpm', 'glow', 'drop-shadow']
  this.filesList = null

  this.init = async function () {
    let filesList = await getFilesList()
    this.filesList = filesList
    // now add options to dropdown
    let elem = document.getElementById(dropDownId)

    this.filesList.forEach((fileName)=>{
      let option = document.createElement('option')
      option.innerHTML = fileName
      option.setAttribute('value', fileName)
      elem.appendChild(option)
    })
    elem.onchange = this.selectOnChange()
  }

  this.selectOnChange = function () {
    return async (evt) => {
      let fileName = document.getElementById(dropDownId).value
      await this.setupSVG(fileName)
    }
  }

  this.setSVG = async function (fileName) {
    let evt = new Event('change')
    let elem = document.getElementById(dropDownId)
    elem.value = fileName
    elem.dispatchEvent(evt)
  }

  this.setupSVG = async function (fileName) {
    let promises = ids.map(id => loadSVG(`#${id}`, `assets/${fileName}`))
    await Promise.all(promises)

    let obj = new ParallaxByGroup()
    obj.init(d3.select(`#${ids[0]} svg`))

    let bpmObj = new BPM()
    bpmObj.init(93/2, d3.select(`#${ids[1]} svg`))

    let hoverObj = new HoverEffect()
    hoverObj.init(d3.select(`#${ids[2]} svg`))

    let dropShadowObj = new DropShadow()
    dropShadowObj.init(d3.select(`#${ids[3]} svg`))
  }
}



window.onload = async () => {
  let app = new App()
  await app.init()
  // let fileName = "Hedgehog_Wallace_Moo8Den5Gra1Ene6Ens7Mel8Ten4Rhy6.post_wav2png.post_primitive.svg"
  let fileName = "single-shape.svg"
  await app.setSVG(fileName)

}
