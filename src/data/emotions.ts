import type { EmotionData } from '../types/emotion';

export const emotionData: EmotionData = {
  joy: [
    {
      level: 1,
      expressions: [
        { emoji: '🙂', messageKey: 'emotions.joy.l1.nice' },
        { emoji: '😉', messageKey: 'emotions.joy.l1.hehe' },
        { emoji: '😊', messageKey: 'emotions.joy.l1.yay' },
      ],
    },
    {
      level: 2,
      expressions: [
        { emoji: '😀', messageKey: 'emotions.joy.l2.good' },
        { emoji: '😃', messageKey: 'emotions.joy.l2.fun' },
        { emoji: '😄', messageKey: 'emotions.joy.l2.happy' },
        { emoji: '😁', messageKey: 'emotions.joy.l2.haha' },
      ],
    },
    {
      level: 3,
      expressions: [
        { emoji: '😆', messageKey: 'emotions.joy.l3.lol' },
        { emoji: '😅', messageKey: 'emotions.joy.l3.hah' },
        { emoji: '😂', messageKey: 'emotions.joy.l3.lmao' },
        { emoji: '🤣', messageKey: 'emotions.joy.l3.omg_lol' },
      ],
    },
  ],
  love: [
    {
      level: 1,
      expressions: [
        { emoji: '☺️', messageKey: 'emotions.love.l1.sweet' },
        { emoji: '😗', messageKey: 'emotions.love.l1.chu' },
        { emoji: '😚', messageKey: 'emotions.love.l1.mwah' },
      ],
    },
    {
      level: 2,
      expressions: [
        { emoji: '😘', messageKey: 'emotions.love.l2.kiss' },
        { emoji: '😙', messageKey: 'emotions.love.l2.luv_u' },
        { emoji: '🥰', messageKey: 'emotions.love.l2.warm' },
      ],
    },
    {
      level: 3,
      expressions: [
        { emoji: '😍', messageKey: 'emotions.love.l3.love' },
        { emoji: '🤩', messageKey: 'emotions.love.l3.wow' },
      ],
    },
  ],
  playful: [
    {
      level: 1,
      expressions: [
        { emoji: '😋', messageKey: 'emotions.playful.l1.yum' },
        { emoji: '😏', messageKey: 'emotions.playful.l1.heh' },
      ],
    },
    {
      level: 2,
      expressions: [
        { emoji: '😛', messageKey: 'emotions.playful.l2.bleh' },
        { emoji: '😜', messageKey: 'emotions.playful.l2.gotcha' },
      ],
    },
    {
      level: 3,
      expressions: [
        { emoji: '🤪', messageKey: 'emotions.playful.l3.crazy' },
        { emoji: '😝', messageKey: 'emotions.playful.l3.blehhh' },
        { emoji: '🤑', messageKey: 'emotions.playful.l3.rich' },
      ],
    },
  ],
  neutral: [
    {
      level: 1,
      expressions: [
        { emoji: '😐', messageKey: 'emotions.neutral.l1.hm' },
        { emoji: '😑', messageKey: 'emotions.neutral.l1.ellipsis' },
        { emoji: '😶', messageKey: 'emotions.neutral.l1.dash' },
      ],
    },
    {
      level: 2,
      expressions: [
        { emoji: '🤨', messageKey: 'emotions.neutral.l2.hmm' },
        { emoji: '🫤', messageKey: 'emotions.neutral.l2.uhm' },
        { emoji: '😒', messageKey: 'emotions.neutral.l2.meh' },
      ],
    },
    {
      level: 3,
      expressions: [
        { emoji: '🙄', messageKey: 'emotions.neutral.l3.ugh' },
        { emoji: '😬', messageKey: 'emotions.neutral.l3.eek' },
        { emoji: '🤐', messageKey: 'emotions.neutral.l3.zip' },
        { emoji: '🤥', messageKey: 'emotions.neutral.l3.uhh' },
        { emoji: '😮‍💨', messageKey: 'emotions.neutral.l3.sigh' },
        { emoji: '🫨', messageKey: 'emotions.neutral.l3.shock' },
        { emoji: '🙂‍↔️', messageKey: 'emotions.neutral.l3.ok' },
        { emoji: '🙂‍↕️', messageKey: 'emotions.neutral.l3.fine' },
      ],
    },
  ],
  sleepy: [
    {
      level: 1,
      expressions: [
        { emoji: '😌', messageKey: 'emotions.sleepy.l1.relax' },
        { emoji: '😔', messageKey: 'emotions.sleepy.l1.tired' },
      ],
    },
    {
      level: 2,
      expressions: [
        { emoji: '😪', messageKey: 'emotions.sleepy.l2.zzz' },
        { emoji: '🤤', messageKey: 'emotions.sleepy.l2.drool' },
      ],
    },
    {
      level: 3,
      expressions: [
        { emoji: '😴', messageKey: 'emotions.sleepy.l3.sleep' },
        { emoji: '🥱', messageKey: 'emotions.sleepy.l3.haaam' },
        { emoji: '🫩', messageKey: 'emotions.sleepy.l3.exhaust' },
      ],
    },
  ],
  sick: [
    {
      level: 1,
      expressions: [
        { emoji: '😷', messageKey: 'emotions.sick.l1.sniff' },
        { emoji: '🤧', messageKey: 'emotions.sick.l1.achoo' },
      ],
    },
    {
      level: 2,
      expressions: [
        { emoji: '🤒', messageKey: 'emotions.sick.l2.hot' },
        { emoji: '🤕', messageKey: 'emotions.sick.l2.ouch' },
        { emoji: '🤢', messageKey: 'emotions.sick.l2.ugh' },
        { emoji: '🥵', messageKey: 'emotions.sick.l2.hot2' },
        { emoji: '🥶', messageKey: 'emotions.sick.l2.cold' },
      ],
    },
    {
      level: 3,
      expressions: [
        { emoji: '🤮', messageKey: 'emotions.sick.l3.blurgh' },
        { emoji: '🥴', messageKey: 'emotions.sick.l3.dizzy' },
        { emoji: '😵', messageKey: 'emotions.sick.l3.spin' },
        { emoji: '😵‍💫', messageKey: 'emotions.sick.l3.whoaa' },
      ],
    },
  ],
  worried: [
    {
      level: 1,
      expressions: [
        { emoji: '😕', messageKey: 'emotions.worried.l1.huh' },
        { emoji: '🫤', messageKey: 'emotions.worried.l1.hmm' },
        { emoji: '🙁', messageKey: 'emotions.worried.l1.sad' },
        { emoji: '☹️', messageKey: 'emotions.worried.l1.oh' },
        { emoji: '😯', messageKey: 'emotions.worried.l1.shock' },
      ],
    },
    {
      level: 2,
      expressions: [
        { emoji: '😟', messageKey: 'emotions.worried.l2.worried' },
        { emoji: '😲', messageKey: 'emotions.worried.l2.whoa' },
        { emoji: '😳', messageKey: 'emotions.worried.l2.oh_no' },
        { emoji: '😦', messageKey: 'emotions.worried.l2.no' },
        { emoji: '😧', messageKey: 'emotions.worried.l2.why' },
        { emoji: '😨', messageKey: 'emotions.worried.l2.scary' },
        { emoji: '😥', messageKey: 'emotions.worried.l2.hmm' },
        { emoji: '😓', messageKey: 'emotions.worried.l2.down' },
      ],
    },
    {
      level: 3,
      expressions: [
        { emoji: '😰', messageKey: 'emotions.worried.l3.nervous' },
        { emoji: '🥺', messageKey: 'emotions.worried.l3.please' },
        { emoji: '🥹', messageKey: 'emotions.worried.l3.sniff' },
        { emoji: '😢', messageKey: 'emotions.worried.l3.tears' },
        { emoji: '😭', messageKey: 'emotions.worried.l3.waaah' },
        { emoji: '😱', messageKey: 'emotions.worried.l3.aaaah' },
        { emoji: '😖', messageKey: 'emotions.worried.l3.ugh' },
        { emoji: '😣', messageKey: 'emotions.worried.l3.pain' },
        { emoji: '😞', messageKey: 'emotions.worried.l3.sigh' },
        { emoji: '😩', messageKey: 'emotions.worried.l3.tired' },
        { emoji: '😫', messageKey: 'emotions.worried.l3.noo' },
      ],
    },
  ],
  angry: [
    {
      level: 1,
      expressions: [{ emoji: '😤', messageKey: 'emotions.angry.l1.hmph' }],
    },
    {
      level: 2,
      expressions: [
        { emoji: '😠', messageKey: 'emotions.angry.l2.grr' },
        { emoji: '😡', messageKey: 'emotions.angry.l2.angry' },
      ],
    },
    {
      level: 3,
      expressions: [{ emoji: '🤬', messageKey: 'emotions.angry.l3.furious' }],
    },
  ],
};
