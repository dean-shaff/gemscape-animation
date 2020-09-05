import React, { Component } from "react"

import Parallax from "./components/Parallax.js"
import { getFilesList, getSVG, parseGemscapeXML } from "./util.js"

import "./App.css"


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fileNames: new Array(0),
      currentFileName: '',
      svg: null
    }

    this.handleChange = this.handleChange.bind(this)

  }

  async componentDidMount() {
    let filesList = await getFilesList()
    console.log(`App.componentDidMount: filesList.length=${filesList.length}`)
    let initFileName = 'Tralaga_Moo4Den7Gra7Ene7Ens9Mel1Ten7Rhy8.post_wav2png.post_primitive.svg'
    this.setState({
      "fileNames": filesList,
      "currentFileName": initFileName
    })
    await this.loadSVG(this.state.currentFileName)
  }

  renderOptions() {
    console.log(`App.renderOptions: ${this.state.fileNames.length}`)
    let component = this.state.fileNames.map((name, idx) =>  {
      return <option key={idx} name={name}>{name}</option>
    })
    return component
  }

  loadSVG(fileName){
    getSVG(fileName).then((contents) => {
      console.log(`loadSVG: ${fileName}, contents.length=${contents.length}`)
      this.setState({
        'svg': parseGemscapeXML()(contents)
      })
    })
  }

  handleChange(evt) {
    const value = evt.target.value
    console.log(`handleChange: ${value}`)
    this.setState({
      "currentFileName": value
    })
    this.loadSVG(value)
  }

  render() {
    // console.log(`App.render: svg.paths.length=${this.state.svg.paths.length}`)
    return (
      <div className="container">
      	<h1 className="title is-1">Gemscape Animation Sandbox</h1>
      	<div className="level">
      		<div className="level-left">
      			<div className="level-item">
      			<div className="box">
      				<label className="label">Choose an SVG file:</label>
      				<div className="select">
      				  <select onChange={this.handleChange} value={this.state.currentFileName}>
                  {this.renderOptions()}
      				  </select>
      				</div>
      			</div>
      		</div>
      	</div>
      </div>
      <Parallax svg={this.state.svg}></Parallax>
      </div>
    )
  }
}

export default App
