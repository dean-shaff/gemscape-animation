import * as d3 from 'd3'

import { processTransformStr } from './../util.js'


function DropShadow() {

  this.sizeScaleFactor = 1.1
  this.opacityScaleFactor = 1.5
  this.transitionTime = 200

  this.init = function (elem) {
    if (elem == null) {
      elem = d3.select('svg')
    }
    this.elem = elem
    let opacities = []
    this.elem.selectAll('path,polygon').each(function() {
      opacities.push(d3.select(this).attr('fill-opacity'))
    })
    this.opacities = opacities
    this.transformed = new Array(this.opacities.length)
    this.transformed.fill(false)

    let transform = processTransformStr(this.elem.select('g').attr('transform'))

    console.log(`DropShadow.init`)
    this.preProcess()
    this.elem.on('mousemove', this.onMousemove(transform.scale, transform.translate))
    this.elem.on('mouseleave', this.onMouseleave())
    // this.elem.seletAll('polygon,path').on('mouseover')
  }

  /**
   * Enclose each path in a `<g>` element so we can apply transform accordingly. Clone each path, so we can create `drop shadows`
   * @return {[type]} [description]
   */
  this.preProcess = function () {
    this.elem.attr('class', 'origin')
    let removed = this.elem.selectAll('path,polygon').remove()
    let group = this.elem.select('g')
    removed.nodes().forEach(node => {
      let subGroup = group.append('g')

      let shadow = d3.select(node).clone()
      shadow.attr('fill-opacity', 0.0)
      shadow.attr('fill', '#282828')
      let shadowGroup = subGroup.append('g')
      shadowGroup.attr('class', 'shadow')
      shadowGroup.append(() => shadow.node())

      let foregroudGroup = subGroup.append('g')
      foregroudGroup.attr('class', 'foreground')
      foregroudGroup.append(() => node)
    })
    group.attr("class", 'origin')
  }

  this.computeOffset = function (pos, len) {
    let scale = this.sizeScaleFactor - 1.0
    let offset = pos*scale + len*scale/2
    offset /= this.sizeScaleFactor
    return offset
  }

  this.onMousemove = function (scale, translate) {
    console.log(`DropShadow.onMousemove: scale=${scale}, translate=${translate}`)
    const [width, height] = [this.elem.attr('width'), this.elem.attr('height')]
    const self = this
    return (d, idx, nodes) => {
      this.elem.selectAll('g.shadow').each(function (_d, _idx, _nodes ) {
        let path = d3.select(this).select('path,polygon')
        const mouse = d3.mouse(self.elem.node()).map((val, i) => val/scale - translate[i])
        const bbox = path.node().getBBox()

        let xVal = -0.1/self.sizeScaleFactor
        let yVal = -0.1/self.sizeScaleFactor

        let xOffset = self.computeOffset(bbox.x, bbox.width)
        let yOffset = self.computeOffset(bbox.y, bbox.height)

        // let xOffset = bbox.x + bbox.width/2
        // let yOffset = bbox.y + bbox.height/2

        let transX = xVal*(mouse[0]-bbox.x-bbox.width/2) - xOffset
        let transY = yVal*(mouse[1]-bbox.y-bbox.height/2) - yOffset
        let transformVal = `scale(${self.sizeScaleFactor}) translate(${transX}, ${transY})`
        // console.log(transformVal)

        d3.select(this)

          .attr('transform', transformVal)

        const bboxScale = path.node().getBBox()

        if (! self.transformed[_idx]) {
          path
            .attr('fill-opacity', 0.1)
        }
        self.transformed[_idx] = true
      })

      this.elem.selectAll('g.foreground')
        .select('path,polygon')
        .attr('fill-opacity', (_d, _idx, _nodes) => {
          let op = self.opacities[_idx]
          return 1.2*op
        })
    }
  }

  this.filter = function (val) {
    return function () {
      let layerVal = d3.select(this).attr('layer')
      return layerVal == val
    }
  }

  this.onMouseleave = function () {
    const self = this
    return (d, idx, nodes) => {
      console.log(`DropShadow.onMouseleave`)
      this.elem.selectAll('g.shadow')
        .select('path,polygon')
        .attr('fill-opacity', 0.0)
      this.elem.selectAll('g.foreground')
        .select('path,polygon')
        .attr('fill-opacity', (_d, _idx, _nodes) => {
          let op = self.opacities[_idx]
          return op
        })
      this.transformed.fill(false)
    }
  }


}

export { DropShadow }
