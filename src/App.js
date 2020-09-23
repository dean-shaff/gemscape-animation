import React, { Component } from "react"

import { ParallaxContainer } from "./components/Parallax.js"
import { GlowOnHoverContainer } from "./components/GlowOnHover.js"
import { getFilesList, getSVG, parseGemscapeXML } from "./util.js"

import "./App.css"


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fileNames: new Array(0),
      currentFileName: '',
      svg: null,
      number: 0,
      checked: false,
      rectFill: "none"
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleToggleChange = this.handleToggleChange.bind(this)

  }

  async componentDidMount() {
    let filesList = await getFilesList()
    console.log(`App.componentDidMount: filesList.length=${filesList.length}`)
    let initFileName = 'Tralaga_Moo4Den7Gra7Ene7Ens9Mel1Ten7Rhy8.post_wav2png.post_primitive.svg'
    // let initFileName = 'single-shape.svg'
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
      const parser = parseGemscapeXML()
      const parsed = parser(contents)
      const number = parsed.paths.length
      parsed.rect.fill = this.state.rectFill
      this.setState({
        'svg': parsed,
        'number': number
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

  handleToggleChange (evt){
    console.log('handleToggleChange')
    let newRectFill = 'none'
    if (this.state.rectFill === 'none') {
      newRectFill = '#282828'
    }
    let newState = {
      'checked': ! this.state.checked,
      'rectFill': newRectFill
    }
    let svg = this.state.svg

    if (svg !== null) {
      if (svg.rect.fill !== newRectFill) {
        svg.rect.fill = newRectFill
        newState['svg'] = svg
      }
    }
    this.setState(newState)
  }

  render() {
    // console.log(`App.render: svg.paths.length=${this.state.svg.paths.length}`)
    return (
      <div>
        <nav className="navbar is-spaced has-shadow" role="navigation" aria-label="main navigation">
          <div className="container">
            <div className="navbar-brand">
              <a href="/" className="navbar-item">
                <h1 className="title is-1">Gemscape Animation Sandbox</h1>
              </a>
            </div>
          </div>
          <div className="navbar-menu">
            <div className="navbar-end">
              <div className="navbar-item">
                <div className="field">
                  <input id="darkModeToggle" type="checkbox" name="darkModeToggle" className="switch" checked={this.state.checked} onClick={this.handleToggleChange} onChange={this.handleToggleChange}/>
                  <label htmlFor="darkModeToggle">Toggle Dark Mode</label>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <section className="section">
          <div className="container">
            <div className='level'>
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
            <div className="container">
              <GlowOnHoverContainer svg={this.state.svg} number={this.state.number}></GlowOnHoverContainer>
              <ParallaxContainer svg={this.state.svg}></ParallaxContainer>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default App
