import type React from 'react';
import { ANNOUNCEMENT_DURATION_MS, MAX_WAVE, WAVE_TRANSITION_DELAY_MS } from './constants';
import { getWaveTargetKillCount, getWaveVisualTier } from './helpers';
import {
    getWaveEliteKillTarget,
    getWaveEliteSpawnInterval,
    getWaveRuntimeConfig,
} from './waveConfig';
import type { BombBlast, DeathBurst, JelloKnightAnnouncement, SpawnSignal, WebZone } from './types';

type ShowAnnouncement = (
    title: string,
    detail: string,
    tone: JelloKnightAnnouncement['tone']
) => void;

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

export const advanceWaveIfReady = ({
    elapsedMs,
    nextWaveAdvanceAtMsRef,
    waveIndexRef,
    waveKillCountRef,
    waveTargetKillCountRef,
    waveEliteKillCountRef,
    waveEliteKillTargetRef,
    lastSpawnTimeRef,
    lastRangedSpawnTimeRef,
    nextEliteSpawnAtMsRef,
}: {
    elapsedMs: number;
    nextWaveAdvanceAtMsRef: React.MutableRefObject<number | null>;
    waveIndexRef: React.MutableRefObject<number>;
    waveKillCountRef: React.MutableRefObject<number>;
    waveTargetKillCountRef: React.MutableRefObject<number>;
    waveEliteKillCountRef: React.MutableRefObject<number>;
    waveEliteKillTargetRef: React.MutableRefObject<number>;
    lastSpawnTimeRef: React.MutableRefObject<number>;
    lastRangedSpawnTimeRef: React.MutableRefObject<number>;
    nextEliteSpawnAtMsRef: React.MutableRefObject<number>;
}) => {
    if (
        nextWaveAdvanceAtMsRef.current !== null
        && elapsedMs >= nextWaveAdvanceAtMsRef.current
    ) {
        nextWaveAdvanceAtMsRef.current = null;
        waveIndexRef.current = Math.min(MAX_WAVE, waveIndexRef.current + 1);
        waveKillCountRef.current = 0;
        waveTargetKillCountRef.current = getWaveTargetKillCount(waveIndexRef.current);
        waveEliteKillCountRef.current = 0;
        waveEliteKillTargetRef.current = getWaveEliteKillTarget(waveIndexRef.current);
        const nextWaveConfig = getWaveRuntimeConfig(waveIndexRef.current);
        lastSpawnTimeRef.current = elapsedMs;
        lastRangedSpawnTimeRef.current = nextWaveConfig.rangedSpawnChance > 0
            ? elapsedMs - (nextWaveConfig.rangedSpawnIntervalMs * 0.8)
            : elapsedMs;
        nextEliteSpawnAtMsRef.current = waveEliteKillTargetRef.current > 0
            ? elapsedMs + getWaveEliteSpawnInterval(waveIndexRef.current)
            : Number.POSITIVE_INFINITY;
    }

    const waveIndex = waveIndexRef.current;
    return {
        waveIndex,
        isWaveTransitioning: nextWaveAdvanceAtMsRef.current !== null,
        waveConfig: getWaveRuntimeConfig(waveIndex),
        waveVisualTier: getWaveVisualTier(waveIndex),
    };
};

export const createRegisterEnemyDefeat = ({
    elapsedMs,
    nextWaveAdvanceAtMsRef,
    waveIndexRef,
    waveKillCountRef,
    waveTargetKillCountRef,
    waveEliteKillCountRef,
    waveEliteKillTargetRef,
}: {
    elapsedMs: number;
    nextWaveAdvanceAtMsRef: React.MutableRefObject<number | null>;
    waveIndexRef: React.MutableRefObject<number>;
    waveKillCountRef: React.MutableRefObject<number>;
    waveTargetKillCountRef: React.MutableRefObject<number>;
    waveEliteKillCountRef: React.MutableRefObject<number>;
    waveEliteKillTargetRef: React.MutableRefObject<number>;
}) => (enemyCategory: 'normal' | 'elite' = 'normal') => {
    if (nextWaveAdvanceAtMsRef.current !== null || waveIndexRef.current >= MAX_WAVE) return;

    if (enemyCategory === 'elite') {
        waveEliteKillCountRef.current += 1;
    } else {
        waveKillCountRef.current += 1;
    }

    if (
        waveKillCountRef.current >= waveTargetKillCountRef.current
        && waveEliteKillCountRef.current >= waveEliteKillTargetRef.current
    ) {
        nextWaveAdvanceAtMsRef.current = elapsedMs + WAVE_TRANSITION_DELAY_MS;
    }
};

