export interface AtlasFrame { x: number; y: number; w: number; h: number }
export interface AquaAtlas { meta: { image: string; version: string; format: string; scale: string }; frames: Record<string, AtlasFrame> }

export async function loadAquaAtlas(jsonUrl = '/assets/atlas/aqua_fishing_v46.atlas.json'): Promise<AquaAtlas> {
  const response = await fetch(jsonUrl, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`Atlas load failed: ${response.status}`);
  return response.json();
}

export function frameToCss(frame: AtlasFrame, atlasWidth = 1024, atlasHeight = 512) {
  return {
    backgroundSize: `${atlasWidth}px ${atlasHeight}px`,
    backgroundPosition: `-${frame.x}px -${frame.y}px`,
    width: `${frame.w}px`,
    height: `${frame.h}px`,
  } as const;
}
