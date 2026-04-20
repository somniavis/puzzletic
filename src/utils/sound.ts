/**
 * 사운드 재생 유틸리티
 * Cloudflare R2에서 호스팅되는 사운드 파일을 재생합니다.
 *
 * 최적화:
 * - Audio Pool: Audio 객체를 재사용하여 메모리 효율성 향상
 * - Preload: 앱 시작 시 사운드 미리 로드
 * - 즉시 재생: 캐시된 Audio 객체로 지연 없이 재생
 * - Mobile Optimized: iOS/Android에서 터치 시 즉시 재생 가능
 */

const SOUND_BASE_URL = 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/sound';

const sfxGateTimestamps = new Map<string, number>();

const shouldAllowSfx = (gateKey: string, minIntervalMs: number): boolean => {
  if (minIntervalMs <= 0) return true;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const lastPlayedAt = sfxGateTimestamps.get(gateKey) ?? -Infinity;
  if (now - lastPlayedAt < minIntervalMs) {
    return false;
  }
  sfxGateTimestamps.set(gateKey, now);
  return true;
};

export const SOUNDS = {
  buttonClick: `${SOUND_BASE_URL}/game%20sound/button_sound1.mp3`,
  jelloClick1: `${SOUND_BASE_URL}/jellosound/jellosound-1.mp3`,
  jelloClick2: `${SOUND_BASE_URL}/jellosound/jellosound-2.mp3`,
  jelloClick3: `${SOUND_BASE_URL}/jellosound/jellosound-3.mp3`,
  eating: `${SOUND_BASE_URL}/game%20sound/eating_sound1.mp3`,
  cleaning: `${SOUND_BASE_URL}/game%20sound/cleaning-sound1.mp3`,
  backgroundMusic: `${SOUND_BASE_URL}/game%20sound/background_bgm1.mp3`,
  playBackgroundMusic: `${SOUND_BASE_URL}/game%20sound/play_bgm2.mp3`,
} as const;

/**
 * BGM 활성화 상태를 확인하는 함수
 */
const isBgmEnabled = (): boolean => {
  const settings = localStorage.getItem('puzzleletic_sound_settings');
  if (settings) {
    try {
      const parsed = JSON.parse(settings);
      return parsed.bgmEnabled !== false; // 기본값 true
    } catch (e) {
      return true;
    }
  }
  return true; // 기본값 true
};

/**
 * SFX 활성화 상태를 확인하는 함수
 */
const isSfxEnabled = (): boolean => {
  const settings = localStorage.getItem('puzzleletic_sound_settings');
  if (settings) {
    try {
      const parsed = JSON.parse(settings);
      return parsed.sfxEnabled !== false; // 기본값 true
    } catch (e) {
      return true;
    }
  }
  return true; // 기본값 true
};

/**
 * Audio Pool: 각 사운드마다 여러 개의 Audio 인스턴스를 관리
 * 동시에 같은 사운드를 여러 번 재생할 수 있도록 풀 방식 사용
 * 모바일 최적화: load() 메서드로 버퍼 준비 + Touch Unlock
 */
class SoundManager {
  private audioPool: Map<string, HTMLAudioElement[]> = new Map();
  private poolSize: number = 3; // 각 사운드당 최대 3개 인스턴스
  private preloadComplete: Set<string> = new Set();
  private isUnlocked: boolean = false; // 모바일 오디오 컨텍스트 활성화 여부
  private bgmAudio: HTMLAudioElement | null = null; // 배경음 전용 인스턴스
  private currentBgmUrl: string | null = null;
  private unlockInProgress: boolean = false;
  private silentUnlockAudio: HTMLAudioElement | null = null;

  constructor() {
    // 모바일에서 첫 터치 시 오디오 컨텍스트 활성화
    this.setupTouchUnlock();
  }

