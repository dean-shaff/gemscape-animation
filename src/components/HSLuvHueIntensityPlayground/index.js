import React, { useState } from 'react'

import hsluv from 'hsluv'

import Slider from './../Slider.js'
import { HSLuvHueIntensityMap } from './../../util'


const set = function (setter, parser) {
  if (parser == null) {
    parser = parseInt
  }
  return (evt) => {
    setter(parser(evt.target.value))
  }
}


const HSLuvHueIntensityPlayground = (props) => {
  const [hue, setHue] = useState(0)
  const [sat, setSat] = useState(50)
  const [bri, setBri] = useState(50)
  const [fillOpacity, setFillOpacity] = useState(0.5)
  const [intensity, setIntensity] = useState(5)

  // const parsed = props.parsedSVG

  const fill = hsluv.hsluvToHex([hue, sat, bri])
  const fillIntensified = HSLuvHueIntensityMap(fill, intensity)

  return (
    <div>
      <div className="columns">
        <div className="column">
          <Slider title="Hue" val={hue} onChange={set(setHue)} min={0} max={360} step={1}/>
        </div>
        <div className="column">
          <Slider title="Saturation" val={sat} onChange={set(setSat)} min={0} max={100} step={1}/>
        </div>
        <div className="column">
          <Slider title="Brightness" val={bri} onChange={set(setBri)} min={0} max={100} step={1}/>
        </div>
      </div>
      <div className="columns">
        <div className="column">
          <Slider title="Intensity" val={intensity} onChange={set(setIntensity)} min={0} max={20} step={1}/>
        </div>
        <div className="column">
          <Slider title="Opacity" val={fillOpacity} onChange={set(setFillOpacity, parseFloat)} min={0} max={1.0} step={0.1}/>
        </div>

      </div>
      <svg height={300} width={800}>
        <rect fill={fill} fillOpacity={fillOpacity} x={0} y={0} width={400} height={400}/>
        <rect fill={fillIntensified} fillOpacity={fillOpacity} x={400} y={0} width={400} height={400}/>
      </svg>

    </div>
  )
}


export default HSLuvHueIntensityPlayground
