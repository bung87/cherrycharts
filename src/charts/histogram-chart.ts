import { Legend } from '../components/legend'
import { LineBasicMaterial, LineSegments, Mesh, PlaneGeometry } from 'three'
import { createBufferGeometry, createLabel } from '../three-helper'
import * as BarComponent from '../components/bar'
import { ICartesian } from '../interfaces'
import { IChartInteractable } from '../chart'
import CartesianChart from './cartesian-chart'
import { scaleOrdinal, scaleBand, scaleLinear } from 'd3-scale'
import { range } from '../utils'
import * as d3array from 'd3-array'

export default class HistogramChart extends CartesianChart
  implements ICartesian, IChartInteractable {
  dataSource: Array<object>
  barWidth: number
  barGap: number
  bars
  type = 'HistogramChart'
  colorScale
  protected onMouseMoveHandle
  private _originalData
  private histogram: Function
  private histograms
  //   private _transformedData
  constructor(dom?: HTMLElement) {
    super(dom)
    this.barWidth = 20
    this.barGap = 10
  }

  public datum(data) {
    this._originalData = data
    return this
  }

  build(data?: Array<object>) {
    let theData = data ? data : this._originalData
    this.buildCartesianInfo(theData)
  }

  buildCartesianInfo(data?){
    let theData = data ? data : this._originalData
    let uniqued = theData.reduce((pre, cur) => {
      return pre
        .concat(cur['data'])
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort()
    }, []) as Array<number>

    let xMin, xMax
    xMin = uniqued[0]
    xMax = uniqued[uniqued.length - 1]

    this.histogram = d3array
      .histogram()
      .domain([xMin, xMax])
      .value(v => v)

    this.histograms = this._originalData.map(oneSeries => this.histogram(oneSeries['data']))

    let yMax, yMin
    yMax = Math.max.apply(
      null,
      this.histograms.map(oneSeries => {
        let data = oneSeries.map(d => Array.prototype.slice.apply(d))
        return data.reduce(function(pre: number, cur: Array<number>) {
          return Math.max(pre, cur.length)
        }, -Infinity)
      })
    )

    yMin = Math.min.apply(
      null,
      this.histograms.map(oneSeries => {
        let data = oneSeries.map(d => Array.prototype.slice.apply(d))
        return data.reduce(function(pre: number, cur: Array<number>) {
          return Math.min(pre, cur.length)
        }, Infinity)
      })
    )

    let keys = this.histograms.reduce(
      (pre, data) => pre.concat(data.map(one => parseFloat(one['x0'].toFixed(1)))),
      []
    )

    let padding = 0.1

    let yScale = scaleLinear()
      .domain([yMin, yMax])
      .range([this.mainRect.bottom, this.mainRect.bottom + this.mainRect.height])

    let xScale = scaleBand()
      .domain(keys)
      .rangeRound([this.mainRect.left, this.mainRect.left + this.mainRect.width])
      .paddingInner(10 / this.mainRect.width)
      .paddingOuter(padding)

    this.colorScale = scaleOrdinal()
      .domain(range(this._originalData.length))
      .range(this.options.colors)

    // .thresholds(d3array.thresholdScott)
    // .thresholds(d3array.thresholdSturges)
    // .thresholds(d3array.thresholdFreedmanDiaconis)

    this.cartesian = {
      xMax,
      xMin,
      yScale,
      xScale
    }

    this.barWidth = this.cartesian.xScale.bandwidth()
  }

  drawXAxisTick() {
    let material = new LineBasicMaterial({
      color: this.options.axisTick.style.color
    })

    let Y = this.mainRect.bottom

    let arr = []

    let series = this.histograms.reduce((pre, a) => {
      return pre.concat(
        a
          .map((v, i) => {
            return (
              this.cartesian.xScale(parseFloat(v.x0.toFixed(1)))
            )
          })
          .sort()
      )
    }, [])

    let xMax = this.mainRect.left + this.mainRect.width
    series.some((v, i) => {
      if (v > xMax) {
        return true
      }
      arr.push(v, Y, 0, v, Y - this.options.axisTick.style.length, 0)
      return false
    })

    let geometry = createBufferGeometry(arr, 'xAxisTick')
    let lines = new LineSegments(geometry, material)
    this.add(lines)
  }

  drawXAxisLabel() {
    let size = this.options.labels.style.fontSize
    let tickSize = this.options.axisTick.style.length
    let Y = this.mainRect.bottom

    let addLabel = v => {
      let x = this.cartesian.xScale(v) 
      let mesh = createLabel(v, size, this.options.labels.style.color)
      mesh.position.x = x
      mesh.position.y = Y - tickSize - size / 2 - 2
      mesh.position.z = 0
      this.add(mesh)
    }

    this.histograms.forEach(data =>
      data.forEach((v, i) => {
        addLabel(parseFloat(v.x0.toFixed(1)))
      })
    )
  }

  draw() {
    this.drawAxis()
    let barType

    barType = 'Histogram'

    const BarType = BarComponent[barType]
    this.bars = new BarType(
      this.histograms,
      this.cartesian,
      this.mainRect,
      this.colorScale,
      this.barWidth,
      this.barGap
    )
    this.add(this.bars)
    
  }

  drawLegends() {
    let legends

    legends = this._originalData.map(v => v['name'])
    if(!legends.length || legends.every(v=> typeof v ==="undefined")){
      return
    }

    this.add(new Legend(this.size, legends, this.colorScale, this.legendOptions))
  }

  bindingEvents() {
    this.onMouseMoveHandle = this.onMouseMove.bind(this)
    let domElement = this.getCanvas()
    domElement.addEventListener('mousemove', this.onMouseMoveHandle, false)
    domElement.onmouseout = domElement.onmouseleave = this.onMouseLeave.bind(this)
    // domElement.onmouseover = domElement.onmouseenter = this.onMouseEnter.bind(this)
  }

  onMouseMove(event) {
    let barsLen = this.bars.children.length
    let domElement = this.getCanvas()
    let rect = domElement.getBoundingClientRect()

    this.mouse.x = event.clientX - rect.left
    this.mouse.y = this.size.height - Math.abs(event.clientY - rect.top)
    let barIndex

    if (this.mouse.y < this.mainRect.bottom || this.mouse.x < this.mainRect.left) {
      this.hideTooltip()
      return
    }

    barIndex = this.bars.children.findIndex(item => {
      let mesh = item as Mesh
      let { x, y } = mesh.userData
      let geometry = mesh.geometry as PlaneGeometry
      let h = geometry.parameters.height
      return (
        this.mouse.y >= y - h &&
        this.mouse.y <= y &&
        (this.mouse.x >= x - this.barWidth / 2 && this.mouse.x <= x + this.barWidth / 2)
      )
    })

    const keys = Array(barsLen).keys()
    if (barIndex === -1 || !(barIndex in Array.from(keys))) {
      this.hideTooltip()
      return
    }

    let position = this.bars.children[barIndex].position

    this.showTooltip()
    let offsetX = rect.left + position.x

    let tooltipRect = this.tooltip.getBoundingClientRect()
    this.tooltip.style.left = `${offsetX - tooltipRect.width / 2}px`
    this.tooltip.style.top = `${event.clientY - tooltipRect.height}px`
    let { x0="", x1="", freq="" } = { ...this.bars.children[barIndex].userData }
    let label = `${x0}-${x1}`
    let value = freq
    let html = `${label}<br> ${value}`
    if (this.tooltip.innerHTML !== html) {
      this.tooltip.innerHTML = html
    }
  }

  onMouseEnter(event) {
    if (event.relatedTarget === this.tooltip) {
      return
    }
    this.showTooltip()
  }

  onMouseLeave(event) {
    if (event.relatedTarget === this.tooltip) {
      return
    }
    this.hideTooltip()
  }
}
