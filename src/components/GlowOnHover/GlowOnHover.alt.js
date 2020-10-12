import React,  { Component, useRef, useState, useEffect } from "react"
import ReactDOM from 'react-dom'
import { Spring } from 'react-spring/renderprops'
import { useSprings, animated } from 'react-spring'

import hsluv from 'hsluv'

import Slider from './../Slider.js'
import Gemscape from "./../Gemscape.js"
import Gem from './../Gem.js'
import { calcOffset } from './../../util.js'
import { cursorInsidePaths, glowingOpacity, toggle, glowingFill } from './cursorInsidePaths.js'

import './GlowOnHover.alt.css'

const AnimatedGem = animated(Gem)
const AnimatedFeDropShadow = animated('feDropShadow')

const GlowOnHover = (props) => {
  console.log(`GlowOnHover: props.number=${props.number}, props.config=${JSON.stringify(props.config, null, 2)}`)

  const getDefault = (paths) => {
    return paths.map(path => ([
      parseFloat(path['__fillopacity']),
      0.0,
      path['__fill']
    ]))
  }

  const gemscapeRef = useRef(null)
  const glowingAttributesRef = useRef(null)

  const pathRefs = []

  const [saturationFactor, setSaturationFactor] = useState(1.0)
  const [brightnessFactor, setBrightnessFactor] = useState(1.0)

  const [springs, set, stop] = useSprings(
    props.number, idx => ({'fillOpacity': 1, 'filterOpacity': 0.0, 'fill': '#ffffff', 'config': props.config}))

  useEffect(() => {
    glowingAttributesRef.current = null
    if (props.parsedSVG === null) {
      return
    }
    const defaults = getDefault(props.parsedSVG.paths)
    set(idx => ({'fillOpacity': defaults[idx][0], 'fill': defaults[idx][2]}))
  }, [props.parsedSVG])

  useEffect(() => {
    glowingAttributesRef.current = null
  }, [props.config, saturationFactor, brightnessFactor])


  const onMouseMove = ({ clientX: x, clientY: y }) => {
    // console.log(`onMouseMove: props.config=${JSON.stringify(props.config, null, 2)}`)
    if (gemscapeRef.current === null || pathRefs.length === 0) {
      return
    }
    if (glowingAttributesRef.current === null) {
      glowingAttributesRef.current = cursorInsidePaths(
        gemscapeRef, pathRefs)([glowingOpacity, toggle(1.0, 0.0), glowingFill(saturationFactor, brightnessFactor)])
    }
    let attributes = glowingAttributesRef.current(x, y)
    if (attributes === null) {
      attributes = getDefault(props.parsedSVG.paths)
    }
    set(idx => ({'fillOpacity': attributes[idx][0], 'filterOpacity': attributes[idx][1], 'fill': attributes[idx][2], 'config': props.config}))
  }

  const parsed = props.parsedSVG

  if (parsed === null) {
    return null
  } else {
    parsed.svg.onMouseMove = onMouseMove
    const dirName = `assets/${props.fileName.replace('.svg', '')}`
    // parsed.svg.onClick = onMouseMove

    return (
      <div>
      <div className="columns">
        <div className="column">
          <Slider title="Saturation Adjustment Factor" val={saturationFactor} onChange={(evt) => {setSaturationFactor(parseFloat(evt.target.value))}} min={1.0} max={2.0} step={0.1}/>
        </div>
        <div className="column">
          <Slider title="Brightness Adjustment Factor" val={brightnessFactor} onChange={(evt) => {setBrightnessFactor(parseFloat(evt.target.value))}} min={1.0} max={2.0} step={0.1}/>
        </div>
      </div>
      <svg {...parsed.svg} ref={gemscapeRef}>
        <rect {...parsed.rect}/>
        {springs.map((props, idx) => {
          const path = `${dirName}/gem.${idx}.svg`
          const {filterOpacity, fillOpacity, fill, ...rest} = props
          const filterOpacityInterp = filterOpacity.interpolate([0, 1], [0, 1])
          const fillOpacityInterp = fillOpacity.interpolate([0, 1], [0, 1])
          return (
            <g key={idx}>
              <g {...parsed.g}>
                <animated.image key={idx} href={path} style={{'opacity': filterOpacityInterp}}/>
                <AnimatedGem {...parsed.paths[idx]} fill={fill} fillOpacity={fillOpacityInterp} ref={ref => pathRefs[idx] = ref} {...rest}/>
              </g>
            </g>
        )})}
      </svg>
      </div>
    )
  }
}
export default GlowOnHover
