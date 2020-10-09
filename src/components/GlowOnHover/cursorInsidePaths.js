
import hsluv from 'hsluv'


export const glowingOpacity = (ref, inside) => {
  let fillOpacity = parseFloat(ref.getAttribute('__fillopacity'))
  if (inside) {
    // let returnVal = fillOpacity * 1.5
    // if (returnVal > 1.0) {
    //   returnVal = 1.0
    // }
    return Math.sqrt(fillOpacity)
  } else {
    return fillOpacity
  }
}


export const glowingFill = (saturationFactor, brightnessFactor) => {
  return (ref, inside) => {
    let fill = ref.getAttribute('__fill')
    if (inside) {
      let fillHsluv = hsluv.hexToHsluv(fill)
      // up saturation and brightness
      fillHsluv[1] = saturationFactor*fillHsluv[1]
      fillHsluv[2] = brightnessFactor*fillHsluv[2]
      fill = hsluv.hsluvToHex(fillHsluv)
    }
    return fill
  }
}

export const toggle = (trueVal, falseVal) => {
  if (trueVal == null) {
    trueVal = true
  }
  if (falseVal == null) {
    falseVal = false
  }

  return (ref, inside) => {
    if (inside) {
      return trueVal
    } else {
      return falseVal
    }
  }
}

export const glowingTransform = (ref, inside) => {
  if (inside) {
    let bbox = ref.getBBox()
    let [xOffset, yOffset] = [
      calcOffset(bbox.x, bbox.width, this.props.scaleFactor),
      calcOffset(bbox.y, bbox.height, this.props.scaleFactor),
    ]
    return `scale(${this.props.scaleFactor}) translate(${-xOffset}, ${-yOffset})`
  } else {
    return 'scale(1.0) translate(0.0, 0.0)'
  }
}


export const cursorInsidePaths = (gemscapeRef, pathRefs) => {
  return (cb) => {
    return (x, y) => {
      let svg = gemscapeRef.current
      if (svg.svg !== undefined) {
        svg = svg.svg
      }
      const pathRefsFiltered = pathRefs.filter(ref => ref != null).map(ref => ref.path)
      let point = svg.createSVGPoint()
      point.x = x
      point.y = y
      point = point.matrixTransform(svg.getScreenCTM().inverse())
      let first = pathRefsFiltered[0]
      if (first !== undefined) {
        let matrix = first.getCTM()
        let cursor = point.matrixTransform(matrix.inverse())
        const result = pathRefsFiltered.map((ref, idx) => {
          let inside = ref.isPointInFill(cursor)
          if (Array.isArray(cb)) {
            return cb.map(f => f(ref, inside))
          } else {
            return cb(ref, inside)
          }
        })
        return result
      } else {
        return null
      }
    }
  }
}
