import React from 'react'

const Slider = (props) => {
  const {title, val, ...otherProps} = props

  return (
    <div className="field">
      <label className="label">{title}</label>
      <input className="slider is-fullwidth has-output" type="range" value={val} {...otherProps}></input>
      <output>{val}</output>
    </div>
  )
}

export default Slider
