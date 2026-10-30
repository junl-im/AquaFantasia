/** Deterministic float and cast cues. All motion is visual; fishing outcomes stay in fishingEngine. */
import type { FishingRound } from './fishingEngine.ts';

export interface SurfaceMotion {
  /** 0 at the rod tip, 1 at the intended fishing spot. */
  castTravel: number;
  /** 0..1 height of the cast arc. */
  castLift: number;
  /** 0..1 float immersion when a fish bites. */
  biteDip: number;
  /** 0..1 intensity for raster-free Canvas water rings. */
  ripple: number;
  visible: boolean;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Phase age is maintained by the Pixi stage, never used to modify game rules. */
export function surfaceMotion(
  round: FishingRound | null,
  phaseAge: number,
  elapsed: number,
  lite: boolean,
): SurfaceMotion {
  const still = {castTravel:1, castLift:0, biteDip:0, ripple:0, visible:false};
  if (!round) return still;
  const age = Math.max(0, phaseAge);

  switch(round.phase) {
    case 'waiting': {
      const t = clamp01(age / .68);
      const lift = t >= 1 ? 0 : Math.sin(t * Math.PI);
      const settle = age >= .59 && age < 1.26
        ? clamp01((age - .59) / .13) * (1 - clamp01((age - .72) / .54))
        : 0;
      return {
        castTravel:t,
        castLift:lift * (lite ? .40 : 1),
        biteDip:0,
        ripple:settle * (lite ? .35 : .85),
        visible:true,
      };
    }
    case 'bite': {
      const pulse = (1 + Math.sin(Math.max(0, elapsed) * 11)) * .5;
      return {
        castTravel:1, castLift:0,
        biteDip:lite ? .48 : .47 + .37 * pulse,
        ripple:lite ? .32 : .55 + .36 * pulse,
        visible:true,
      };
    }
    case 'fighting':
    case 'landed':
    case 'escaped':
      return still;
  }
}
