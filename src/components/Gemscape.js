import React, { Component } from "react"


class Gemscape extends Component {
  constructor(props) {
    super(props)
    this.renderGen = this.renderGem.bind(this)
    this.handleOnMouseMoveFactory = this.handleOnMouseMoveFactory.bind(this)
  }

  handleOnMouseMoveFactory(nShapes){
    return evt => {
      console.log(`Gemscape.handleOnMouseMoveFactory: ${nShapes}`)
      this.props.onMouseMove(nShapes)
    }
  }

  parseGemscape(contents) {
    console.log(`Gemscape.parseGemscape`)
    const get = (elem, name) => {
      if (elem === undefined) {
        return null
      } else {
        return elem.getAttribute(name)
      }
    }
    const gemTags = ['polygon', 'path']
    const parser = new DOMParser()
    const xml = parser.parseFromString(contents, "text/xml")
    let rect = xml.getElementsByTagName('rect')[0]
    let g = xml.getElementsByTagName('g')[0]
    let svg = xml.getElementsByTagName('svg')[0]
    let paths = []
    if (g !== undefined) {
      paths = g.children
    }
    let parsed = {
      'paths': [],
      'rect': {
        'fill': get(rect, 'fill'),
        'height': get(rect, 'height'),
        'width': get(rect, 'width'),
        'x': get(rect, 'x'),
        'y': get(rect, 'y')
      },
      'g': {
        'transform': get(g, 'transform')
      },
      'svg': {
        'height': get(svg, 'height')
      }
    }
    console.log(`Gemscape.parseGemscape: ${paths.length} shapes in gemscape`)
    for (let path of paths) {
      if (! gemTags.includes(path.tagName)) {
        continue
      }
      let data = get(path, 'd')
      if (path.tagName === 'polygon') {
        data = get(path, 'points')
      }
      parsed.paths.push({
        'data': data,
        'fill-opacity': get(path, 'fill-opacity'),
        'fill': get(path, 'fill'),
        'type': path.tagName
      })
    }
    return parsed
  }

  parseTransformData(transformData, len){
    if (transformData == null) {
      let parsed = new Array(len)
      for (let idx=0; idx<parsed.length; idx++) {
        parsed[idx] = `scale(1.0) translate(0.0, 0.0)`
      }
      return parsed
    } else {
      let parsed = new Array(transformData.length)
      for (let idx=0; idx<transformData.length; idx++) {
        let scale = transformData[idx].scale
        let translate = transformData[idx].translate
        parsed[idx] = `scale(${scale}) translate(${translate[0]}, ${translate[1]})`
      }
      return parsed
    }
  }

  renderGem(gemObj, key){
    console.log(`Gemscape.renderGem`)
    if (gemObj.type === 'path') {
      return (<path key={key} d={gemObj.data} fillOpacity={gemObj['fill-opacity']} fill={gemObj['fill']}/>)
    } else if (gemObj.type === 'polygon') {
      return (<polygon key={key} points={gemObj.data} fillOpacity={gemObj['fill-opacity']} fill={gemObj['fill']}/>)
    }
  }

  render() {
    const parsed = this.parseGemscape(this.props.svgContents)
    const nShapes = parsed.paths.length
    const transform = this.parseTransformData(this.props.transformData, nShapes)
    let handleOnMouseMove = this.handleOnMouseMoveFactory(nShapes)
    return (
      <svg xmlns="http://www.w3.org/2000/svg" height="280" preserveAspectRatio="none" version="1.1" width="930">
        <rect fill={parsed.rect.fill} height={parsed.rect.height} width={parsed.rect.width} x={parsed.rect.x} y={parsed.rect.y} />
        <g transform={parsed.g.transform} onMouseMove={handleOnMouseMove}>
          {parsed.paths.map((val, idx) =>
            <g key={idx} transform={transform[idx]}>
              {this.renderGem(val, idx)}
            </g>
          )}
        </g>
      </svg>
    )
  }
}

export default Gemscape
