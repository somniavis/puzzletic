import React from 'react';
import {
    getBundleIndex,
} from './playAdventureBoardLayout';
import {
    LEVEL_ONE_CREATURE_BUNDLE_INDEXES,
    LEVEL_THREE_CREATURE_BUNDLE_INDEXES,
} from './playAdventureBoardDecorations';
import {
    getOverlayTileKeysForRule,
    OVERLAY_TILE_RULES,
} from './playAdventureBoardOverlayRules';
import {
    buildInitialCreatureMotionByTileKey,
    getRandomBoatPreset,
    getRandomCreaturePreset,
} from './playAdventureBoardMotion';
import type {
    BoardLevelViewModel,
    BoatMotionAssignment,
    CreatureMotionAssignment,
    PlayAdventureBoardTheme,
} from './playAdventureBoardTypes';

interface PlayAdventureBoardMotionState {
    creatureMotionByTileKey: Map<string, CreatureMotionAssignment>;
    boatMotion: BoatMotionAssignment | null;
    sailboatMotion: BoatMotionAssignment | null;
    camelMotion: BoatMotionAssignment | null;
    beeMotion: BoatMotionAssignment | null;
    elephantMotion: BoatMotionAssignment | null;
    handleCreatureAnimationIteration: (tileKey: string) => void;
    handleBoatAnimationIteration: () => void;
    handleSailboatAnimationIteration: () => void;
    handleCamelAnimationIteration: () => void;
    handleBeeAnimationIteration: () => void;
    handleElephantAnimationIteration: () => void;
}

