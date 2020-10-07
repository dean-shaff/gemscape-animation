import React,  { Component, useRef, useState, useEffect } from "react"
import ReactDOM from 'react-dom'
import { Spring } from 'react-spring/renderprops'
import { useSprings, animated } from 'react-spring'

import convert from 'color-convert'

import Gemscape from "./../Gemscape.js"
import Gem from './../Gem.js'
import { calcOffset } from './../../util.js'

import './GlowOnHover.alt.css'

const AnimatedGem = animated(Gem)
const AnimatedFeDropShadow = animated('feDropShadow')


const calcInside = (cursor, ref, path, idx) => {
  return ref.isPointInFill(cursor)
}

const calcBlur = (cursor, ref, path, idx) => {
  let inside = ref.isPointInFill(cursor)
  if (inside) {
    return 2
  } else {
    return 0
  }
}

const calcOpacity = (cursor, ref, path, idx) => {
  let fillOpacity = parseFloat(path['__fillOpacity'])
  let inside = ref.isPointInFill(cursor)
  if (inside) {
    // let returnVal = fillOpacity * 1.5
    // if (returnVal > 1.0) {
    //   returnVal = 1.0
    // }
    // let returnVal = Math.sqrt(fillOpacity)
    let returnVal = 0.5 + 0.5*Math.sqrt(2*fillOpacity)
    if (fillOpacity < 0.5) {
      returnVal = fillOpacity
    }
    return returnVal
  } else {
    return fillOpacity
  }
}

const calcFilterOpacity = (cursor, ref, path, idx) => {
  let inside = ref.isPointInFill(cursor)
  if (inside) {
    return 1.0
  } else {
    return 0.0
  }
}

const calcTransform = (cursor, ref, path, idx) => {
  let inside = ref.isPointInFill(cursor)
  if (inside) {
    let bbox = ref.getBBox()
    let [xOffset, yOffset] = [
      calcOffset(bbox.x, bbox.width, this.props.scaleFactor),
      calcOffset(bbox.y, bbox.height, this.props.scaleFactor),
    ]
    return `scale(${this.props.scaleFactor}) translate(${-xOffset}, ${-yOffset})`
  } else {
    return 'scale(1.0) translate(0.0, 0.0)'
  }
}


const calcAttributeFactory = (gemscapeRef, pathRefs, parsedPaths) => {
  // console.log(`calcAttributeFactory: pathRefs=${JSON.stringify(pathRefs)}`)
  return (cb) => {
    return (x, y) => {
      // const svg = gemscapeRef.current.svg
      const svg = gemscapeRef.current
      const pathRefsFiltered = pathRefs.filter(ref => ref != null).map(ref => ref.path)
      let point = svg.createSVGPoint()
      point.x = x
      point.y = y
      point = point.matrixTransform(svg.getScreenCTM().inverse())
      let first = pathRefsFiltered[0]
      if (first !== undefined) {
        let matrix = first.getCTM()
        let cursor = point.matrixTransform(matrix.inverse())
        const result = pathRefsFiltered.map((ref, idx) => {
          return cb(cursor, ref, parsedPaths[idx], idx)
        })
        return result
      } else {
        return null
      }
    }
  }
}




