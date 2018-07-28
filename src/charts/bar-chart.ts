import { Legend } from './../components/legend'
import { Color, LineBasicMaterial, LineSegments } from 'three'
import { createBufferGeometry, createLabel } from '../three-helper'
import { DataSource, Bar, StackedBar, GroupedBar } from '../components/bar'
import { IRect, ICartesian, ICartesianInfo } from '../interfaces'
import { IChartInteractable } from '../chart'
import CartesianChart from './cartesian-chart'
import { scaleOrdinal, scaleBand, scaleLinear } from 'd3-scale'
import { range } from '../utils'

export default class BarChart extends CartesianChart implements ICartesian, IChartInteractable {
  dataSource: DataSource
  barWidth: number
  barGap: number
  bars: Bar
  type = 'BarChart'
  colorScale
  protected onMouseMoveHandle
  private _grouped = false
  private _stacked = false
  private metaData
  private originData
  constructor(dom: HTMLElement) {
    super(dom)
    this.barWidth = 20
    this.barGap = 10
  }

  public datum(data) {
    this.originData = data
    return this
  }

  build(data?: DataSource) {
    let theData = data ? data : this.originData
    if (this._grouped) {
      this.metaData = theData[0]
      this.dataSource = theData.slice(1)
    } else if (this._stacked) {
      this.metaData = theData[0]
      this.dataSource = theData.slice(1)
    } else {
      this.dataSource = theData
    }
    this.buildCartesianInfo(this.dataSource)
  }

  grouped(arg?: boolean) {
    if (arg) {
      this._grouped = arg
    } else {
      this._grouped = true
    }
  }

  stacked(arg?: boolean) {
    if (arg) {
      this._stacked = arg
    } else {
      this._stacked = true
    }
  }

  isStacked() {
    return this._stacked
  }

  isGrouped() {
    return this._grouped
  }

  buildCartesianInfo(data?: DataSource) {
    let theData = data ? data : this.dataSource
    let padding = 0.2 // this.barGap /this.mainRect.width
    if (this._grouped) {
      let yMax, yMin
      yMax = Math.max.apply(
        null,
        theData.map(oneSeries =>
          oneSeries.slice(1).reduce(function(max, arr) {
            return Math.max(max, arr)
          }, -Infinity)
        )
      )

      yMin = Math.min.apply(
        null,
        theData.map(oneSeries =>
          oneSeries.slice(1).reduce(function(min, arr) {
            return Math.min(min, arr)
          }, Infinity)
        )
      )

      let yScale = scaleLinear()
        .domain([yMin, yMax])
        .range([this.mainRect.bottom, this.mainRect.bottom + this.mainRect.height])
        .nice()

      padding = 0.1
      let colsLen = theData[1].length - 1
      let xScale = scaleBand()
        .domain(range(theData.length))
        .rangeRound([this.mainRect.left, this.mainRect.left + this.mainRect.width])
        .paddingInner(padding)
        .paddingOuter(padding)

      let padding2 = 0.1
      let xScale2 = scaleBand()
        .domain(range(colsLen))
        .rangeRound([0, xScale.bandwidth()])
        .paddingInner(padding2)
        .paddingOuter(padding2)

      this.colorScale = scaleOrdinal()
        .domain(range(colsLen))
        .range(this.options.colors)

      this.cartesian = {
        yMax,
        yMin,
        yScale,
        xScale,
        xScale2
      }

      this.barWidth = this.cartesian.xScale2.bandwidth()

    } else if (this._stacked) {
    } else {
      super.buildCartesianInfo(theData)
      this.colorScale = scaleOrdinal()
        .domain(range(theData.length))
        .range(this.options.colors)
      let xScale = scaleBand()
        .domain(range(theData.length))
        .rangeRound([this.mainRect.left, this.mainRect.left + this.mainRect.width])
        .paddingInner(padding)
        .paddingOuter(padding)

      this.cartesian.xScale = xScale
      this.barWidth = this.cartesian.xScale.bandwidth()
    }
  }

