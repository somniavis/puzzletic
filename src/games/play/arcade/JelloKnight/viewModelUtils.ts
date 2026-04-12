import type { RunnerMotion } from './types';

export const getRunnerMotionStyleVars = (runnerMotion: RunnerMotion) => ({
    ['--jello-knight-runner-bob-speed' as string]: runnerMotion.strength > 0.18 ? '1.7s' : '2.45s',
    ['--jello-knight-runner-shift-x' as string]: `${(runnerMotion.x * runnerMotion.strength * 3.2).toFixed(2)}px`,
    ['--jello-knight-runner-shift-y' as string]: `${(runnerMotion.y * runnerMotion.strength * 2.6).toFixed(2)}px`,
    ['--jello-knight-runner-tilt' as string]: `${(runnerMotion.x * runnerMotion.strength * 10).toFixed(2)}deg`,
    ['--jello-knight-runner-scale-x' as string]: `${(1 + (runnerMotion.strength * 0.06)).toFixed(3)}`,
    ['--jello-knight-runner-scale-y' as string]: `${(1 - (runnerMotion.strength * 0.045)).toFixed(3)}`,
});

export const getStageMoodStyleVars = (dangerTier: number, hasElite: boolean) => {
    const topGlowOpacity = Math.min(0.36, 0.16 + (dangerTier * 0.035));
    const ambientOpacity = Math.min(0.34, 0.1 + (dangerTier * 0.04));
    const duskOpacity = Math.min(0.52, 0.08 + (dangerTier * 0.08));
    const hazardOpacity = hasElite ? 0.22 : Math.max(0, (dangerTier - 3) * 0.06);
    const gridOpacity = Math.max(0.56, 0.74 - (dangerTier * 0.035));

    return {
        ['--jello-knight-top-glow-opacity' as string]: `${topGlowOpacity}`,
        ['--jello-knight-ambient-opacity' as string]: `${ambientOpacity}`,
        ['--jello-knight-dusk-opacity' as string]: `${duskOpacity}`,
        ['--jello-knight-hazard-opacity' as string]: `${hazardOpacity}`,
        ['--jello-knight-grid-opacity' as string]: `${gridOpacity}`,
    };
};
