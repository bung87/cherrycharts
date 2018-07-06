// tslint:disable:one-variable-per-declaration
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  CanvasRenderer,
  OrthographicCamera,
  SVGRenderer,
  AmbientLight,
  Raycaster,
  Light,
  DirectionalLight,
  AxesHelper,
  CameraHelper,
  Object3D,
  Color,
  Vector2,
  Vector3,
  Camera
} from 'three'

import { ISize } from './interfaces'

type RendererAlias = 'webgl' | 'canvas' | 'svg'
type dimensionAlias = '2d' | '3d'

function isElementVisible(elm) {
  let rect = elm.getBoundingClientRect()
  let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)
  let r = !(rect.bottom < 0 || rect.top - viewHeight >= 0)
  return r
}

class Director {
  public size: ISize
  public scene: Scene
  public renderer: CanvasRenderer | SVGRenderer | WebGLRenderer
  protected mainCamera: Camera
  protected dimensionAlias: dimensionAlias
  protected rendererAlias: RendererAlias
  protected mainLight: Light

  constructor(containeer: Element) {
    let rect = containeer.getBoundingClientRect()
    this.size = {
      width: rect.width,
      height: rect.height
    }

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
        this.renderer = new WebGLRenderer({ antialias: true })
        break
    }
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.size.width, this.size.height)

    // let helper = new CameraHelper(this.mainCamera)
    // this.scene.add(helper)
    // let axishelper = new AxesHelper(200)
    // this.scene.add(axishelper)

    containeer.appendChild(this.renderer.domElement)
  }

  getDomElement(){
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
