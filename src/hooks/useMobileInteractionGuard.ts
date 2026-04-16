import { useEffect } from 'react';

type ElementRef = React.RefObject<HTMLElement | null>;

type UseMobileInteractionGuardParams = {
    rootRef: ElementRef;
    ignoreSelectors?: string[];
    blockContextMenu?: boolean;
    blockSelection?: boolean;
    blockCopyCut?: boolean;
    blockTouchGestures?: boolean;
};

const DEFAULT_IGNORE_SELECTORS = [
    'button',
    'input',
    'textarea',
    'select',
    'a',
    '[role="button"]',
    '[contenteditable="true"]',
    '[data-allow-selection="true"]',
] as const;

const matchesIgnoredSelector = (target: EventTarget | null, selectors: string[]) => {
    if (!(target instanceof HTMLElement)) return false;
    return selectors.some((selector) => Boolean(target.closest(selector)));
};

const applyGuardStyles = (element: HTMLElement | null) => {
    if (!element) return;
    const style = element.style as CSSStyleDeclaration & {
        webkitUserSelect?: string;
        webkitTouchCallout?: string;
        webkitTapHighlightColor?: string;
    };
    style.webkitTapHighlightColor = 'transparent';
    style.webkitTouchCallout = 'none';
};

export const useMobileInteractionGuard = ({
    rootRef,
    ignoreSelectors = [...DEFAULT_IGNORE_SELECTORS],
    blockContextMenu = true,
    blockSelection = true,
    blockCopyCut = false,
    blockTouchGestures = false,
}: UseMobileInteractionGuardParams) => {
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;

        applyGuardStyles(root);

        const eventNames = [
            ...(blockContextMenu ? (['contextmenu', 'dragstart'] as const) : []),
            ...(blockSelection ? (['selectstart'] as const) : []),
            ...(blockCopyCut ? (['copy', 'cut'] as const) : []),
        ];

        const touchEventNames = blockTouchGestures
            ? (['gesturestart', 'touchstart', 'touchmove'] as const)
            : (['gesturestart'] as const);

        const blockEvent = (event: Event) => {
            if (matchesIgnoredSelector(event.target, ignoreSelectors)) return;
            event.preventDefault();
        };

        const clearSelectionInsideRoot = () => {
            if (!blockSelection) return;

            const selection = window.getSelection?.();
            if (!selection || selection.rangeCount === 0) return;

            const anchorNode = selection.anchorNode;
            if (!anchorNode) return;

            const anchorElement = anchorNode instanceof HTMLElement
                ? anchorNode
                : anchorNode.parentElement;

            if (anchorElement && root.contains(anchorElement) && !matchesIgnoredSelector(anchorElement, ignoreSelectors)) {
                selection.removeAllRanges();
            }
        };

        eventNames.forEach((eventName) => {
            root.addEventListener(eventName, blockEvent);
        });
        touchEventNames.forEach((eventName) => {
            root.addEventListener(eventName, blockEvent, { passive: false });
        });

        if (blockSelection) {
            document.addEventListener('selectionchange', clearSelectionInsideRoot);
        }

        return () => {
            eventNames.forEach((eventName) => {
                root.removeEventListener(eventName, blockEvent);
            });
            touchEventNames.forEach((eventName) => {
                root.removeEventListener(eventName, blockEvent);
            });

            if (blockSelection) {
                document.removeEventListener('selectionchange', clearSelectionInsideRoot);
            }
        };
    }, [blockContextMenu, blockCopyCut, blockSelection, blockTouchGestures, ignoreSelectors, rootRef]);
};
