// Storybook stub for @/lib/fx/home-bg-webgl. The real module imports GLSL
// shader files which Vite cannot parse without a plugin. Stories never need
// the actual renderer — they just need the module to be importable.

export function createHomeBgRenderer() {
  return {
    dispose() {},
    setColor(_r: number, _g: number, _b: number) {},
  }
}
