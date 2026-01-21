// Global Korean Locales
import fishingCountKo from '../../games/math/adventure/level1/FishingCount/locales/ko';
import roundCountingKo from '../../games/math/adventure/level1/RoundCounting/locales/ko';
import numberHiveKo from '../../games/math/adventure/level1/NumberHive/locales/ko';
import fruitSliceKo from '../../games/math/adventure/level1/FruitSlice/locales/ko';
import numberBalanceKo from '../../games/math/adventure/level1/NumberBalance/locales/ko';
import mathArcheryKo from '../../games/math/adventure/level1/MathArchery/locales/ko';
import frontAdditionKo from '../../games/math/genius/FrontAddition/locales/ko';
import frontSubtractionKo from '../../games/math/genius/FrontSubtraction/locales/ko';
import tenFrameCountKo from '../../games/math/adventure/level2/TenFrameCount/locales/ko';
import mathPinwheelKo from '../../games/math/adventure/level2/PinwheelPop/locales/ko';
import deepSeaDiveKo from '../../games/math/adventure/level2/DeepSeaDive/locales/ko';
import ufoInvasionKo from '../../games/math/adventure/level2/UFOInvasion/locales/ko';

import colorLinkKo from '../../games/brain/level1/ColorLink/locales/ko.ts';
import pairUpTwinKo from '../../games/brain/level1/PairUpTwin/locales/ko.ts';
import mazeEscapeKo from '../../games/brain/level1/MazeEscape/locales/ko.ts';
import wildLinkKo from '../../games/brain/level2/WildLink/locales/ko.ts';
import pairUpConnectKo from '../../games/brain/level2/PairUpConnect/locales/ko.ts';
import animalBanquetKo from '../../games/brain/level2/AnimalBanquet/locales/ko';
import signalHunterKo from '../../games/brain/level2/SignalHunter/locales/ko';
import mazeHunterKo from '../../games/brain/level2/MazeHunter/locales/ko';

