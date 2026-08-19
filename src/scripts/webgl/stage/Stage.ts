import { PerspectiveCamera, Scene, WebGLRenderer } from "three"

const calcViewportDistance = (height: number, fov: number): number => {
  return height / (2 * Math.tan((fov * Math.PI) / 360))
}

interface RendererParams {
  canvas: HTMLCanvasElement | undefined
  alpha: boolean
}

interface RendererColorParams {
  color: number
  alpha: number
}

interface StageSize {
  width: number
  height: number
  aspect: {
    xy: number
  }
}

interface CameraParams {
  fov: number
  aspect: number
  near: number
  far: number
}

export default class Stage {
  private rendererParams: RendererParams
  private rendererColorParams: RendererColorParams
  private stageSize: StageSize
  private cameraParams: CameraParams
  private $canvas: HTMLCanvasElement | null
  private renderer: WebGLRenderer | null
  private scene: Scene | null
  private camera: PerspectiveCamera | null

  constructor(options = {}) {
    this.rendererParams = {
      canvas: undefined,
      alpha: true
    }
    this.rendererColorParams = {
      color: 0xffffff,
      alpha: 0
    }
    this.stageSize = {
      width: 0,
      height: 0,
      aspect: {
        xy: 0
      }
    }
    this.cameraParams = {
      fov: 45,
      aspect: 0,
      near: 0.01,
      far: 10000
    }

    this.$canvas = null
    this.renderer = null
    this.scene = null
    this.camera = null

    Object.assign(this, options)
  }

  public init(): void {
    this.setCanvas()
    this.setScene()
    this.setStageSize()
    this.setCamera()
    this.setRenderer()
  }

  public destroy(): void {
    if (this.renderer) {
      this.renderer.dispose()
    }

    this.camera = null
    this.scene = null
    this.renderer = null
  }

  private setCanvas(): void {
    this.rendererParams.canvas = this.$canvas ?? undefined
  }

  private setScene(): void {
    this.scene = new Scene()
  }

  private setStageSize(): void {
    this.stageSize.width = window.innerWidth
    this.stageSize.height = window.innerHeight
    this.stageSize.aspect.xy = this.stageSize.width / this.stageSize.height
  }

  private setCamera(): void {
    if (!this.camera) {
      this.camera = new PerspectiveCamera(
        this.cameraParams.fov,
        this.cameraParams.aspect,
        this.cameraParams.near,
        this.cameraParams.far
      )
    }

    this.camera.aspect = this.stageSize.aspect.xy
    this.camera.updateProjectionMatrix()
    this.camera.position.z = calcViewportDistance(
      this.stageSize.height,
      this.camera.fov
    )
  }

  private setRenderer(): void {
    if (!this.renderer) {
      this.renderer = new WebGLRenderer(this.rendererParams)
    }

    this.renderer.setClearColor(
      this.rendererColorParams.color,
      this.rendererColorParams.alpha
    )
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.stageSize.width, this.stageSize.height)
  }

  public render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  public getScene(): Scene | null {
    return this.scene
  }

  public onResize(): void {
    this.setStageSize()
    this.setRenderer()
    this.setCamera()
  }
}
