import React,  { Component, useRef, useState, useEffect } from "react"
import ReactDOM from 'react-dom'
import { useSprings, useSpring, animated } from 'react-spring'

import hsluv from 'hsluv'

import Toggle from './../Toggle.js'
import Slider from './../Slider.js'
import Gemscape from "./../Gemscape.js"
import Gem from './../Gem.js'
import {
  calcOffset,
  cursorInsidePaths,
  glowingOpacity,
  glowingFill,
  glowingTransform,
  toggle,
  calcCursorFactory,
  calcTransformFactory
} from './../../util'
import mouseGemRefGenerator from './../../util/mouseGemRefGenerator.js'

import './ParallaxGlowOnHover.css'

const AnimatedGem = animated(Gem)


const ParallaxGlowOnHover = (props) => {
  console.log(`ParallaxGlowOnHover: props.number=${props.number}, props.config=${JSON.stringify(props.config, null, 2)}`)

  const getDefault = (paths) => {
    return paths.map(path => ({
      'fillOpacity': parseFloat(path['__fillopacity']),
      'fill': path['__fill'],
      'transform': 'scale(1.0) translate(0 0)'
    }))
  }

  const gemscapeRef = useRef(null)
  const attributesRef = useRef(null)
  // const glowingAttributesRef = useRef(null)
  // const parallaxAttributesRef = useRef(null)

  const pathRefs = []

  const [saturationFactor, setSaturationFactor] = useState(1.1)
  const [brightnessFactor, setBrightnessFactor] = useState(1.1)
  const [useParallax, setUseParallax] = useState(true)
  const [useGlowOnHover, setUseGlowOnHover] = useState(true)
  const [parallaxFactor, setParallaxFactor] = useState(2)
  const [parallaxPlane, setParallaxPlane] = useState(2)
  const [scaleFactor, setScaleFactor] = useState(1.05)


  const [springs, set, stop] = useSprings(
    props.number, idx => ({
      'fillOpacity': 1,
      'fill': '#ffffff',
      'transform': 'scale(1.0) translate(0 0)',
      'config': props.config
    })
  )

  const [width, setWidth, stopWidth] = useSpring(() => ({width: 100}))

  useEffect(() => {
    attributesRef.current = null
    // glowingAttributesRef.current = null
    // parallaxAttributesRef.current = null
    if (props.parsedSVG === null) {
      return
    }
    const defaults = getDefault(props.parsedSVG.paths)
    set(idx => defaults[idx])
  }, [props.parsedSVG])

  useEffect(() => {
    attributesRef.current = null
    // glowingAttributesRef.current = null
    // parallaxAttributesRef.current = null
  }, [
    props.config,
    saturationFactor,
    brightnessFactor,
    scaleFactor,
    useParallax,
    useGlowOnHover,
    parallaxFactor,
    parallaxPlane
  ])

  const onMouseMove = ({ clientX: x, clientY: y }) => {
    if (gemscapeRef.current === null || pathRefs.length === 0) {
      return
    }
    if (attributesRef.current === null) {
      attributesRef.current = mouseGemRefGenerator(gemscapeRef, pathRefs)
    }
    const getFillOpacity = glowingOpacity
    const getFill = glowingFill(saturationFactor, brightnessFactor)
    const getTransform = glowingTransform(scaleFactor)
    const [width, height] = [gemscapeRef.current.getAttribute('width'), gemscapeRef.current.getAttribute('height')]
    const nLayers = (new Set(pathRefs.map(path => path.path.getAttribute('layer')))).size
    let attributes = []
    const defaults = getDefault(props.parsedSVG.paths)

    for (const obj of attributesRef.current(x, y)) {
      if (obj.idx === 0) {
        setWidth({width: obj.screenCursor.x})
      }
      // let translateStr = defaults[obj.idx].transform
      // let transformStr = defaults[obj.idx].transform
      let transform = {
        'scale': 1.0,
        'x': 0.0,
        'y': 0.0
      }


      const layer = parseInt(obj.ref.getAttribute('layer'))
      if (useParallax) {
        const parallaxLayer = layer + parallaxPlane - nLayers
        const xScale = parallaxLayer * 0.001 * parallaxFactor
        const yScale = parallaxLayer * 0.001 * parallaxFactor
        const xPos = (obj.screenCursor.x - width/2)
        const yPos = (obj.screenCursor.y - height/2)
        if (obj.inside) {
          transform.x = xPos*xScale/scaleFactor
          transform.y = yPos*yScale/scaleFactor
        } else {
          transform.x = xPos*xScale
          transform.y = yPos*yScale
        }
      }
      let fillOpacity = defaults[obj.idx].fillOpacity
      let fill = defaults[obj.idx].fill

      if (useGlowOnHover) {
        if (layer > 0) {
          fillOpacity = getFillOpacity(obj.ref, obj.inside)
          fill = getFill(obj.ref, obj.inside)
          // console.log(getTransform(obj.ref, obj.inside))
          // translateStr = getTransform(obj.ref, obj.inside)
          let transformObj = getTransform(obj.ref, obj.inside)
          transform.x += transformObj.x
          transform.y += transformObj.y
          transform.scale = transformObj.scale
        }
      }

      attributes.push({
        'fillOpacity': fillOpacity,
        'fill': fill,
        'transform': `scale(${transform.scale}) translate(${transform.x} ${transform.y})`
      })
    }
    set(idx => ({
      ...attributes[idx],
      'config': props.config
    }))
  }

  // const onMouseMove = ({ clientX: x, clientY: y }) => {
  //   // console.log(`onMouseMove: props.config=${JSON.stringify(props.config, null, 2)}`)
  //   if (gemscapeRef.current === null || pathRefs.length === 0) {
  //     return
  //   }
  //   if (glowingAttributesRef.current === null) {
  //     glowingAttributesRef.current = cursorInsidePaths(gemscapeRef, pathRefs)({
  //       'fillOpacity': glowingOpacity,
  //       'fill': glowingFill(saturationFactor, brightnessFactor)
  //     })
  //   }
  //
  //   const defaults = getDefault(props.parsedSVG.paths)
  //   let attributes = defaults
  //
  //   if (useGlowOnHover) {
  //     attributes = glowingAttributesRef.current(x, y)
  //     if (attributes === null) {
  //       attributes = defaults
  //     }
  //   }
  //   // calculate transforms for parallax
  //
  //   if (useParallax) {
  //     if (parallaxAttributesRef.current === null) {
  //       parallaxAttributesRef.current = ((ref) => {
  //         const calcCursor = calcCursorFactory(ref)
  //         const [width, height] = [ref.getAttribute('width'), ref.getAttribute('height')]
  //         const nLayers = (new Set(pathRefs.map(path => path.path.getAttribute('layer')))).size
  //         return (_x, _y) => {
  //           const [x, y] = calcCursor(_x, _y)
  //           return pathRefs.map((path, idx) => {
  //             const layer = parseInt(path.path.getAttribute('layer')) + parallaxPlane - nLayers
  //             const xScale = layer * 0.001 * parallaxFactor
  //             const yScale = layer * 0.001 * parallaxFactor
  //             const xPos = (x - width/2)
  //             const yPos = (y - height/2)
  //             const translateStr = `translate(${xPos*xScale} ${yPos*yScale})`
  //             return translateStr
  //           })
  //         }
  //       })(gemscapeRef.current)
  //     }
  //     const translates = parallaxAttributesRef.current(x, y)
  //     translates.forEach((t, idx) => attributes[idx]['transform'] = t)
  //   }
  //   set(idx => ({
  //       ...attributes[idx],
  //       'config': props.config
  //     })
  //   )
  // }

  const parsed = props.parsedSVG

  const setFactor = (setter) => {
    return (evt) => {
      setter(parseFloat(evt.target.value))
    }
  }


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
          <Slider title="Saturation Adjustment Factor" val={saturationFactor} onChange={setFactor(setSaturationFactor)} min={1.0} max={2.0} step={0.1}/>
        </div>
        <div className="column">
          <Slider title="Brightness Adjustment Factor" val={brightnessFactor} onChange={setFactor(setBrightnessFactor)} min={1.0} max={2.0} step={0.1}/>
        </div>
        <div className="column">
          <Slider title="Scale Adjustment Factor" val={scaleFactor} onChange={setFactor(setScaleFactor)} min={1.0} max={2.0} step={0.05}/>
        </div>
      </div>
      <div className="columns">
        <div className="column">
          <Slider title="Parallax Adjustment Factor" val={parallaxFactor} onChange={setFactor(setParallaxFactor)} min={1} max={15} step={1}/>
        </div>
        <div className="column">
          <Slider title="Parallax Plane" val={parallaxPlane} onChange={(evt) => {setParallaxPlane(parseFloat(evt.target.value))}} min={1} max={3} step={1}/>
        </div>
      </div>
      <div className="columns">
        <div className="column">
          <Toggle title="Toggle Parallax" checked={useParallax} onChange={() => {setUseParallax(! useParallax)}}/>
          <Toggle title="Toggle GlowOnHover" checked={useGlowOnHover} onChange={() => {setUseGlowOnHover(! useGlowOnHover)}}/>
        </div>
        <div className="column">
        </div>
      </div>
      <svg {...parsed.svg} ref={gemscapeRef}>
        <rect {...parsed.rect}/>
        <animated.rect width={width.width} x={0} y={0} height={parsed.rect.height} fill="050505"/>
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