export const updateAnnouncementsAndEffects = ({
    elapsedMs,
    waveIndex,
    gt,
    lastAnnouncedWaveRef,
    announcementExpiresAtRef,
    spawnSignalsRef,
    bombBlastsRef,
    deathBurstsRef,
    webZonesRef,
    setAnnouncement,
    showAnnouncement,
}: {
    elapsedMs: number;
    waveIndex: number;
    gt: TranslateFn;
    lastAnnouncedWaveRef: React.MutableRefObject<number>;
    announcementExpiresAtRef: React.MutableRefObject<number>;
    spawnSignalsRef: React.MutableRefObject<SpawnSignal[]>;
    bombBlastsRef: React.MutableRefObject<BombBlast[]>;
    deathBurstsRef: React.MutableRefObject<DeathBurst[]>;
    webZonesRef: React.MutableRefObject<WebZone[]>;
    setAnnouncement: React.Dispatch<React.SetStateAction<JelloKnightAnnouncement | null>>;
    showAnnouncement: ShowAnnouncement;
}) => {
    if (waveIndex > lastAnnouncedWaveRef.current) {
        lastAnnouncedWaveRef.current = waveIndex;
        const waveConfig = getWaveRuntimeConfig(waveIndex);
        const waveDetailKey = `announcements.waveDetails.${waveConfig.spawnProfileId}` as const;
        const announcementTone: JelloKnightAnnouncement['tone'] =
            waveConfig.eliteKillTarget > 0
                ? 'elite'
                : waveConfig.rangedSpawnChance > 0
                    ? 'ranged'
                    : 'danger';
        showAnnouncement(
            gt('announcements.dangerTitle', { tier: waveIndex }),
            gt(waveDetailKey),
            announcementTone
        );
    }

    if (announcementExpiresAtRef.current > 0 && elapsedMs >= announcementExpiresAtRef.current) {
        announcementExpiresAtRef.current = 0;
        setAnnouncement(null);
    }

    const pruneExpiredEntries = <T extends { expiresAtMs: number }>(entries: T[]) => {
        let nextEntries: T[] | null = null;

        for (let index = 0; index < entries.length; index += 1) {
            const entry = entries[index];
            if (entry.expiresAtMs > elapsedMs) {
                if (nextEntries) nextEntries.push(entry);
                continue;
            }

            if (!nextEntries) {
                nextEntries = entries.slice(0, index);
            }
        }

        return nextEntries ?? entries;
    };

    const liveSignals = pruneExpiredEntries(spawnSignalsRef.current);
    if (liveSignals !== spawnSignalsRef.current) {
        spawnSignalsRef.current = liveSignals;
    }

    const liveBombBlasts = pruneExpiredEntries(bombBlastsRef.current);
    if (liveBombBlasts !== bombBlastsRef.current) {
        bombBlastsRef.current = liveBombBlasts;
    }

    const liveDeathBursts = pruneExpiredEntries(deathBurstsRef.current);
    if (liveDeathBursts !== deathBurstsRef.current) {
        deathBurstsRef.current = liveDeathBursts;
    }

    const liveWebZones = pruneExpiredEntries(webZonesRef.current);
    if (liveWebZones !== webZonesRef.current) {
        webZonesRef.current = liveWebZones;
    }
};

export const createShowAnnouncement = ({
    elapsedMs,
    announcementExpiresAtRef,
    nextAnnouncementIdRef,
    setAnnouncement,
}: {
    elapsedMs: number;
    announcementExpiresAtRef: React.MutableRefObject<number>;
    nextAnnouncementIdRef: React.MutableRefObject<number>;
    setAnnouncement: React.Dispatch<React.SetStateAction<JelloKnightAnnouncement | null>>;
}) => (
    title: string,
    detail: string,
    tone: JelloKnightAnnouncement['tone']
) => {
    announcementExpiresAtRef.current = elapsedMs + ANNOUNCEMENT_DURATION_MS;
    setAnnouncement({
        id: nextAnnouncementIdRef.current,
        title,
        detail,
        tone,
    });
    nextAnnouncementIdRef.current += 1;
};
