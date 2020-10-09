import React,  { Component, useRef, useState, useEffect } from "react"
import ReactDOM from 'react-dom'

import hsluv from 'hsluv'

import Slider from "./../Slider.js"
import Gemscape from "./../Gemscape.js"
import Gem from './../Gem.js'

const generateColorGrid = (fillHsluv, fillOpacity, nShapes, width, height, useSat) => {
  const xIncrement = 100/(nShapes-1)
  const yIncrement = 100/nShapes
  const rectWidth = width / nShapes
  const rectHeight = height / nShapes

  let rects = []

  let closestRow = Math.round(fillHsluv[1]/100 * nShapes)
  if (! useSat) {
    closestRow = Math.round(fillOpacity * nShapes)
    if (closestRow >= nShapes) {
      closestRow = nShapes - 1
    }
  }
  const closestCol = Math.round(fillHsluv[2]/100 * nShapes)
  for (let irow=0; irow<nShapes; irow++) {
    let row = []
    let opacity = ((irow)*xIncrement)/100
    if (useSat) {
      opacity = fillOpacity
    }
    let saturation = (irow) * xIncrement
    for (let icol=0; icol<nShapes; icol++) {
      let fillHsluvRect = fillHsluv.slice()
      let brightness = (icol) * yIncrement
      if (useSat) {
        fillHsluvRect[1] = saturation
      }
      fillHsluvRect[2] = brightness
      let fillRect = hsluv.hsluvToHex(fillHsluvRect)
      let params = {
        key: `row-${irow}-col-${icol}`,
        fill: fillRect,
        height: rectHeight,
        width: rectWidth,
        x: irow*rectWidth,
        y: icol*rectHeight,
        'brightness': brightness,
        'fillOpacity': opacity
      }
      if (irow === closestRow && icol === closestCol) {
        params['stroke'] = 'red'
      }
      row.push((
        <rect {...params}/>
      ))
    }
    rects.push((
      <g key={`row-${irow}`} groupsaturation={saturation} groupopacity={opacity}>
        {row}
      </g>
    ))
  }
  return rects
}


const BrightnessSandbox = (props) => {

  const [fillHsluv, setFillHsluv] = useState([0, 0, 0])
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (props.parsedSVG === null) {
      return
    }
    const firstPath = props.parsedSVG.paths[0]
    const newFillHsluv = hsluv.hexToHsluv(firstPath['fill'])
    setFillHsluv(newFillHsluv)
    const fillOpacity = parseFloat(firstPath['fillOpacity'])
    setOpacity(fillOpacity)

  }, [props.parsedSVG])

  const onChange = (evt) => {
    let newFillHsluv = fillHsluv.slice()
    newFillHsluv[0] = parseFloat(evt.target.value)
    setFillHsluv(newFillHsluv)
  }


  const nShapes = 10
  const width = 500
  const height = 500

  const xIncrement = 100/(nShapes-1)
  const yIncrement = 100/nShapes
  const rectWidth = width / nShapes
  const rectHeight = height / nShapes

  if (props.parsedSVG !== null) {
    const satBrightnessRects = generateColorGrid(fillHsluv, opacity, nShapes, width, height, true)
    const opBrightnessRects = generateColorGrid(fillHsluv, opacity, nShapes, width, height, false)
    const hue = fillHsluv[0].toFixed(0)

    return (
      <div>
        <Slider val={hue} onChange={onChange} title="Hue" max={360}/>
        <div className="block">
        <p>HSLuv color is {fillHsluv.map(f => f.toFixed(2).toString()).join(', ')}</p>
        <p>Fill Opacity is {opacity}</p>
        </div>
        <svg width={width} height={height}>
          {satBrightnessRects}
        </svg>
        <svg width={width} height={height}>
          {opBrightnessRects}
        </svg>

      </div>
    )
  } else {
    return null
  }
}


// const BrightnessSandbox = (props) => {
//   const pathRef = useRef(null)
//
//   if (props.parsedSVG !== null) {
//     // const colorIdx = 1
//     const firstPath = props.parsedSVG.paths[0]
//     const {fill, ...other} = firstPath
//     const fillHsluv = hsluv.hexToHsluv(fill)
//     const nShapes = 10
//     let width = props.parsedSVG.svg.width
//     let height = props.parsedSVG.svg.height
//     let shapes = []
//     let translate = [0, 0]
//
//     if (pathRef.current !== null) {
//       const bbox = pathRef.current.path.getBBox()
//       width = 2.5*bbox.width
//       height = bbox.height * (nShapes + 1)
//       translate[1] = ((fillHsluv[colorIdx]/100)*nShapes)*bbox.height
//       console.log(translate)
//
//       for (let idx=0; idx<nShapes; idx++) {
//         let increment = 100/nShapes
//         let fillHsluvIdx = fillHsluv.slice()
//         let colorComponent = increment*idx
//         fillHsluvIdx[colorIdx] = colorComponent
//         let fillIdx = hsluv.hsluvToHex(fillHsluvIdx)
//         shapes.push((
//           <g key={idx} transform={`translate(${bbox.width} ${(idx)*bbox.height})`}>
//             <Gem fill={fillIdx} {...other}/>
//           </g>
//         ))
//       }
//     }
//
//     return (
//       <div>
//         <svg height={height} width={width}>
//           <g>
//             <Gem fill={fill} {...other} ref={pathRef} transform={`translate(${translate[0]} ${translate[1]})`}/>
//           </g>
//           {shapes}
//         </svg>
//       </div>
//     )
//   } else {
//     return <div>Nothing Yet!</div>
//   }
//
// }


export default BrightnessSandbox
