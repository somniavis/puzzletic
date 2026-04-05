import tailMonkeyAsset from './assets/tail-monkey.svg';
import tailDogAsset from './assets/tail-dog.svg';
import tailRaccoonAsset from './assets/tail-raccoon.svg';
import tailCatAsset from './assets/tail-cat.svg';
import tailTigerAsset from './assets/tail-tiger.svg';
import tailDeerAsset from './assets/tail-deer.svg';
import tailCowAsset from './assets/tail-cow.svg';
import tailRabbitAsset from './assets/tail-rabbit.svg';
import tailHedgehogAsset from './assets/tail-hedgehog.svg';
import tailEagleAsset from './assets/tail-eagle.svg';
import enemyRockAsset from './assets/enemy-rock.svg';
import enemyDevilAsset from './assets/enemy-devil.svg';
import enemyDinoAsset from './assets/enemy-dino.svg';
import enemyAlertAsset from './assets/enemy-alert.svg';
import { TAIL_RUNNER_IPAD_TAIL_EMOJI_SET } from './constants';

export const TAIL_RUNNER_IPAD_EMOJI_ASSET_MAP: Record<string, string> = {
    '🐒': tailMonkeyAsset,
    '🐕': tailDogAsset,
    '🦝': tailRaccoonAsset,
    '🐈': tailCatAsset,
    '🐅': tailTigerAsset,
    '🦌': tailDeerAsset,
    '🐄': tailCowAsset,
    '🐇': tailRabbitAsset,
    '🦔': tailHedgehogAsset,
    '🦅': tailEagleAsset,
    '🪨': enemyRockAsset,
    '👿': enemyDevilAsset,
    '🦖': enemyDinoAsset,
    '💢': enemyAlertAsset,
};

export const mapTailRunnerIpadTailEmoji = (emoji: string) => {
    if (TAIL_RUNNER_IPAD_EMOJI_ASSET_MAP[emoji]) return emoji;
    let hash = 0;
    for (const char of Array.from(emoji)) {
        hash += char.codePointAt(0) || 0;
    }
    return TAIL_RUNNER_IPAD_TAIL_EMOJI_SET[hash % TAIL_RUNNER_IPAD_TAIL_EMOJI_SET.length];
};

export const getTailRunnerIpadEmojiAssetSrc = (emoji: string) => (
    TAIL_RUNNER_IPAD_EMOJI_ASSET_MAP[emoji] || tailMonkeyAsset
);
