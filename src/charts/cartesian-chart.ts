import Chart from '../chart'

import { DataSource } from '../components/bar'
import { IRect, ISize, ICartesianInfo } from '../interfaces'
import { scaleLinear } from 'd3-scale'
import { createBufferGeometry,createLabel } from '../three-helper'

import { LineBasicMaterial, LineDashedMaterial, LineSegments } from 'three'

export default class CartesianChart extends Chart {
  dataSource: DataSource

  public get cartesian(): ICartesianInfo {
    return this._cartesian
  }
  public set cartesian(value: ICartesianInfo) {
    this._cartesian = { ...value }
  }

  private _cartesian: ICartesianInfo
  constructor(dom?: Element) {
    super(dom)
    this.mainRect = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
   
  }

  build(data?: DataSource) {
    
    let theData = data ? data : this.dataSource
    this.buildCartesianInfo(theData)
  }

  buildCartesianInfo(data?: DataSource) {
    let theData = data ? data : this.dataSource
    let dataMax = theData.reduce(function(max, arr) {
      return Math.max(max, arr[1])
    }, -Infinity)

    let dataMin = theData.reduce(function(min, arr) {
      return Math.min(min, arr[1])
    }, Infinity)
    let yScale = scaleLinear()
      .domain([dataMin, dataMax])
      .range([this.mainRect.bottom, this.mainRect.bottom+this.mainRect.height])
      .nice()

    this.cartesian = {
      dataMax,
      dataMin,
      yScale
    }
  }

  updateSize(size: ISize) {
    let theSize = size ? size : this.size
    this.updateMainRect(theSize)
    this.buildCartesianInfo()
  }

  drawAxisLine() {
    let material = new LineBasicMaterial({
      color: this.options.theme.axisLine.style.color
    })
    let lineWidth = 1 / window.devicePixelRatio
    let hStart = [this.mainRect.left, this.mainRect.bottom - lineWidth, 0]
    let hEnd = [this.mainRect.left + this.mainRect.width, this.mainRect.bottom - lineWidth, 0]
    let vEnd = [this.mainRect.left, this.mainRect.bottom - lineWidth + this.mainRect.height, 0]
    let arr = hStart.concat(hEnd, hStart, vEnd)

    let geometry = createBufferGeometry(arr, 'axisLine')
    let lines = new LineSegments(geometry, material)
    this.add(lines)
  }

  drawYSplitLine() {
    let ticks = this.cartesian.yScale.ticks().slice(1)

    let material = new LineDashedMaterial({
      color: this.options.theme.splitLine.style.color,
      dashSize: this.options.theme.splitLine.style.dashSize,
      gapSize: this.options.theme.splitLine.style.gapSize,
      fog: false,
      depthWrite: false
    })

    const X1 = this.mainRect.left
    const X2 = this.mainRect.left + this.mainRect.width

    let arr = ticks.reduce((accumulator, currentValue) => {
      let h = this.cartesian.yScale(currentValue) 
      return accumulator.concat(X1, h, 0, X2, h, 0)
    }, [])

    let geometry = createBufferGeometry(arr, 'splitLine')
    let lines = new LineSegments(geometry, material)
    lines.computeLineDistances()
    this.add(lines)
  }

  drawXAxisLabel(): void {
    throw new Error('Method not implemented.')
  }

  drawYAxisLabel() {
    let ticks = this.cartesian.yScale.ticks().slice(1)
    let size = this.options.theme.labels.style.fontSize
    
    let labels = ticks.map((v, i) => {
      let h = this.cartesian.yScale(v) 
      let mesh = createLabel(
        v.toString(),
        null,
        h,
        0,
        size,
        this.options.theme.labels.style.color
      )
      return mesh
    })
    // adjust mainRect
    let maxTextWidth = labels.reduce(function(max, arr) {
      return Math.max(max, arr.userData.textWidth)
    }, -Infinity)
    const labelMarginRight = 4
    let offsetX = Math.max(this.mainRect.left,maxTextWidth + labelMarginRight) 
    this.mainRect.left = offsetX
    if(this.cartesian.xScale){
      this.cartesian.xScale.range([offsetX,offsetX+this.mainRect.width])
    }
    labels.forEach( (v,i)=>{
      v.translateX(offsetX-labelMarginRight)
    })
    this.add(...labels)
  }

  drawXAxisTick(): void {
    throw new Error('Method not implemented.')
  }

  drawAxisLabel(): void {
    this.drawYAxisLabel()
    this.drawXAxisLabel()
    
  }
  drawAxisTick(): void {
    this.drawXAxisTick()
  }
  drawSplitLine(): void {
    this.drawYSplitLine()
  }

  drawAxis() {
    this.drawAxisLabel()
    this.drawAxisLine()
    
    this.drawAxisTick()
    this.drawSplitLine()
  }
}
