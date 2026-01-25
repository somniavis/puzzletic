import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { playButtonSound } from '../../../utils/sound';
import { generateShareUrl, type ShareData } from '../../../utils/shareUtils';
import type { Character } from '../../../types/character';

// Utility to ensure all images in the container are loaded and DECODED
const waitForImages = async (element: HTMLElement) => {
    const images = Array.from(element.getElementsByTagName('img'));
    const promises = images.map(async (img) => {
        if (img.complete && img.naturalHeight !== 0) {
            try {
                await img.decode();
            } catch (e) { }
            return;
        }
        return new Promise<void>((resolve) => {
            img.onload = async () => {
                try {
                    await img.decode();
                } catch (e) { }
                resolve();
            };
            img.onerror = () => resolve();
        });
    });
    await Promise.all(promises);
};

interface UsePetCameraProps {
    character: Character;
    speciesId: string;
    nurturing: any;
}

export const usePetCamera = ({ character, speciesId, nurturing }: UsePetCameraProps) => {
    const petRoomRef = useRef<HTMLDivElement>(null);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string>('');
    const [currentShareUrl, setCurrentShareUrl] = useState<string>('');

    const handleCameraClick = async () => {
        if (!petRoomRef.current) return;

        try {
            playButtonSound();

            await waitForImages(petRoomRef.current);
            await new Promise(resolve => setTimeout(resolve, 100));

            if (!petRoomRef.current) return;

            petRoomRef.current.classList.add('snapshot-mode');

            const width = petRoomRef.current.clientWidth;
            const height = petRoomRef.current.clientHeight;

            let dataUrl: string;
            try {
                dataUrl = await toPng(petRoomRef.current, {
                    cacheBust: true,
                    pixelRatio: 2,
                    skipAutoScale: true,
                    width: width,
                    height: height,
                    style: {
                        width: `${width}px`,
                        height: `${height}px`,
                    },
                    filter: (node) => {
                        const excludeClasses = [
                            'camera-modal-overlay',
                            'action-bar',
                            'fab-menu-container',
                            'settings-menu-overlay',
                            'premium-btn-floating',
                            'abandonment-alert',
                            'premium-btn'
                        ];
                        if (node.classList) {
                            for (const cls of excludeClasses) {
                                if (node.classList.contains(cls)) return false;
                            }
                        }
                        return true;
                    },
                });
            } finally {
                petRoomRef.current?.classList.remove('snapshot-mode');
            }

            const shareData: ShareData = {
                c: speciesId,
                e: character.evolutionStage,
                n: character.name,
                h: nurturing.currentHouseId || 'tent',
                g: nurturing.currentLand,
                l: character.level
            };

            const shareUrl = generateShareUrl(shareData);

            setCapturedImage(dataUrl);
            setCurrentShareUrl(shareUrl);
            setShowCameraModal(true);

        } catch (err) {
            console.error('Failed to capture image:', err);
        }
    };

    return {
        petRoomRef,
        showCameraModal,
        setShowCameraModal,
        capturedImage,
        currentShareUrl,
        handleCameraClick
    };
};
