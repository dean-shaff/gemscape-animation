import React, { Component } from "react"

// import Gem from './Gem.js'

class Gemscape extends Component {
  render(){
    const {rect, g, svg, ...otherKeys} = this.props
    return (
      <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" {...svg} ref={(svg) => this.svg = svg}>
        {this.props.defs}
        <rect {...rect}/>
        <g {...g}>
          {this.props.children}
        </g>
      </svg>
    )
  }
}

// class Gemscape extends Component {
//   constructor(props) {
//     super(props)
//     this.handleOnMouseMoveFactory = this.handleOnMouseMoveFactory.bind(this)
//   }
//
//   handleOnMouseMoveFactory(nShapes){
//     return evt => {
//       console.log(`Gemscape.handleOnMouseMoveFactory: ${nShapes}`)
//       this.props.onMouseMove(nShapes)
//     }
//   }
//
//
//
//
//   render() {
//     const parsed = this.parseGemscape(this.props.svgContents)
//     const nShapes = parsed.paths.length
//     const transform = this.parseTransformData(this.props.transformData, nShapes)
//     let handleOnMouseMove = this.handleOnMouseMoveFactory(nShapes)
//     return (
//       <svg xmlns="http://www.w3.org/2000/svg" height="280" preserveAspectRatio="none" version="1.1" width="930">
//         <rect fill={parsed.rect.fill} height={parsed.rect.height} width={parsed.rect.width} x={parsed.rect.x} y={parsed.rect.y} />
//         <g transform={parsed.g.transform} onMouseMove={handleOnMouseMove}>
//           {props.children}
//           // {parsed.paths.map((val, idx) =>
//           //   <g key={idx} transform={transform[idx]}>
//           //     <Gem key={idx} {...val}></Gem>
//           //   </g>
//           // )}
//         </g>
//       </svg>
//     )
//   }
// }

export default Gemscape
