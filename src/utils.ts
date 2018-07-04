import {
  MeshBasicMaterial,
  Mesh,
  CanvasTexture,
  PlaneGeometry,
  ClampToEdgeWrapping,
  NearestFilter,
  LinearFilter
} from 'three'


export function createLabel(text, x, y, z, size, color) {
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  context.font = size + 'px Arial'
  let textWidth = context.measureText(text).width
  canvas.width = textWidth * window.devicePixelRatio
  canvas.height = size * window.devicePixelRatio
  canvas.style.cssText = `width:${textWidth}px;height:${size}px`

  context.font = size * window.devicePixelRatio + 'px Arial' // change before fill

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = color.getStyle()

  context.fillText(text, canvas.width / 2, canvas.height / 2)

  let texture = new CanvasTexture(canvas)
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.minFilter = NearestFilter // or LinearFilter?

  let material = new MeshBasicMaterial({
    // color: color,
    transparent: true,
    map: texture
  })
  let mesh = new Mesh(
    new PlaneGeometry(
      canvas.width / window.devicePixelRatio,
      canvas.height / window.devicePixelRatio
    ),
    material
  )
  mesh.position.x = x
  mesh.position.y = y
  mesh.position.z = z
  return mesh
}