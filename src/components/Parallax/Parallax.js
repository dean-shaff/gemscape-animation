import React,  { useRef, useState } from "react"
import ReactDOM from 'react-dom'

import { useSpring, animated, config } from 'react-spring'

import Gemscape from "./../Gemscape.js"
import Gem from './../Gem.js'
import { scale, sortIntoLayers } from './../../util.js'


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



export function ParallaxByLayer (props) {
  const gemscapeRef = useRef(null)
  const [state, set] = useSpring(() => ({ xy: [0, 0], config: props.config }))
  set({
    'config': props.config
  })

  let gemscape = null
  if (props.parsedSVG != null) {

    const paths = props.parsedSVG.paths
    const layers = sortIntoLayers(paths)
    const orderedLayerKeys = Object.keys(layers).map(k => parseFloat(k)).sort()

    const xValScale = scale([0, orderedLayerKeys.length], [-1/props.xVal, 1/props.xVal])
    const yValScale = scale([0, orderedLayerKeys.length], [-1/props.yVal, 1/props.yVal])

    props.parsedSVG.svg.onMouseMove = ({ clientX: x, clientY: y }) => set({ xy: calcCursorFactory(gemscapeRef.current.svg)(x, y) })
    gemscape = (
      <Gemscape svg={props.parsedSVG.svg} rect={props.parsedSVG.rect} g={props.parsedSVG.g} ref={gemscapeRef}>
        {orderedLayerKeys.map((layer, idx) => {
          let transform = state.xy.interpolate(
            calcTransformFactory(props.parsedSVG, xValScale(idx), yValScale(idx))
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
  if (props.parsedSVG != null) {
    let svg = props.parsedSVG.svg
    const xValScale = scale([0, props.parsedSVG.paths.length + 1], [-1/props.xVal, 1/props.xVal])
    const yValScale = scale([0, props.parsedSVG.paths.length + 1], [-1/props.yVal, 1/props.yVal])

    svg.onMouseMove = ({ clientX: x, clientY: y }) => set({ xy: calcCursorFactory(gemscapeRef.current.svg)(x, y) })
    gemscape = (
      <Gemscape svg={svg} rect={props.parsedSVG.rect} g={props.parsedSVG.g} ref={gemscapeRef}>
        {props.parsedSVG.paths.map((val, idx) =>
          <animated.g key={idx} transform={state.xy.interpolate(calcTransformFactory(props.parsedSVG, xValScale(idx), yValScale(idx)))}>
            <Gem key={idx} {...val}/>
          </animated.g>
        )}
      </Gemscape>
    )
  }

  return gemscape
}
