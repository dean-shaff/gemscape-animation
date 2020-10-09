import React from 'react'

import AnimationContainer from './../AnimationContainer.js'
import Slider from './../Slider.js'
import SpringSliders from './../SpringSliders.js'


class ParallaxContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      xVal: 50,
      yVal: 50,
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
    console.log(`ParallaxContainer.handleChange: ${name}, ${value}`)
    this.setState({
      [name]: value
    })
  }

  render(){
    let {xVal, yVal, ...config} = this.state
    config.velocity = parseFloat(config.velocity)
    const Component = this.props.component
    return (
      <AnimationContainer title={this.props.title}>
        <div className="columns">
          <div className="column">
            <Slider val={this.state.xVal} onChange={this.handleChange} min={5} max={100} step={5} name="xVal" title="x-direction factor"/>
          </div>
          <div className="column">
            <Slider val={this.state.yVal} onChange={this.handleChange} min={5} max={100} step={5} name="yVal" title="y-direction factor"/>
          </div>
        </div>
        <SpringSliders {...config} onChange={this.handleChange}/>
        <Component {...this.props} xVal={xVal} yVal={yVal} config={config}/>
      </AnimationContainer>
    )
  }
}

export default ParallaxContainer
