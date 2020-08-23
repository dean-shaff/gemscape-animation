import * as d3 from "d3"

import parallax from "./sandbox/parallax.js"
import bpm from "./sandbox/bpm.js"

let obj = new parallax.ParallaxByGroup()
// let obj = new parallax.ParallaxByShape()
obj.init(d3.select("#parallax svg"))

let bpmObj = new bpm.BPM()
// bpmObj.init(153, d3.select("#bpm svg"))
bpmObj.init(93/2, d3.select("#bpm svg"))
