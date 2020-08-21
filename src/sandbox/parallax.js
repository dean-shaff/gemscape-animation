import * as d3 from "d3"


function Parallax () {

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
      this.elem.selectAll("g .layer")
        .attr("transform", this.attrTransform())
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


export default Parallax
