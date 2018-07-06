import Chart from '../chart'

import { DataSource } from '../components/bar'
import { IRect,ISize, ICartesianInfo } from '../interfaces'
import { scaleLinear } from 'd3-scale'
import { createBufferGeometry } from '../three-helper'

import { LineBasicMaterial, LineDashedMaterial, LineSegments } from 'three'

export default class CartesianChart extends Chart {
  dataSource: DataSource
  cartesian: ICartesianInfo
  mainRect: IRect
  constructor(dom: Element) {
    super(dom)
    this.updateMainRect()
  }
  datum(data) {
    this.dataSource = data
    this.buildCartesianInfo(data)
    this.dataProcessed = true
    return this
  }

  getMainRect(){
    return this.mainRect
  }

  buildCartesianInfo(data?: DataSource) {
    let theData = data? data :this.dataSource
    let dataMax = theData.reduce(function(max, arr) {
      return Math.max(max, arr[1])
    }, -Infinity)

    let dataMin = theData.reduce(function(min, arr) {
      return Math.min(min, arr[1])
    }, Infinity)
    let yScale = scaleLinear()
      .domain([dataMin, dataMax])
      .range([0, this.mainRect.height])
      .nice()
    this.cartesian = {
      dataMax,
      dataMin,
      yScale
    }
  }

  getCartesianInfo(){
    return this.cartesian
  }

  updateMainRect(size?){
    this.mainRect = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
    let theSize = size? size:this.size
    this.size = {...theSize}
    this.mainRect.width = this.size.width - this.mainRect.left - this.mainRect.right
    this.mainRect.height = this.size.height - this.mainRect.top - this.mainRect.bottom
  }

  updateSize(size: ISize){
    this.updateMainRect(size)
    this.buildCartesianInfo()
    
  }

  drawAxisLine() {
    let material = new LineBasicMaterial({
      color: 0x000000
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
    let cartesian = this.getCartesianInfo()
    let ticks = cartesian.yScale.ticks().slice(1)

    let material = new LineDashedMaterial({
      color: '#ccc',
      dashSize: 5,
      gapSize: 5,
      fog: false,
      depthWrite: false
    })

    const X1 = this.mainRect.left
    const X2 = this.mainRect.left + this.mainRect.width

    let arr = ticks.reduce((accumulator, currentValue) => {
      let h = cartesian.yScale(currentValue) + this.mainRect.bottom
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

  drawYAxisLabel(): void {
    throw new Error('Method not implemented.')
  }

  drawXAxisTick(): void {
    throw new Error('Method not implemented.')
  }

  drawAxisLabel(): void {
    this.drawXAxisLabel()
    this.drawYAxisLabel()
  }
  drawAxisTick(): void {
    this.drawXAxisTick()
  }
  drawSplitLine(): void {
    this.drawYSplitLine()
  }

  drawAxis() {
    this.drawAxisLine()
    this.drawAxisLabel()
    this.drawAxisTick()
    this.drawSplitLine()
  }
}
