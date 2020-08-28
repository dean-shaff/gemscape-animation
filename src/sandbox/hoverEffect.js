import * as d3 from "d3"

function HoverEffect() {

  this.init = function (elem) {
    if (elem == null) {
      elem = d3.select("svg")
    }
    this.elem = elem
    let opacities = []
    let fills = []
    this.elem.selectAll("path").each(function() {
      fills.push(d3.select(this).attr("fill"))
      opacities.push(d3.select(this).attr("fill-opacity"))
    })
    this.opacities = opacities
    this.fills = fills
    this.elem
      .on("mousemove", this.onMousemove(4.0, [-11.13636363636364, 0.5]))
    // this.elem.selectAll("path")
    //   .on("mouseover", this.onMouseover())
    //   .on("mouseout", this.onMouseout())
  }

  this.onMousemove = function (scale, transform) {
    return (d, idx, nodes) => {
      const mouse = d3.mouse(nodes[idx])
      let mousePoint = nodes[idx].createSVGPoint()
      mousePoint.x = mouse[0]/scale - transform[0]
      mousePoint.y = mouse[1]/scale - transform[1]
      // const mouseDomPoint = new DOMPoint(mouse[0], mouse[1])
      const self = this
      this.elem.selectAll("path").each(function(d, idx, nodes){
        // console.log(d, idx, nodes)
        if (this.isPointInFill(mousePoint)) {
          let op = self.opacities[idx]
          op *= 1.5
          if (op > 1.0) {
            op = 1.0
          }
          d3.select(this).attr("fill-opacity", op)
        } else {
          d3.select(this).attr("fill-opacity", self.opacities[idx])
        }
      })
    }
  }
}

export { HoverEffect }
// export default {
//   "HoverEffect": HoverEffect
// }
