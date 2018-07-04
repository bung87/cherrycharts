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

// import Chart from 'chart'

type RendererAlias = 'webgl' | 'canvas' | 'svg'
let renderer
let mainCanvas
let director 



class Director {
  // public rect: DOMRect | ClientRect
  scenes: Array<Scene> =[]
  // charts:Array<Chart>
  // protected mainCamera: Camera
  // protected renderer: CanvasRenderer | SVGRenderer | WebGLRenderer
  // protected dimensionAlias: dimensionAlias
  protected rendererAlias: RendererAlias
  // protected mainLight: Light

  constructor() {
    if (!mainCanvas) {
      mainCanvas = document.createElement('canvas')
      mainCanvas.style.cssText = 'position: fixed;left: 0px;width: 100%;height: 100%;'
      document.body.appendChild(mainCanvas)
    }
    if (!renderer) {
      switch (this.rendererAlias) {
        case 'canvas':
          renderer = new CanvasRenderer()
          break
        case 'svg':
          renderer = new SVGRenderer()
          break
        default:
          renderer = new WebGLRenderer({ canvas:mainCanvas,antialias: true })
          break
      }
      renderer.setClearColor( 0xffffff, 1 );
      renderer.setPixelRatio(window.devicePixelRatio)

     
    }
  }

   updateSize() {

    let width = mainCanvas.clientWidth;
    let height = mainCanvas.clientHeight;

    if ( mainCanvas.width !== width || mainCanvas.height !== height ) {

        renderer.setSize( width, height, false );

    }

}

   renderScene(scene) {
    // scene.userData.chart.draw()
    // get the element that is a place holder for where we want to
    // draw the scene
    // let element = scene.userData.chart.dom
  
    // get its position relative to the page's viewport
    let rect = scene.userData.rect
    // console.log(scene)
   // check if it's offscreen. If so skip it
    if (
      rect.bottom < 0 ||
      rect.top > renderer.domElement.clientHeight ||
      rect.right < 0 ||
      rect.left > renderer.domElement.clientWidth
    ) {
      return // it's off screen
    }
  
    // set the viewport
    let width = rect.width
    let height = rect.height
    let left = rect.left
    let bottom = renderer.domElement.clientHeight - rect.bottom

    // camera.aspect = width / height;
    scene.userData.mainCamera.updateProjectionMatrix();
    renderer.setViewport(left, bottom, width, height)
    // renderer.setSize(left, bottom, width, height)
    renderer.setScissor(left, bottom, width, height)
  
    renderer.render(scene, scene.userData.mainCamera)
  }

  render() {
    this.updateSize();
  
    renderer.setClearColor(0xffffff)
    renderer.clear(true)
    renderer.setClearColor(0xe0e0e0)

    renderer.setScissorTest(true)
    this.scenes.forEach(this.renderScene)
    renderer.setScissorTest(false)
  }

  animate() {
    this.render()
    requestAnimationFrame(this.animate.bind(this))
    // this._render()
  }
}

export function getDirector(){
  if(!director){
    director = new Director()
  }
  return director
}

export default Director
