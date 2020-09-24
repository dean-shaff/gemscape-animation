import React from 'react'

import Slider from './Slider.js'

const SpringSliders = (props) => {
  return (
    <div className="columns">
      <div className="column">
        <Slider val={props.mass} onChange={props.onChange} min={1} max={100} step={5} name="mass" title="Mass"/>
      </div>
      <div className="column">
        <Slider val={props.tension} onChange={props.onChange} min={1} max={300} step={5} name="tension" title="Tension"/>
      </div>
      <div className="column">
        <Slider val={props.friction} onChange={props.onChange} min={1} max={200} step={5} name="friction" title="Friction"/>
      </div>
      <div className="column">
        <Slider val={props.velocity} onChange={props.onChange} min={0} max={25} step={1} name="velocity" title="Velocity"/>
      </div>
    </div>
  )
}

export default SpringSliders
