import {
  BufferAttribute,
  BufferGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
  CanvasTexture,
  PlaneGeometry,
  ClampToEdgeWrapping,
  NearestFilter,
  LinearMipMapLinearFilter,
  LinearFilter
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

export function createLabel(text, size, color, strokeWidth = 0, strokeColor?) {
  let mesh

  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  context.font = size + 'px Arial'
  if (strokeWidth && strokeColor) {
    context.lineWidth = strokeWidth * window.devicePixelRatio
    context.strokeStyle = new Color(strokeColor).getStyle()
  }
  let textWidth = Math.round(context.measureText(text).width)
  canvas.width = (textWidth + strokeWidth * 2) * window.devicePixelRatio
  canvas.height = (size + strokeWidth * 2) * window.devicePixelRatio
  canvas.style.cssText = `width:${textWidth}px;height:${size}px;`
  context.font = size * window.devicePixelRatio + 'px Arial' // change before fill

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = new Color(color).getStyle()

  if (strokeWidth && strokeColor) {
    context.lineWidth = strokeWidth * window.devicePixelRatio
    context.strokeStyle = new Color(strokeColor).getStyle()
    context.strokeText(text, canvas.width / 2, canvas.height / 2)
  }
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  let texture = new CanvasTexture(canvas)
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.minFilter = LinearFilter // or LinearFilter?
  if (strokeWidth && strokeColor) {
    texture.magFilter = LinearMipMapLinearFilter
    texture.premultiplyAlpha = true
  } else {
    texture.magFilter = NearestFilter
  }

  let material = new MeshBasicMaterial({
    // color: color,
    transparent: true,
    map: texture
  })

  mesh = new Mesh(
    new PlaneGeometry(
      canvas.width / window.devicePixelRatio,
      canvas.height / window.devicePixelRatio
    ),
    material
  )
  mesh.userData.textWidth = textWidth

  mesh.position.z = 0

  return mesh
}
