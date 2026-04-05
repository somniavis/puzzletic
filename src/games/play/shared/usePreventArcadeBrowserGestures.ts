import { useEffect } from 'react';

type ElementRef = React.RefObject<HTMLElement | null>;

type UsePreventArcadeBrowserGesturesParams = {
    rootRef: ElementRef;
    stageRef: ElementRef;
    controlsRef?: ElementRef;
    stageIgnoreSelectors?: string[];
};

const ROOT_BLOCK_EVENTS = ['contextmenu', 'dragstart', 'selectstart', 'copy', 'cut'] as const;
const ROOT_TOUCH_EVENTS = ['gesturestart', 'touchstart', 'touchmove'] as const;
const STAGE_TOUCH_EVENTS = ['gesturestart', 'touchstart', 'touchmove'] as const;
const DEFAULT_ROOT_IGNORE_SELECTORS = ['button', 'input', 'textarea', 'select', 'a'];

const matchesIgnoredSelector = (target: EventTarget | null, selectors: string[]) => {
    if (!(target instanceof HTMLElement)) return false;
    return selectors.some((selector) => Boolean(target.closest(selector)));
};

const applyGestureBlockStyles = (element: HTMLElement | null) => {
    if (!element) return;
    const style = element.style as CSSStyleDeclaration & {
        webkitUserSelect?: string;
        webkitTouchCallout?: string;
        webkitTapHighlightColor?: string;
    };
    style.userSelect = 'none';
    style.webkitUserSelect = 'none';
    style.webkitTouchCallout = 'none';
    style.webkitTapHighlightColor = 'transparent';
};

export const usePreventArcadeBrowserGestures = ({
    rootRef,
    stageRef,
    controlsRef,
    stageIgnoreSelectors = [],
}: UsePreventArcadeBrowserGesturesParams) => {
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;
        applyGestureBlockStyles(root);

        const blockRootEvent = (event: Event) => {
            if (matchesIgnoredSelector(event.target, DEFAULT_ROOT_IGNORE_SELECTORS)) return;
            event.preventDefault();
        };

        const clearSelectionInsideRoot = () => {
            const selection = window.getSelection?.();
            if (!selection || selection.rangeCount === 0) return;
            const anchorNode = selection.anchorNode;
            if (!anchorNode) return;

            const anchorElement = anchorNode instanceof HTMLElement
                ? anchorNode
                : anchorNode.parentElement;

            if (anchorElement && root.contains(anchorElement)) {
                selection.removeAllRanges();
            }
        };

        ROOT_BLOCK_EVENTS.forEach((eventName) => {
            root.addEventListener(eventName, blockRootEvent);
        });
        ROOT_TOUCH_EVENTS.forEach((eventName) => {
            root.addEventListener(eventName, blockRootEvent, { passive: false });
        });
        document.addEventListener('selectionchange', clearSelectionInsideRoot);

        return () => {
            ROOT_BLOCK_EVENTS.forEach((eventName) => {
                root.removeEventListener(eventName, blockRootEvent);
            });
            ROOT_TOUCH_EVENTS.forEach((eventName) => {
                root.removeEventListener(eventName, blockRootEvent);
            });
            document.removeEventListener('selectionchange', clearSelectionInsideRoot);
        };
    }, [rootRef]);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return undefined;

        const controls = controlsRef?.current ?? null;
        applyGestureBlockStyles(stage);
        applyGestureBlockStyles(controls);
        const blockStageEvent = (event: Event) => {
            if (matchesIgnoredSelector(event.target, stageIgnoreSelectors)) return;
            event.preventDefault();
        };

        STAGE_TOUCH_EVENTS.forEach((eventName) => {
            stage.addEventListener(eventName, blockStageEvent, { passive: false });
            controls?.addEventListener(eventName, blockStageEvent, { passive: false });
        });

        return () => {
            STAGE_TOUCH_EVENTS.forEach((eventName) => {
                stage.removeEventListener(eventName, blockStageEvent);
                controls?.removeEventListener(eventName, blockStageEvent);
            });
        };
    }, [controlsRef, stageIgnoreSelectors, stageRef]);
};
