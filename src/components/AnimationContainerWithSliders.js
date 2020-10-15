import React from "react"

import * as easings from 'd3-ease'

import SpringSliders from './SpringSliders.js'
import Slider from './Slider.js'
import AnimationContainer from './AnimationContainer.js'


class AnimationContainerWithSliders extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      scaleFactor: 1.1,
      mass: 1,
      tension: 120,
      friction: 14,
      velocity: 0.0
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(evt) {
    const target = evt.target;
    const value = target.value;
    const name = target.name;
    console.log(`AnimationContainerWithSliders.handleChange: ${name}, ${value}`)
    this.setState({
      [name]: value
    })
  }

  render(){
    let {scaleFactor, ...config} = this.state
    config.velocity = parseFloat(config.velocity)
    Object.keys(config).forEach(key => {
      config[key] = parseFloat(config[key])
    })
    // config.clamp = true
    const Component = this.props.component
    config = {
      'transition': 1000,
      'easing': easings.easeCubic
    }
    return (
      <AnimationContainer title={this.props.title}>
        <SpringSliders {...config} onChange={this.handleChange}/>
        <Component {...this.props} config={config}/>
      </AnimationContainer>
    )
  }
}

export default AnimationContainerWithSliders
