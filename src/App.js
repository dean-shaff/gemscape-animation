import React, { Component } from "react"

import Parallax from "./components/Parallax.js"
import util from "./util.js"

import "./App.css"


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fileNames: new Array(0),
      currentFileName: '',
      svgContents: ''
    }

    this.handleChange = this.handleChange.bind(this)

  }

  async componentDidMount() {
    console.log(`App.componentDidMount`)
    let filesList = await util.getFilesList()
    console.log(`App.componentDidMount: filesList.length=${filesList.length}`)
    this.setState({
      "fileNames": filesList,
      "currentFileName": filesList[0]
    })
    this.loadSVG()
  }

  renderOptions() {
    console.log(`App.renderOptions: ${this.state.fileNames.length}`)
    let component = this.state.fileNames.map((name, idx) =>  {
      return <option key={idx} name={name}>{name}</option>
    })
    return component
  }

  loadSVG(){
    util.getSVG(this.state.currentFileName).then((contents) => {
      console.log(`handleChange: contents.length=${contents.length}`)
      this.setState({
        'svgContents': contents
      })
    })
  }

  handleChange(evt) {
    const value = evt.target.value
    console.log(`handleChange: ${value}`)
    this.setState({
      "currentFileName": evt.target.value
    })
    this.loadSVG()
  }

  render() {
    console.log(`App.render: svgContents.length=${this.state.svgContents.length}`)
    return (
      <div className="container">
      	<h1 className="title is-1">Gemscape Animation Sandbox</h1>
      	<div className="level">
      		<div className="level-left">
      			<div className="level-item">
      			<div className="box">
      				<label className="label">Choose an SVG file:</label>
      				<div className="select">
      				  <select onChange={this.handleChange} value={this.currentFileName}>
                  {this.renderOptions()}
      				  </select>
      				</div>
      			</div>
      		</div>
      	</div>
      </div>
      <Parallax svgContents={this.state.svgContents}></Parallax>
      </div>
    )
  }
}

export default App
