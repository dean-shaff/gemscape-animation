import * as d3 from "d3"

function ParallaxByShape () {

  this.elem = null

  this.init = function () {
    this.elem = d3.select("svg")
    this.elem
      .on("mousemove", this.onMousemove())
      // .on("mouseout", this.onMouseout())
  }

  this.onMousemove = function () {
    return (d, i, nodes) => {
      let node = nodes[i]
      let selection = this.elem.selectAll("path")
      let nPaths = selection.nodes().length
      selection
        .attr("transform", this.attrTransform(nPaths))
    }
  }

  this.attrTransform = function (nPaths) {
    const [width, height] = [this.elem.attr("width"), this.elem.attr("height")]
    return (d, idx, nodes) => {
      let val = document.getElementById('factor-spin-box').value
      const scale = d3.scaleLinear().domain([0, nPaths]).range([-1/val, 1/val])
      const [x, y] = d3.mouse(this.elem.node())
      let node = nodes[idx]
      let factor = scale(idx)
      let transformVal = `translate(${(x - width/2)*factor}, ${(y - height/2)*factor})`
      return transformVal
    }
  }
}

function ParallaxByGroup () {

  this.elem = null

  this.init = function () {
    this.elem = d3.select("svg")
    // add individual layers to groups.
    this.initLayerGroups()
    this.elem
      .on("mousemove", this.onMousemove())
      .on("mouseleave", this.onMouseleave())
  }

  this.initLayerGroups = function () {
    for (let idx=0; idx<3; idx++) {
      let group = this.elem.select("g").append("g")
        .attr("class", "layer")
        .attr("transform", "translate(0, 0)")
        .attr("label", idx)
      let removed = this.elem.selectAll("path")
        .filter((d, i, nodes) => {
          let node = nodes[i]
          let layerVal = d3.select(node).attr("layer")
          return layerVal == idx
        })
        .remove()
      removed.nodes().forEach((node) => {
        group.append(() => {
          return node
        })
      })
    }
  }

  this.onMousemove = function () {
    return (d, i, nodes) => {
      let node = nodes[i]
      this.elem.selectAll("g .layer")
        .attr("transform", this.attrTransform())
    }
  }

  this.onMouseleave = function () {
    return (d, i, nodes) => {
      console.log("mouseleave")
      // this.elem.selectAll("g .layer")
      //   .attr("transform", "translate(0, 0)")
    }
  }

  this.attrTransform = function () {
    const [width, height] = [this.elem.attr("width"), this.elem.attr("height")]
    return (d, idx, nodes) => {
      const [x, y] = d3.mouse(this.elem.node())
      let node = nodes[idx]
      let transformVal = d3.select(node).attr("transform")
      let labelVal = d3.select(node).attr("label")
      let factor = 0
      if (idx == 0) {
        factor = 1./50
      } else if (idx == 1) {
        factor = 1./100
      } else if (idx == 2) {
        factor = -1./100
      }
      transformVal = `translate(${-(x - width/2)*factor}, ${-(y - height/2)*factor})`
      return transformVal
    }
  }
}


export default {
  "ParallaxByShape": ParallaxByShape,
  "ParallaxByGroup": ParallaxByGroup
}