export const usePlayAdventureBoardMotion = (
    boardLevels: BoardLevelViewModel[],
    theme: PlayAdventureBoardTheme
): PlayAdventureBoardMotionState => {
    const layoutByLevel = React.useMemo(
        () => new Map(boardLevels.map((boardLevel) => [boardLevel.level, boardLevel.layout])),
        [boardLevels]
    );

    const initialCreatureMotionByTileKey = React.useMemo(() => {
        if (theme === 'brain') {
            return new Map<string, CreatureMotionAssignment>();
        }

        const creatureTilesByBundle = boardLevels.flatMap(({ level, layout }) => {
            const creatureBundleIndexes =
                level === 1 ? LEVEL_ONE_CREATURE_BUNDLE_INDEXES
                    : level === 3 ? LEVEL_THREE_CREATURE_BUNDLE_INDEXES
                        : [];

            return creatureBundleIndexes.map((bundleIndex) => ({
                level,
                tiles: layout.tiles.filter((tile) =>
                    tile.kind === 'forest' && getBundleIndex(tile.y, layout.rowOffset) === bundleIndex
                ),
            }));
        });

        return buildInitialCreatureMotionByTileKey(creatureTilesByBundle);
    }, [boardLevels, theme]);

    const overlayTileKeysByMotionKey = React.useMemo(() => ({
        boat: theme === 'math' ? getOverlayTileKeysForRule(layoutByLevel.get(OVERLAY_TILE_RULES.boat.level) ?? null, OVERLAY_TILE_RULES.boat) : [],
        sailboat: theme === 'math' ? getOverlayTileKeysForRule(layoutByLevel.get(OVERLAY_TILE_RULES.sailboat.level) ?? null, OVERLAY_TILE_RULES.sailboat) : [],
        camel: theme === 'math' ? getOverlayTileKeysForRule(layoutByLevel.get(OVERLAY_TILE_RULES.camel.level) ?? null, OVERLAY_TILE_RULES.camel) : [],
        bee: theme === 'math' ? getOverlayTileKeysForRule(layoutByLevel.get(OVERLAY_TILE_RULES.bee.level) ?? null, OVERLAY_TILE_RULES.bee) : [],
        elephant: theme === 'math' ? getOverlayTileKeysForRule(layoutByLevel.get(OVERLAY_TILE_RULES.elephant.level) ?? null, OVERLAY_TILE_RULES.elephant) : [],
    }), [layoutByLevel, theme]);

    const [creatureMotionByTileKey, setCreatureMotionByTileKey] = React.useState<Map<string, CreatureMotionAssignment>>(
        () => initialCreatureMotionByTileKey
    );
    const [boatMotion, setBoatMotion] = React.useState<BoatMotionAssignment | null>(
        () => getRandomBoatPreset(overlayTileKeysByMotionKey.boat)
    );
    const [sailboatMotion, setSailboatMotion] = React.useState<BoatMotionAssignment | null>(
        () => getRandomBoatPreset(overlayTileKeysByMotionKey.sailboat)
    );
    const [camelMotion, setCamelMotion] = React.useState<BoatMotionAssignment | null>(
        () => getRandomBoatPreset(overlayTileKeysByMotionKey.camel)
    );
    const [beeMotion, setBeeMotion] = React.useState<BoatMotionAssignment | null>(
        () => getRandomBoatPreset(overlayTileKeysByMotionKey.bee)
    );
    const [elephantMotion, setElephantMotion] = React.useState<BoatMotionAssignment | null>(
        () => getRandomBoatPreset(overlayTileKeysByMotionKey.elephant)
    );

    React.useEffect(() => {
        setCreatureMotionByTileKey(initialCreatureMotionByTileKey);
    }, [initialCreatureMotionByTileKey]);

    React.useEffect(() => {
        setBoatMotion(getRandomBoatPreset(overlayTileKeysByMotionKey.boat));
    }, [overlayTileKeysByMotionKey.boat]);
    React.useEffect(() => {
        setSailboatMotion(getRandomBoatPreset(overlayTileKeysByMotionKey.sailboat));
    }, [overlayTileKeysByMotionKey.sailboat]);
    React.useEffect(() => {
        setCamelMotion(getRandomBoatPreset(overlayTileKeysByMotionKey.camel));
    }, [overlayTileKeysByMotionKey.camel]);
    React.useEffect(() => {
        setBeeMotion(getRandomBoatPreset(overlayTileKeysByMotionKey.bee));
    }, [overlayTileKeysByMotionKey.bee]);
    React.useEffect(() => {
        setElephantMotion(getRandomBoatPreset(overlayTileKeysByMotionKey.elephant));
    }, [overlayTileKeysByMotionKey.elephant]);

    const handleCreatureAnimationIteration = React.useCallback((tileKey: string) => {
        setCreatureMotionByTileKey((previous) => {
            const next = new Map(previous);
            next.set(tileKey, getRandomCreaturePreset(previous.get(tileKey) ?? null));
            return next;
        });
    }, []);
    const handleBoatAnimationIteration = React.useCallback(() => {
        setBoatMotion((previous) => getRandomBoatPreset(overlayTileKeysByMotionKey.boat, previous));
    }, [overlayTileKeysByMotionKey.boat]);
    const handleSailboatAnimationIteration = React.useCallback(() => {
        setSailboatMotion((previous) => getRandomBoatPreset(overlayTileKeysByMotionKey.sailboat, previous));
    }, [overlayTileKeysByMotionKey.sailboat]);
    const handleCamelAnimationIteration = React.useCallback(() => {
        setCamelMotion((previous) => getRandomBoatPreset(overlayTileKeysByMotionKey.camel, previous));
    }, [overlayTileKeysByMotionKey.camel]);
    const handleBeeAnimationIteration = React.useCallback(() => {
        setBeeMotion((previous) => getRandomBoatPreset(overlayTileKeysByMotionKey.bee, previous));
    }, [overlayTileKeysByMotionKey.bee]);
    const handleElephantAnimationIteration = React.useCallback(() => {
        setElephantMotion((previous) => getRandomBoatPreset(overlayTileKeysByMotionKey.elephant, previous));
    }, [overlayTileKeysByMotionKey.elephant]);

    return {
        creatureMotionByTileKey,
        boatMotion,
        sailboatMotion,
        camelMotion,
        beeMotion,
        elephantMotion,
        handleCreatureAnimationIteration,
        handleBoatAnimationIteration,
        handleSailboatAnimationIteration,
        handleCamelAnimationIteration,
        handleBeeAnimationIteration,
        handleElephantAnimationIteration,
    };
};
