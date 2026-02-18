const omokKo = {
    title: '오목',
    subtitle: '다섯 알 잇기',
    description: 'AI를 상대로 돌 5개를 먼저 연결해보세요!',
    howToPlay: {
        step1: {
            title: '돌 놓기',
            description: '교차점을 눌러 돌을 놓아요.'
        },
        step2: {
            title: 'AI 막기',
            description: 'AI의 5목을 먼저 막아요.'
        },
        step3: {
            title: '5알 완성',
            description: '먼저 5알을 잇으면 승리!'
        }
    },
    status: {
        playerTurn: '나의 턴',
        aiTurn: 'AI가 생각 중입니다...',
        win: '승리!',
        lose: '패배...',
        draw: '무승부!'
    },
    ui: {
        guideHint: 'AI보다 먼저 5알을 연결해요!'
    }
};

export default omokKo;
