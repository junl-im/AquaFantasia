/** Pure V4 animation poses: visuals follow fishing input, not random loops. */
import { fightImpact, type FishingRound, type FishBehavior } from './fishingEngine.ts';

export type FisherPose = 'idle' | 'cast' | 'hook' | 'reel' | 'brace' | 'land' | 'fail';
export interface VisualMotion {
  pose: FisherPose;
  frame: 0 | 1 | 2 | 3;
  rodBend: number;
  tailAmplitude: number;
  tailFrequency: number;
  /** Localized dorsal/ventral membrane flex, never a claim of separate fin artwork. */
  finAmplitude: number;
  finFrequency: number;
  fisherEffort: number;
}

const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));
const frame = (i: number): 0 | 1 | 2 | 3 => (Math.floor(i) % 4) as 0 | 1 | 2 | 3;
const FIN_STYLE: Record<FishBehavior, number> = {
  steady:.62, dart:1.32, heavy:.48, wave:1.12, trickster:1.45, boss:1.15,
};

/** `phaseAge` and `elapsed` are scene time, while reel/fish forces are game truth. */
export function visualMotion(
  round: FishingRound | null,
  held: boolean,
  phaseAge: number,
  elapsed: number,
  lite: boolean,
): VisualMotion {
  if (!round) return {pose:'idle',frame:0,rodBend:0,tailAmplitude:0,tailFrequency:0,finAmplitude:0,finFrequency:0,fisherEffort:0};
  const tension = clamp(round.tension,0,1);
  const intensity = round.phase === 'fighting' ? fightImpact(round).strength : 0;
  const tailAmplitude = round.phase === 'fighting' && !lite ? .033 + .069 * intensity : 0;
  const tailFrequency = round.phase === 'fighting' ? 3.8 + intensity * 5 : 0;
  const finStyle = FIN_STYLE[round.fish.behavior];
  const finAmplitude = round.phase === 'fighting' && !lite
    ? (.010 + intensity*.027) * finStyle : 0;
  const finFrequency = round.phase === 'fighting'
    ? (5.4 + intensity*6.2) * (.70 + finStyle*.30) : 0;
  const fisherEffort = round.phase === 'fighting'
    ? clamp(tension*.62 + intensity*.29 + (held?.12:.03),0,1) : 0;
  switch(round.phase) {
    case 'waiting':
      return {
        pose:phaseAge < .62 ? 'cast' : 'idle',
        frame:phaseAge < .62 ? frame(Math.min(3,phaseAge/.155)) : 0,
        rodBend:phaseAge < .62 ? -Math.sin(phaseAge/.62*Math.PI)*.11 : 0,
        tailAmplitude:0,tailFrequency:0,finAmplitude:0,finFrequency:0,fisherEffort:0,
      };
    case 'bite':
      return {pose:'hook',frame:3,rodBend:-.16,tailAmplitude:0,tailFrequency:0,finAmplitude:0,finFrequency:0,fisherEffort:0};
    case 'fighting':
      return {
        pose:held ? 'reel' : 'brace',
        frame:held ? frame(elapsed/(lite?.22:.12)) : 1,
        rodBend:clamp(.045 + tension*.20 + intensity*.10 + (held?.045:0),0,.40),
        tailAmplitude,tailFrequency,finAmplitude,finFrequency,fisherEffort,
      };
    case 'landed':
      return {pose:'land',frame:2,rodBend:-.10,tailAmplitude:0,tailFrequency:0,finAmplitude:0,finFrequency:0,fisherEffort:0};
    case 'escaped':
      return {pose:'fail',frame:1,rodBend:.07,tailAmplitude:0,tailFrequency:0,finAmplitude:0,finFrequency:0,fisherEffort:0};
  }
}

/**
 * V4's visible line and water response. Values are presentation-only:
 * they never mutate tension, catch progress, rewards, or saved collection.
 */
export interface WaterResponse {
  /** 0 = taut line, 1 = deeply slack; canvas maps this to a bounded pixel sag. */
  lineSag: number;
  /** Underwater wake driven by fish pressure and its approach to the surface. */
  wakeStrength: number;
  /** Short raster spray only as the real fish nears the surface. */
  surfaceSpray: number;
}

export function waterResponse(
  round: FishingRound | null,
  held: boolean,
  lite: boolean,
): WaterResponse {
  const quiet = { lineSag: 0, wakeStrength: 0, surfaceSpray: 0 };
  if (!round) return quiet;
  if (round.phase === 'waiting') return { ...quiet, lineSag: .28 };
  if (round.phase === 'bite') return { ...quiet, lineSag: .22 };
  if (round.phase !== 'fighting') return quiet;

  const tension = clamp(round.tension, 0, 1);
  const impact = clamp(fightImpact(round).strength, 0, 1);
  const surface = clamp((round.progress - .62) / .38, 0, 1);
  return {
    lineSag: clamp((held ? .12 : .30) * (1 - .72 * tension), .015, .36),
    wakeStrength: lite ? 0 : clamp(.15 + impact * .62 + surface * .17, 0, .94),
    surfaceSpray: lite ? 0 : clamp(surface * (.18 + impact * .67), 0, .85),
  };
}

/** A separate V4 rod prop pivots from the fisher's hand instead of following walk frames. */
export interface RodAction {
  /** Offset in radians from the rod's forward resting angle. */
  angle: number;
  /** Visible bend in [0,1]; only presentation, never modifies the line limit. */
  flex: number;
  /** Reel handle turns only while the player actually holds the control. */
  reelTurn: number;
}

export function rodAction(
  round: FishingRound | null,
  held: boolean,
  phaseAge: number,
  elapsed: number,
  lite: boolean,
): RodAction {
  const idle = {angle: .07, flex: 0, reelTurn: 0};
  if (!round) return idle;
  switch (round.phase) {
    case 'waiting': {
      const t = clamp(phaseAge / .62, 0, 1);
      if (t >= 1) return idle;
      return {
        angle: -.32 + .47*t + (lite ? 0 : .18*Math.sin(t*Math.PI)),
        flex: (lite ? .025 : .09)*Math.sin(t*Math.PI),
        reelTurn: 0,
      };
    }
    case 'bite':
      return {angle: -.18, flex: .12, reelTurn: 0};
    case 'fighting': {
      const tension = clamp(round.tension, 0, 1);
      const impact = clamp(fightImpact(round).strength, 0, 1);
      return {
        angle: clamp(.05 + tension*.38 + impact*.07 + (held ? -.04 : .09), -.4, .65),
        flex: clamp(.08 + tension*.64 + impact*.14, 0, .88),
        reelTurn: held ? Math.max(0, elapsed) * (lite ? 6 : 11) : 0,
      };
    }
    case 'landed':
      return {angle: -.36, flex: .05, reelTurn: 0};
    case 'escaped':
      return {angle: .20, flex: .02, reelTurn: 0};
  }
}
