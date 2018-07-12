// tslint:disable:one-variable-per-declaration
import Director from './director'
import { Object3D, Vector2 } from 'three'
import { ICartesian, ISize } from './interfaces'
import { throttle, defaultsDeep } from 'lodash'
import optimizedResize from './interactions/optimized-resize'
import Debounce from 'debounce-decorator'
import * as themes from './themes'
import * as d3time from 'd3-time'
import { capitalize } from './utils'

const defualtTheme = 'walden'
type TimeUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'

export interface IChart {
  populateOptions()
  draw()
  build(data: any)
  updateSize(size: ISize)
}

export interface IChartInteractable {
  bindingEvents()
}

class Chart extends Object3D implements IChart, IChartInteractable {
  dataSource
  xUnit
  xInterval
  xFormat
  labelUnit
  labelFormat
  labelInterval
  protected director: Director

  protected get size(): ISize {
    return this._size
  }
  protected set size(value: ISize) {
    this._size = { ...value }
  }
  protected container: Element
  protected mouse: Vector2 = new Vector2()
  protected tooltip
  protected dataProcessed: Boolean
  protected timeStart
  protected timeEnd
  private _useTimeRange: boolean = false
  protected get useTimeRange(): boolean {
    return this._useTimeRange
  }
  protected set useTimeRange(value: boolean) {
    this._useTimeRange = value
  }

  private _size: ISize
  private isResponsive: boolean
  private _options = { theme: defualtTheme }

  public get options() {
    return this._options
  }
  public set options(value) {
    this._options = { ...value }
  }

  constructor(container: Element) {
    super()
    this.container = container
    this.director = new Director(container)
    this.size = this.director.size
    this.director.scene.add(this)
    this.init()
  }

  public setOptions(value) {
    this.options = value
    return this
  }

  public timeRange(start, end, unit: TimeUnit, interval = 1) {
    this.useTimeRange = true
    this.timeStart = start
    this.timeEnd = end
    this.xUnit = d3time[`time${capitalize(unit)}`]
    this.xInterval = interval
    switch (unit) {
      case 'day':
        this.xFormat = '%b %d'
        break
    }
    return this
  }

  public xLabel(unit: TimeUnit, interval = 1) {
    this.labelUnit = d3time[`time${capitalize(unit)}`]
    this.labelInterval = interval
    switch (unit) {
      case 'month':
        this.labelFormat = '%B'
        break
    }
    return this
  }

  addTooltip() {
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'cherrycharts-tooltip'
    this.container.appendChild(this.tooltip)
    this.tooltip.onmouseout = this.tooltip.onmouseleave = this.onMouseLeaveTooltip.bind(this)
  }

  init() {
    this.isResponsive = this.getResponsive()
    if (this.isResponsive) {
      window.addEventListener('resize', throttle(this.onResize.bind(this), 250))
    }

    this.addTooltip()
    this.bindingEvents()
  }

  onResize() {
    let { width, height } = this.container.getBoundingClientRect()

    if (this.size.width !== width || this.size.height !== height) {
      this.resize()
    }
  }

  @Debounce(300)
  resize() {
    let { width, height } = this.container.getBoundingClientRect()
    this.director.updateSize({ width, height })
    this.updateSize({ width, height })
    this.redraw()
    this.director._render()
  }

  onMouseLeaveTooltip(event) {
    if (event.relatedTarget === this.director.getCanvas()) {
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
    if (typeof this.options.theme === 'string') {
      let themeName = this.options.theme
      this.options.theme = themes[themeName]
    } else {
      defaultsDeep(this.options.theme, themes[defualtTheme])
    }
  }

  datum(data) {
    this.dataSource = data
    this.populateOptions()
    this.build(data)
    this.dataProcessed = true
    return this
  }

  build(data) {
    throw new Error('Method not implemented.')
  }

  draw(): void {
    throw new Error('Method not implemented.')
  }

  updateSize(size: ISize): void {
    throw new Error('Method not implemented.')
  }

  clearThree(obj) {
    while (obj.children.length > 0) {
      this.clearThree(obj.children[0])
      obj.remove(obj.children[0])
    }
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) obj.material.dispose()
    if (obj.texture) obj.texture.dispose()
  }

  redraw(): void {
    this.clearThree(this)
    // this.updateMatrix()
    // this.updateMatrixWorld(true)
    this.draw()
  }

  render() {
    if (!this.dataProcessed) {
      throw new Error('no data')
    }
    this.draw()
    this.director._render()
  }

  private getResponsive() {
    let responsive =
      this.container.style.width === '' ||
      this.container.style.height === '' ||
      this.container.style.width.indexOf('%') !== -1 ||
      this.container.style.height.indexOf('%') !== -1
    return responsive
  }
}
export default Chart
