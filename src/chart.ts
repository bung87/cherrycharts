// tslint:disable:one-variable-per-declaration
import Director,{getDirector} from './director'
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  CanvasRenderer,
  OrthographicCamera,
  SVGRenderer,
  AmbientLight,
  Light,
  Object3D,
  DirectionalLight,
  AxesHelper,
  CameraHelper,
  Color,
  Camera
} from 'three'
import { ICartesian } from './interfaces'
export interface IChart {
  draw()
}

type dimensionAlias = '2d' | '3d'

class Chart extends Object3D implements IChart {
  public scene: Scene
  colors = ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'] // walden

  protected mainCamera: Camera
  // protected renderer: CanvasRenderer | SVGRenderer | WebGLRenderer
  protected dimensionAlias: dimensionAlias

  protected mainLight: Light
  
  protected director: Director
  protected rect: DOMRect | ClientRect
  protected dom: Element
  constructor(dom: Element) {
    super()
    this.dom = dom;
    this.rect = dom.getBoundingClientRect()

    let width = this.rect.width,
      height = this.rect.height,
      left = width / -2,
      right = width / 2,
      top = height / 2,
      bottom = height / -2

    this.scene = new Scene()
    this.scene.background = new Color(0xffffff)
    this.director = getDirector()
    // this.rect = this.director.rect
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
    this.scene.userData.rect = this.rect
    this.scene.userData.mainCamera  = this.mainCamera
    this.scene.add(this)
    
  }

  draw(): void {
    throw new Error('Method not implemented.')
  }

  // _render() {
  //   // updateSize();

  //   renderer.setClearColor(0xffffff)
  //   renderer.clear(true)
  //   renderer.setClearColor(0xe0e0e0)

  //   renderer.enableScissorTest(true)

  //   let rect = element.getBoundingClientRect()

  //   // check if it's offscreen. If so skip it
  //   if (
  //     rect.bottom < 0 ||
  //     rect.top > renderer.domElement.clientHeight ||
  //     rect.right < 0 ||
  //     rect.left > renderer.domElement.clientWidth
  //   ) {
  //     return // it's off screen
  //   }

  //   // set the viewport
  //   let width = rect.right - rect.left
  //   let height = rect.bottom - rect.top
  //   let left = rect.left
  //   let bottom = renderer.domElement.clientHeight - rect.bottom

  //   // camera.aspect = width / height
  //   // camera.updateProjectionMatrix()
  //   renderer.setViewport(left, bottom, width, height)
  //   renderer.setScissor(left, bottom, width, height)

  //   renderer.render(this.scene, this.mainCamera)
  //   renderer.setScissorTest(false)
  // }

  render() {
    this.draw()
    this.director.scenes.push(this.scene)
    // this.director.renderScene(this.scene)
  }
}

export default Chart
