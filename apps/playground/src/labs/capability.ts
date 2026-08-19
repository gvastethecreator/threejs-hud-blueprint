import { probeRendererCapabilities, type RendererCapabilityReport } from "@scope/three-hud";

export async function probeHostRenderer(renderer: unknown): Promise<RendererCapabilityReport> {
  return probeRendererCapabilities(renderer);
}

async function probeWebGpuRenderer(options?: {
  forceWebGL?: boolean;
}): Promise<RendererCapabilityReport | { error: string }> {
  try {
    const webgpu = await import("three/webgpu");
    const renderer = new webgpu.WebGPURenderer(options);
    try {
      return await probeRendererCapabilities(renderer);
    } finally {
      renderer.dispose();
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export function probeWebGpuFallbackRenderer(): Promise<
  RendererCapabilityReport | { error: string }
> {
  return probeWebGpuRenderer({ forceWebGL: true });
}

export function probeWebGpuNativeRenderer(): Promise<RendererCapabilityReport | { error: string }> {
  return probeWebGpuRenderer();
}
