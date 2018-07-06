// tslint:disable:one-variable-per-declaration
import Director from './director'
import { Object3D, Vector2 } from 'three'
import { ICartesian, ISize } from './interfaces'
export interface IChart {
  
  populateOptions()
  draw()
  
}
export interface IChartInteractable{
  bindingEvents()
}
class Chart extends Object3D implements IChart,IChartInteractable {
  colors = ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'] // walden
  protected director: Director
  protected size: ISize
  protected container: Element
  protected mouse: Vector2 = new Vector2()
  protected tooltip
 
  protected dataProcessed:Boolean
  constructor(container: Element) {
    super()
    this.container = container

    this.director = new Director(container)
    this.size = this.director.size
    this.director.scene.add(this)
    this.init()
   
  }

  addTooltip(){
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'cherrycharts-tooltip'
    this.container.appendChild(this.tooltip)
  }

  init(){
    this.addTooltip()
    this.bindingEvents()
  }

  hideTooltip(){
    this.tooltip.style.display = 'none'
  }
  bindingEvents(){
    throw new Error('Method not implemented.')
  }

  populateOptions(){
    throw new Error('Method not implemented.')
  }

  draw(): void {
    throw new Error('Method not implemented.')
  }

  render() {
    if(!this.dataProcessed){
      throw new Error('no data')
    }
    this.draw()
    this.director._render()
  }

  
 
}
export default Chart
