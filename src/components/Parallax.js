import React,  { Component, useRef, useState } from "react"
import ReactDOM from 'react-dom'

import { useSpring, animated, config } from 'react-spring'

import Gemscape from "./Gemscape.js"
import Gem from './Gem.js'
import Slider from './Slider.js'
import SpringSliders from './SpringSliders.js'
import { scale, parseGemscapeXML } from './../util.js'


export class ParallaxContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      xVal: 10,
      yVal: 10,
      mass: 1,
      tension: 120,
      friction: 14
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
              <SpringSliders mass={this.state.mass} tension={this.state.tension} friction={this.state.friction}  onChange={this.handleChange}/>
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
  const configObj = {
    mass: props.mass, tension: props.tension, friction: props.friction
  }

  console.log(`Parallax: mass=${props.mass} tension=${props.tension} friction=${props.friction}`)
  const [state, set] = useSpring(() => ({ xy: [0, 0], config: configObj }))
  set({
    'config': configObj
  })
  // const [state, set] = useSpring(() => ({ xy: [0, 0], config: config.molasses }))
  // const [state, set] = useSpring(() => ({ xy: [0, 0], config: config.gentle }))

  let gemscape = null
  if (props.svg != null) {
    let svg = props.svg.svg
    const calcCursor = calcCursorFactory()
    const xValScale = scale([0, props.svg.paths.length + 1], [-1/props.xVal, 1/props.xVal])
    const yValScale = scale([0, props.svg.paths.length + 1], [-1/props.yVal, 1/props.yVal])

    svg.onMouseMove = ({ clientX: x, clientY: y }) => set({ xy: calcCursor(x, y) })
    gemscape = (<Gemscape svg={svg} rect={props.svg.rect} g={props.svg.g} ref={gemscapeRef}>
      {props.svg.paths.map((val, idx) =>
        <animated.g key={idx} transform={state.xy.interpolate(calcTransformFactory(xValScale(idx), yValScale(idx)))}>
          <Gem key={idx} {...val}/>
        </animated.g>
      )}
    </Gemscape>)
  }

  return gemscape
}
