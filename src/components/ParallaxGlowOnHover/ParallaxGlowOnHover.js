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
  // glowingFill,
  glowingTransform,
  toggle,
  calcCursorFactory,
  calcTransformFactory,
  HSLuvHueIntensityMap
} from './../../util'
import mouseGemRefGenerator from './../../util/mouseGemRefGenerator.js'

import './ParallaxGlowOnHover.css'

const AnimatedGem = animated(Gem)
const AnimatedFeTurbulence = animated('feTurbulence')
const AnimatedFeDisplacementMap = animated('feDisplacementMap')
const AnimatedFilter = animated('filter')

const glowingFill = function (intensityFactor) {
  return (ref, inside) => {
    let fill = ref.getAttribute('__fill')
    if (inside) {
      fill = HSLuvHueIntensityMap(fill, intensityFactor)
    }
    return fill
  }
}


const ParallaxGlowOnHover = (props) => {
  console.log(`ParallaxGlowOnHover: props.number=${props.number}, props.config=${JSON.stringify(props.config, null, 2)}`)


  const getDefault = (paths) => {
    return paths.map(path => ({
      'fillOpacity': parseFloat(path['__fillopacity']),
      'fill': path['__fill'],
      'transform': 'translate(0 0) scale(1)'
    }))
  }

  const gemscapeRef = useRef(null)
  const attributesRef = useRef(null)

  const pathRefs = []

  const [saturationFactor, setSaturationFactor] = useState(1.1)
  const [brightnessFactor, setBrightnessFactor] = useState(1.1)
  const [intensityFactor, setIntensityFactor] = useState(10)
  const [useParallax, setUseParallax] = useState(true)
  const [useGlowOnHover, setUseGlowOnHover] = useState(true)
  const [parallaxFactor, setParallaxFactor] = useState(2)
  const [parallaxPlane, setParallaxPlane] = useState(2)
  const [scaleFactor, setScaleFactor] = useState(1.05)

  window.transforms = []

  const [springs, set, stop] = useSprings(
    props.number, idx => ({
      'fillOpacity': 1,
      'fill': '#ffffff',
      'transform': 'translate(0 0) scale(1.0)',
      'config': props.config,
      'onFrame': val => { window.transforms.push(val.transform) }
    })
  )

  const [playCursor, setPlayCursor, stopPlayCursor] = useSpring(() => ({offset: 100, config: props.config}))
  // const [width, setWidth, stopWidth] = useSpring(() => ({width: 100, config: props.config}))

  useEffect(() => {
    attributesRef.current = null
    if (props.parsedSVG === null) {
      return
    }
    const defaults = getDefault(props.parsedSVG.paths)
    set(idx => defaults[idx])
  }, [props.parsedSVG])

  useEffect(() => {
    attributesRef.current = null
    setPlayCursor({'config': props.config})
    set(idx => ({'config': props.config}))
  }, [
    props.config,
    saturationFactor,
    brightnessFactor,
    intensityFactor,
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
    // const getFill = glowingFill(saturationFactor, brightnessFactor)
    const getFill = glowingFill(intensityFactor)
    const getTransform = glowingTransform(scaleFactor)
    const [width, height] = [gemscapeRef.current.getAttribute('width'), gemscapeRef.current.getAttribute('height')]
    const nLayers = (new Set(pathRefs.map(path => path.path.getAttribute('layer')))).size
    let attributes = []
    const defaults = getDefault(props.parsedSVG.paths)

    for (const obj of attributesRef.current(x, y)) {
      if (obj.idx === 0) {
        // const frac = obj.screenCursor.x/props.parsedSVG.rect.width
        const bbox = gemscapeRef.current.getBBox()
        const frac = obj.screenCursor.x/width
        setPlayCursor({ offset: 100*frac })
      }

      const transform = {
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
        transform.x = xPos*xScale
        transform.y = yPos*yScale
      }
      let fillOpacity = defaults[obj.idx].fillOpacity
      let fill = defaults[obj.idx].fill

      if (useGlowOnHover) {
        if (layer > 0) {
          fillOpacity = getFillOpacity(obj.ref, obj.inside)
          fill = getFill(obj.ref, obj.inside)
          const transformObj = getTransform(obj.ref, obj.inside)
          transform.x += transformObj.x
          transform.y += transformObj.y
          transform.scale = transformObj.scale
        }
      }

      const bbox = obj.ref.getBBox()
      // console.log(bbox.x + bbox.width, obj.pathCursor.x)
      if (obj.pathCursor.x < bbox.x && layer !== 0) {
        fill = props.parsedSVG.paths[obj.idx].__fillgreyscale
      }


      attributes.push({
        'fillOpacity': fillOpacity,
        'fill': fill,
        'transform': `translate(${transform.x} ${transform.y}) scale(${transform.scale}) `
      })
    }
    set(idx => ({
      ...attributes[idx],
      config: props.config
    }))
  }


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
    // const dirName = `assets/${props.fileName.replace('.svg', '')}`
    // parsed.svg.onClick = onMouseMove

    const interp = playCursor.offset.interpolate(o => `${o}%`)

    return (
      <div>
      <div className="columns">
        <div className="column">
          <Slider title="Intensity Adjustment Factor" val={intensityFactor} onChange={setFactor(setIntensityFactor)} min={1} max={20} step={1}/>
        </div>

        {/*<div className="column">
          <Slider title="Saturation Adjustment Factor" val={saturationFactor} onChange={setFactor(setSaturationFactor)} min={1.0} max={2.0} step={0.1}/>
        </div>
        <div className="column">
          <Slider title="Brightness Adjustment Factor" val={brightnessFactor} onChange={setFactor(setBrightnessFactor)} min={1.0} max={2.0} step={0.1}/>
        </div>*/}
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
        <defs>
          <clipPath id="clip">
            <animated.rect width={interp} fill="#000000" x={0} y={0} height={parsed.rect.height}/>
          </clipPath>
          <clipPath id="grayscale-clip">
            <animated.rect width={parsed.rect.width} fill="#000000" x={interp} y={0} height={parsed.rect.height}/>
          </clipPath>
          {/*<filter id="grayscale">
            <feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"/>
          </filter>*/}

          {/*<linearGradient id="linear-gradient">
            <stop offset="0%" stopColor="white"/>
            <animated.stop offset={playCursor.offset.interpolate(o => `${o}%`)} stopColor="white"/>
            <animated.stop offset={playCursor.offset.interpolate(o => `${o + 1}%`)} stopColor="white" stopOpacity="30%"/>
            <stop offset="100%" stopColor="white" stopOpacity="30%"/>
          </linearGradient>*/}

          {/*<AnimatedFilter id="water" x="0" width="100%">
            <AnimatedFeTurbulence type="fractalNoise" baseFrequency={0.1} numOctaves="2" result="TURB" seed="8" />
            <AnimatedFeDisplacementMap xChannelSelector="R" yChannelSelector="G" in="SourceGraphic" in2="TURB" result="DISP" scale={offset.offset.interpolate(o => `${o}`)} />
          </AnimatedFilter>*/}

          {/*<linearGradient id="linear-gradient">
            <stop offset="0%" stopColor="black"/>
            <animated.stop offset={offset.offset} stopColor="black" stopOpacity="30%"/>
            <stop offset="100%" stopColor="black"/>
          </linearGradient>*/}

          {/*<mask id="mask">
            <rect x={0} width={parsed.rect.width} height={parsed.rect.height} fill="url(#linear-gradient)"/>
          </mask>*/}

        </defs>
        <rect {...parsed.rect}/>
        <g clipPath="url(#grayscale-clip)">
          <g {...parsed.g}>
            {springs.map((props, idx) => {
              const transform = props.transform
              const {fill, __fillgreyscale, ...rest} = parsed.paths[idx]

              const layer = parseInt(parsed.paths[idx].layer)
              if (layer != null) {
                if (layer === 0) {
                  return <AnimatedGem key={`grayscale-${idx}`} {...rest} fill={__fillgreyscale} fillOpacity="0.5" transform={transform}/>
                }
              }
              return null
            })}
          </g>
        </g>
            {springs.map((props, idx) => {
              // const path = `${dirName}/gem.${idx}.svg`
              const {fillOpacity, fill, ...rest} = props
              const fillOpacityInterp = fillOpacity.interpolate([0, 1], [0, 1])
              const layer = parseInt(parsed.paths[idx].layer)
              let clipPath = null
              if (layer === 0) {
                clipPath = "url(#clip)"
              }
              return (
                <g clipPath={clipPath} key={idx}>
                  <g {...parsed.g}>
                    <g key={idx}>
                    {/*<Gem  {...parsed.paths[idx]} clipPath="url(#grayscale-clip)" filter="url(#grayscale)"/>*/}
                    <AnimatedGem
                      {...parsed.paths[idx]}
                      fill={fill}
                      fillOpacity={fillOpacityInterp}
                      ref={ref => pathRefs[idx] = ref}
                      {...rest}/>
                    </g>
                  </g>
                </g>
                )
              })
            }
      </svg>
      </div>
    )
  }
}
export default ParallaxGlowOnHover