  /**
   * 모바일 오디오 컨텍스트 활성화 (Touch Unlock)
   * iOS/Android에서는 사용자 제스처 후에만 오디오 재생 가능
   */
  private setupTouchUnlock(): void {
    const removeUnlockListeners = (handler: () => void) => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('touchend', handler);
      document.removeEventListener('click', handler);
      document.removeEventListener('pointerdown', handler);
    };

    const unlockAudio = () => {
      if (this.isUnlocked || this.unlockInProgress) return;
      this.unlockInProgress = true;

      // 무음 오디오는 1회 생성 후 재사용 (WebMediaPlayer 누적 방지)
      if (!this.silentUnlockAudio) {
        this.silentUnlockAudio = new Audio();
        this.silentUnlockAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4TnXXFTAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZDQP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
        this.silentUnlockAudio.volume = 0;
        this.silentUnlockAudio.preload = 'auto';
      }

      this.silentUnlockAudio.currentTime = 0;
      this.silentUnlockAudio.play().then(() => {
        this.isUnlocked = true;
        this.unlockInProgress = false;
        console.log('🔓 Mobile audio context unlocked');
        removeUnlockListeners(unlockAudio);

        // BGM도 함께 시작 시도
        if (this.bgmAudio && isBgmEnabled()) {
          this.playBgm();
        }

        // Unlock 완료 후 무음 오디오 해제
        if (this.silentUnlockAudio) {
          this.silentUnlockAudio.pause();
          this.silentUnlockAudio.src = '';
          this.silentUnlockAudio.load();
          this.silentUnlockAudio = null;
        }
      }).catch(() => {
        // 실패하면 리스너를 유지해서 다음 사용자 제스처에서 재시도
        this.unlockInProgress = false;
      });
    };

