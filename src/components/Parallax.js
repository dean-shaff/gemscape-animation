import React,  { Component, useRef, useState } from "react"
import ReactDOM from 'react-dom'

import { useSpring, animated } from 'react-spring'

import Gemscape from "./Gemscape.js"
import Gem from './Gem.js'
import { scale, parseGemscapeXML } from './../util.js'


export class ParallaxContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      xVal: 100,
      yVal: 100,
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(evt) {
    const target = evt.target;
    const value = target.value;
    const name = target.name;
    console.log(`ParallaxContainer.handleChange: ${name}, ${value}`)
    this.setState({
      [name]: value
    })
  }

  render(){
    return (
      <div className="level">
        <div className="level-left">
        <div className="level-item">
          <div className="box">
            <h3 className="title is-3">Parallax</h3>
            <div className="field">
              <label className="label">x-direction factor</label>
              <input className="input" name="xVal" min="0" max="100" type="number" value={this.state.xVal} step="5" onChange={this.handleChange}></input>
            </div>
            <div className="field">
              <label className="label">y-direction factor</label>
              <input className="input" name="yVal" min="0" max="100" type="number" value={this.state.yVal} step="5" onChange={this.handleChange}></input>
            </div>
            <Parallax {...this.props} xVal={this.state.xVal} yVal={this.state.yVal}></Parallax>
          </div>
        </div>
        </div>
      </div>
    )
  }
}

export  function Parallax (props) {
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

  const calcTransformFactory = function (xScale, yScale) {
    const [width, height] = [props.svg.svg['width'], props.svg.svg['height']]
    return (x, y) => {
      let xPos = (x - width/2)
      let yPos = (y - height/2)
      let translateStr = `translate(${xPos*xScale}, ${yPos*yScale})`
      return translateStr
    }
  }

  const [state, set] = useSpring(() => ({ xy: [0, 0], config: { mass: 10, tension: 550, friction: 140 } }))

  let gemscape = null
  if (props.svg != null) {
    let svg = props.svg.svg
    const calcCursor = calcCursorFactory()
    const xValScale = scale([0, props.svg.paths.length], [-1/props.xVal, 1/props.xVal])
    const yValScale = scale([0, props.svg.paths.length], [-1/props.yVal, 1/props.yVal])

    svg.onMouseMove = ({ clientX: x, clientY: y }) => set({ xy: calcCursor(x, y) })
    gemscape = (<Gemscape svg={svg} rect={props.svg.rect} g={props.svg.g} ref={gemscapeRef}>
      {props.svg.paths.map((val, idx) =>
        <animated.g key={idx} transform={state.xy.interpolate(calcTransformFactory(xValScale(idx), yValScale(idx)))}>
          <Gem key={idx} {...val}></Gem>
        </animated.g>
      )}
    </Gemscape>)
  }

  return gemscape
}
