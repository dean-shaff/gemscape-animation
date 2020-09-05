import React,  { Component, useRef } from "react"
import ReactDOM from 'react-dom'

import { useSpring, animated } from 'react-spring'

import Gemscape from "./Gemscape.js"
import Gem from './Gem.js'
import { scale, parseGemscapeXML } from './../util.js'

// function ParallaxContainer {
//
//   return (
//     <div className="level">
//       <div className="level-left">
//       <div className="level-item">
//         <div className="box">
//           <h3 className="title is-3">Parallax</h3>
// <div className="field">
//   <label className="label">x-direction factor</label>
//   <input className="input" name="xVal" min="0" max="100" type="number" value={this.state.xVal} step="5" onChange={this.handleChange}></input>
// </div>
// <div className="field">
//   <label className="label">y-direction factor</label>
//   <input className="input" name="yVal" min="0" max="100" type="number" value={this.state.yVal} step="5" onChange={this.handleChange}></input>
// </div>
//           <div className="field">
//           <div>
//             {gemscape}
//           </div>
//         </div>
//       </div>
//       </div>
//     </div>
//   )
// }

export default function Parallax (props) {
  const gemscapeRef = useRef(null);

  const calcCursorFactory = function () {
    return (x, y) => {
      const svg = gemscapeRef.current.svg
      let point = svg.createSVGPoint()
      point.x = x
      point.y = y
      let cursor = point.matrixTransform(svg.getScreenCTM().inverse())
      return [cursor.x, cursor.y]
    }
  }

  const calcTransformFactory = function (scaleVal) {
    const [width, height] = [props.svg.svg['width'], props.svg.svg['height']]
    return (x, y) => {
      let xPos = (x - width/2)
      let yPos = (y - height/2)
      let translateStr = `translate(${xPos*scaleVal}, ${yPos*scaleVal})`
      return translateStr
    }
  }

  const [state, set] = useSpring(() => ({ xy: [0, 0], config: { mass: 10, tension: 550, friction: 140 } }))

  let gemscape = null
  if (props.svg != null) {
    let svg = props.svg.svg
    const calcCursor = calcCursorFactory()
    const xval = scale([0, props.svg.paths.length], [-0.01, 0.01])
    svg.onMouseMove = ({ clientX: x, clientY: y }) => set({ xy: calcCursor(x, y) })
    gemscape = (<Gemscape svg={svg} rect={props.svg.rect} g={props.svg.g} ref={gemscapeRef}>
      {props.svg.paths.map((val, idx) =>
        <animated.g key={idx} transform={state.xy.interpolate(calcTransformFactory(xval(idx)))}>
          <Gem key={idx} {...val}></Gem>
        </animated.g>
      )}
    </Gemscape>)
  }

  return (
    <div className="level">
      <div className="level-left">
      <div className="level-item">
        <div className="box">
          <h3 className="title is-3">Parallax</h3>
          <div>
            {gemscape}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