    // 다양한 이벤트에 리스너 등록
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('touchend', unlockAudio);
    document.addEventListener('click', unlockAudio);
    document.addEventListener('pointerdown', unlockAudio);
  }

  /**
   * 사운드 프리로드
   * loadeddata 이벤트 사용으로 더 빠른 준비 완료
   */
  async preload(soundUrl: string): Promise<void> {
    if (this.preloadComplete.has(soundUrl)) {
      return;
    }

    // Optimistically mark as complete to prevent race conditions (double loading)
    this.preloadComplete.add(soundUrl);

    const pool: HTMLAudioElement[] = [];

    for (let i = 0; i < this.poolSize; i++) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = soundUrl;

      // Mobile optimization: start loading immediately
      audio.load();

      // loadeddata is faster than canplaythrough
      await new Promise<void>((resolve) => {
        audio.addEventListener('loadeddata', () => resolve(), { once: true });
        audio.addEventListener('error', () => {
          console.warn(`Failed to preload sound: ${soundUrl}`);
          // Keep it in complete set to prevent endless retries
          resolve();
        }, { once: true });

        // Timeout fallback
        setTimeout(() => resolve(), 3000);
      });

      pool.push(audio);

    }

    this.audioPool.set(soundUrl, pool);
    console.log(`✅ Preloaded sound: ${soundUrl}`);
  }

  /**
   * 재생 가능한 Audio 인스턴스 찾기 또는 생성
   */
  private getAvailableAudio(soundUrl: string): HTMLAudioElement {
    const pool = this.audioPool.get(soundUrl);

    if (!pool || pool.length === 0) {
      // 프리로드되지 않았으면 즉시 생성
      console.warn(`Sound not preloaded: ${soundUrl}, creating on-demand`);
      return new Audio(soundUrl);
    }

    // 재생 중이 아닌 인스턴스 찾기
    const available = pool.find(audio => audio.paused);

    if (available) {
      return available;
    }

    // 모두 재생 중이면 가장 먼저 시작된 것을 중단하고 재사용
    const oldest = pool[0];
    oldest.pause();
    oldest.currentTime = 0;
    return oldest;
  }

  /**
   * 사운드 재생
   * 최적화: 불필요한 체크 제거로 즉시 재생
   */
  play(soundUrl: string, volume: number = 0.5): void {
    try {
      const audio = this.getAvailableAudio(soundUrl);
      audio.volume = Math.max(0, Math.min(1, volume));

      // 재생 중인 오디오만 초기화 (이미 정지된 오디오는 currentTime이 0)
      if (!audio.paused) {
        audio.currentTime = 0;
      }

      // 프리로드된 오디오는 바로 재생 (readyState 체크 제거)
      audio.play().catch((error) => {
        console.warn('Sound playback failed:', error);
        // 사용자 인터랙션 전에는 자동재생이 차단될 수 있음
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  /**
   * 사운드 풀을 무음으로 프라임 (iOS Safari 대응)
   * 실제 들리는 소리 없이 해당 오디오 채널 재생 가능 상태를 준비한다.
   */
  primeSilently(soundUrls: string[]): void {
    try {
      soundUrls.forEach((soundUrl) => {
        const audio = this.getAvailableAudio(soundUrl);
        const prevVolume = audio.volume;
        audio.muted = true;
        audio.volume = 0;
        if (!audio.paused) {
          audio.currentTime = 0;
        }

        const restore = () => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
          audio.volume = prevVolume;
        };

        audio.play().then(restore).catch(() => {
          audio.muted = false;
          audio.volume = prevVolume;
        });
      });
    } catch (error) {
      console.warn('Silent prime failed:', error);
    }
  }

  /**
   * 모든 사운드 프리로드
   */
  async preloadAll(): Promise<void> {
    const soundUrls = Object.values(SOUNDS);
    console.log('🔊 Preloading sounds...');

    await Promise.all(
      soundUrls.map(url => this.preload(url))
    );

    console.log('🎵 All sounds preloaded!');
  }

  /**
   * 배경음악 초기화 및 프리로드
   */
  async initBgm(soundUrl: string = SOUNDS.backgroundMusic): Promise<void> {
    if (this.bgmAudio && this.currentBgmUrl === soundUrl) return;

    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.src = '';
      this.bgmAudio.load();
    }

    this.bgmAudio = new Audio(soundUrl);
    this.currentBgmUrl = soundUrl;
    this.bgmAudio.loop = true; // 무한 반복
    this.bgmAudio.volume = 0.3; // 배경음은 조금 작게
    this.bgmAudio.preload = 'auto';

    await new Promise<void>((resolve) => {
      this.bgmAudio!.addEventListener('loadeddata', () => resolve(), { once: true });
      this.bgmAudio!.addEventListener('error', () => {
        console.warn('Failed to preload background music');
        resolve();
      }, { once: true });
      setTimeout(() => resolve(), 3000);
    });

    console.log('✅ Background music initialized');
  }

  /**
   * 배경음악 재생
   */
  playBgm(): void {
    if (!this.bgmAudio) {
      console.warn('Background music not initialized');
      return;
    }

    this.bgmAudio.play().catch((error) => {
      // 자동 재생 정책으로 인한 에러는 경고가 아닌 정보로 로그
      if (error.name === 'NotAllowedError') {
        console.log('🔇 BGM waiting for user interaction...');
      } else {
        console.warn('Background music playback failed:', error);
      }
    });
  }

  /**
   * 배경음악 정지
   */
  pauseBgm(): void {
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.pause();
    }
  }

  /**
   * 배경음악 볼륨 설정
   */
  setBgmVolume(volume: number): void {
    if (this.bgmAudio) {
      this.bgmAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

// 싱글톤 인스턴스
const soundManager = new SoundManager();

/**
 * 앱 시작 시 모든 사운드 프리로드
 * 컴포넌트에서 호출하거나 App.tsx에서 초기화 시 호출
 */
export const preloadSounds = async (): Promise<void> => {
  await soundManager.preloadAll();
  await soundManager.initBgm();
};

/**
 * 사운드를 재생합니다.
 * @param soundUrl 재생할 사운드 URL
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playSound = (soundUrl: string, volume: number = 0.5): void => {
  if (!isSfxEnabled()) return;
  soundManager.play(soundUrl, volume);
};

/**
 * 버튼 클릭 사운드를 재생합니다.
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playButtonSound = (volume: number = 0.5): void => {
  if (!isSfxEnabled()) return;
  if (!shouldAllowSfx('button', 60)) return;
  soundManager.play(SOUNDS.buttonClick, volume);
};

/**
 * 젤로 클릭 사운드를 랜덤하게 재생합니다.
 * jellosound-1.mp3, jellosound-2.mp3, jellosound-3.mp3 중 하나를 랜덤하게 재생
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playJelloClickSound = (volume: number = 0.5): void => {
  if (!isSfxEnabled()) return;
  if (!shouldAllowSfx('jello-click', 140)) return;
  const jelloSounds = [SOUNDS.jelloClick1, SOUNDS.jelloClick2, SOUNDS.jelloClick3];
  const randomSound = jelloSounds[Math.floor(Math.random() * jelloSounds.length)];
  soundManager.play(randomSound, volume);
};

/**
 * 먹기 사운드를 재생합니다.
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playEatingSound = (volume: number = 0.5): void => {
  if (!isSfxEnabled()) return;
  if (!shouldAllowSfx('eating', 120)) return;
  soundManager.play(SOUNDS.eating, volume);
};

/**
 * 청소 사운드를 재생합니다.
 * 똥치우기 또는 벌레 잡기 시 사용됩니다.
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playCleaningSound = (volume: number = 0.5): void => {
  if (!isSfxEnabled()) return;
  if (!shouldAllowSfx('cleaning', 100)) return;
  soundManager.play(SOUNDS.cleaning, volume);
};

/**
 * 클리어 사운드를 재생합니다.
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playClearSound = (volume: number = 0.5): void => {
  if (!isSfxEnabled()) return;
  if (!shouldAllowSfx('clear', 180)) return;
  // Using cleaning sound as clear sound for now
  soundManager.play(SOUNDS.cleaning, volume);
};

/**
 * 배경음악을 재생합니다.
 * 설정에서 BGM이 활성화된 경우에만 재생됩니다.
 */
export const startBackgroundMusic = async (soundUrl: string = SOUNDS.backgroundMusic): Promise<void> => {
  if (isBgmEnabled()) {
    try {
      await soundManager.initBgm(soundUrl);
      soundManager.playBgm();
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.log('🔇 Audio autoplay blocked. Waiting for user interaction...');
      } else {
        console.error('Failed to start background music:', error);
      }
    }
  }
};

/**
 * 배경음악을 정지합니다.
 */
export const stopBackgroundMusic = (): void => {
  soundManager.pauseBgm();
};

/**
 * 배경음악 볼륨을 설정합니다.
 * @param volume 볼륨 (0.0 ~ 1.0)
 */
export const setBackgroundMusicVolume = (volume: number): void => {
  soundManager.setBgmVolume(volume);
};

export const startPlayBackgroundMusic = async (): Promise<void> => {
  await startBackgroundMusic(SOUNDS.playBackgroundMusic);
};

/**
 * 퐁당/물소리 사운드를 재생합니다. (임시로 eating 사운드 사용)
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playPlopSound = (volume: number = 0.5): void => {
  if (!isSfxEnabled()) return;
  if (!shouldAllowSfx('plop', 120)) return;
  // TODO: Add specific plop sound to SOUNDS
  soundManager.play(SOUNDS.eating, volume);
};

/**
 * 피드백 SFX(정답/오답) 채널을 무음으로 프라임합니다.
 * iOS Safari에서 첫 제스처 시 호출하면 이후 판정 사운드 누락을 줄일 수 있습니다.
 */
export const primeFeedbackSoundsSilently = (): void => {
  soundManager.primeSilently([
    SOUNDS.cleaning,
    SOUNDS.jelloClick1,
    SOUNDS.jelloClick2,
    SOUNDS.jelloClick3,
  ]);
};
