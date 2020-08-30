import React, { Component } from "react"


class Parallax extends Component {
  constructor(props) {
    super(props)
    this.state = {
      xVal: 10,
      yVal: 10
    }

    this.handleChange = this.handleChange.bind(this)
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


  render() {
    console.log(`Parallax.render: svgContents.length=${this.props.svgContents.length}`)
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
              {this.props.svgContents}
    				</div>
    			</div>
    		</div>
    	</div>
    </div>
    )
  }
}

export default Parallax
