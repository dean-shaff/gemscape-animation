import React,  { Component, useRef, useState } from "react"
import ReactDOM from 'react-dom'

import { useSpring, animated, config } from 'react-spring'

import Gemscape from "./Gemscape.js"
import Gem from './Gem.js'
import Slider from './Slider.js'
import SpringSliders from './SpringSliders.js'
import { scale, sortIntoLayers } from './../util.js'


const calcCursorFactory = function (svgRef) {
  return (x, y) => {
    // const svg = gemscapeRef.current.svg
    let point = svgRef.createSVGPoint()
    point.x = x
    point.y = y
    const cursor = point.matrixTransform(svgRef.getScreenCTM().inverse())
    return [cursor.x, cursor.y]
  }
}

const calcTransformFactory = function (svgObj, xScale, yScale) {
  const [width, height] = [svgObj.svg['width'], svgObj.svg['height']]
  return (x, y) => {
    let xPos = (x - width/2)
    let yPos = (y - height/2)
    let translateStr = `translate(${xPos*xScale}, ${yPos*yScale})`
    return translateStr
  }
}


export class ParallaxContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      xVal: 50,
      yVal: 50,
      mass: 1,
      tension: 120,
      friction: 14,
      velocity: 0.0
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
    let {xVal, yVal, ...config} = this.state
    config.velocity = parseFloat(config.velocity)
    const ParallaxComponent = this.props.component
    return (
      <div className="level">
        <div className="level-left">
        <div className="level-item">
          <div className="box">
            <div className="level">
              <h3 className="title is-3">{this.props.title}</h3>
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
              <SpringSliders {...config} onChange={this.handleChange}/>
            </div>
            {/*<Parallax {...this.props} xVal={xVal} yVal={yVal} config={config}/>*/}
            {/*<ParallaxByLayer {...this.props} xVal={xVal} yVal={yVal} config={config}/>*/}
            <ParallaxComponent {...this.props} xVal={xVal} yVal={yVal} config={config}/>

          </div>
        </div>
        </div>
      </div>
    )
  }
}

export function ParallaxByLayer (props) {
  const gemscapeRef = useRef(null)
  const [state, set] = useSpring(() => ({ xy: [0, 0], config: props.config }))
  set({
    'config': props.config
  })

  let gemscape = null
  if (props.svg != null) {

    const paths = props.svg.paths
    const layers = sortIntoLayers(paths)
    const orderedLayerKeys = Object.keys(layers).map(k => parseFloat(k)).sort()

    const xValScale = scale([0, orderedLayerKeys.length], [-1/props.xVal, 1/props.xVal])
    const yValScale = scale([0, orderedLayerKeys.length], [-1/props.yVal, 1/props.yVal])

    props.svg.svg.onMouseMove = ({ clientX: x, clientY: y }) => set({ xy: calcCursorFactory(gemscapeRef.current.svg)(x, y) })
    gemscape = (
      <Gemscape svg={props.svg.svg} rect={props.svg.rect} g={props.svg.g} ref={gemscapeRef}>
        {orderedLayerKeys.map((layer, idx) => {
          let transform = state.xy.interpolate(
            calcTransformFactory(props.svg, xValScale(idx), yValScale(idx))
          )
          return (<animated.g key={`layer-${idx}`} transform={transform}>
            {layers[layer].map((path, idy) => (
              <Gem key={`gem-${idx}-${idy}`} {...path}/>
            ))}
          </animated.g>)
        })}
      </Gemscape>
    )
  }

  return gemscape
}



export function Parallax (props) {
  const gemscapeRef = useRef(null);
  const [state, set] = useSpring(() => ({ xy: [0, 0], config: props.config }))
  set({
    'config': props.config
  })

  let gemscape = null
  if (props.svg != null) {
    let svg = props.svg.svg
    const xValScale = scale([0, props.svg.paths.length + 1], [-1/props.xVal, 1/props.xVal])
    const yValScale = scale([0, props.svg.paths.length + 1], [-1/props.yVal, 1/props.yVal])

    svg.onMouseMove = ({ clientX: x, clientY: y }) => set({ xy: calcCursorFactory(gemscapeRef.current.svg)(x, y) })
    gemscape = (
      <Gemscape svg={svg} rect={props.svg.rect} g={props.svg.g} ref={gemscapeRef}>
        {props.svg.paths.map((val, idx) =>
          <animated.g key={idx} transform={state.xy.interpolate(calcTransformFactory(props.svg, xValScale(idx), yValScale(idx)))}>
            <Gem key={idx} {...val}/>
          </animated.g>
        )}
      </Gemscape>
    )
  }

  return gemscape
}
