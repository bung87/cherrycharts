// tslint:disable:one-variable-per-declaration
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  CanvasRenderer,
  OrthographicCamera,
  SVGRenderer,
  AmbientLight,
  Light,
  DirectionalLight,
  AxesHelper,
  CameraHelper,
  Color,
  Camera
} from 'three'

type RendererAlias = 'webgl' | 'canvas' | 'svg'
type dimensionAlias = '2d' | '3d'

class Director {
  public rect: DOMRect | ClientRect
  public scene: Scene
  protected mainCamera: Camera
  protected renderer: CanvasRenderer | SVGRenderer | WebGLRenderer
  protected dimensionAlias: dimensionAlias
  protected rendererAlias: RendererAlias
  protected mainLight: Light
 
  constructor(dom: Element) {
    this.rect = dom.getBoundingClientRect()

    this.scene = new Scene()
    this.scene.background = new Color(0xffffff)
    let width = this.rect.width,
      height = this.rect.height,
      left = width / -2,
      right = width / 2,
      top = height / 2,
      bottom = height / -2

    switch (this.dimensionAlias) {
      case '3d':
        this.mainCamera = new PerspectiveCamera()
        break
      default:
        this.mainLight = new AmbientLight()
        this.mainLight.position.setZ(1)
        this.mainCamera = new OrthographicCamera(left, right, top, bottom)
        this.mainCamera.position.set(right, top, 1)
        break
    }

    this.scene.add(this.mainLight)

    switch (this.rendererAlias) {
      case 'canvas':
        this.renderer = new CanvasRenderer()
        break
      case 'svg':
        this.renderer = new SVGRenderer()
        break
      default:
        this.renderer = new WebGLRenderer({ antialias: true })
        break
    }
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.rect.width, this.rect.height)

    // let helper = new CameraHelper(this.camera)
    // this.scene.add(helper)
    // let axishelper = new AxesHelper(100)
    // this.scene.add(axishelper)

    dom.appendChild(this.renderer.domElement)
  }

  _render() {
    this.renderer.render(this.scene, this.mainCamera)
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    this._render()
  }
}

export default Director
