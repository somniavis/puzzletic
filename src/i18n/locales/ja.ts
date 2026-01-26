// Game Locales - Updated
import fishingCountJa from '../../games/math/adventure/level1/FishingCount/locales/ja';
import roundCountingJa from '../../games/math/adventure/level1/RoundCounting/locales/ja';
import numberHiveJa from '../../games/math/adventure/level1/NumberHive/locales/ja';
import fruitSliceJa from '../../games/math/adventure/level1/FruitSlice/locales/ja';
import numberBalanceJa from '../../games/math/adventure/level1/NumberBalance/locales/ja';
import mathArcheryJa from '../../games/math/adventure/level1/MathArchery/locales/ja';
import frontAdditionJa from '../../games/math/genius/FrontAddition/locales/ja';
import frontSubtractionJa from '../../games/math/genius/FrontSubtraction/locales/ja';
import backMultiplicationJa from '../../games/math/genius/BackMultiplication/locales/ja';
import tenFrameCountJa from '../../games/math/adventure/level2/TenFrameCount/locales/ja';
import mathPinwheelJa from '../../games/math/adventure/level2/PinwheelPop/locales/ja';
import deepSeaDiveJa from '../../games/math/adventure/level2/DeepSeaDive/locales/ja';
import ufoInvasionJa from '../../games/math/adventure/level2/UFOInvasion/locales/ja';

import colorLinkJa from '../../games/brain/level1/ColorLink/locales/ja';
import pairUpTwinJa from '../../games/brain/level1/PairUpTwin/locales/ja';
import mazeEscapeJa from '../../games/brain/level1/MazeEscape/locales/ja';
import wildLinkJa from '../../games/brain/level2/WildLink/locales/ja';
import pairUpConnectJa from '../../games/brain/level2/PairUpConnect/locales/ja';
import animalBanquetJa from '../../games/brain/level2/AnimalBanquet/locales/ja';
import signalHunterJa from '../../games/brain/level2/SignalHunter/locales/ja';
import mazeHunterJa from '../../games/brain/level2/MazeHunter/locales/ja';
import ticTacToeJa from '../../games/brain/level3/TicTacToe/locales/ja';
import omokJa from '../../games/brain/level3/Omok/locales/ja';



