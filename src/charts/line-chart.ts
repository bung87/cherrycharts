import { ICartesian } from '../interfaces'
import AreaChart from './area-chart'
import { scaleOrdinal } from 'd3-scale';
import { range } from '../utils';
import { Vector2, Shape, Color, LineBasicMaterial, LineSegments } from 'three';
import { createBufferGeometry } from '../three-helper';

class LineChart extends AreaChart implements ICartesian {
  type = 'LineChart'
  constructor(dom: Element) {
    super(dom)
  }
  drawBasicLine() {

    let colorScale = scaleOrdinal()
      .domain(range(this.dataSource[0].length))
      .range(this.colors)

    this.dataSource.forEach((v, i) => {
     
      let color = new Color(colorScale(i))
      
      let material = new LineBasicMaterial({
        color: color
      })
  
      let arr = v.reduce((accumulator, currentValue, index) => {
        let h = this.cartesian.yScale(currentValue[1]) + this.mainRect.bottom
        let x = this.cartesian.xScale(new Date(currentValue[0]))
        if (index > 0 && index < v.length) {
          return accumulator.concat(x, h, 0, x, h, 0)
        } else {
          return accumulator.concat(x, h, 0)
        }
      }, [])
      let geometry = createBufferGeometry(arr, 'line')
  
      let lines = new LineSegments(geometry, material)
      this.add(lines)

    })
  }
  draw() {
    this.drawAxis()
    this.drawBasicLine()
  }
}

export default LineChart
