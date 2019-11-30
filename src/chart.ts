import Director from './director'
import { Object3D, Vector2 } from 'three'
import { ISize, IRect } from './interfaces'
import { merge } from 'lodash'
import optimizedResize from './interactions/optimized-resize'
import * as themes from './themes'
import * as d3time from 'd3-time'
import { capitalize, keyedDefaultDeep } from './utils'
import { createLabel } from './three-helper'
import * as numberFormatters from './formatters/number-formatters'

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

export interface IOptions {
  [key: string]: any
}

class Chart extends Object3D implements IChart, IChartInteractable {
  xUnit
  xInterval
  xFormat
  labelUnit
  labelFormat
  labelInterval
  _title

  protected get size(): ISize {
    return this._size
  }
  protected set size(value: ISize) {
    this._size = { ...value }
  }
  protected container: HTMLElement
  protected mouse: Vector2 = new Vector2()
  protected tooltip
  protected dataProcessed: Boolean
  protected timeStart
  protected timeEnd
  protected useTimeRange: Boolean = false
  protected onMouseMoveHandle: EventListener
  protected _xTickLabelFormatter
  protected _yTickLabelFormatter
  protected _useUTC
  private _dataSource
  private _plotOptions
  private _legendOptions

  public get legendOptions() {
    return this._legendOptions
  }

  public get plotOptions() {
    return this._plotOptions
  }

  public get mainRect(): IRect {
    return this._mainRect
  }
  public set mainRect(value: IRect) {
    this._mainRect = { ...value }
  }
  private _mainRect: IRect
  public get dataSource() {
    return this._dataSource
  }
  public set dataSource(value) {
    this._dataSource = [...value]
  }
  private director: Director

  private _size: ISize
  private isResponsive: boolean
  private _options: IOptions = { theme: defualtTheme }

  public get options() {
    return this._options
  }

  constructor(container?: HTMLElement) {
    super()
    if (container) {
      this.container = container
      this.director = new Director(container)
      this.size = this.director.size
      this.director.scene.add(this)
      this.init()
    }
  }

  public xTickLabelFormatter(formatter?: String | Function) {
    if (formatter) {
      if (typeof formatter === 'string') {
        this._xTickLabelFormatter = numberFormatters[formatter]
      } else {
        this._xTickLabelFormatter = formatter
      }
      return this
    } else {
      return this._xTickLabelFormatter
    }
  }

  public yTickLabelFormatter(formatter?: String | Function) {
    if (formatter) {
      if (typeof formatter === 'string') {
        this._yTickLabelFormatter = numberFormatters[formatter]
      } else {
        this._yTickLabelFormatter = formatter
      }
      return this
    } else {
      return this._yTickLabelFormatter
    }
  }

  public setOptions(opts) {
    this._options ? merge(this._options, opts) : (this._options = { ...opts })
    return this
  }

  public setPlotOptions(opts) {
    this._plotOptions ? merge(this._plotOptions, opts) : (this._plotOptions = { ...opts })
    return this
  }

  public populateOptions() {
    if (typeof this._options === 'undefined') {
      this._options = {}
    }
    if (typeof this._legendOptions === 'undefined') {
      this._legendOptions = {}
    }
    if (typeof this._plotOptions === 'undefined') {
      this._plotOptions = {}
    }
    if (typeof this.options.theme === 'string') {
      let themeName = this.options.theme
      this.options['theme'] = themes[themeName]
    } else {
      keyedDefaultDeep(this.options.theme, themes[defualtTheme])
    }

    keyedDefaultDeep(this.options, this.options.theme)
    keyedDefaultDeep(this.legendOptions, this.options.legends)
    keyedDefaultDeep(this.plotOptions, this.getThemePlotOptions())
    let chartType = this.getChartType()
    this.options.plotOptions[chartType] = this.plotOptions
    this.options.legends = this.legendOptions
  }

  public build(data) {
    throw new Error('Method not implemented.')
  }

  public draw(): void {
    throw new Error('Method not implemented.')
  }