const GlowOnHover = (props) => {
  console.log(`GlowOnHover: props.number=${props.number}, props.config=${JSON.stringify(props.config, null, 2)}`)

  const gemscapeRef = useRef(null)
  const calcAttributeRef = useRef(null)
  const calcOpacityRef = useRef(null)
  const calcTransformRef = useRef(null)
  const calcFilterOpacityRef = useRef(null)
  const calcInsideRef = useRef(null)

  const pathRefs = []

  const [fills, setFills] = useState([])

  const [springs, set, stop] = useSprings(props.number, idx => ({'fillOpacity': 1, 'filterOpacity': 0, 'config': props.config}))

  useEffect(() => {
    calcAttributeRef.current = null
    if (props.parsedSVG === null) {
      return
    }
    const fills = props.parsedSVG.paths.map(p => p.fill)
    setFills(fills)

    // console.log(fills.map(fill => convert.hex.hsl(fill)))

    const opacities = props.parsedSVG.paths.map(p => p['__fillOpacity'])
    set(idx => ({'fillOpacity': parseFloat(opacities[idx])}))
    console.log(opacities)
  }, [props.parsedSVG])


  useEffect(() => {
    calcAttributeRef.current = null
  }, [props.config])

  const getDefault = (paths) => {
    return paths.reduce((acc, cur) => {
      acc[0].push(parseFloat(cur['__fillOpacity']))
      acc[1].push(cur.fill)
      acc[2].push(0)
      acc[3].push('scale(1.0) translate(0.0, 0.0)')
      return acc
    }, [[], [], [], []])
  }

  let counter = 0
  let delta = 0

  const onMouseMove = ({ clientX: x, clientY: y }) => {
    // console.log(`onMouseMove: props.config=${JSON.stringify(props.config, null, 2)}`)
    if (gemscapeRef.current === null || pathRefs.length === 0) {
      return
    }
    if (calcAttributeRef.current === null) {
      calcAttributeRef.current = calcAttributeFactory(gemscapeRef, pathRefs, props.parsedSVG.paths)
      calcOpacityRef.current = calcAttributeRef.current(calcOpacity)
      calcFilterOpacityRef.current = calcAttributeRef.current(calcFilterOpacity)
    }

    const defaults = getDefault(props.parsedSVG.paths)
    let opacities = calcOpacityRef.current(x, y)
    if (opacities === null) {
      opacities = defaults[0]
    }
    let filterOpacities = calcFilterOpacityRef.current(x, y)
    if (filterOpacities === null) {
      filterOpacities = defaults[2]
    }
    set(idx => ({'fillOpacity': opacities[idx], 'filterOpacity': filterOpacities[idx], 'config': props.config}))
  }

  const parsed = props.parsedSVG

  if (parsed === null) {
    return null
  } else {
    parsed.svg.onMouseMove = onMouseMove
    // parsed.svg.onClick = onMouseMove
    // let images = []
    // for (let idx=0; idx<5; idx++) {
    //   let path = `assets/Cicle_Vascule.5/gem.${idx}.svg`
    //   // images.push((
    //   //   <div key={idx}>
    //   //     <img className="image-item" src={path}/>
    //   //   </div>
    //   // ))
    //   images.push((
    //     <image key={idx} href={path}/>
    //   ))
    // }

    // const images = springs.map((props, idx) => {
    //   let path = `assets/Cicle_Vascule.5/gem.${idx}.svg`
    //   const filterOpacityInterp = props.filterOpacity.interpolate([0, 1], [0, 1])
    //   return (
    //     <animated.image key={idx} href={path} style={{'opacity': filterOpacityInterp}}/>
    //   )
    // })

    return (
      <div>
      <svg {...parsed.svg} ref={gemscapeRef}>
        <rect {...parsed.rect}/>
        {springs.map((props, idx) => {
          const path = `assets/Cicle_Vascule.5/gem.${idx}.svg`
          const {filterOpacity, fillOpacity, ...rest} = props
          const filterOpacityInterp = filterOpacity.interpolate([0, 1], [0, 1])
          const fillOpacityInterp = fillOpacity.interpolate([0, 1], [0, 1])
          return (
            <g key={idx}>
              {/*<animated.image key={idx} href={path} style={{'opacity': filterOpacityInterp}}/>*/}
              <g {...parsed.g}>
                <AnimatedGem {...parsed.paths[idx]} ref={ref => pathRefs[idx] = ref} fillOpacity={fillOpacityInterp} {...rest}/>
              </g>
            </g>
        )})}
      </svg>
      {/*<Gemscape svg={parsed.svg} rect={parsed.rect} g={parsed.g} ref={gemscapeRef} supplemental={images}>
        {springs.map((props, idx) => {
          const {filterOpacity, fillOpacity, ...rest} = props
          const filterOpacityInterp = filterOpacity.interpolate([0, 1], [0, 1])
          const fillOpacityInterp = fillOpacity.interpolate([0, 1], [0, 1])
          return (
            <g key={idx}>
              <AnimatedGem {...parsed.paths[idx]} ref={ref => pathRefs[idx] = ref} fillOpacity={fillOpacityInterp} {...rest}/>
            </g>
        )})}
      </Gemscape>*/}
      {/*<svg {...parsed.svg}>
      </svg>*/}
      </div>
    )
  }
}
export default GlowOnHover
