import { getCursorFactory } from './util.js'

const mouseGemRefGenerator = (gemscapeRef, pathRefs) => {
  let svg = gemscapeRef.current
  if (svg.svg !== undefined) {
    svg = svg.svg
  }
  const getCursor = getCursorFactory(svg)

  return function* (x, y) {
    const screenCursor = getCursor(x, y)
    const first = pathRefs[0].path
    if (first !== undefined) {
      const matrix = first.getCTM()
      const pathCursor = screenCursor.matrixTransform(matrix.inverse())
      for (let idx=0; idx<pathRefs.length; idx++) {
        const ref = pathRefs[idx].path
        yield {
          'ref': ref,
          'idx': idx,
          'inside': ref.isPointInFill(pathCursor),
          'screenCursor': screenCursor,
          'pathCursor': pathCursor,
        }
      }
    }
  }
}

export default mouseGemRefGenerator
