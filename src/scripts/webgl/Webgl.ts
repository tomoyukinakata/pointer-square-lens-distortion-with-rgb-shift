import GUI from "lil-gui"
import Stage from "./stage/Stage"
import Mesh, { type ShaderParams } from "./mesh/Mesh"

interface SelectorNames {
  root: string
  canvas: string
  mesh: string
}

export default class Webgl {
  private selectorNames: SelectorNames
  private shaderParams: ShaderParams
  private $root: HTMLElement | null
  private $canvas: HTMLCanvasElement | null
  private stage: Stage | null
  private mesh: Mesh | null
  private gui: GUI | null
  private rafId: number | null

  constructor() {
    this.selectorNames = {
      root: "[data-page]",
      canvas: "[data-canvas]",
      mesh: "[data-mesh]"
    }
    this.shaderParams = {
      squareSize: 0.4,
      lensDistortion: 1.5,
      rgbShiftR: 0.01,
      rgbShiftG: 0,
      rgbShiftB: -0.01,
      waveFrequency: 10,
      waveStrength: 0.01,
      waveSpeed: 1,
      randomFrequency: 1,
      randomStrength: 0.02,
      randomSpeed: 0.2,
      pointerEase: 0.1
    }

    this.$root = null
    this.$canvas = null
    this.stage = null
    this.mesh = null
    this.gui = null
    this.rafId = null
  }

  public init(): void {
    this.setSelector()
    this.setStage()
    this.addEventListeners()
    this.raf()
  }

  public destroy(): void {
    this.caf()
    this.removeEventListeners()
    this.leave()

    if (this.stage) {
      this.stage.destroy()
    }
  }

  public async enter(): Promise<boolean> {
    const $target = this.$root?.querySelector<HTMLElement>(
      this.selectorNames.mesh
    )
    const scene = this.stage?.getScene()

    if (!$target || !scene) return false

    this.mesh = new Mesh({
      scene,
      $target,
      shaderParams: this.shaderParams
    })
    await this.mesh.init()
    this.setGUI()

    return true
  }

  public leave(): void {
    this.destroyGUI()

    if (this.mesh) {
      this.mesh.destroy()
      this.mesh = null
    }
  }

  private setSelector(): void {
    this.$root = document.querySelector(this.selectorNames.root)
    this.$canvas = document.querySelector(this.selectorNames.canvas)
  }

  private setStage(): void {
    this.stage = new Stage({
      $canvas: this.$canvas
    })
    this.stage.init()
  }

  private setGUI(): void {
    this.destroyGUI()

    this.gui = new GUI({
      title: "Square Texture Effect"
    })

    this.gui.onChange(this.updateShaderParams)

    const squareFolder = this.gui.addFolder("Square")
    const rgbShiftFolder = this.gui.addFolder("RGB Shift")
    const waveFolder = this.gui.addFolder("Wave")
    const randomFolder = this.gui.addFolder("Random")
    const pointerFolder = this.gui.addFolder("Pointer")

    squareFolder
      .add(this.shaderParams, "squareSize", 0, 5, 0.01)
      .name("Square Size")

    squareFolder
      .add(this.shaderParams, "lensDistortion", -5, 5, 0.01)
      .name("Lens Distortion")

    rgbShiftFolder
      .add(this.shaderParams, "rgbShiftR", -0.05, 0.05, 0.001)
      .name("Red Shift")

    rgbShiftFolder
      .add(this.shaderParams, "rgbShiftG", -0.05, 0.05, 0.001)
      .name("Green Shift")

    rgbShiftFolder
      .add(this.shaderParams, "rgbShiftB", -0.05, 0.05, 0.001)
      .name("Blue Shift")

    waveFolder
      .add(this.shaderParams, "waveFrequency", 0, 200, 1)
      .name("Wave Frequency")

    waveFolder
      .add(this.shaderParams, "waveStrength", 0, 0.1, 0.001)
      .name("Wave Strength")

    waveFolder
      .add(this.shaderParams, "waveSpeed", 0, 5, 0.01)
      .name("Wave Speed")

    randomFolder
      .add(this.shaderParams, "randomFrequency", 0.1, 20, 0.1)
      .name("Random Frequency")

    randomFolder
      .add(this.shaderParams, "randomStrength", 0, 0.1, 0.001)
      .name("Random Strength")

    randomFolder
      .add(this.shaderParams, "randomSpeed", 0, 2, 0.01)
      .name("Random Speed")

    pointerFolder
      .add(this.shaderParams, "pointerEase", 0.01, 1, 0.01)
      .name("Pointer Ease")
  }

  private destroyGUI(): void {
    if (!this.gui) return

    this.gui.destroy()
    this.gui = null
  }

  private addEventListeners(): void {
    window.addEventListener("pointermove", this.onPointerMove)
    window.addEventListener("resize", this.onResize)
  }

  private removeEventListeners(): void {
    window.removeEventListener("pointermove", this.onPointerMove)
    window.removeEventListener("resize", this.onResize)
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (this.mesh) {
      this.mesh.onPointerMove(event)
    }
  }

  private onResize = (): void => {
    if (this.stage) {
      this.stage.onResize()
    }

    if (this.mesh) {
      this.mesh.onResize()
    }
  }

  private updateShaderParams = (): void => {
    if (this.mesh) {
      this.mesh.setShaderParams(this.shaderParams)
    }
  }

  private raf(): void {
    this.rafId = requestAnimationFrame(this.onRaf)
  }

  private caf(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private onRaf = (): void => {
    this.render()
    this.rafId = requestAnimationFrame(this.onRaf)
  }

  private render(): void {
    if (this.mesh) {
      this.mesh.render()
    }

    if (this.stage) {
      this.stage.render()
    }
  }
}
