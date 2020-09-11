import React,  { Component, useRef, useState } from "react"
import ReactDOM from 'react-dom'

import { useSpring, animated } from 'react-spring'

import Gemscape from "./Gemscape.js"
import Gem from './Gem.js'
import { scale, parseGemscapeXML } from './../util.js'


const Slider = (props) => {
  const {title, val, ...otherProps} = props

  return (
    <div className="field">
      <label className="label">{title}</label>
      <input className="slider is-fullwidth has-output" type="range" value={val} {...otherProps}></input>
      <output>{val}</output>
    </div>
  )
}



export class ParallaxContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      xVal: 50,
      yVal: 50,
      mass: 10,
      tension: 550,
      friction: 140
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
            <div className="level">
              <h3 className="title is-3">Parallax</h3>
            </div>
            <div className="box">
              <div className="columns">
                <div className="column">
                  <Slider val={this.state.xVal} onChange={this.handleChange} min={5} max={100} step={5} name="xVal" title="x-direction factor"/>
                </div>
                <div className="column">
                  <Slider val={this.state.yVal} onChange={this.handleChange} min={5} max={100} step={5} name="yVal" title="y-direction factor"/>
                </div>
              </div>
              <div className="columns">
                <div className="column">
                  <Slider val={this.state.mass} onChange={this.handleChange} min={1} max={50} step={5} name="mass" title="Mass"/>
                </div>
                <div className="column">
                  <Slider val={this.state.tension} onChange={this.handleChange} min={10} max={2000} step={100} name="tension" title="Tension"/>
                </div>
                <div className="column">
                  <Slider val={this.state.friction} onChange={this.handleChange} min={10} max={500} step={30} name="friction" title="Friction"/>
                </div>
              </div>

            </div>
            <Parallax
              {...this.props}
              xVal={this.state.xVal}
              yVal={this.state.yVal}
              mass={this.state.mass}
              tension={this.state.tension}
              friction={this.state.friction}>
            </Parallax>
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
  console.log(`Parallax: mass=${props.mass} tension=${props.tension} friction=${props.friction}`)
  const [state, set] = useSpring(() => ({ xy: [0, 0], config: { mass: props.mass, tension: props.tension, friction: props.friction } }))

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