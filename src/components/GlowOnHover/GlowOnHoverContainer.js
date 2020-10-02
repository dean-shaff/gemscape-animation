import React from "react"

import Gemscape from "./../Gemscape.js"
import Gem from './../Gem.js'
import SpringSliders from './../SpringSliders.js'
import Slider from './../Slider.js'


class GlowOnHoverContainer extends React.Component {
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
    console.log(`GlowOnHoverContainer.handleChange: ${name}, ${value}`)
    this.setState({
      [name]: value
    })
  }

  render(){
    let {scaleFactor, ...config} = this.state
    // console.log(`GlowOnHoverContainer.render: config=${JSON.stringify(config, null, 2)}`)
    config.velocity = parseFloat(config.velocity)
    Object.keys(config).forEach(key => {
      config[key] = parseFloat(config[key])
    })
    // config.clamp = true
    const Component = this.props.component

    return (
      <div className="level">
        <div className="level-left">
        <div className="level-item">
          <div className="box">
            <div className="level">
              <h3 className="title is-3">GlowOnHover</h3>
            </div>
            <div className="box">
              <div className="columns">
                <div className="column is-one-third">
                  <Slider val={this.state.scaleFactor} onChange={this.handleChange} min={1.0} max={2.0} step={0.1} name="scaleFactor" title="Scale Factor"/>
                </div>
              </div>
              <SpringSliders {...config} onChange={this.handleChange}/>
              <Component {...this.props} config={config}/>
            </div>
          </div>
        </div>
        </div>
      </div>
    )
  }
}

export default GlowOnHoverContainer
