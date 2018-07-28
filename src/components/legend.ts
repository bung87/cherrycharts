import { Object3D, Group, MeshBasicMaterial, Mesh, CircleGeometry } from 'three'
import { IRect } from '../interfaces'
import { scaleBand } from 'd3-scale'
import { range } from '../utils'
import { createLabel } from '../three-helper'

function calculate(num) {
  if (num === 2) {
    return [2, 1]
  }
  let ret = []
  let half = Math.floor(num / 2),
    i = 2,
    j = 1

  for (i; i <= half; i += j) {
    ret.push(i)
  }
  let halfIndex = Math.floor(ret.length / 2)
  let offset = num % 2 === 0 ? 0 : 1
  return [ret[halfIndex - 1] + offset, ret[halfIndex]]
}

export class Legend extends Object3D {
  constructor(containerRect: IRect, names: Array<any>, colorScale, options) {
    super()
    let style = options.style
    let radius = 6
    let gap = 4
    let [cols, rows] = calculate(names.length)
    let labels = names.map(name => {
      return createLabel(name, style.fontSize, style.color)
    })

    let maxTextWidth = labels.reduce(function(max, arr) {
      return Math.max(max, arr.userData.textWidth)
    }, -Infinity)

    let rect: IRect = {
      width: (maxTextWidth + radius * 2) * cols + gap * 2 * (cols - 2),
      height: style.fontSize * 1.5 * rows
    }

    // right top
    rect.left = containerRect.width - rect.width
    rect.bottom = containerRect.height - rect.height

    let xScale = scaleBand()
      .domain(range(cols))
      .rangeRound([rect.left, rect.left + rect.width])
    //   .paddingInner(padding)
    //   .paddingOuter(padding)

    let yScale = scaleBand()
      .domain(range(rows).reverse())
      .rangeRound([rect.bottom, rect.bottom + rect.height])
    //   .paddingInner(padding)
    //   .paddingOuter(padding)
    let group = new Group()
    group.name = 'legends'
    names.forEach((_, index) => {
      let geometry = new CircleGeometry(radius, 32)
      let material = new MeshBasicMaterial({ color: colorScale(index) })
      let circle = new Mesh(geometry, material)
      let x = xScale(index % cols)
      let y = yScale(Math.floor(index / cols) % rows)

      geometry.translate(x, y, 0)
      let mesh = labels[index]
      mesh.position.x = x + mesh.userData.textWidth / 2 + radius + gap
      mesh.position.y = y
      group.add(mesh)
      group.add(circle)
    })
    this.add(group)
  }
}