export const ko = {
    profile: {
        title: '프로필',
        home: '홈으로',
        signedInAs: '로그인 계정',
        guestUser: '게스트 유저',
        status: {
            premium: '👑 프리미엄',
            free: '체험판',
            premiumLabel: '✨ 프리미엄 멤버',
            freeLabel: '🌱 무료 플랜',
        },
        upgradePrompt: '프리미엄 업그레이드',
        subscription: {
            quarterly: {
                title: '3개월 결제',
                desc: '지금 $3.99',
            },
            yearly: {
                title: '연간 결제',
                desc: '총 $12.00',
                badge: '최고의 선택',
            },
            unit: '/ 월',
            currency: 'USD',
        },
        cancelPolicy: '모든 플랜은 언제든 해지 가능합니다.',
        premiumActive: {
            title: '프리미엄 회원입니다!',
            desc: '후원해주셔서 감사합니다.',
        },
        myJelloBox: '마이 젤로 박스',
    },
    character: {
        profile: {
            level: 'Lv.{{level}}',
        },
        stats: {
            hunger: '포만감',
            happiness: '행복도',
            health: '건강',
            hygiene: '청결',
            fatigue: '피로',
            affection: '애정도',
        },
        species: {
            yellowJello: '옐로우 젤로',
            redJello: '레드 젤로',
            limeJello: '라임 젤로',
            mintJello: '민트 젤로',
            blueJello: '블루 젤로',
            creamJello: '크림 젤로',
            purpleJello: '퍼플 젤로',
            skyJello: '스카이 젤로',
            brownJello: '브라운 젤로',
            orangeJello: '오렌지 젤로',
            oliveJello: '올리브 젤로',
            cyanJello: '시안 젤로',
        },
        evolutions: {
            // Yellow Jello
            'Yellow Jello': '옐로우 젤로',
            'Golden Jello': '골든 젤로',
            'Sunlight Jello': '햇살 젤로',
            // Red Jello
            'Red Jello': '레드 젤로',
            'Ruby Jello': '루비 젤로',
            'Crimson Jello': '크림슨 젤로',
            // Lime Jello
            'Lime Jello': '라임 젤로',
            'Emerald Jello': '에메랄드 젤로',
            'Jade Jello': '제이드 젤로',
            // Mint Jello
            'Mint Jello': '민트 젤로',
            'Glacier Jello': '글레이셜 젤로',
            'Arctic Jello': '아틱 젤로',
            // Blue Jello
            'Blue Jello': '블루 젤로',
            'Sapphire Jello': '사파이어 젤로',
            'Ocean Jello': '오션 젤로',
            // Cream Jello
            'Cream Jello': '크림 젤로',
            'Whipped Cream Jello': '생크림 젤로',
            'Milky Pudding Jello': '우유푸딩 젤로',
            'Angel Cake Jello': '엔젤케익 젤로',
            'Celestial Cream Jello': '천상의 크림 젤로',
            // Pink Jello
            'Pink Jello': '핑크 젤로',
            'Heart Jello': '하트 젤로',
            'Cupid Jello': '큐피드 젤로',
            'Rose Angel Jello': '로즈엔젤 젤로',
            'Goddess of Love Jello': '사랑의 여신 젤로',
            // Purple Jello
            'Purple Jello': '퍼플 젤로',
            'Amethyst Jello': '아메지스트 젤로',
            'Royal Jello': '로얄 젤로',
            // Sky Jello
            'Sky Jello': '스카이 젤로',
            'Azure Jello': '아주르 젤로',
            'Heaven Jello': '헤븐 젤로',
            // Brown Jello
            'Brown Jello': '브라운 젤로',
            'Cocoa Jello': '코코아 젤로',
            'Chocolate Jello': '초콜릿 젤로',
            // Orange Jello
            'Orange Jello': '오렌지 젤로',
            'Tangerine Jello': '탠저린 젤로',
            'Sunset Jello': '선셋 젤로',
            // Olive Jello
            'Olive Jello': '올리브 젤로',
            'Moss Jello': '모스 젤로',
            'Forest Jello': '포레스트 젤로',
            // Cyan Jello
            'Cyan Jello': '시안 젤로',
            'Aqua Jello': '아쿠아 젤로',
            'Crystal Jello': '크리스탈 젤로',
        },
    },
    common: {
        startGame: '게임 시작',
        start: '시작',
        cancel: '취소',
        premium: '프리미엄',
        loading: '로딩 중...',
        confirm: '확인',
        close: '닫기',
        menu: '메뉴',
        score: '점수',
        lives: '생명',
        combo: '콤보',
        bestCombo: '최고 콤보',
        difficulty: '난이도',
        time: '시간',
        accuracy: '정확도',
        gameOver: '게임 오버!',
        finalScore: '최종 점수',
        bestScore: '최고 점수',
        previousBest: '이전 기록',
        newRecord: '신기록 달성!',
        playAgain: '다시 하기',
        download: '결과 저장',
        howToPlay: '게임 방법',
        results: '게임 결과',
        earnedXp: 'XP',
        earnedGro: 'Gro',
        yes: '예',
        no: '아니오',
        goHome: '홈으로 가기',
    },
    evolution: {
        title: '진화!',
        continue: '화면을 터치하세요',
    },
    graduation: {
        title: '안녕, 젤로!',
        message: "젤로가 다 자라서 더 넓은 세상으로 떠났어요! 🌍",
        action: "다음에 또 만나!",
    },
    food: {
        menu: {
            title: '먹이',
            close: '닫기',
        },
        categories: {
            fruit: '과일',
            vegetable: '채소',
            bakery: '베이커리',
            meal: '식사',
            snack: '간식',
            dessert: '디저트',
        },
        items: {
            // Fruits
            grapes: '포도',
            melon: '멜론',
            watermelon: '수박',
            tangerine: '귤',
            lemon: '레몬',
            lime: '라임',
            banana: '바나나',
            pineapple: '파인애플',
            mango: '망고',
            red_apple: '빨간 사과',
            green_apple: '초록 사과',
            pear: '배',
            peach: '복숭아',
            cherries: '체리',
            strawberry: '딸기',
            blueberries: '블루베리',
            kiwi_fruit: '키위',
            tomato: '토마토',
            olive: '올리브',
            coconut: '코코넛',

            // Vegetables
            avocado: '아보카도',
            eggplant: '가지',
            potato: '감자',
            carrot: '당근',
            ear_of_corn: '옥수수',
            hot_pepper: '고추',
            bell_pepper: '피망',
            cucumber: '오이',
            leafy_green: '쌈채소',
            broccoli: '브로콜리',
            garlic: '마늘',
            onion: '양파',
            peanuts: '땅콩',
            beans: '콩',
            chestnut: '밤',
            ginger: '생강',
            pea_pod: '완두콩',
            mushroom: '버섯',

            // Bakery
            bread: '식빵',
            croissant: '크루아상',
            baguette_bread: '바게트',
            flatbread: '플랫브레드',
            pretzel: '프레첼',
            bagel: '베이글',
            pancakes: '팬케이크',
            waffle: '와플',
            butter: '버터',
            cheese_wedge: '치즈',

            // Meals
            meat_on_bone: '고기',
            poultry_leg: '닭다리',
            cut_of_meat: '스테이크',
            bacon: '베이컨',
            hamburger: '햄버거',
            french_fries: '감자튀김',
            pizza: '피자',
            hot_dog: '핫도그',
            sandwich: '샌드위치',
            taco: '타코',
            burrito: '부리토',
            stuffed_flatbread: '케밥',
            falafel: '파라펠',
            egg: '달걀',
            cooking: '요리',
            curry_rice: '카레라이스',
            steaming_bowl: '우동',
            cooked_rice: '밥',
            pot_of_food: '찌개',
            shallow_pan_of_food: '파에야',

            // Snacks
            oden: '오뎅',
            rice_cracker: '쌀과자',
            rice_ball: '주먹밥',
            fried_shrimp: '새우튀김',
            fish_cake_with_swirl: '나루토마끼',
            dumpling: '만두',
            fortune_cookie: '포춘쿠키',
            moon_cake: '월병',
            takeout_box: '배달음식',
            popcorn: '팝콘',
            canned_food: '통조림',
            roasted_sweet_potato: '군고구마',
            tamale: '타말레',

            // Desserts
            soft_ice_cream: '소프트 아이스크림',
            shaved_ice: '빙수',
            ice_cream: '아이스크림',
            doughnut: '도넛',
            cookie: '쿠키',
            birthday_cake: '생일 케이크',
            shortcake: '조각 케이크',
            cupcake: '컵케이크',
            pie: '파이',
            chocolate_bar: '초콜릿',
            candy: '사탕',
            lollipop: '막대사탕',
            custard: '푸딩',
            honey_pot: '꿀단지',
        },
        effects: {
            hunger: '포만감',
            happiness: '행복도',
            health: '건강',
        },
    },
    medicine: {
        menu: {
            title: '치료',
        },
        items: {
            pill: '알약',
            syringe: '예방주사',
        },
    },
    shop: {
        menu: {
            title: '상점',
        },
        categories: {
            ground: '배경',
            house: '하우스',
        },
        items: {
            default_ground: '기본 마루',
            'default_ground.desc': '따스한 느낌의 기본 마루입니다.',
            tropical_ground: '열대 해변',
            'tropical_ground.desc': '햇살 가득한 파라다이스 해변입니다.',
            arctic_ground: '얼음 나라',
            'arctic_ground.desc': '차가운 얼음과 눈의 세상입니다.',
            volcanic_ground: '화산 지대',
            'volcanic_ground.desc': '용암이 흐르는 뜨거운 땅입니다.',
            desert_ground: '모래 사막',
            'desert_ground.desc': '끝없이 펼쳐진 모래 언덕입니다.',
            forest_ground: '깊은 숲',
            'forest_ground.desc': '푸르른 나무가 우거진 숲입니다.',
            night_city: '나이트 시티',
            'night_city.desc': '레트로 사이버펑크 감성의 도시입니다.',
            layout1_template: '기본 레이아웃',
            'layout1_template.desc': '표준형 레이아웃입니다.',
            shape_ground: '파스텔 광장',
            'shape_ground.desc': '부드럽고 꿈같은 파스텔 세상입니다.',
            sweet_ground: '달콤 나라',
            'sweet_ground.desc': '사탕과 과자가 가득한 맛있는 세상입니다.',

            // Houses
            tent: '텐트',
            'tent.desc': '아늑한 캠핑 텐트입니다.',
            old_house: '낡은 집',
            house: '일반 주택',
            garden_house: '정원 주택',
            building: '빌딩',
            hotel: '호텔',
            factory: '공장',
            circus: '서커스',
            stadium: '경기장',
            church: '교회',
            mosque: '모스크',
            hindu_temple: '힌두 사원',
            synagogue: '유대교 회당',
            greek_temple: '그리스 신전',
            kaaba: '카바 신전',
            japanese_castle: '일본 성',
            european_castle: '유럽 성',
        },
    },
    actions: {
        feed: '먹이',
        medicine: '치료',
        play: '놀이',
        clean: '청소',
        camera: '카메라',
        settings: '설정',
    },
    camera: {
        title: '스냅샷!',
        save: '저장',
        copyLink: '링크 복사',
        capturing: '촬영 중...',
    },
    share: {
        linkCopied: '링크 복사됨!',
        copyFailed: '복사 실패',
        invite: {
            title: '제가 키우는 젤로예요! 🥰',
            desc: '같이 키워보실래요?',
        },
        cta: '지금 플레이하기',
        error: {
            invalid: '유효하지 않은 링크입니다',
            missing: '데이터를 찾을 수 없습니다',
        },
    },
    sleep: {
        confirm: {
            sleepTitle: '재우기',
            sleepMessage: '젤로를 재우시겠어요? 💤\n(30분 동안 잠을 잡니다)',
            wakeTitle: '깨우기',
            wakeMessage: '젤로를 깨우시겠어요? 🌅',
        },
    },
    cleanMenu: {
        title: '청소 도구',
        broom: {
            name: '빗자루',
            effect: '똥 1개 청소',
        },
        newspaper: {
            name: '신문지',
            effect: '벌레 1마리 잡기',
        },
        shower: {
            name: '샤워기',
            effect: '상쾌하게 씻기',
        },
        robot_cleaner: {
            name: '로봇청소기',
            effect: '모두 청소하기',
        },
        toothbrush: {
            name: '칫솔',
            effect: '깨끗하게 양치',
        },
        max_stats: {
            name: '치트키',
            effect: '모든 상태 회복',
        },
    },
    emotions: {
        joy: {
            l1: {
                nice: '좋아',
                hehe: '헤헤',
                yay: '야호',
            },
            l2: {
                good: '좋아요!',
                fun: '신나요!',
                happy: '행복해!',
                haha: '하하!',
            },
            l3: {
                lol: 'ㅋㅋㅋ',
                hah: '하하',
                lmao: '대박!',
                omg_lol: '완전웃겨',
            },
        },
        love: {
            l1: {
                sweet: '달콤해',
                chu: '쪽',
                mwah: '움쪽',
            },
            l2: {
                kiss: '키스!',
                luv_u: '사랑해',
                warm: '따뜻해…',
            },
            l3: {
                love: '사랑해요!',
                wow: '와우!',
            },
        },
        playful: {
            l1: {
                yum: '냠냠!',
                heh: '헤헷~',
            },
            l2: {
                bleh: '메롱!',
                gotcha: '잡았다!',
            },
            l3: {
                crazy: '미쳐따!',
                blehhh: '베에에!',
                rich: '부자다!',
            },
        },
        neutral: {
            l1: {
                hm: '흠…',
                ellipsis: '…',
                dash: '--',
            },
            l2: {
                hmm: '흐음?',
                uhm: '음',
                meh: '별로...',
            },
            l3: {
                ugh: '윽',
                eek: '이런',
                zip: '쉿',
                uhh: '어..',
                sigh: '휴',
                shock: '!?',
                ok: '오케이',
                fine: '좋아',
            },
        },
        sleepy: {
            l1: {
                relax: '나른해…',
                tired: '피곤해…',
            },
            l2: {
                zzz: '쿨쿨',
                drool: '주륵…',
            },
            l3: {
                sleep: '졸려…',
                haaam: '하암…',
                exhaust: '지친다…',
            },
        },
        sick: {
            l1: {
                sniff: '훌쩍…',
                achoo: '에취!',
            },
            l2: {
                hot: '뜨거워…',
                ouch: '아야…',
                ugh: '으으…',
                hot2: '열나!!',
                cold: '추워!!',
            },
            l3: {
                blurgh: '우웩!',
                dizzy: '어지러워…',
                spin: '빙글빙글…',
                whoaa: '으악',
            },
        },
        worried: {
            l1: {
                huh: '어…',
                hmm: '음…',
                sad: '슬퍼…',
                oh: '아…',
                shock: '?!',
            },
            l2: {
                worried: '걱정돼…',
                whoa: '우와!',
                oh_no: '안돼',
                no: '싫어…',
                why: '왜…',
                scary: '무서워…',
                hmm: '음…',
                down: '우울해…',
            },
            l3: {
                nervous: '긴장돼!',
                please: '제발…',
                sniff: '훌쩍…',
                tears: '눈물…',
                waaah: '으앙!',
                aaaah: '아악!!',
                ugh: '으…',
                pain: '아파…',
                sigh: '에휴…',
                tired: '힘들어…',
                noo: '안돼…',
            },
        },
        angry: {
            l1: {
                hmph: '흥!',
            },
            l2: {
                grr: '으르렁…',
                angry: '화나!',
            },
            l3: {
                furious: '!!!',
            },
        },
    },
    abandonment: {
        danger: '관심이 필요해요!',
        critical: '위험한 상태입니다!',
        leaving: '곧 떠날 것 같아요!',
        abandoned: '젤로가 떠났습니다... ㅠㅠ',
    },
    settings: {
        title: '설정',
        sound: {
            title: '사운드',
            description: '소리 설정',
            bgm: '배경음악',
            sfx: '효과음',
            on: '켜기',
            off: '끄기',
        },
        language: {
            title: '언어',
            description: '언어 선택',
            selected: '선택됨',
        },
        admin: {
            title: '관리',
            gallery: '도감',
            stats: '통계',
        },
        cloudSave: '클라우드 저장',
        logout: '로그아웃',
        saveStatus: {
            idle: '클라우드 저장',
            saving: '저장 중...',
            success: '저장 완료!',
            error: '저장 실패',
            cooldown: '{{time}}초 대기',
        },
    },
    encyclopedia: {
        title: '마이 젤로 박스',
        home: '홈',
        species: '종족',
        stage: '단계 {{stage}}',
        hidden: '???',
    },
    auth: {
        login: {
            title: '반가워요!',
            subtitle: '로그인하고 젤로를 만나보세요 🐾',
            email: '이메일',
            emailPlaceholder: '이메일을 입력하세요',
            password: '비밀번호',
            passwordPlaceholder: '비밀번호를 입력하세요',
            action: '로그인 🔑',
            or: '또는',
            signup: '이메일로 회원가입',
            backToHome: '홈으로 돌아가기',
            google: 'Google로 로그인',
        },
        signup: {
            title: 'Grogro Jello 가입하기!',
            subtitle: '계정을 만들고 젤로를 키워보세요 🐣',
            emailLabel: '이메일 (ID)',
            emailPlaceholder: 'hello@example.com',
            nicknameLabel: '닉네임',
            nicknamePlaceholder: '젤로가 부를 별명...',
            passwordLabel: '비밀번호',
            passwordPlaceholder: '비밀번호 입력',
            confirmPasswordLabel: '비밀번호 확인',
            confirmPasswordPlaceholder: '한 번 더 입력',
            action: '가입하기 ✨',
            haveAccount: '이미 계정이 있으신가요?',
            loginLink: '로그인하기',
            backToLogin: '로그인으로 돌아가기',
            passwordMismatch: '비밀번호가 일치하지 않습니다! ❌',
            success: '가입 성공! 환영합니다! 🎉'
        },
        errors: {
            default: '로그인 실패! ❌',
            invalidCredential: '이메일 또는 비밀번호가 올바르지 않습니다.',
            tooManyRequests: '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
            googleFailed: 'Google 로그인 실패 ❌. 다시 시도해주세요.',
            emailInUse: '이미 가입된 이메일입니다.',
            weakPassword: '비밀번호는 6자리 이상이어야 합니다.',
            invalidEmail: '올바르지 않은 이메일 형식입니다.',
            registrationFailed: '가입 실패! ❌',
        }
    },
    play: {
        title: '놀이 & 학습',
        home: '홈',
        controls: {
            title: "같이 놀자!",
            expand: '펼치기',
            collapse: '접기',
            level: '레벨',
        },
        modes: {
            adventure: '어드벤처',
            genius: '지니어스',
        },
        sections: {
            funMath: {
                title: '펀매쓰',
                desc: '재미있는 수학 모험',
            },
            genius: {
                title: '지니어스 연산',
                desc: "천재들의 '비밀' 계산법",
            },
        },
        categories: {
            brain: '두뇌',
            math: '수학',
            science: '과학',
            sw: '코딩',
        },
        game: {
            playNow: '지금 플레이',
            noGames: '새로운 게임이 준비 중입니다!',
            unlock: {
                reason: '{{game}} 마스터 등급 달성 시 해금',
            },
        },
    },
    games: {
        'math-fishing-count': fishingCountKo,
        'math-round-counting': roundCountingKo,
        'math-number-hive': numberHiveKo,
        'math-fruit-slice': fruitSliceKo,
        'math-number-balance': numberBalanceKo,
        'math-archery': mathArcheryKo,
        frontAddition: frontAdditionKo,
        frontSubtraction: frontSubtractionKo,
        'ten-frame-count': tenFrameCountKo,
        'pinwheel-pop': mathPinwheelKo,
        'animal-banquet': animalBanquetKo,
        'deep-sea-dive': deepSeaDiveKo,
        'math-level2-ufo-invasion': ufoInvasionKo,

        'color-link': colorLinkKo,
        'pair-up-twin': pairUpTwinKo,
        'maze-escape': mazeEscapeKo,
        'wild-link': wildLinkKo,
        'pair-up-connect': pairUpConnectKo,
        'signal-hunter': signalHunterKo,
        'maze-hunter': mazeHunterKo,
        tags: {
            counting1to5: '1-5 수세기',
            sequence1to10: '수 순서',
            additionBasic: '덧셈 기초',
            partWhole: '가르기/모으기',
            operations1to10: '연산',
            grouping10s: '묶어 세기',
            additionApplied: '덧셈 응용',
            subtraction: '뺄셈',
            speedMath: '빠른 연산',
            frontAddition: '앞에서 더하기',
            frontSubtraction: '앞에서 빼기',
            spatial: '공간 지각',
            observation: '관찰력',
            categorization: '범주화',
            workingMemory: '작업 기억',
            association: '연상 논리',
            focusTiming: '집중력/타이밍',
        },
        mission: {
            challenge: '성공 도전! ({{current}}/{{total}})',
            challenge10: '도전! ({{current}}/{{total}})',
        },
    },
    train: {
        reward: {
            glo: 'GLO',
            dud: '꽭!',
            confirm: '확인',
        },
    },
} as const;

export default ko;
