import { LineBasicMaterial, LineSegments } from 'three'

import { scaleLinear } from 'd3-scale'
import { timeMonth } from 'd3-time'
import CartesianChart from './cartesian-chart'
import { createBufferGeometry } from '../three-helper'
import { IRect, ICartesian, ICartesianInfo } from '../interfaces'
import { DataSource } from '../components/bar'
import AreaChart from './area-chart'

class LineChart extends AreaChart implements ICartesian {
  
  constructor(dom: Element) {
    super(dom)

    this.mainRect = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
    this.mainRect.width = this.rect.width - this.mainRect.left - this.mainRect.right
    this.mainRect.height = this.rect.height - this.mainRect.top - this.mainRect.bottom
  }
  

  draw() {
    this.drawAxis()
    this.drawBasicLine()
  }
}

export default LineChart
