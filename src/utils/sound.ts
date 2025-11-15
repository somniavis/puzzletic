/**
 * 사운드 재생 유틸리티
 * Cloudflare R2에서 호스팅되는 사운드 파일을 재생합니다.
 *
 * 최적화:
 * - Audio Pool: Audio 객체를 재사용하여 메모리 효율성 향상
 * - Preload: 앱 시작 시 사운드 미리 로드
 * - 즉시 재생: 캐시된 Audio 객체로 지연 없이 재생
 */

const SOUND_BASE_URL = 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/sound';

export const SOUNDS = {
  buttonClick: `${SOUND_BASE_URL}/game%20sound/button-sound1.mp3`,
  jelloClick1: `${SOUND_BASE_URL}/jellosound/jellosound-1.mp3`,
  jelloClick2: `${SOUND_BASE_URL}/jellosound/jellosound-2.mp3`,
} as const;

/**
 * Audio Pool: 각 사운드마다 여러 개의 Audio 인스턴스를 관리
 * 동시에 같은 사운드를 여러 번 재생할 수 있도록 풀 방식 사용
 */
class SoundManager {
  private audioPool: Map<string, HTMLAudioElement[]> = new Map();
  private poolSize: number = 3; // 각 사운드당 최대 3개 인스턴스
  private preloadComplete: Set<string> = new Set();

  /**
   * 사운드 프리로드
   */
  async preload(soundUrl: string): Promise<void> {
    if (this.preloadComplete.has(soundUrl)) {
      return;
    }

    const pool: HTMLAudioElement[] = [];

    for (let i = 0; i < this.poolSize; i++) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = soundUrl;

      // 로드 완료 대기
      await new Promise<void>((resolve) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', () => {
          console.warn(`Failed to preload sound: ${soundUrl}`);
          resolve(); // 실패해도 계속 진행
        }, { once: true });
      });

      pool.push(audio);
    }

    this.audioPool.set(soundUrl, pool);
    this.preloadComplete.add(soundUrl);
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
   */
  play(soundUrl: string, volume: number = 0.5): void {
    try {
      const audio = this.getAvailableAudio(soundUrl);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.currentTime = 0; // 처음부터 재생

      audio.play().catch((error) => {
        console.warn('Sound playback failed:', error);
        // 사용자 인터랙션 전에는 자동재생이 차단될 수 있음
      });
    } catch (error) {
      console.error('Error playing sound:', error);
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
}

// 싱글톤 인스턴스
const soundManager = new SoundManager();

/**
 * 앱 시작 시 모든 사운드 프리로드
 * 컴포넌트에서 호출하거나 App.tsx에서 초기화 시 호출
 */
export const preloadSounds = async (): Promise<void> => {
  await soundManager.preloadAll();
};

/**
 * 사운드를 재생합니다.
 * @param soundUrl 재생할 사운드 URL
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playSound = (soundUrl: string, volume: number = 0.5): void => {
  soundManager.play(soundUrl, volume);
};

/**
 * 버튼 클릭 사운드를 재생합니다.
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playButtonSound = (volume: number = 0.5): void => {
  soundManager.play(SOUNDS.buttonClick, volume);
};

/**
 * 젤로 클릭 사운드를 랜덤하게 재생합니다.
 * jellosound-1.mp3 또는 jellosound-2.mp3 중 하나를 랜덤하게 재생
 * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playJelloClickSound = (volume: number = 0.5): void => {
  const jelloSounds = [SOUNDS.jelloClick1, SOUNDS.jelloClick2];
  const randomSound = jelloSounds[Math.floor(Math.random() * jelloSounds.length)];
  soundManager.play(randomSound, volume);
};
