export default {
    title: '빙글빙글 찾기',
    subtitle: '움직이는 목표를 잡아라!',
    description: '그림들이 자리를 바꿔요! 목표 그림을 빠르게 찾아주세요.',
    howToPlay: {
        step1: { title: '몇 개 찾을까?', description: '목표 개수를 먼저 봐요' },
        step2: { title: '빠르게 찾기', description: '같은 그림을 바로 눌러요' },
        step3: { title: '끝까지 찾기', description: '섞여도 모두 찾으면 성공' }
    },
    target: '{{count}}개의 {{emoji}} 찾기',
    shuffleMessage: '섞는 중!',
    powerups: {
        freeze: '시간 멈춤!',
        life: '생명 추가!',
        double: '점수 2배!'
    }
};
