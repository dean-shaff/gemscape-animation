import * as d3 from "d3"


function BPM () {

  this.elem = null
  this.bpm = null
  this.timer = null

  this.interval = null

  this.init = function (bpm, elem) {
    if (elem == null) {
      console.log("BPM.init: elem is null")
      elem = d3.select("svg")
    }
    this.elem = elem
    this.bpm = bpm
    this.interval = this.calculateInterval(this.bpm)
    console.log(`BPM.init: bpm=${bpm}, interval=${this.interval}`)

    this.elem
      .on("mouseenter", this.onMouseenter())
      .on("mouseleave", this.onMouseleave())
  }

  this.calculateInterval = function (bpm) {
    return 1000 / (bpm / 60)
  }


  this.onMouseenter = function () {
    return (d, i, nodes) => {
      this.bpm = document.getElementById('bpm-spin-box').value / 2.0
      this.interval = this.calculateInterval(this.bpm)
      let node = nodes[i]
      // console.log(`BPM.onMouseenter: bps=${bps}, interval=${interval}`)
      this.timer = setInterval(this.beat(node), this.interval/2.0)
    }
  }

  this.beat = function (node) {
    let select = d3.select(node)
    let on = true
    return () => {
      // console.log(`BPM.beat: on=${on}`)
      // let opacity = select.attr("opacity")

      let factor = document.getElementById('bpm-opacity-spin-box').value
      if (on) {
        factor = 1/factor
      }
      // select.selectAll("path")
      //   .transition()
      //   .duration(this.interval/2.0)
      //   .ease(d3.easeLinear)
      //   .each(function() {
      //     let curVal = d3.select(this).style("fill-opacity")
      //     d3.select(this)
      //       .style("fill-opacity", factor*curVal)
      //   })
      //
      let opacity = 0.8
      if (on) {
        opacity = 0.5
      }
      select.selectAll("path")
        .transition()
        .duration(this.interval/2.0)
        .ease(d3.easeLinear)
        .attr("fill-opacity", function(d, i, nodes) {
          let curVal = d3.select(this).attr("fill-opacity")
          return factor*curVal
        })
      on = ! on

    }
  }

  this.onMouseleave = function () {
    return (d, i, nodes) => {
      let node = nodes[i]
      console.log("BPM.onMouseleave: mouseleave")
      clearInterval(this.timer)
    }
  }


}

export { BPM }
