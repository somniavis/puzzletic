import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import { GameLogic } from './GameLogic';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

interface CompareCrittersProps {
    onExit: () => void;
}

export const CompareCritters: React.FC<CompareCrittersProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 60,
        maxDifficulty: 3
    });

    return (
        <Layout2
            gameId={GameIds.MATH_COMPARE_CRITTERS}
            title={t('games.math-compare-critters.title')}
            subtitle={t('games.math-compare-critters.subtitle')}
            instructions={[
                { icon: '🦁', title: t('games.math-compare-critters.howToPlay.step1.title'), description: t('games.math-compare-critters.howToPlay.step1.description') },
                { icon: '⚖️', title: t('games.math-compare-critters.howToPlay.step2.title'), description: t('games.math-compare-critters.howToPlay.step2.description') },
                { icon: '🏆', title: t('games.math-compare-critters.howToPlay.step3.title'), description: t('games.math-compare-critters.howToPlay.step3.description') }
            ]}
            engine={engine}
            onExit={onExit}
            powerUps={[]}
            cardBackground={
                <div className={styles.animatedBackground} />
            }
        >
            <GameLogic engine={engine} />
        </Layout2>
    );
};