export const ja = {
    profile: {
        title: 'プロフィール',
        home: 'ホーム',
        signedInAs: 'ログイン中',
        guestUser: 'ゲスト',
        status: {
            premium: '👑 プレミアム',
            free: 'トライアル',
            premiumLabel: '✨ プレミアム会員',
            freeLabel: '🌱 無料プラン',
        },
        upgradePrompt: 'プレミアムにアップグレード',
        subscription: {
            quarterly: {
                title: '3ヶ月払い',
                desc: '現在 $3.99',
            },
            yearly: {
                title: '年払い',
                desc: '合計 $12.00',
                badge: 'おすすめ',
            },
            unit: '/ 月',
            currency: 'USD',
        },
        cancelPolicy: 'プランはいつでもキャンセル可能です。',
        premiumActive: {
            title: 'プレミアム会員です！',
            desc: 'サポートありがとうございます。',
        },
        myJelloBox: 'マイジェロ図鑑',
    },
    character: {
        profile: {
            level: 'Lv.{{level}}',
        },
        stats: {
            hunger: '満腹度',
            happiness: '幸福度',
            health: '健康',
            hygiene: '清潔',
            fatigue: '疲労',
            affection: '愛情',
        },
        tags: {
            defense: '防御',
            honey_wood: '蜂蜜/木',
            attack: '攻撃力',
            fire_flame: '火/炎',
            magic: '魔法',
            poison_curse: '毒/呪い',
            sleep: '睡眠',
            illusion_cottoncandy: '幻想/綿あめ',
            hp: '体力',
            vitality_buff: '活力/バフ',
            heal: '治癒',
            purification_plant: '浄化/植物',
            bind: '束縛',
            stability_normal: '安定/ノーマル',
            speed: '速度',
            flexibility_water: '柔軟/水',
        },
        species: {
            yellowJello: 'イエロージェロ',
            redJello: 'レッドジェロ',
            limeJello: 'ライムジェロ',
            mintJello: 'ミントジェロ',
            blueJello: 'ブルージェロ',
            creamJello: 'クリームジェロ',
            pinkJello: 'ピンクジェロ',
            purpleJello: 'パープルジェロ',
            skyJello: 'スカイジェロ',
            brownJello: 'ブラウンジェロ',
            orangeJello: 'オレンジジェロ',
            oliveJello: 'オリーブジェロ',
            cyanJello: 'シアンジェロ',
        },
        evolutions: {
            // Yellow Jello
            yellowJello_stage1_name: 'イエロージェロ',
            yellowJello_stage1_desc: '甘い香りがするゼリー。森の小さな水滴のような姿をしています。',
            yellowJello_stage2_name: 'トゥウィグロ',
            yellowJello_stage2_desc: '頭に小さな木の枝が生えました。枝から流れる甘い樹液で虫たちを引き寄せます。',
            yellowJello_stage3_name: 'ヴァインジェル',
            yellowJello_stage3_desc: '丈夫なツルで体を覆い、防御力が高いです。ツルの間の粘り気のある蜜で敵を動けなくします。',
            yellowJello_stage4_name: 'ハニーブルーム',
            yellowJello_stage4_desc: '体に花が咲き、手足が生えました。親友のミツバチと一緒に旅をし、ハチミツを分け合って体力を回復します。',
            yellowJello_stage5_name: 'アルボロス',
            yellowJello_stage5_desc: '巨大な森の守護竜です。葉っぱの翼で飛行し、尻尾の花から放つ「ハニーブレス」で敵を眠らせます。',

            // Red Jello
            redJello_stage1_name: 'レッドジェロ',
            redJello_stage1_desc: '触ると熱気を感じるゼリー。怒ると赤色が濃くなり、周囲が暑くなります。',
            redJello_stage2_name: 'デビレット',
            redJello_stage2_desc: '頭に可愛らしい赤い角が生えました。角でつつくイタズラが好きで、怒ると火花が散ります。',
            redJello_stage3_name: 'インプジェル',
            redJello_stage3_desc: 'コウモリの翼で素早く飛び回ります。意地悪なイタズラをして逃げますが、キャンディをあげると大人しくなります。',
            redJello_stage4_name: 'パイロン',
            redJello_stage4_desc: '尻尾に消えない炎が燃えています。口から火を吹くことができ、弱い友達を率先して守ります。',
            redJello_stage5_name: 'インフェルノス',
            redJello_stage5_desc: 'マグマが流れる地獄の君主です。溢れ出る破壊力を制御するために自らを鎖で縛った「誓い」の化身です。',

            // Mint Jello
            mintJello_stage1_name: 'ミントジェロ',
            mintJello_stage1_desc: '触るとひんやりした清涼感があるゼリー。清らかな露を食べて育ち、爽やかなハーブの香りを残します。',
            mintJello_stage2_name: 'リーフロ',
            mintJello_stage2_desc: '頭に可愛い芽が生えました。綺麗な水と日光が好きで、日当たりの良い場所を探し回ります。',
            mintJello_stage3_name: 'ブルームミント',
            mintJello_stage3_desc: '芽が育って綺麗な花を咲かせました。葉っぱをパタパタさせて周囲の空気を浄化し、友達に休息を与えます。',
            mintJello_stage4_name: 'フェアリーリーフ',
            mintJello_stage4_desc: '大きな葉っぱの翼で森を飛び回ります。枯れかけた植物の近くに行くと、再び蘇らせる能力があります。',
            mintJello_stage5_name: 'ヴェルダントス',
            mintJello_stage5_desc: '自然の生命力を纏った森の守護竜です。羽ばたきで「治癒の風」を起こし、広い地域を同時に回復させます。',

            // Blue Jello
            blueJello_stage1_name: 'ブルージェロ',
            blueJello_stage1_desc: '深い海水のように透明で冷たいゼリー。表情の変化がほとんどなく、水のように柔軟に状況に対処します。',
            blueJello_stage2_name: 'フィンジェル',
            blueJello_stage2_desc: '頭に素早いサメの背びれが生えました。水中では非常に速く、危機が迫ると瞬時に逃げます。',
            blueJello_stage3_name: 'コラリン',
            blueJello_stage3_desc: '体に色とりどりのサンゴ礁の飾りがつきました。エラ呼吸が可能で、水圧に耐えられるほど体が硬いです。',
            blueJello_stage4_name: 'ハイドロ',
            blueJello_stage4_desc: 'ヒレの翼が生え、口から「ウォーターキャノン」を発射します。深い水の底で瞑想することを楽しんでいます。',
            blueJello_stage5_name: 'オケアノス',
            blueJello_stage5_desc: '海を支配する水竜です。透明に輝く鱗を持ち、怒ると巨大な津波を引き起こします。',

            // Cream Jello
            creamJello_stage1_name: 'クリームジェロ',
            creamJello_stage1_desc: '焼きたてのパンの匂いがする温かいゼリー。性格がのんびりしていて、日当たりの良い場所で溶けたように眠ります。',
            creamJello_stage2_name: 'ミューロ',
            creamJello_stage2_desc: '頭に猫耳が生えました。聴覚が鋭く、おやつの袋の音が聞こえるだけで寝ていても飛び起きます。',
            creamJello_stage3_name: 'ウィスケル',
            creamJello_stage3_desc: 'ヒゲと長い尻尾が生え、完璧な「香箱座り」が可能です。狭い箱が好きで、しつこくすると尻尾で床を叩きます。',
            creamJello_stage4_name: 'キーパー',
            creamJello_stage4_desc: '動くのさえ面倒になり、その場で「香箱座り」を維持します。頭の魚と尻尾の毛糸玉は、触ると威嚇するほど大切な宝物です。',
            creamJello_stage5_name: 'フェリノス',
            creamJello_stage5_desc: '優雅な猫人のドラゴンです。翼の肉球模様は敵を油断させ、強力な「ニャンニャンパンチ」を放ちます。',

            // Pink Jello
            pinkJello_stage1_name: 'ピンクジェロ',
            pinkJello_stage1_desc: 'イチゴの香りがするピンク色のゼリー。気分が良いと体が膨らみ、甘い匂いを漂わせます。',
            pinkJello_stage2_name: 'ロリジェル',
            pinkJello_stage2_desc: '頭にペロペロキャンディのアンテナが生えました。落ち込んでいる友達を見つけるとアンテナを振って慰めます。',
            pinkJello_stage3_name: 'トゥインジェル',
            pinkJello_stage3_desc: '体に金平糖の飾りがつき、キラキラしています。動くたびに澄んだ弾けるような音がします。',
            pinkJello_stage4_name: 'コットンパフ',
            pinkJello_stage4_desc: 'ふわふわの綿あめ雲をつけてプカプカ浮かんでいます。綿あめの中に美味しいおやつを隠し持っています。',
            pinkJello_stage5_name: 'キャンディオス',
            pinkJello_stage5_desc: '綿あめの翼を持つ幻想のドラゴンです。通り過ぎた場所に撒く甘い粉は、敵を深く幸せな眠りに落とします。',

            // Purple Jello
            purpleJello_stage1_name: 'パープルジェロ',
            purpleJello_stage1_desc: '夜になると体から光が出るゼリー。正体不明の言葉で呪文を唱えるような音を出します。',
            purpleJello_stage2_name: 'ウィスパー',
            purpleJello_stage2_desc: '尻尾に鬼火(Wisp)が生えました。この光で霊たちと会話をし、暗い道を照らします。',
            purpleJello_stage3_name: 'ルーンインプ',
            purpleJello_stage3_desc: '額に古代文字が刻まれた一本角が生えました。尻尾の光を囮にして敵を誘い出し、混乱させます。',
            purpleJello_stage4_name: 'スペルバウンド',
            purpleJello_stage4_desc: '魔力を制御するために全身をお札の帯で巻きました。親友の骸骨(Skull)が背後を監視してくれます。',
            purpleJello_stage5_name: 'アルカニオス',
            purpleJello_stage5_desc: '封印が解かれた古代魔法のドラゴンです。羽ばたきだけで広範囲の呪いや祝福を下す、あの世の案内人です。',

            // Orange Jello
            orangeJello_stage1_name: 'オレンジジェロ',
            orangeJello_stage1_desc: '搾りたてのジュースのように爽やかな香りがするゼリー。弾力が良く、ボールのようにポンポン跳ねるのが好きです。',
            orangeJello_stage2_name: 'マンダポップ',
            orangeJello_stage2_desc: '頭にミカンの粒のような耳が生えました。気分が良いと炭酸のような気泡が上がり、転がるのが得意です。',
            orangeJello_stage3_name: 'シトピックス',
            orangeJello_stage3_desc: '頭に芽と小さな翼が生えました。日光を浴びると光合成をして、周囲に爽やかな元気を分け与えます。',
            orangeJello_stage4_name: 'ビタウィング',
            orangeJello_stage4_desc: '尻尾に栄養たっぷりの「命のミカン」が実りました。疲れた味方に果汁を分け与え、活力を取り戻させます。',
            orangeJello_stage5_name: 'タンジェロス',
            orangeJello_stage5_desc: '強靭な生命力を持つフルーツドラゴンです。口から吐く「シトラスブレス」は、敵の戦意を喪失させるほど爽やかです。',

            // Sky Jello
            skyJello_stage1_name: 'スカイジェロ',
            skyJello_stage1_desc: 'スカイジェロ',

            // Brown Jello
            brownJello_stage1_name: 'ブラウンジェロ',
            brownJello_stage1_desc: 'ブラウンジェロ',

            // Olive Jello
            oliveJello_stage1_name: 'オリーブジェロ',
            oliveJello_stage1_desc: 'オリーブジェロ',

            // Cyan Jello
            cyanJello_stage1_name: 'シアンジェロ',
            cyanJello_stage1_desc: 'シアンジェロ',
        },
    },
    common: {
        startGame: 'ゲーム開始',
        start: 'スタート',
        cancel: 'キャンセル',
        premium: 'プレミアム',
        loading: '読み込み中...',
        confirm: '確認',
        close: '閉じる',
        menu: 'メニュー',
        score: 'スコア',
        lives: 'ライフ',
        combo: 'コンボ',
        bestCombo: 'ベストコンボ',
        difficulty: '難易度',
        time: 'タイム',
        accuracy: '正確さ',
        gameOver: 'ゲームオーバー！',
        finalScore: '最終スコア',
        bestScore: '自己ベスト',
        previousBest: '前回のベスト',
        newRecord: '新記録達成！',
        playAgain: 'もう一度プレイ',
        download: '保存',
        howToPlay: '遊び方',
        results: '結果発表',
        earnedXp: 'XP',
        earnedGro: 'Gro',
        yes: 'はい',
        no: 'いいえ',
        goHome: 'ホームへ',
    },
    evolution: {
        title: '進化！',
        continue: 'タップして続ける',
    },
    graduation: {
        title: 'さようなら、ジェロ！',
        message: "ジェロは立派に育ち、広い世界へと旅立ちました！🌍",
        action: "また会おうね！",
    },
    food: {
        menu: {
            title: '食事',
            close: '閉じる',
        },
        categories: {
            fruit: 'フルーツ',
            vegetable: '野菜',
            bakery: 'ベーカリー',
            meal: '食事',
            snack: 'おやつ',
            dessert: 'デザート',
        },
        items: {
            // Fruits
            grapes: 'ぶどう',
            melon: 'メロン',
            watermelon: 'スイカ',
            tangerine: 'みかん',
            lemon: 'レモン',
            lime: 'ライム',
            banana: 'バナナ',
            pineapple: 'パイナップル',
            mango: 'マンゴー',
            red_apple: '赤リンゴ',
            green_apple: '青リンゴ',
            pear: '梨',
            peach: '桃',
            cherries: 'さくらんぼ',
            strawberry: 'いちご',
            blueberries: 'ブルーベリー',
            kiwi_fruit: 'キウイ',
            tomato: 'トマト',
            olive: 'オリーブ',
            coconut: 'ココナッツ',

            // Vegetables
            avocado: 'アボカド',
            eggplant: 'ナス',
            potato: 'ジャガイモ',
            carrot: 'ニンジン',
            ear_of_corn: 'トウモロコシ',
            hot_pepper: '唐辛子',
            bell_pepper: 'ピーマン',
            cucumber: 'キュウリ',
            leafy_green: '葉野菜',
            broccoli: 'ブロッコリー',
            garlic: 'ニンニク',
            onion: '玉ねぎ',
            peanuts: 'ピーナッツ',
            beans: '豆',
            chestnut: '栗',
            ginger: '生姜',
            pea_pod: 'さやえんどう',
            mushroom: 'キノコ',

            // Bakery
            bread: '食パン',
            croissant: 'クロワッサン',
            baguette_bread: 'バゲット',
            flatbread: 'フラットブレッド',
            pretzel: 'プレッツェル',
            bagel: 'ベーグル',
            pancakes: 'パンケーキ',
            waffle: 'ワッフル',
            butter: 'バター',
            cheese_wedge: 'チーズ',

            // Meals
            meat_on_bone: '骨付き肉',
            poultry_leg: 'チキン',
            cut_of_meat: 'ステーキ',
            bacon: 'ベーコン',
            hamburger: 'ハンバーガー',
            french_fries: 'フライドポテト',
            pizza: 'ピザ',
            hot_dog: 'ホットドッグ',
            sandwich: 'サンドイッチ',
            taco: 'タコス',
            burrito: 'ブリトー',
            stuffed_flatbread: 'ケバブ',
            falafel: 'ファラフェル',
            egg: '卵',
            cooking: '料理',
            curry_rice: 'カレーライス',
            steaming_bowl: 'うどん',
            cooked_rice: 'ご飯',
            pot_of_food: 'シチュー',
            shallow_pan_of_food: 'パエリア',

            // Snacks
            oden: 'おでん',
            rice_cracker: 'おせんべい',
            rice_ball: 'おにぎり',
            fried_shrimp: 'エビフライ',
            fish_cake_with_swirl: 'なると',
            dumpling: '餃子',
            fortune_cookie: 'フォーチュンクッキー',
            moon_cake: '月餅',
            takeout_box: '中華テイクアウト',
            popcorn: 'ポップコーン',
            canned_food: '缶詰',
            roasted_sweet_potato: '焼き芋',
            tamale: 'タマレス',

            // Desserts
            soft_ice_cream: 'ソフトクリーム',
            shaved_ice: 'かき氷',
            ice_cream: 'アイスクリーム',
            doughnut: 'ドーナツ',
            cookie: 'クッキー',
            birthday_cake: 'バースデーケーキ',
            shortcake: 'ショートケーキ',
            cupcake: 'カップケーキ',
            pie: 'パイ',
            chocolate_bar: '板チョコ',
            candy: 'キャンディ',
            lollipop: 'ペロペロキャンディ',
            custard: 'プリン',
            honey_pot: 'ハチミツ',
        },
        effects: {
            hunger: '満腹度',
            happiness: '幸福度',
            health: '健康',
        },
    },
    medicine: {
        menu: {
            title: '治療',
        },
        items: {
            pill: '薬',
            syringe: '注射',
        },
    },
    shop: {
        menu: {
            title: 'ショップ',
        },
        categories: {
            ground: '背景',
            house: 'ハウス',
        },
        items: {
            default_ground: 'ベーシックな床',
            'default_ground.desc': '温かみのある木の床です。',
            tropical_ground: '南国ビーチ',
            'tropical_ground.desc': '太陽が降り注ぐパラダイスビーチ。',
            arctic_ground: '氷の国',
            'arctic_ground.desc': '冷たい氷と雪の世界です。',
            volcanic_ground: '火山地帯',
            'volcanic_ground.desc': 'マグマが流れる灼熱の大地。',
            desert_ground: '砂漠',
            'desert_ground.desc': '見渡す限りの砂丘です。',
            forest_ground: '深い森',
            'forest_ground.desc': '緑豊かな深い森の中です。',
            night_city: 'ナイトシティ',
            'night_city.desc': 'レトロなサイバーパンクの街並み。',
            layout1_template: '基本レイアウト',
            'layout1_template.desc': '標準的なレイアウトテンプレート。',
            shape_ground: 'パステル広場',
            'shape_ground.desc': '夢のようなパステルカラーの世界。',
            sweet_ground: 'お菓子の国',
            'sweet_ground.desc': 'お菓子がいっぱいの美味しい世界。',

            // Houses
            tent: 'テント',
            'tent.desc': '快適なキャンプ用テント。',
            old_house: '古い家',
            house: '一軒家',
            garden_house: '庭付きハウス',
            building: 'ビル',
            hotel: 'ホテル',
            factory: '工場',
            circus: 'サーカス',
            stadium: 'スタジアム',
            church: '教会',
            mosque: 'モスク',
            hindu_temple: 'ヒンドゥー寺院',
            synagogue: 'シナゴーグ',
            greek_temple: 'ギリシャ神殿',
            kaaba: 'カアバ',
            japanese_castle: '日本のお城',
            european_castle: '西洋のお城',
        },
    },
    actions: {
        feed: '食事',
        medicine: '治療',
        play: '遊ぶ',
        clean: '掃除',
        camera: 'カメラ',
        settings: '設定',
    },
    camera: {
        title: 'スナップショット！',
        save: '保存',
        copyLink: 'リンクをコピー',
        capturing: '撮影中...',
    },
    share: {
        linkCopied: 'コピーしました！',
        copyFailed: 'コピー失敗',
        invite: {
            title: '私が育てているジェロです！🥰',
            desc: '一緒に育ててみませんか？',
        },
        cta: '今すぐプレイ',
        error: {
            invalid: '無効なリンクです',
            missing: 'データが見つかりません',
        },
    },
    sleep: {
        confirm: {
            sleepTitle: '寝かしつけ',
            sleepMessage: 'ジェロを寝かせますか？ 💤\n(30分間眠ります)',
            wakeTitle: '起こす',
            wakeMessage: 'ジェロを起こしますか？ 🌅',
        },
    },
    cleanMenu: {
        title: '掃除用具',
        broom: {
            name: 'ほうき',
            effect: 'フンを1つ掃除',
        },
        newspaper: {
            name: '新聞紙',
            effect: '虫を1匹退治',
        },
        shower: {
            name: 'シャワー',
            effect: 'さっぱりする',
        },
        robot_cleaner: {
            name: 'ロボット掃除機',
            effect: '全てきれいにする',
        },
        toothbrush: {
            name: '歯ブラシ',
            effect: '歯を磨く',
        },
        max_stats: {
            name: 'チート',
            effect: '全ステータス回復',
        },
    },
    emotions: {
        joy: {
            l1: {
                nice: 'いいね',
                hehe: 'へへっ',
                yay: 'やったー',
            },
            l2: {
                good: 'いい感じ！',
                fun: 'たのしい！',
                happy: 'しあわせ！',
                haha: 'あはは！',
            },
            l3: {
                lol: 'ウケる',
                hah: 'ハハッ',
                lmao: '最高！',
                omg_lol: '超ウケる',
            },
        },
        love: {
            l1: {
                sweet: 'あまい',
                chu: 'チュッ',
                mwah: 'ん～まっ',
            },
            l2: {
                kiss: 'キス！',
                luv_u: 'すき',
                warm: 'あったかい…',
            },
            l3: {
                love: 'だいすき！',
                wow: 'わあ！',
            },
        },
        playful: {
            l1: {
                yum: 'おいしい！',
                heh: 'へへ～',
            },
            l2: {
                bleh: 'べー！',
                gotcha: 'つかまえた！',
            },
            l3: {
                crazy: 'サイコー！',
                blehhh: 'べーーー！',
                rich: 'お金持ち！',
            },
        },
        neutral: {
            l1: {
                hm: 'ん…',
                ellipsis: '…',
                dash: '--',
            },
            l2: {
                hmm: 'ふむ？',
                uhm: 'うーん',
                meh: 'ビミョー…',
            },
            l3: {
                ugh: 'うっ',
                eek: 'えっ',
                zip: 'シーッ',
                uhh: 'あー…',
                sigh: 'はぁ',
                shock: '！？',
                ok: 'オッケー',
                fine: 'いいよ',
            },
        },
        sleepy: {
            l1: {
                relax: 'ふぅ…',
                tired: 'つかれた…',
            },
            l2: {
                zzz: 'ぐーぐー',
                drool: 'よだれ…',
            },
            l3: {
                sleep: 'ねむい…',
                haaam: 'ふわぁ…',
                exhaust: 'ぐったり…',
            },
        },
        sick: {
            l1: {
                sniff: 'ぐすん…',
                achoo: 'ハクション！',
            },
            l2: {
                hot: 'あつい…',
                ouch: 'いたい…',
                ugh: 'うぅ…',
                hot2: '熱がある！',
                cold: 'さむい！！',
            },
            l3: {
                blurgh: 'オェッ！',
                dizzy: 'クラクラする…',
                spin: '目が回る…',
                whoaa: 'うわぁ',
            },
        },
        worried: {
            l1: {
                huh: 'あれ…',
                hmm: 'うーん…',
                sad: 'かなしい…',
                oh: 'あぁ…',
                shock: '？！',
            },
            l2: {
                worried: 'しんぱい…',
                whoa: 'わっ！',
                oh_no: 'やだ',
                no: 'いや…',
                why: 'なんで…',
                scary: 'こわい…',
                hmm: 'うーん…',
                down: '落ち込む…',
            },
            l3: {
                nervous: 'ドキドキする！',
                please: 'おねがい…',
                sniff: 'ぐすん…',
                tears: 'なみだ…',
                waaah: 'うわーん！',
                aaaah: 'ぎゃあ！！',
                ugh: 'うぅ…',
                pain: 'いたい…',
                sigh: 'はぁ…',
                tired: 'つらい…',
                noo: 'だめ…',
            },
        },
        angry: {
            l1: {
                hmph: 'ふん！',
            },
            l2: {
                grr: 'ガルル…',
                angry: 'おこった！',
            },
            l3: {
                furious: '！！！',
            },
        },
    },
    abandonment: {
        danger: 'かまってほしいみたい！',
        critical: 'あぶない状態です！',
        leaving: 'もうすぐ家出しそうです！',
        abandoned: 'ジェロは旅に出ました… (涙)',
    },
    settings: {
        title: '設定',
        sound: {
            title: 'サウンド',
            description: '音量設定',
            bgm: 'BGM',
            sfx: '効果音',
            on: 'ON',
            off: 'OFF',
        },
        language: {
            title: '言語',
            description: '言語選択',
            selected: '選択中',
        },
        admin: {
            title: '管理',
            gallery: '図鑑',
            stats: '統計',
        },
        cloudSave: 'クラウド保存',
        logout: 'ログアウト',
        saveStatus: {
            idle: 'クラウド保存',
            saving: '保存中...',
            success: '保存完了！',
            error: '保存失敗',
            cooldown: '{{time}}秒 待機',
        },
    },
    encyclopedia: {
        title: 'マイジェロ図鑑',
        home: 'ホーム',
        species: '種類',
        stage: '段階 {{stage}}',
        hidden: '？？？',
        legendary: {
            title: '伝説の進化',
            prefix: 'この姿を解除するには',
            suffix: 'が必要です！',
        },
    },
    auth: {
        login: {
            title: 'ようこそ！',
            subtitle: 'ログインしてジェロに会いに行こう 🐾',
            email: 'メールアドレス',
            emailPlaceholder: 'メールアドレスを入力',
            password: 'パスワード',
            passwordPlaceholder: 'パスワードを入力',
            action: 'ログイン 🔑',
            or: 'または',
            signup: 'メールアドレスで登録',
            backToHome: 'ホームに戻る',
            google: 'Googleでログイン',
        },
        signup: {
            title: 'Grogro Jello アカウント作成',
            subtitle: 'アカウントを作ってジェロを育てよう 🐣',
            emailLabel: 'メールアドレス (ID)',
            emailPlaceholder: 'hello@example.com',
            nicknameLabel: 'ニックネーム',
            nicknamePlaceholder: 'ジェロになんて呼ばれたい？',
            passwordLabel: 'パスワード',
            passwordPlaceholder: '秘密のパスワード',
            confirmPasswordLabel: 'パスワード確認',
            confirmPasswordPlaceholder: 'もう一度入力',
            action: '登録する ✨',
            haveAccount: 'すでにアカウントをお持ちですか？',
            loginLink: 'ログインはこちら',
            backToLogin: 'ログイン画面に戻る',
            passwordMismatch: 'パスワードが一致しません！ ❌',
            success: '登録完了！ようこそ Grogro Jelloへ！ 🎉',
        },
        errors: {
            default: 'ログイン失敗！ ❌',
            invalidCredential: 'メールアドレスまたはパスワードが違います。',
            tooManyRequests: '試行回数が多すぎます。しばらく待ってから再度お試しください。',
            googleFailed: 'Googleログインに失敗しました ❌。もう一度お試しください。',
            emailInUse: 'すでに登録されているメールアドレスです。',
            weakPassword: 'パスワードは6文字以上で入力してください。',
            invalidEmail: '無効なメールアドレスの形式です。',
            registrationFailed: '登録失敗！ ❌',
        }
    },
    play: {
        title: 'プレイ & 学び',
        home: 'ホーム',
        controls: {
            title: "いっしょにあそぼ！",
            expand: '広げる',
            collapse: 'たたむ',
            level: 'レベル',
        },
        modes: {
            adventure: 'アドベンチャー',
            genius: 'ジーニアス',
        },
        sections: {
            funMath: {
                title: 'ファンマス',
                desc: '楽しい算数アドベンチャー',
            },
            genius: {
                title: 'ジーニアス計算',
                desc: "天才たちの「秘密」の計算",
            },
        },
        categories: {
            brain: '脳トレ',
            math: '算数',
            science: '科学',
            sw: 'プログラミング',
        },
        game: {
            playNow: '今すぐプレイ',
            noGames: '新しいゲームを準備中！',
            unlock: {
                reason: '{{game}}のマスターランク達成で解禁',
            },
        },
    },
    games: {
        'math-fishing-count': fishingCountJa,
        'math-round-counting': roundCountingJa,
        'math-number-hive': numberHiveJa,
        'math-fruit-slice': fruitSliceJa,
        'math-number-balance': numberBalanceJa,
        'math-archery': mathArcheryJa,
        frontAddition: frontAdditionJa,
        frontSubtraction: frontSubtractionJa,
        backMultiplication: backMultiplicationJa,
        'ten-frame-count': tenFrameCountJa,
        'pinwheel-pop': mathPinwheelJa,
        'animal-banquet': animalBanquetJa,
        'deep-sea-dive': deepSeaDiveJa,
        'math-level2-ufo-invasion': ufoInvasionJa,

        'color-link': colorLinkJa,
        'pair-up-twin': pairUpTwinJa,
        'maze-escape': mazeEscapeJa,
        'wild-link': wildLinkJa,
        'pair-up-connect': pairUpConnectJa,
        'signal-hunter': signalHunterJa,
        'maze-hunter': mazeHunterJa,
        'tic-tac-toe': ticTacToeJa,
        omok: omokJa,
        tags: {
            counting: '数え方',
            sequence: '数の順序',
            numberSense: '数の感覚',
            addition: '足し算',
            subtraction: '引き算',
            partWhole: '数の構成',
            mixedOps: '混合計算',
            speedMath: 'スピード計算',
            mentalMath: '暗算',
            spatial: '空間認識',
            observation: '観察力',
            categorization: '分類',
            workingMemory: 'ワーキングメモリ',
            association: '連想',
            concentration: '集中力',
            strategy: '戦略',
            memory: '記憶力',
            logic: '論理',
        },
        mission: {
            challenge: '挑戦！ ({{current}}/{{total}})',
            challenge10: '挑戦！ ({{current}}/{{total}})',
        },
        medal: {
            bronze: '🥈 銀メダルまであと{{count}}回！',
            silver: '🥇 金メダルまであと{{count}}回！',
            gold: 'すごい！マスターしました！🎉',
        },
    },
    train: {
        reward: {
            glo: 'GLO',
            dud: 'ハズレ!',
            confirm: 'OK',
        },
    },
} as const;

export default ja;
