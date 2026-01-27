import { useEffect, useRef } from 'react';
import { CHARACTER_SPECIES } from '../data/species';

/**
 * Smart Image Preloader Hook
 * 
 * Automatically preloads images for characters the user owns (unlocked).
 * This ensures that when the user visits "My Jello Box" (Encyclopedia),
 * the images render instantly from the browser cache without network delay.
 * 
 * @param unlockedJellos Record of unlocked species and stages from NurturingContext
 */
export const useSmartImagePreloader = (unlockedJellos: Record<string, number[]> | undefined) => {
    // Keep track of URLs we have already requested to preload to avoid redundant processing
    const preloadedUrls = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!unlockedJellos) return;

        Object.entries(unlockedJellos).forEach(([speciesId, stages]) => {
            const species = CHARACTER_SPECIES[speciesId];
            if (!species) return;

            stages.forEach(stage => {
                const evolution = species.evolutions.find(e => e.stage === stage);
                if (evolution && evolution.imageUrl) {
                    const url = evolution.imageUrl;

                    // If not already preloaded in this session
                    if (!preloadedUrls.current.has(url)) {
                        preloadedUrls.current.add(url);

                        // Create image object to trigger browser download/cache
                        const img = new Image();
                        // CRITICAL: Must match JelloAvatar's crossOrigin setting to reuse cache
                        img.crossOrigin = 'anonymous';

                        // No verbose logging for production, just silent preloading
                        // We only log critical errors if needed, but for preloading it's often better to fail silently
                        // img.onerror = (e) => console.warn(`Failed to preload: ${url}`, e);

                        img.src = url;

                        // Optional: Decoding hints helps move decoding off the main thread
                        if ('decode' in img) {
                            (img as any).decode().catch(() => { });
                        }
                    }
                }
            });
        });

    }, [unlockedJellos]); // Re-run if user unlocks something new
};
