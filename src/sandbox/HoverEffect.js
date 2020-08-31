import * as d3 from 'd3'

import { getBetween } from './../util.js'


function HoverEffect() {

  this.sizeScaleFactor = 1.1
  this.opacityScaleFactor = 1.5
  this.transitionTime = 200

  this.init = function (elem) {
    if (elem == null) {
      elem = d3.select('svg')
    }
    this.elem = elem
    let opacities = []
    let fills = []
    this.elem.selectAll('path,polygon').each(function() {
      fills.push(d3.select(this).attr('fill'))
      opacities.push(d3.select(this).attr('fill-opacity'))
    })
    this.opacities = opacities
    this.fills = fills
    this.transformed = new Array(this.fills.length)
    this.transformed.fill(false)
    this.preProcess()

    let transform = this.elem.select('g').attr('transform')
    console.log(`HoverEffect: transform=${transform}`)

    let translateStr = getBetween(transform, 'translate(', ')')
    let translate = translateStr.split(',').map(val => parseFloat(val))
    let scaleStr = getBetween(transform, 'scale(', ')')
    let scale = parseFloat(scaleStr)

    console.log(`HoverEffect: translate=${translate}, scale=${scale}`)

    this.elem
      .on('mousemove', this.onMousemove(scale, translate))
  }

  /**
   * Enclose each path in a `<g>` element so we can apply transform accordingly.
   * @return {[type]} [description]
   */
  this.preProcess = function () {
    let removed = this.elem.selectAll('path,polygon').remove()
    let group = this.elem.select('g')
    removed.nodes().forEach(node => {
      group.append('g').append(() => node)
    })
    // make sure we transform from the origin, not the center of the parent group
    group.attr("class", 'origin')
  }


  /**
   * Given some x or y position `pos`, and some side length `len`, get the
   * new position offset with a scale factor of `this.sizeScaleFactor`
   * @param  {[type]} pos    [description]
   * @param  {[type]} length [description]
   * @return {[type]}        [description]
   */
  this.computeOffsets = function (pos, len) {
    let scale = this.sizeScaleFactor - 1.0
    // let offset = -((scaledPos - pos) + (scaledLen - len)/2)
    // let offset = -(scaledPos - pos)
    // let offset = (scaledLen - len)/2
    let offset = pos*scale + len*scale/2
    offset /= this.sizeScaleFactor
    return offset
  }


  this.onMousemove = function (scale, transform) {
    return (d, idx, nodes) => {
      const mouse = d3.mouse(nodes[idx])
      let mousePoint = nodes[idx].createSVGPoint()
      mousePoint.x = mouse[0]/scale - transform[0]
      mousePoint.y = mouse[1]/scale - transform[1]
      let w = this.elem.attr("width")/scale
      let h = this.elem.attr("height")/scale

      this.sizeScaleFactor = document.getElementById("glow-size-spin-box").value
      this.opacityScaleFactor = document.getElementById("glow-opacity-spin-box").value
      this.transitionTime = document.getElementById("glow-transition-spin-box").value

      // const mouseDomPoint = new DOMPoint(mouse[0], mouse[1])
      const self = this
      // let selection = this.elem.selectAll('path,polygon')
      let selection = this.elem.select('g').selectAll('g')
      selection.each(function(d, idx, nodes){
        let inner = d3.select(this).select('path,polygon')
        let innerNode = inner.node()
        if (innerNode.isPointInFill(mousePoint)) {
          if (!self.transformed[idx]) {
            let op = self.opacities[idx]
            op *= self.opacityScaleFactor
            if (op > 1.0) {
              op = 1.0
            }
            inner
              .transition()
              .duration(self.transitionTime)
              .ease(d3.easeLinear)
              .attr('fill-opacity', op)
            let bbox = d3.select(this).node().getBBox()
            let bounds = d3.select(this).node().getBoundingClientRect()
            let xBefore = bounds.x
            let [xOffset, yOffset] = [
              self.computeOffsets(bbox.x, bbox.width),
              self.computeOffsets(bbox.y, bbox.height),
            ]
            d3.select(this)
              .transition()
              .duration(self.transitionTime)
              .ease(d3.easeLinear)
              .attr('transform', `scale(${self.sizeScaleFactor}) translate(${-xOffset}, ${-yOffset}) `)
          }
          self.transformed[idx] = true
        } else {
          if (!self.transformed[idx]) {
            inner
              .transition()
              .duration(self.transitionTime)
              .ease(d3.easeLinear)
              .attr('fill-opacity', self.opacities[idx])
            // inner
            d3.select(this)
              .transition()
              .duration(self.transitionTime)
              .ease(d3.easeLinear)
              .attr('transform', 'scale(1.0) translate(0, 0)')
          }
          self.transformed[idx] = false
        }
      })
    }
  }
}

export { HoverEffect }
