import { useEffect, useRef } from 'react';
import { CHARACTER_SPECIES } from '../data/species';

/**
 * Smart Image Preloader Hook (Robust Version)
 * 
 * Features:
 * 1. Strong RAM Caching: Keeps HTMLImageElement references to prevent GC.
 * 2. Auto-Retry: Retries failed downloads up to 3 times.
 * 3. CrossOrigin Sync: Matches 'anonymous' setting for cache hits.
 * 
 * @param unlockedJellos Record of unlocked species and stages from NurturingContext
 */
export const useSmartImagePreloader = (unlockedJellos: Record<string, number[]> | undefined) => {
    // [Layer 1] Strong RAM Poll: Holds actual DOM elements to prevent Garbage Collection
    const imagePool = useRef<Map<string, HTMLImageElement>>(new Map());

    // Track ongoing retries to prevent duplicate attempts
    const loadingAttempts = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!unlockedJellos) return;

        const loadImageWithRetry = (url: string, attempt: number = 0) => {
            // Already loaded? Skip.
            if (imagePool.current.has(url)) return;

            // Already trying? Skip.
            if (loadingAttempts.current.has(url)) return;

            loadingAttempts.current.add(url);

            const img = new Image();
            img.crossOrigin = 'anonymous'; // [CRITICAL] Matches JelloAvatar

            img.onload = () => {
                // Success: Pin to RAM pool
                imagePool.current.set(url, img);
                loadingAttempts.current.delete(url);
                // console.log(`✅ [Pool] Pinned to RAM: ${url.split('/').pop()}`);
            };

            img.onerror = () => {
                loadingAttempts.current.delete(url);

                // [Layer 2] Retry Logic
                if (attempt < 3) {
                    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                    // console.warn(`⚠️ [Pool] Load failed, retrying in ${delay}ms... (${url.split('/').pop()})`);
                    setTimeout(() => {
                        loadImageWithRetry(url, attempt + 1);
                    }, delay);
                } else {
                    console.error(`❌ [Pool] Gave up after 3 attempts: ${url}`);
                    // Layer 3 (Fallback) is handled by JelloAvatar's onError
                }
            };

            img.src = url;

            if ('decode' in img) {
                (img as any).decode().catch(() => { });
            }
        };

        Object.entries(unlockedJellos).forEach(([speciesId, stages]) => {
            const species = CHARACTER_SPECIES[speciesId];
            if (!species) return;

            stages.forEach(stage => {
                const evolution = species.evolutions.find(e => e.stage === stage);
                if (evolution && evolution.imageUrl) {
                    loadImageWithRetry(evolution.imageUrl);
                }
            });
        });

    }, [unlockedJellos]);
};
