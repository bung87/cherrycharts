import { IChart } from '../chart'
import { DataSource } from '../components/bar'
import { RingGeometry, Vector2, MeshBasicMaterial, Mesh } from 'three'

import { angle } from '../utils'
import { createLabel } from '../three-helper'
import PieChart from './pie-chart'

export default class DonutChart extends PieChart implements IChart {
  type = 'DonutChart'
  dataSource: DataSource
  maxRadius: number
  total: number
  colorScale
  angles: Array<any>
  centerLabel: Mesh
  isCenterLabel: boolean
  origin: Vector2
  constructor(dom: Element) {
    super(dom)
  }

  isOutOfArea(vector2) {
    let radius = this.maxRadius * this.innerRadiusPer
    let vpow = Math.pow(vector2.x - this.origin.x, 2) + Math.pow(vector2.y - this.origin.y, 2)
    let isInside = vpow < Math.pow(radius, 2)
    let isOutside = vpow > Math.pow(this.maxRadius, 2)
    return isInside || isOutside
  }

  onMouseMove(event) {
    let canvas = this.getCanvas()
    let rect = canvas.getBoundingClientRect()
    this.mouse.x = event.clientX - rect.left
    this.mouse.y = this.size.height - Math.abs(event.clientY - rect.top)
    if (this.isOutOfArea(this.mouse)) {
      if (this.centerLabel) {
        this.remove(this.centerLabel)
        this._render()
      }
      this.hideTooltip()
      return
    }
    let deg = angle(this.origin, this.mouse)
    let index = this.angles.findIndex(v => {
      if (v.endAngleDegree > v.startAngleDegree) {
        return deg >= v.startAngleDegree && deg <= v.endAngleDegree
      } else {
        return deg >= v.startAngleDegree
      }
    })
    if (index === -1) {
      this.hideTooltip()
      return
    }

    let [label, value] = this.dataSource[index]
    let percent = ((value / this.total) * 100).toFixed(2)
    let html = `${label} ${value} (${percent}%)`
    let size = this.options.labels.style.fontSize

    if (this.options.plotOptions.donut.label.position === 'center') {
      if (this.centerLabel) {
        this.remove(this.centerLabel)
      }
      this.centerLabel = createLabel(
        `${label} ${value} (${percent}%)`,
        this.origin.x,
        this.origin.y,
        0,
        size,
        this.options.labels.style.color
      )
      this.add(this.centerLabel)
      this._render()
    }

    this.tooltip.style.display = 'block'
    let offsetX = event.clientX

    let tooltipRect = this.tooltip.getBoundingClientRect()
    this.tooltip.style.left = `${offsetX - tooltipRect.width / 2}px`
    this.tooltip.style.top = `${event.clientY - tooltipRect.height}px`

    if (this.tooltip.innerHTML !== html) {
      this.tooltip.innerHTML = html
    }
  }

  drawDonut() {
    this.angles.forEach((v, i) => {
      let geometry = new RingGeometry(
        this.maxRadius * this.innerRadiusPer,
        this.maxRadius,
        this.maxRadius,
        1,
        v.thetaStart,
        v.thetaLength
      )
      let material = new MeshBasicMaterial({ color: this.colorScale(i) })
      let mesh = new Mesh(geometry, material)
      geometry.translate(this.mainRect.width / 2, this.mainRect.height / 2, 0)
      this.add(mesh)
    })
  }

  draw() {
    this.drawTicks()
    this.drawDonut()
  }
}
