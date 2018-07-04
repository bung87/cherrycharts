// tslint:disable:one-variable-per-declaration
import Director from './director'
import {
  Object3D
} from 'three'
import {ICartesian} from './interfaces'
export interface IChart{
  draw()
}

class Chart extends Object3D implements  IChart{
  colors = ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'] // walden
  protected director:Director;
  protected rect: DOMRect | ClientRect
  constructor(dom: Element) {
    super()
    this.director = new Director(dom)
    this.rect = this.director.rect
    this.director.scene.add(this)
  }
  draw(): void {
    throw new Error("Method not implemented.");
  }
  render() {
    this.draw()
    this.director._render()
  }
  
}
export default Chart
