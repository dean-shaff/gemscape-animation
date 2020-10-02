
class OpacityOnHover extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      toggle: true,
      opacity: 1.0,
      dx: 0,
      dy: 0,
      std: 0.0,
      blur: 0,
      scaleFactor: 5.0,
      fill: "#6187ac",
      __fill: "#6187ac"
    }
    this.ref = React.createRef()
    this.polygonRef = React.createRef()
    this.toggle = this.toggle.bind(this)
  }

  toggle () {
    this.setState({
      'toggle': ! this.state.toggle
    })
  }

  render() {
    const onMouseMove = ({ clientX: x, clientY: y }) => {
      const path = this.polygonRef.current
      const bbox = path.getBBox()
      const svg = this.ref.current
      const { width, height } = svg.getBoundingClientRect()
      let point = svg.createSVGPoint()
      point.x = x
      point.y = y
      point = point.matrixTransform(svg.getScreenCTM().inverse())

      const matrix = path.getCTM()
      const cursor = point.matrixTransform(matrix.inverse())

      let opacity = 0.5
      let fill = this.state.__fill
      let std = 0.0
      let blur = 0
      if (path.isPointInFill(cursor)) {
        opacity = 1.0
        let hsl = convert.hex.hsl(fill)
        let delta = this.props.hslScale - 1.0
        hsl[1] = this.props.hslScale*hsl[1]
        hsl[2] = 1.05*hsl[2]
        fill = `#${convert.hsl.hex(hsl)}`
        std = 2.0
        blur = 5
      }

      // console.log(convert.hex.hsl(fill))

      const xOffset = (bbox.x + bbox.width/2)*this.state.scaleFactor
      const yOffset = (bbox.y + bbox.height/2)*this.state.scaleFactor

      // const xMax = Math.max(xOffset, width - xOffset)
      // const yMax = Math.max(yOffset, height - yOffset)
      // const maxDist = calcDist([0, 0], [xMax, yMax])
      const dist = calcDist([point.x, point.y], [xOffset, yOffset])
      // const opacity = 1.0 - 0.5*(dist / maxDist)


      this.setState({
        // 'dx': -(point.x - xOffset)/20,
        // 'dy': -(point.y - yOffset)/20,
        // 'std': (dist + 0.5) / 200,
        'std': std,
        'blur': blur,
        'opacity': opacity,
        // 'fill': fill
      })
    }

    const onClick = ({ clientX: x, clientY: y }) => {
      let newOpacity = 0.0
      if (this.state.opacity === 0.0) {
        newOpacity = 1.0
      }
      this.setState({
        'opacity': newOpacity
      })
    }

    const config = Object.assign({clamp: true}, this.props.config)

    return (
      <div onMouseMove={onMouseMove}>
        <svg ref={this.ref} width="930" height="300">
          <defs>
            <filter id="shadow" height="300%" width="300%" x="-50%" y="-50%">
              <Spring
                // from={{ opacity: 0.0, dx: 0, dy: 0, std: 0.0}}
                // to={{ opacity: this.state.opacity, dx: this.state.dx, dy: this.state.dy, std: this.state.std }}
                from={{ opacity: 0.0, std: 0.0 }}
                to={{ opacity: this.state.opacity, std: this.state.std }}
                config={config}>
                {props => (
                  <feDropShadow dx={0} dy={0} stdDeviation={props.std} floodOpacity={props.opacity} floodColor={this.state.__fill}/>
                )}
              </Spring>
            </filter>
            {/*<filter id="displacementFilter" height="300%" width="300%">
              <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="1" result="turbulence"/>
              <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G"/>
            </filter>*/}
          </defs>
          <g transform={`scale(${this.state.scaleFactor})`}>
            {/*<polygon fill="#6c6ba9" points="100,20,140,20,140,60,100,60" />*/}
            <Spring
              // from={{ opacity: 0.0, fill: this.state.fill}}
              // to={{ opacity: this.state.opacity, fill: this.state.fill }}
              from={{ opacity: 0.0, blur: 0.0 }}
              to={{ opacity: this.state.opacity, blur: this.state.blur }}

              config={config}>
              {props => (
                  <path
                    ref={this.polygonRef}
                    // filter="url(#shadow)"
                    // filter="url(#displacementFilter)"
                    filter={`drop-shadow(0px 0px ${props.blur}px ${this.state.fill})`}
                    fillOpacity={props.opacity}
                    d="M 125.68 31.55 Q 126.86 32.48, 126.11 33.78 L 120.90 42.83 Q 120.15 44.13, 119.05 45.15 L 111.42 52.28 Q 110.32 53.30, 109.56 52.01 L 104.78 43.94 Q 104.02 42.65, 103.71 41.18 L 101.75 32.02 Q 101.44 30.55, 100.96 29.13 L 99.68 25.37 Q 99.20 23.95, 99.58 22.50 L 100.57 18.65 Q 100.95 17.20, 102.33 17.79 L 113.54 22.53 Q 114.92 23.12, 116.10 24.05 L 125.68 31.55"
                    fill={this.state.fill}
                    label="middle"
                    layer="1"/>
              )}
            </Spring>

          </g>
        {/*<Spring
          from={{ opacity: 0 }}
          to={{ opacity: this.state.opacity }}
          config={this.props.config}>
          {props => <div style={props}>Hello</div>}
        </Spring>*/}
        </svg>
      </div>
    )
  }
}
