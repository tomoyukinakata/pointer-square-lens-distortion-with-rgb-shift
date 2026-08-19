import {
  TextureLoader,
  PlaneGeometry,
  RawShaderMaterial,
  Mesh as ThreeMesh,
  Texture,
  Vector2
} from "three"
import type { IUniform, Scene } from "three"
import VertexShader from "../glsl/vert/vert.glsl"
import FragmentShader from "../glsl/frag/frag.glsl"

interface MeshOptions {
  scene: Scene
  $target: HTMLElement
  shaderParams: ShaderParams
}

interface Uniforms {
  [uniform: string]: IUniform<unknown>
  u_texture1: IUniform<Texture | null>
  u_texture2: IUniform<Texture | null>
  u_meshSize: IUniform<Vector2>
  u_textureSize1: IUniform<Vector2>
  u_textureSize2: IUniform<Vector2>
  u_mouse: IUniform<Vector2>
  u_squareSize: IUniform<number>
  u_lensDistortion: IUniform<number>
  u_rgbShiftR: IUniform<number>
  u_rgbShiftG: IUniform<number>
  u_rgbShiftB: IUniform<number>
  u_waveFrequency: IUniform<number>
  u_waveStrength: IUniform<number>
  u_waveSpeed: IUniform<number>
  u_randomFrequency: IUniform<number>
  u_randomStrength: IUniform<number>
  u_randomSpeed: IUniform<number>
  u_time: IUniform<number>
}

export interface ShaderParams {
  squareSize: number
  lensDistortion: number
  rgbShiftR: number
  rgbShiftG: number
  rgbShiftB: number
  waveFrequency: number
  waveStrength: number
  waveSpeed: number
  randomFrequency: number
  randomStrength: number
  randomSpeed: number
  pointerEase: number
}

export default class Mesh {
  private scene: Scene
  private uniforms: Uniforms
  private $target: HTMLElement
  private geometry: PlaneGeometry | null
  private material: RawShaderMaterial | null
  private mesh: ThreeMesh | null
  private windowWidth: number
  private windowHeight: number
  private mouse: Vector2
  private mouseEase: Vector2
  private pointerEase: number

  constructor({ scene, $target, shaderParams }: MeshOptions) {
    this.uniforms = {
      u_texture1: { value: null },
      u_texture2: { value: null },
      u_meshSize: { value: new Vector2(1, 1) },
      u_textureSize1: { value: new Vector2(1, 1) },
      u_textureSize2: { value: new Vector2(1, 1) },
      u_mouse: { value: new Vector2() },
      u_squareSize: { value: shaderParams.squareSize },
      u_lensDistortion: { value: shaderParams.lensDistortion },
      u_rgbShiftR: { value: shaderParams.rgbShiftR },
      u_rgbShiftG: { value: shaderParams.rgbShiftG },
      u_rgbShiftB: { value: shaderParams.rgbShiftB },
      u_waveFrequency: { value: shaderParams.waveFrequency },
      u_waveStrength: { value: shaderParams.waveStrength },
      u_waveSpeed: { value: shaderParams.waveSpeed },
      u_randomFrequency: { value: shaderParams.randomFrequency },
      u_randomStrength: { value: shaderParams.randomStrength },
      u_randomSpeed: { value: shaderParams.randomSpeed },
      u_time: { value: 0 }
    }

    this.scene = scene
    this.$target = $target

    this.geometry = null
    this.material = null
    this.mesh = null

    this.windowWidth = 0
    this.windowHeight = 0
    this.pointerEase = shaderParams.pointerEase

    this.mouse = new Vector2()
    this.mouseEase = new Vector2()
  }

  public async init(): Promise<void> {
    this.setWindowSize()
    await this.setTexture()
    this.setMesh()
    this.setMeshScale()
  }

  public destroy(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh)
    }

    if (this.material) {
      this.material.dispose()
    }

    if (this.uniforms.u_texture1.value) {
      this.uniforms.u_texture1.value.dispose()
    }

    if (this.uniforms.u_texture2.value) {
      this.uniforms.u_texture2.value.dispose()
    }

    if (this.geometry) {
      this.geometry.dispose()
    }

    this.mesh = null
  }

  private setWindowSize(): void {
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
  }

  private async setTexture(): Promise<void> {
    const loader = new TextureLoader()
    const texture1Path = this.$target.dataset.texture1Path
    const texture2Path = this.$target.dataset.texture2Path

    if (!texture1Path || !texture2Path) return

    const [texture1, texture2] = await Promise.all([
      loader.loadAsync(texture1Path),
      loader.loadAsync(texture2Path)
    ])

    const image1 = texture1.image as {
      width: number
      height: number
    }

    const image2 = texture2.image as {
      width: number
      height: number
    }

    this.uniforms.u_texture1.value = texture1
    this.uniforms.u_texture2.value = texture2
    this.uniforms.u_textureSize1.value.set(image1.width, image1.height)
    this.uniforms.u_textureSize2.value.set(image2.width, image2.height)
  }

  private setMesh(): void {
    this.geometry = new PlaneGeometry()
    this.material = new RawShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      uniforms: this.uniforms
    })
    this.mesh = new ThreeMesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  private setMeshScale(): void {
    if (!this.mesh) return

    this.mesh.scale.set(this.windowWidth, this.windowHeight, 1)
    this.uniforms.u_meshSize.value.set(this.mesh.scale.x, this.mesh.scale.y)
  }

  public setShaderParams({
    squareSize,
    lensDistortion,
    rgbShiftR,
    rgbShiftG,
    rgbShiftB,
    waveFrequency,
    waveStrength,
    waveSpeed,
    randomFrequency,
    randomStrength,
    randomSpeed,
    pointerEase
  }: ShaderParams): void {
    this.uniforms.u_squareSize.value = squareSize
    this.uniforms.u_lensDistortion.value = lensDistortion
    this.uniforms.u_rgbShiftR.value = rgbShiftR
    this.uniforms.u_rgbShiftG.value = rgbShiftG
    this.uniforms.u_rgbShiftB.value = rgbShiftB
    this.uniforms.u_waveFrequency.value = waveFrequency
    this.uniforms.u_waveStrength.value = waveStrength
    this.uniforms.u_waveSpeed.value = waveSpeed
    this.uniforms.u_randomFrequency.value = randomFrequency
    this.uniforms.u_randomStrength.value = randomStrength
    this.uniforms.u_randomSpeed.value = randomSpeed
    this.pointerEase = pointerEase
  }

  public onPointerMove(event: PointerEvent): void {
    this.mouse.set(
      (event.clientX / this.windowWidth) * 2 - 1,
      -(event.clientY / this.windowHeight) * 2 + 1
    )
  }

  public onResize(): void {
    this.setWindowSize()
    this.setMeshScale()
  }

  public render(): void {
    if (!this.mesh) return

    this.mouseEase.lerp(this.mouse, this.pointerEase)
    this.uniforms.u_mouse.value.copy(this.mouseEase)
    this.uniforms.u_time.value = performance.now() * 0.001
  }
}
