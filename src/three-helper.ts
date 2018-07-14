import {
  BufferAttribute,
  BufferGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
  CanvasTexture,
  PlaneGeometry,
  ClampToEdgeWrapping,
  NearestFilter
} from 'three'

export function createBufferGeometry(
  arrayOrArrayBuffer: ArrayLike<number> | ArrayBuffer,
  name?: string
) {
  let geometry = new BufferGeometry()
  if (name) {
    geometry.name = name
  }
  let vertices = new Float32Array(arrayOrArrayBuffer)
  let position = new BufferAttribute(vertices, 3)
  geometry.addAttribute('position', position)
  return geometry
}

export function createLabel(text, x, y, z, size, color) {
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  context.font = size + 'px Arial'
  let textWidth = Math.round(context.measureText(text).width)
  canvas.width = textWidth * window.devicePixelRatio
  canvas.height = size * window.devicePixelRatio
  canvas.style.cssText = `width:${textWidth}px;height:${size}px`

  context.font = size * window.devicePixelRatio + 'px Arial' // change before fill

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = new Color(color).getStyle()

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
  mesh.position.x = x||-textWidth/2
  mesh.position.y = y
  mesh.position.z = z
  mesh.userData.textWidth = textWidth
  return mesh
}
