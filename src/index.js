import * as d3 from "d3"

import parallax from "./sandbox/parallax.js"
import bpm from "./sandbox/bpm.js"
import {HoverEffect} from "./sandbox/hoverEffect.js"
import util from "./util.js"


function App () {

  const ids = ["parallax", "bpm", "glow"]

  this.init = async function () {
    let filesList = await util.getFilesList()
    let promises = ids.map(id => util.loadSVG(`#${id}`, `assets/${filesList[0]}`))
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
}