  title(text?: String) {
    if (text) {
      this._title = text
      return this
    } else {
      return this._title
    }
  }

  legends(options: object | Function) {
    let opts = typeof options === 'object' ? options : options.call(this)
    this._legendOptions ? merge(this._legendOptions, opts) : (this._legendOptions = { ...opts })
    return this
  }

  onResize() {
    let { width, height } = this.container.getBoundingClientRect()
    if (this.size.width !== width || this.size.height !== height) {
      this.resize()
    }
  }

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

  public datum(data) {
    this.dataSource = data
    return this
  }

  public render() {
    this.populateOptions()
    this.updateMainRect()

    this.build(this.dataSource)
    this.dataProcessed = true
    this.drawCommon()
    this.draw()
    // this.beforeRender()
    this.director._render()
  }

  public renderTo(container: HTMLElement) {
    this.container = container
    this.director = new Director(container)
    this.size = this.director.size
    this.director.scene.add(this)
    this.init()
    this.render()
    return this
  }

  public makeCopy() {
    // dirty work
    let obj = Object.assign({}, this)
    obj.container = null
    obj.dataSource = []
    obj.dataProcessed = false
    obj.director = null
    obj.size = null
    obj.children = []
    delete obj.uuid
    delete obj.position
    delete obj.rotation
    delete obj.quaternion
    delete obj.scale
    const theClass = Object.getPrototypeOf(this).constructor
    let a = new theClass()
    Object.assign(a, obj)
    return a
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

  public useUTC(useUTC: Boolean) {
    this._useUTC = useUTC
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

  public bindingEvents() {
    throw new Error('Method not implemented.')
  }

  public updateSize(size: ISize): void {
    throw new Error('Method not implemented.')
  }

  protected updateMainRect(size?: ISize) {
    let theSize = size ? size : this.size
    this.size = { ...theSize }
    this.mainRect.width = this.size.width - this.mainRect.left - this.mainRect.right
    this.mainRect.height = this.size.height - this.mainRect.top - this.mainRect.bottom
  }

  protected _render() {
    this.director._render()
  }

  protected getCanvas() {
    return this.director.getCanvas()
  }

  protected drawLegends() {
    //  this.add(new Legend())
  }

  private addTooltip() {
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'cherrycharts-tooltip'
    this.container.appendChild(this.tooltip)
    this.tooltip.onmouseout = this.tooltip.onmouseleave = this.onMouseLeaveTooltip.bind(this)
  }

  private init() {
    this.isResponsive = this.getResponsive()
    if (this.isResponsive) {
      optimizedResize.add(this.onResize.bind(this))
    }
    this.addTooltip()
    this.bindingEvents()
  }

  private drawCommon() {
    if (this._title) {
      this.drawTitle()
    }
    if (this.legendOptions['show'] === true) {
      this.drawLegends()
    }
  }

  // private beforeRender(){

  // }

  private drawTitle() {
    let style = this.options.title.style
    let position = this.options.title.position
    let horizontal = parseInt(position.x, 10) / 100
    let vetical = parseInt(position.y, 10) / 100
    let x = this.size.width * horizontal
    let y = this.size.height * vetical - style.fontSize / 2
    let label = createLabel(this._title, style.fontSize, style.color)
    label.position.x = x
    label.position.y = y
    this.add(label)
  }

  private clearThree(obj) {
    while (obj.children.length > 0) {
      this.clearThree(obj.children[0])
      obj.remove(obj.children[0])
    }
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) obj.material.dispose()
    if (obj.texture) obj.texture.dispose()
  }

  private redraw(): void {
    this.clearThree(this)
    // this.updateMatrix()
    // this.updateMatrixWorld(true)
    this.drawCommon()
    this.draw()
  }

  private getChartType() {
    let chartType = this.type.toLowerCase()
    let index = chartType.indexOf('chart')
    if (index !== -1) {
      chartType = chartType.substring(0, index)
      return chartType
    }
  }

  private getThemePlotOptions() {
    let chartType = this.getChartType()
    return this.options.theme.plotOptions[chartType]
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
