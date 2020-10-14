import React,  { Component, useRef, useState, useEffect } from "react"
import ReactDOM from 'react-dom'
import { useSprings, animated } from 'react-spring'

import hsluv from 'hsluv'

import Toggle from './../Toggle.js'
import Slider from './../Slider.js'
import Gemscape from "./../Gemscape.js"
import Gem from './../Gem.js'
import {
  calcOffset,
  cursorInsidePaths,
  glowingOpacity,
  toggle,
  glowingFill,
  calcCursorFactory,
  calcTransformFactory
} from './../../util'

import './ParallaxGlowOnHover.css'

const AnimatedGem = animated(Gem)


const ParallaxGlowOnHover = (props) => {
  console.log(`ParallaxGlowOnHover: props.number=${props.number}, props.config=${JSON.stringify(props.config, null, 2)}`)

  const getDefault = (paths) => {
    return paths.map(path => ([
      parseFloat(path['__fillopacity']),
      path['__fill'],
      'translate(0 0)'
    ]))
  }

  const gemscapeRef = useRef(null)
  const glowingAttributesRef = useRef(null)
  const parallaxAttributesRef = useRef(null)

  const pathRefs = []

  const [saturationFactor, setSaturationFactor] = useState(1.0)
  const [brightnessFactor, setBrightnessFactor] = useState(1.0)
  const [useParallax, setUseParallax] = useState(true)
  const [useGlowOnHover, setUseGlowOnHover] = useState(true)

  const [springs, set, stop] = useSprings(
    props.number, idx => ({
      'fillOpacity': 1,
      'fill': '#ffffff',
      'transform': 'translate(0 0)',
      'config': props.config
    })
  )

  useEffect(() => {
    glowingAttributesRef.current = null
    parallaxAttributesRef.current = null
    if (props.parsedSVG === null) {
      return
    }
    const defaults = getDefault(props.parsedSVG.paths)
    set(idx => ({
        'fillOpacity': defaults[idx][0],
        'fill': defaults[idx][1],
        'transform': 'translate(0 0)'
      })
    )
  }, [props.parsedSVG])

  useEffect(() => {
    glowingAttributesRef.current = null
    parallaxAttributesRef.current = null
  }, [props.config, saturationFactor, brightnessFactor])


  const onMouseMove = ({ clientX: x, clientY: y }) => {
    // console.log(`onMouseMove: props.config=${JSON.stringify(props.config, null, 2)}`)
    if (gemscapeRef.current === null || pathRefs.length === 0) {
      return
    }
    if (glowingAttributesRef.current === null) {
      glowingAttributesRef.current = cursorInsidePaths(
        gemscapeRef, pathRefs)([glowingOpacity, glowingFill(saturationFactor, brightnessFactor)])
    }

    let attributes = glowingAttributesRef.current(x, y)
    if (attributes === null) {
      attributes = getDefault(props.parsedSVG.paths)
    }
    // calculate transforms for parallax
    if (parallaxAttributesRef.current === null) {
      parallaxAttributesRef.current = ((ref) => {
        const calcCursor = calcCursorFactory(ref)
        const [width, height] = [ref.getAttribute('width'), ref.getAttribute('height')]
        const nLayers = (new Set(pathRefs.map(path => path.path.getAttribute('layer')))).size
        return (_x, _y) => {
          const [x, y] = calcCursor(_x, _y)
          return pathRefs.map((path, idx) => {
            const layer = parseInt(path.path.getAttribute('layer')) + 2 - nLayers
            const xScale = layer * 0.002
            const yScale = layer * 0.002
            const xPos = (x - width/2)
            const yPos = (y - height/2)
            const translateStr = `translate(${xPos*xScale} ${yPos*yScale})`
            return translateStr
          })
        }
      })(gemscapeRef.current)
    }

    const translates = parallaxAttributesRef.current(x, y)

    set(idx => ({
        'fillOpacity': attributes[idx][0],
        'fill': attributes[idx][1],
        'transform': translates[idx],
        'config': props.config
      })
    )
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
      <div className="columns">
        <div className="column">
          <Toggle title="Toggle Parallax" checked={useParallax} onChange={() => {setUseParallax(! useParallax)}}/>
        </div>
        <div className="column">
          <Toggle title="Toggle GlowOnHover" checked={useGlowOnHover} onChange={() => {setUseGlowOnHover(! useGlowOnHover)}}/>
        </div>
      </div>
      <svg {...parsed.svg} ref={gemscapeRef}>
        <rect {...parsed.rect}/>
        {springs.map((props, idx) => {
          const path = `${dirName}/gem.${idx}.svg`
          const {fillOpacity, fill, ...rest} = props
          const fillOpacityInterp = fillOpacity.interpolate([0, 1], [0, 1])
          return (
            <g key={idx}>
              <g {...parsed.g}>
                <AnimatedGem {...parsed.paths[idx]} fill={fill} fillOpacity={fillOpacityInterp} ref={ref => pathRefs[idx] = ref} {...rest}/>
              </g>
            </g>
        )})}
      </svg>
      </div>
    )
  }
}
export default ParallaxGlowOnHover
