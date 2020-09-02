import React, { Component } from "react"

import Gemscape from "./Gemscape.js"


class Parallax extends Component {
  constructor(props) {
    super(props)
    this.state = {
      xVal: 10,
      yVal: 10,
      transformData: null
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleOnMouseMove = this.handleOnMouseMove.bind(this)
  }

  handleChange(evt) {
    const target = evt.target;
    const value = target.value;
    const name = target.name;
    console.log(`Parallax.handleChange: ${name}, ${value}`)
    this.setState({
      [name]: value
    })
  }

  handleOnMouseMove(len) {
    console.log(`Parallax.handleOnMouseMove: ${len}`)
    let transformData = new Array(len)
    for (let idx=0; idx<len; idx++) {
      transformData[idx] = {
        scale: 2.0,
        translate: [1.0, 1.0]
      }
    }
    this.setState({
      'transformData': transformData
    })
  }

  componentDidUpdate() {
    console.log(`Parallax.componentDidUpdate`)
  }

  render() {
    console.log(`Parallax.render`)
    return (
      <div className="level">
    		<div className="level-left">
    		<div className="level-item">
    			<div className="box">
    				<h3 className="title is-3">Parallax</h3>
						<div className="field">
							<label className="label">x-direction factor</label>
							<input className="input" name="xVal" min="0" max="100" type="number" value={this.state.xVal} step="5" onChange={this.handleChange}></input>
						</div>
						<div className="field">
							<label className="label">y-direction factor</label>
							<input className="input" name="yVal" min="0" max="100" type="number" value={this.state.yVal} step="5" onChange={this.handleChange}></input>
						</div>
    				<div>
              <Gemscape
                transformData={this.state.transformData}
                onMouseMove={this.handleOnMouseMove}
                svgContents={this.props.svgContents}>
              </Gemscape>
    				</div>
    			</div>
    		</div>
    	</div>
    </div>
    )
  }
}

export default Parallax
