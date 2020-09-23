import React from 'react'

import Slider from './Slider.js'

const SpringSliders = (props) => {
  return (
    <div className="columns">
      <div className="column">
        <Slider val={props.mass} onChange={props.onChange} min={1} max={500} step={5} name="mass" title="Mass"/>
      </div>
      <div className="column">
        <Slider val={props.tension} onChange={props.onChange} min={10} max={1000} step={100} name="tension" title="Tension"/>
      </div>
      <div className="column">
        <Slider val={props.friction} onChange={props.onChange} min={10} max={500} step={30} name="friction" title="Friction"/>
      </div>
    </div>
  )
}

export default SpringSliders
