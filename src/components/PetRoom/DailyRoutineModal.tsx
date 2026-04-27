import React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuModal } from './MenuModal';
import type { DailyRoutineTask } from '../../types/dailyRoutine';
import type { DailyRoutineState } from '../../types/dailyRoutine';

interface DailyRoutineModalProps {
  dailyRoutine: DailyRoutineState;
  onClose: () => void;
  onClaim: () => void;
  isClaiming?: boolean;
  canClaim?: boolean;
  errorMessage?: string | null;
}

const getTaskLabel = (
  task: DailyRoutineTask,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  switch (task.type) {
    case 'study_stars':
      return t('dailyRoutine.task.studyStars');
    case 'pet_touch':
      return t('dailyRoutine.task.petTouch');
    case 'feed_category': {
      const categoryLabel = t(`dailyRoutine.foodCategory.${task.foodCategory}`);
      return t('dailyRoutine.task.feedCategory', {
        category: categoryLabel,
      });
    }
    case 'brush_teeth':
      return t('dailyRoutine.task.brushTeeth');
    case 'shower':
      return t('dailyRoutine.task.shower');
    case 'clean_poop':
      return t('dailyRoutine.task.cleanPoop');
    case 'clean_bug':
      return t('dailyRoutine.task.cleanBug');
    case 'sleep':
      return t('dailyRoutine.task.sleep');
    default:
      return '';
  }
};

export const DailyRoutineModal: React.FC<DailyRoutineModalProps> = ({
  dailyRoutine,
  onClose,
  onClaim,
  isClaiming = false,
  canClaim = true,
  errorMessage = null,
}) => {
  const { t } = useTranslation();
  const isClaimDisabled = !dailyRoutine.completed || dailyRoutine.claimed || isClaiming || !canClaim;
  const claimLabel = dailyRoutine.claimed
    ? t('dailyRoutine.claimed')
    : isClaiming
      ? t('dailyRoutine.claiming')
    : t('dailyRoutine.claim');

  return (
    <MenuModal
      title={t('dailyRoutine.title')}
      onClose={onClose}
      variant="custom"
      className="daily-routine-menu pr-modal--daily"
    >
      <div className="daily-routine-modal">
        <div className="daily-routine-task-list">
          {dailyRoutine.tasks.map((task) => (
            <div
              key={task.id}
              className={`daily-routine-task-card ${task.completed ? 'completed' : ''}`}
            >
              <div className="daily-routine-task-main">
                <div className="daily-routine-task-check" aria-hidden="true">
                  {task.completed ? '✓' : ''}
                </div>
                <div className="daily-routine-task-copy">
                  <div className="daily-routine-task-title">{getTaskLabel(task, t)}</div>
                </div>
              </div>
              <div className={`daily-routine-task-status ${task.completed ? 'done' : 'todo'}`}>
                {task.progress} / {task.target}
              </div>
            </div>
          ))}
        </div>

        {errorMessage ? (
          <div className="daily-routine-error-message" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="button"
          className={`daily-routine-claim-button ${dailyRoutine.claimed ? 'claimed' : ''}`}
          disabled={isClaimDisabled}
          onClick={onClaim}
        >
          {claimLabel}
        </button>
      </div>
    </MenuModal>
  );
};
