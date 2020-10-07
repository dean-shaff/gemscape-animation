import React from 'react'
import { Spring, animated } from 'react-spring/renderprops'

import convert from 'color-convert'

import './OpacityOnHover.css'

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
      __fill: "#6187ac",
      hidden: 'hidden',
      filterOpacity: 0.0
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

      let hidden = 'hidden'
      let filterOpacity = 0.0
      if (path.isPointInFill(cursor)) {
        hidden = 'visible'
        filterOpacity = 1.0
      }

      // console.log(convert.hex.hsl(fill))

      const xOffset = (bbox.x + bbox.width/2)*this.state.scaleFactor
      const yOffset = (bbox.y + bbox.height/2)*this.state.scaleFactor

      this.setState({
        'hidden': hidden,
        'filterOpacity': filterOpacity
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
      <>
      <div>
        <svg ref={this.ref} width="930" height="300" onMouseMove={onMouseMove}>
        <g transform={`scale(${this.state.scaleFactor})`}>
          <path
            ref={this.polygonRef}
            fillOpacity={1.0}
            d="M 80.00 6.00 L 79.53 21.02 L 79.89 23.36 L 80.67 32.05 L 79.77 42.67 L 79.45 46.81 L 80.00 63.00 L 80.00 63.00 L 88.89 60.28 L 90.23 59.05 L 97.68 57.56 L 108.37 54.10 L 111.27 52.19 L 118.01 50.80 L 127.61 46.71 L 134.54 44.49 L 140.83 43.61 L 149.68 39.48 L 158.37 37.03 L 165.28 35.08 L 169.80 33.93 L 183.49 29.16 L 188.06 26.84 L 201.26 23.46 L 220.00 17.00 L 220.00 17.00 L 213.83 16.35 L 205.01 16.09 L 195.47 15.63 L 189.64 14.46 L 182.86 13.47 L 173.93 13.63 L 170.29 13.12 L 164.83 13.18 L 158.99 11.62 L 158.31 11.69 L 139.99 10.50 L 139.40 10.78 L 126.95 9.16 L 124.31 9.45 L 121.22 9.69 L 113.43 9.10 L 111.36 8.05 L 108.93 7.78 L 106.94 7.89 L 101.79 7.15 L 98.79 7.65 L 80.00 6.00 "
            fill="#6187ac"
            label="middle"
            layer="1"/>
        </g>
        </svg>
      </div>
      <Spring
        from={{ opacity: 0.0 }}
        to={{ opacity: this.state.filterOpacity }}>
        {props => (
          <div style={props}>
            <svg width="930" height="300">
              {/*<rect fill="none" height="280" width="1024" x="0" y="0" />
              <g transform="scale(4.0000) translate(-11.13636363636364, 0.5)">
              <polygon filter="drop-shadow(0px 0px 2px #dcd06c)" fill="#dcd06c" fillOpacity="0.807843" label="outline" layer="0" points="64.145054,3.655960,226.903184,40.068524,64.145054,56.146965,24.404108,40.068524" />
              <polygon filter="drop-shadow(0px 0px 2px #bcb05d)" fill="#bcb05d" fillOpacity="0.870588" label="outline" layer="0" points="214.642539,0.703390,147.928854,1.781043,145.831573,69.000000,242.800883,62.599548" />
              <polygon filter="drop-shadow(0px 0px 2px #bcb85d)" fill="#bcb85d" fillOpacity="0.827451" label="outline" layer="0" points="82.982138,-0.000000,122.274757,63.000000,82.982138,69.000000,45.441916,63.000000" />
              <polygon filter="drop-shadow(0px 0px 2px #bab15b)" fill="#bab15b" fillOpacity="0.717647" label="outline" layer="0" points="49,0 49,69 117,4" />
              <polygon filter="drop-shadow(0px 0px 2px #b8b25b)" fill="#b8b25b" fillOpacity="0.623529" label="outline" layer="0" points="13,19 13,50 130,33" />
              <polygon filter="drop-shadow(0px 0px 2px #ceb966)" fill="#ceb966" fillOpacity="0.584314" label="middle" layer="1" points="201.514827,-0.000000,161.860602,30.006038,201.514827,69.000000,241.227773,30.006038" />
              <polygon filter="drop-shadow(0px 0px 2px #c3cc64)" fill="#c3cc64" fillOpacity="0.596078" label="middle" layer="1" points="105.206642,-0.000000,116.675374,6.000000,105.206642,69.000000,94.415895,6.000000" />
              <polygon filter="drop-shadow(0px 0px 2px #bab15c)" fill="#bab15c" fillOpacity="0.576471" label="middle" layer="1" points="239.861267,33.481132,214.684144,69.000000,161.078082,67.953284,146.259992,0.000000" />
              <polygon filter="drop-shadow(0px 0px 2px #bdbb5e)" fill="#bdbb5e" fillOpacity="0.639216" label="middle" layer="1" points="61.048355,69.000000,113.072653,67.414638,114.944252,3.673497,66.866387,0.000000" />
              <polygon filter="drop-shadow(0px 0px 2px #bea458)" fill="#bea458" fillOpacity="0.517647" label="middle" layer="1" points="228.120389,6.795392,237.441250,36.022247,228.120389,49.612420,223.259948,36.022247" />
              <polygon filter="drop-shadow(0px 0px 2px #c2bf61)" fill="#c2bf61" fillOpacity="0.486275" label="middle" layer="1" points="12.034520,42.748836,63.448835,34.723794,12.034520,26.839422,12.034520,34.723794" />
              <polygon filter="drop-shadow(0px 0px 2px #8a5d42)" fill="#8a5d42" fillOpacity="0.376471" label="middle" layer="1" points="123.235830,17.733649,112.491889,34.136236,119.163692,58.846504,151.766869,26.267421" />
              <polygon filter="drop-shadow(0px 0px 2px #b89e56)" fill="#b89e56" fillOpacity="0.443137" label="middle" layer="1" points="46.552510,7.144314,46.552510,37.452825,46.552510,59.040961,64.930973,37.452825" />
              <polygon filter="drop-shadow(0px 0px 2px #c2b260)" fill="#c2b260" fillOpacity="0.666667" label="middle" layer="1" points="170.964742,60.086212,235.099938,44.006939,234.711504,21.890153,109.847139,28.457001" />
              <polygon filter="drop-shadow(0px 0px 2px #bdba5f)" fill="#bdba5f" fillOpacity="0.690196" label="middle" layer="1" points="86.512751,15.865196,114.104207,0.000000,114.139790,68.130847,65.307521,60.153698" />
              <polygon filter="drop-shadow(0px 0px 2px #bfbb5f)" fill="#bfbb5f" fillOpacity="0.815686" label="detail" layer="2" points="147.569694,54.692293,151.842622,12.060191,215.597427,8.891008,155.134650,62.168293" />
              <polygon filter="drop-shadow(0px 0px 2px #7d703b)" fill="#7d703b" fillOpacity="0.521569" label="detail" layer="2" points="52.708363,40.547189,78.090666,58.973503,52.708363,64.973503,49.886933,58.973503" />
              <polygon filter="drop-shadow(0px 0px 2px #bfb95f)" fill="#bfb95f" fillOpacity="0.729412" label="detail" layer="2" points="63.383776,19.173391,90.153115,3.508504,132.008293,38.468134,62.496906,69.000000" />
              <polygon filter="drop-shadow(0px 0px 2px #84673c)" fill="#84673c" fillOpacity="0.423529" label="detail" layer="2" points="232.647898,44.419181,216.064034,7.969827,213.343643,35.819220,217.039360,63.922343" />
              <polygon filter="drop-shadow(0px 0px 2px #c6b163)" fill="#c6b163" fillOpacity="0.588235" label="detail" layer="2" points="183,4 183,65 238,34" />
              </g>*/}
              <image href="/assets/Cicle_Vascule.filter.svg"/>
            </svg>
          </div>
        )}
      </Spring>
      </>
    )


    // return (
    //   <div onMouseMove={onMouseMove}>
    //     <svg ref={this.ref} width="930" height="300">
    //       <defs>
    //         <filter id="shadow" height="300%" width="300%" x="-50%" y="-50%">
    //           <Spring
    //             // from={{ opacity: 0.0, dx: 0, dy: 0, std: 0.0}}
    //             // to={{ opacity: this.state.opacity, dx: this.state.dx, dy: this.state.dy, std: this.state.std }}
    //             from={{ opacity: 0.0, std: 0.0 }}
    //             to={{ opacity: this.state.opacity, std: this.state.std }}
    //             config={config}>
    //             {props => (
    //               <feDropShadow dx={0} dy={0} stdDeviation={props.std} floodOpacity={props.opacity} floodColor={this.state.__fill}/>
    //             )}
    //           </Spring>
    //         </filter>
    //         {/*<filter id="displacementFilter" height="300%" width="300%">
    //           <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="1" result="turbulence"/>
    //           <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G"/>
    //         </filter>*/}
    //       </defs>
    //       <g transform={`scale(${this.state.scaleFactor})`}>
    //         {/*<polygon fill="#6c6ba9" points="100,20,140,20,140,60,100,60" />*/}
    //         <Spring
    //           // from={{ opacity: 0.0, fill: this.state.fill}}
    //           // to={{ opacity: this.state.opacity, fill: this.state.fill }}
    //           from={{ opacity: 0.0, blur: 0.0 }}
    //           to={{ opacity: this.state.opacity, blur: this.state.blur }}
    //           config={config}>
    //           {props => (
    //               <path
    //                 ref={this.polygonRef}
    //                 // filter="url(#shadow)"
    //                 // filter="url(#displacementFilter)"
    //                 filter={`drop-shadow(0px 0px ${props.blur}px ${this.state.fill})`}
    //                 fillOpacity={props.opacity}
    //                 d="M 80.00 6.00 L 79.53 21.02 L 79.89 23.36 L 80.67 32.05 L 79.77 42.67 L 79.45 46.81 L 80.00 63.00 L 80.00 63.00 L 88.89 60.28 L 90.23 59.05 L 97.68 57.56 L 108.37 54.10 L 111.27 52.19 L 118.01 50.80 L 127.61 46.71 L 134.54 44.49 L 140.83 43.61 L 149.68 39.48 L 158.37 37.03 L 165.28 35.08 L 169.80 33.93 L 183.49 29.16 L 188.06 26.84 L 201.26 23.46 L 220.00 17.00 L 220.00 17.00 L 213.83 16.35 L 205.01 16.09 L 195.47 15.63 L 189.64 14.46 L 182.86 13.47 L 173.93 13.63 L 170.29 13.12 L 164.83 13.18 L 158.99 11.62 L 158.31 11.69 L 139.99 10.50 L 139.40 10.78 L 126.95 9.16 L 124.31 9.45 L 121.22 9.69 L 113.43 9.10 L 111.36 8.05 L 108.93 7.78 L 106.94 7.89 L 101.79 7.15 L 98.79 7.65 L 80.00 6.00 "
    //                 fill={this.state.fill}
    //                 label="middle"
    //                 layer="1"/>
    //           )}
    //         </Spring>
    //
    //       </g>
    //     {/*<Spring
    //       from={{ opacity: 0 }}
    //       to={{ opacity: this.state.opacity }}
    //       config={this.props.config}>
    //       {props => <div style={props}>Hello</div>}
    //     </Spring>*/}
    //     </svg>
    //   </div>
    // )
  }
}

export default OpacityOnHover
