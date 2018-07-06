// tslint:disable:one-variable-per-declaration
import Director from './director'
import { Object3D, Vector2 } from 'three'
import { ICartesian, ISize } from './interfaces'
import Debounce from 'debounce-decorator'
import optimizedResize from './interactions/optimized-resize'

export interface IChart {
  populateOptions()
  draw()
}

export interface IChartInteractable {
  bindingEvents()
}

class Chart extends Object3D implements IChart, IChartInteractable {
  colors = ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'] // walden
  protected director: Director
  protected size: ISize
  protected container: Element
  protected mouse: Vector2 = new Vector2()
  protected tooltip

  protected dataProcessed: Boolean
  constructor(container: Element) {
    super()
    this.container = container

    this.director = new Director(container)
    this.size = this.director.size
    this.director.scene.add(this)
    this.init()
  }

  addTooltip() {
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'cherrycharts-tooltip'
    this.container.appendChild(this.tooltip)
    this.tooltip.onmouseout = this.tooltip.onmouseleave = this.onMouseLeaveTooltip.bind(this)
  }

  init() {
    optimizedResize.add(this.updateSize.bind(this))
    this.addTooltip()
    this.bindingEvents()
  }

  updateSize() {
    let rect = this.container.getBoundingClientRect()
    let width = rect.width
    let height = rect.height

    if (this.size.width !== width || this.size.height !== height) {
      this.director.size = this.size = { width, height }
      this.director.renderer.setSize(width, height)
      this.redraw()
      this.director._render()
    }
  }

  onMouseLeaveTooltip(event) {
    if (event.relatedTarget === this.director.getDomElement()) {
      return
    }
    this.hideTooltip()
  }

  // @Debounce(250)
  hideTooltip() {
    this.tooltip.style.display = 'none'
  }

  // @Debounce(250)
  showTooltip() {
    this.tooltip.style.display = 'block'
  }

  bindingEvents() {
    throw new Error('Method not implemented.')
  }

  populateOptions() {
    throw new Error('Method not implemented.')
  }

  draw(): void {
    throw new Error('Method not implemented.')
  }

  redraw(): void {
    this.director.scene.remove(...this.children)
    this.draw()
  }

  render() {
    if (!this.dataProcessed) {
      throw new Error('no data')
    }
    this.draw()
    this.director._render()
  }
}
export default Chart
