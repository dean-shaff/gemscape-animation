import * as d3 from 'd3'

import parallax from './sandbox/parallax.js'
import bpm from './sandbox/bpm.js'
import {HoverEffect} from './sandbox/hoverEffect.js'
import util from './util.js'


function App () {

  const dropDownId = 'files'
  const ids = ['parallax', 'bpm', 'glow', 'drop-shadow']
  this.filesList = null

  this.init = async function () {
    let filesList = await util.getFilesList()
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
    let promises = ids.map(id => util.loadSVG(`#${id}`, `assets/${fileName}`))
    await Promise.all(promises)

    let obj = new parallax.ParallaxByGroup()
    obj.init(d3.select(`#${ids[0]} svg`))

    let bpmObj = new bpm.BPM()
    bpmObj.init(93/2, d3.select(`#${ids[1]} svg`))

    let hoverObj = new HoverEffect()
    hoverObj.init(d3.select(`#${ids[2]} svg`))
  }
}



window.onload = async () => {
  let app = new App()
  await app.init()
  let fileName = "Hedgehog_Wallace_Moo8Den5Gra1Ene6Ens7Mel8Ten4Rhy6.post_wav2png.post_primitive.svg"
  await app.setSVG(fileName)

}
