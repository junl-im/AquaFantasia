/** Pure V4 animation poses: visuals follow fishing input, not random loops. */
import { fightImpact, type FishingRound } from './fishingEngine.ts';

export type FisherPose = 'idle' | 'cast' | 'hook' | 'reel' | 'brace' | 'land' | 'fail';
export interface VisualMotion {
  pose: FisherPose;
  frame: 0 | 1 | 2 | 3;
  rodBend: number;
  tailAmplitude: number;
  tailFrequency: number;
}

const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));
const frame = (i: number): 0 | 1 | 2 | 3 => (Math.floor(i) % 4) as 0 | 1 | 2 | 3;

/** `phaseAge` and `elapsed` are scene time, while reel/fish forces are game truth. */
export function visualMotion(
  round: FishingRound | null,
  held: boolean,
  phaseAge: number,
  elapsed: number,
  lite: boolean,
): VisualMotion {
  if (!round) return {pose:'idle',frame:0,rodBend:0,tailAmplitude:0,tailFrequency:0};
  const tension = clamp(round.tension,0,1);
  const intensity = round.phase === 'fighting' ? fightImpact(round).strength : 0;
  const tailAmplitude = round.phase === 'fighting' && !lite ? .033 + .069 * intensity : 0;
  const tailFrequency = round.phase === 'fighting' ? 3.8 + intensity * 5 : 0;
  switch(round.phase) {
    case 'waiting':
      return {
        pose:phaseAge < .62 ? 'cast' : 'idle',
        frame:phaseAge < .62 ? frame(Math.min(3,phaseAge/.155)) : 0,
        rodBend:phaseAge < .62 ? -Math.sin(phaseAge/.62*Math.PI)*.11 : 0,
        tailAmplitude:0,tailFrequency:0,
      };
    case 'bite':
      return {pose:'hook',frame:3,rodBend:-.16,tailAmplitude:0,tailFrequency:0};
    case 'fighting':
      return {
        pose:held ? 'reel' : 'brace',
        frame:held ? frame(elapsed/(lite?.22:.12)) : 1,
        rodBend:clamp(.045 + tension*.20 + intensity*.10 + (held?.045:0),0,.40),
        tailAmplitude,tailFrequency,
      };
    case 'landed':
      return {pose:'land',frame:2,rodBend:-.10,tailAmplitude:0,tailFrequency:0};
    case 'escaped':
      return {pose:'fail',frame:1,rodBend:.07,tailAmplitude:0,tailFrequency:0};
  }
}
