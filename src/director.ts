import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  OrthographicCamera,
  AmbientLight,
  Light,
  AxesHelper,
  CameraHelper,
  Color
} from 'three'
import CanvasRenderer = require('./renderers/CanvasRenderer.js')
import { ISize } from './interfaces'

type RendererAlias = 'webgl' | 'canvas' | 'svg'
type dimensionAlias = '2d' | '3d'

function isElementVisible(elm) {
  let rect = elm.getBoundingClientRect()
  let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)
  let r = !(rect.bottom < 0 || rect.top - viewHeight >= 0)
  return r
}

function webglAvailable() {
  try {
    let canvas = document.createElement('canvas')
    return !!(
      window['WebGLRenderingContext'] &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch (e) {
    return false
  }
}

const isWebglAvailable = webglAvailable()

class Director {
  public get size(): ISize {
    return this._size
  }
  public set size(value: ISize) {
    this._size = { ...value }
    // this._size = value
  }
  public scene: Scene
  public renderer: CanvasRenderer | SVGRenderer | WebGLRenderer
  public mainCamera: PerspectiveCamera | OrthographicCamera
  protected dimensionAlias: dimensionAlias
  protected rendererAlias: RendererAlias
  protected mainLight: Light
  protected container: Element
  private _size: ISize
  constructor(container: Element) {
    let rect = container.getBoundingClientRect()
    this.size = {
      width: rect.width,
      height: rect.height
    }
    this.container = container
    this.scene = new Scene()
    this.scene.background = new Color(0xffffff)
    let width = this.size.width,
      height = this.size.height,
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
        if (isWebglAvailable) {
          this.renderer = new WebGLRenderer({ antialias: true })
        } else {
          this.renderer = new CanvasRenderer()
        }

        break
    }
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.size.width, this.size.height)

    container.appendChild(this.renderer.domElement)
    // this.debug()
  }

  debug() {
    let helper = new CameraHelper(this.mainCamera)
    this.scene.add(helper)
    let axishelper = new AxesHelper(200)
    this.scene.add(axishelper)
  }

  updateSize(size: ISize) {
    this.size = size
    this.updateCamera()
    this.renderer.setSize(size.width, size.height, true) // needs to be false here
  }

  updateCamera() {
    switch (this.dimensionAlias) {
      case '3d':
        // this.mainCamera = new PerspectiveCamera()
        break
      default:
        let camera = this.mainCamera as OrthographicCamera
        let width = this.size.width,
          height = this.size.height,
          left = width / -2,
          right = width / 2,
          top = height / 2,
          bottom = height / -2
        camera.left = left
        camera.right = right
        camera.top = top
        camera.bottom = bottom
        camera.position.set(right, top, 1)
        break
    }

    this.mainCamera.updateProjectionMatrix()
  }

  getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement
  }

  _render() {
    // if(isElementVisible(this.dom)){
    this.renderer.render(this.scene, this.mainCamera)
    // }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    this._render()
  }
}

export default Director
