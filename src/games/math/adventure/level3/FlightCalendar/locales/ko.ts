import base from './base';

const ko = {
    ...base,
    title: '출발 달력',
    subtitle: '7단 마스터',
    description: '달력의 주를 채우며 7단을 연습해요.',
    question: '몇일 후에 떠나나요?',
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '생명 추가',
        doubleScore: '점수 2배'
    },
    a11y: {
        ladybug1: '무당벌레 1',
        ladybug2: '무당벌레 2',
        beetle: '풍뎅이',
        cloverDot: '클로버 자리 {{index}}'
    },
    ui: {
        tapEverySpotFirst: '정확한 횟수만큼 일요일 칸을 눌러요.'
    },
    weekdays: {
        mon: '월',
        tue: '화',
        wed: '수',
        thu: '목',
        fri: '금',
        sat: '토',
        sun: '일'
    },
    howToPlay: {
        step1: { title: '목표 확인', description: '목표 문제 7 × n을 확인해요.' },
        step2: { title: '달력 채우기', description: '일요일 칸을 누르면 1주가 채워져요.' },
        step3: { title: '정답 고르기', description: '출발까지 남은 날짜는?' }
    }
} as const;

export default ko;
