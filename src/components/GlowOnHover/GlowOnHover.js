import React,  { Component, useRef, useState, useEffect } from "react"
import ReactDOM from 'react-dom'
import { Spring } from 'react-spring/renderprops'
import { useSprings, animated } from 'react-spring'

import Gemscape from "./../Gemscape.js"
import Gem from './../Gem.js'
import { calcOffset } from './../../util'

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
    return fillOpacity * 1.5
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
      const svg = gemscapeRef.current.svg
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
  // const calcBlurRef = useRef(null)
  const calcInsideRef = useRef(null)

  const pathRefs = []

  const [fills, setFills] = useState([])

  // const [springs, set, stop] = useSprings(props.number, idx => ({'fillOpacity': 1, blur: 0, 'config': props.config}))
  const [springs, set, stop] = useSprings(props.number, idx => ({'fillOpacity': 1, 'filterOpacity': 0, 'config': props.config}))

  useEffect(() => {
    calcAttributeRef.current = null
    if (props.parsedSVG === null) {
      return
    }
    const fills = props.parsedSVG.paths.map(p => p.fill)
    setFills(fills)
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
      // calcBlurRef.current = calcAttributeRef.current(calcBlur)
      // calcInsideRef.current = calcAttributeRef.current(calcInside)
      // init(gemscapeRef, pathRefs, props.parsedSVG.paths)
    }
    // const lastInside = props.number - 1 - calcInsideRef.current(x, y).reverse().findIndex(val => val)
    // set(idx => {
    //   const path = props.parsedSVG.paths[idx]
    //   let fillOpacity = parseFloat(path.fillOpacity)
    //   let blur = 0.0
    //   if (idx === lastInside) {
    //     fillOpacity *= 1.5
    //     blur = 2.0
    //   }
    //   return {'fillOpacity': fillOpacity, 'config': props.config, 'blur': blur}
    // })

    const defaults = getDefault(props.parsedSVG.paths)
    let opacities = calcOpacityRef.current(x, y)
    if (opacities === null) {
      opacities = defaults[0]
    }
    let filterOpacities = calcFilterOpacityRef.current(x, y)
    if (filterOpacities === null) {
      filterOpacities = defaults[2]
    }
    // let blurs = calcBlurRef.current(x, y)
    // if (blurs === null) {
    //   blurs = defaults[0]
    // }
    // set(idx => ({'fillOpacity': opacities[idx], 'blur': blurs[idx], 'config': props.config}))
    set(idx => ({'fillOpacity': opacities[idx], 'filterOpacity': filterOpacities[idx], 'config': props.config}))
  }

  const parsed = props.parsedSVG

  if (parsed === null) {
    return null
  } else {
    // return (
    //   <div onMouseMove={onMouseMove}>
    //     {/*{springs.map((prop, idx) => <animated.div key={idx}>{prop.opacity}</animated.div>)}*/}
    //     {springs.map((props, idx) => {
    //       let result = props.opacity.interpolate(o => o)
    //       return (<animated.div key={idx}>{props.opacity.interpolate(o => o)}</animated.div>)
    //     })}
    //   </div>
    // )
    parsed.svg.onMouseMove = onMouseMove
    // parsed.svg.onClick = onMouseMove
    // const defs = springs.map((props, idx) => (
    //   <filter key={`shadow-${idx}`} id={`shadow-${idx}`} height="300%" width="300%" x="-50%" y="-50%">
    //     <AnimatedFeDropShadow dx={0} dy={0} stdDeviation={2} floodOpacity={props.fillOpacity} floodColor={fills[idx]}/>
    //   </filter>
    // ))
    const defs = null

    return (
      <Gemscape svg={parsed.svg} rect={parsed.rect} g={parsed.g} ref={gemscapeRef} defs={defs}>
        {springs.map((props, idx) => {
          // const {blur, fillOpacity, ...rest} = props
          // const filter = blur.interpolate(b => {
          //   // if (b === 0.0) {
          //   //   return null
          //   // }
          //   if (b < 0) {
          //     b = 0.0
          //   }
          //   return `drop-shadow(0px 0px ${b}px ${fills[idx]})`
          // })
          const {filterOpacity, fillOpacity, ...rest} = props
          const filterOpacityInterp = filterOpacity.interpolate([0, 1], [0, 1])
          const fillOpacityInterp = fillOpacity.interpolate([0, 1], [0, 1])
          // const filter = null
          // const filter=`drop-shadow(0px 0px 2px ${fills[idx]})`
          // const fillOpacityInterp = fillOpacity.interpolate(f => {
          //   if (f < 0) {
          //     f = 0
          //   } else if (f > 1) {
          //     f = 1
          //   }
          //   return f
          // })
          // const filter = blur.interpolate(f => {
          //   return `drop-shadow(0px 0px 5px ${fills[idx]})`
          // })
          //
          return (
            <g key={idx}>
              <g>
                <AnimatedGem {...parsed.paths[idx]} ref={ref => pathRefs[idx] = ref} fillOpacity={fillOpacityInterp} {...rest}/>
              </g>
              <animated.g fillOpacity={filterOpacityInterp}>
                <AnimatedGem {...parsed.paths[idx]} {...rest} filter={`drop-shadow(0px 0px 2px ${fills[idx]})`}/>
              </animated.g>
            </g>
        )})}
      </Gemscape>
    )
  }
}
export default GlowOnHover