  drawXAxisTick() {
    let material = new LineBasicMaterial({
      color: this.options.axisTick.style.color
    })
    let Y = this.mainRect.bottom
    let arr = []

    // let offsetX = this.mainRect.left + this.barGap + this.barWidth / 2

    // let stepWidth = this.barWidth + this.barGap

    let xArr = this.dataSource.map((v, i) => {
      return this.cartesian.xScale(i) + this.cartesian.xScale.bandwidth() / 2 // +this.cartesian.xScale.paddingOuter()*this.mainRect.width
    })
    let xMax = this.mainRect.left + this.mainRect.width
    xArr.some((v, i) => {
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
    // let offsetX = this.mainRect.left + this.barGap + this.barWidth / 2
    // let stepWidth = this.barWidth + this.barGap
    // let xArr = this.dataSource.map((v, i) => {
    //   return i * stepWidth + offsetX
    // })
    let xArr = this.dataSource.map((v, i) => {
      return this.cartesian.xScale(i) + this.cartesian.xScale.bandwidth() / 2 // + this.cartesian.xScale.paddingOuter()*this.mainRect.width
    })
    let xMax = this.mainRect.left + this.mainRect.width
    xArr.some((v, i) => {
      if (v > xMax) {
        return true
      }
      let mesh = createLabel(this.dataSource[i][0], size, this.options.labels.style.color)
      mesh.position.x = v
      mesh.position.y = Y - tickSize - size / 2 - 2
      mesh.position.z = 0
      this.add(mesh)
      return false
    })
  }

  draw() {
    this.drawAxis()
    if (this._grouped) {
      this.bars = new GroupedBar(
        this.dataSource,
        this.cartesian,
        this.mainRect,
        this.colorScale,
        this.barWidth,
        this.barGap
      )
    } else if (this._stacked) {
    } else {
      this.bars = new Bar(
        this.dataSource,
        this.cartesian,
        this.mainRect,
        this.colorScale,
        this.barWidth,
        this.barGap
      )
    }

    this.add(this.bars)
    if (this.legendOptions['show'] === true) {
      this.drawLegends()
    }
  }

  drawLegends() {
    let legends
    if(this._grouped){
      legends = this.metaData.slice(1)
    } else{
      legends =  this.dataSource.map( v => v[0])
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
    if (this.mouse.y < this.mainRect.bottom || this.mouse.x < this.mainRect.left) {
      this.hideTooltip()
      return
    }
    let offsetXWithHalfWidth = this.mouse.x + this.barWidth / 2
    let finalIndex = this.bars.children.findIndex(x => {
      return (
        offsetXWithHalfWidth >= x.position.x && offsetXWithHalfWidth <= x.position.x + this.barWidth
      )
    })

    if (finalIndex === -1) {
      this.hideTooltip()
      return
    }
    let seriesIndex, dataIndex, label, value
    if (this._grouped) {
      let rows = this.dataSource.length
      let colsLen = this.dataSource[0].length - 1
      dataIndex = finalIndex % colsLen
      seriesIndex = Math.floor(finalIndex / colsLen) % rows
      value = this.dataSource[seriesIndex][dataIndex+1]
      label = this.metaData[dataIndex + 1]
    } else if (this._stacked) {
    } else {
      ;[label, value] = this.dataSource[finalIndex]
    }

    if (this.mouse.y > this.cartesian.yScale(value)) {
      this.hideTooltip()
      return
    }
    let position = this.bars.children[finalIndex].position
    const keys = Array(barsLen).keys()
    if (!(finalIndex in Array.from(keys))) {
      this.hideTooltip()
      return
    }

    this.showTooltip()
    let offsetX = rect.left + position.x

    let tooltipRect = this.tooltip.getBoundingClientRect()
    this.tooltip.style.left = `${offsetX - tooltipRect.width / 2}px`
    this.tooltip.style.top = `${event.clientY - tooltipRect.height}px`
    let html = `${label} ${value}`
    if (this.tooltip.innerHTML !== html) {
      this.tooltip.innerHTML = `${label} ${value}`
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
