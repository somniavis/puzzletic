export default {
    title: '빙글빙글 찾기',
    subtitle: '움직이는 목표를 잡아라!',
    description: '그림들이 자리를 바꿔요! 목표 그림을 빠르게 찾아주세요.',
    howToPlay: {
        step1: { title: '몇 개 찾을까?', description: '먼저 목표 개수를 확인해요.' },
        step2: { title: '빠르게 탭!', description: '같은 그림을 빠르게 눌러요.' },
        step3: { title: '누를 때마다 셔플', description: '섞여도 끝까지 찾아요.' }
    },
    ui: {
        clinks: '클릭해요!',
        ready: '준비'
    },
    target: '{{count}}개의 {{emoji}} 찾기',
    shuffleMessage: '섞는 중!',
    powerups: {
        freeze: '시간 멈춤!',
        life: '생명 추가!',
        double: '점수 2배!'
    }
};
