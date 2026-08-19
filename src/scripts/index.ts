import Webgl from "./webgl/Webgl"

const revealPage = (): void => {
  document.body.classList.remove("loading")
}

const boot = async (): Promise<void> => {
  const root = document.querySelector("[data-page]")

  if (!root) {
    revealPage()
    return
  }

  const webgl = new Webgl()

  try {
    webgl.init()
    const isReady = await webgl.enter()

    if (isReady) {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve())
      })
      document.body.classList.add("webgl-ready")
    }
  } catch (error) {
    console.error("Failed to initialize the WebGL demo.", error)
  } finally {
    revealPage()
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true })
} else {
  boot()
}
