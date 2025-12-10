
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Trophy,
  Coins,
  Flame,
  RotateCcw,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  HelpCircle,
  Play,
  Download,
  Volume2,
  VolumeX
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';

type LanguageCode = 'en' | 'ko' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'ru' | 'ar' | 'zh' | 'ja' | 'vi' | 'th' | 'id';
type GameState = 'idle' | 'playing' | 'correct' | 'wrong' | 'gameover';

type Language = {
  code: LanguageCode;
  name: string;
  dir: 'ltr' | 'rtl';
};

const supportedLangs: Language[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ko', name: '한국어', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'it', name: 'Italiano', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'zh', name: '中文', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
  { code: 'vi', name: 'Tiếng Việt', dir: 'ltr' },
  { code: 'th', name: 'ไทย', dir: 'ltr' },
  { code: 'id', name: 'Indonesia', dir: 'ltr' },
];

const translations: Record<LanguageCode, any> = {
  en: {
    title: "Shape Master", subtitle: "The Secret of Sides & Vertices", scoreLabel: "Score", livesLabel: "Lives", streakLabel: "Streak", timeLabel: "Time", difficulty_1: "Beginner", difficulty_2: "Intermediate", difficulty_3: "Advanced", question: "What is the sum of the sides and vertices of this shape?", answerPlaceholder: "Answer", submitButton: "Check", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Hint ({remaining}/3)", hintButtonClose: "Close Hint", hintLabel: "Hint:", hintUsedText: "(Hint used, 50% score penalty)", hintSpecialShapeText: "This shape has a special rule. Try counting it as {count}! 🔵", hintNormalShapeText: "{sides} sides + {vertices} vertices = ?", feedbackCorrect: "Correct! +{score} points", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorrect. The answer is {correctAnswer}. 💔", achievementsTitle: "Achievements ({count}/4)", achievements_firstCorrect: "First Correct", achievements_lightningSpeed: "Speedy", achievements_streakMaster: "Streak", achievements_master: "Master", achievementsTooltip_firstCorrect: "Get your first answer correct.", achievementsTooltip_lightningSpeed: "Answer in under 3 seconds.", achievementsTooltip_streakMaster: "Get a 5-question streak.", achievementsTooltip_master: "Correctly answer 3+ questions on Advanced difficulty.", gameOverTitle: "Game Over!", gameOverBadge: "End", finalScoreLabel: "Final Score", scoreUnit: " pts", difficultyReachedLabel: "Difficulty Reached", bestStreakLabel: "Best Streak", itemUnit: "", starsEarnedLabel: "Stars Earned", accuracyLabel: "Accuracy", achievementsEarnedLabel: "Achievements Unlocked", gameOverMessage_great: "🎉 Excellent work!", gameOverMessage_good: "👍 Well done!", gameOverMessage_tryAgain: "💪 You can do better next time!", playAgainButton: "Play Again", tip: "💡 Tip: Answer as many questions correctly as you can in 1 minute!", howToPlayButton: "How to Play", howToPlayTitle: "How to Play", howToPlay_goal_title: "Goal", howToPlay_goal_desc: "Correctly answer the sum of the shape's sides and vertices as fast as you can.", howToPlay_time_lives_title: "Time & Lives", howToPlay_time_lives_desc: "You have 60 seconds and 3 lives. An incorrect answer costs one life. Don't let the timer run out!", howToPlay_difficulty_title: "Difficulty", howToPlay_difficulty_desc: "The game adapts! The better you play, the harder the shapes get, earning you more points.", howToPlay_streak_title: "Streak & Power-ups", howToPlay_streak_desc: "Chain correct answers for a streak bonus. Earn random power-ups like ❄️ Time Freeze, ❤️ Extra Life, and ⚡ Double Score!", howToPlay_hints_title: "Hints", howToPlay_hints_desc: "Stuck? Use one of 3 hints per game. Be careful, it will cost you 50% of the score for that question.", howToPlay_achievements_title: "Achievements", howToPlay_achievements_desc: "Unlock special achievements for completing milestones in the game.", closeButton: "Got it!", startGameButton: "Start Game", shareResultButton: "Download Result", shareSuccess: "✅ Image downloaded!", shareError: "❌ Download failed."
  },
  ko: {
    title: "도형 마스터", subtitle: "변과 꼭짓점의 비밀", scoreLabel: "점수", livesLabel: "생명력", streakLabel: "연속", timeLabel: "시간", difficulty_1: "기초", difficulty_2: "중급", difficulty_3: "고급", question: "이 도형의 변과 꼭짓점의 합은?", answerPlaceholder: "정답", submitButton: "확인", doubleScoreActive: "⚡2배 ({timeLeft}초)", hintButton: "💡 힌트 ({remaining}/3)", hintButtonClose: "힌트 닫기", hintLabel: "힌트:", hintUsedText: "(힌트 사용으로 50% 차감)", hintSpecialShapeText: "이 도형은 특별한 규칙을 가져요. {count}개로 세어보세요! 🔵", hintNormalShapeText: "변 {sides}개 + 꼭짓점 {vertices}개 = ?", feedbackCorrect: "정답! +{score}점", feedbackEmojiCorrect: "🎉", feedbackWrong: "틀렸습니다. 정답은 {correctAnswer}개입니다. 💔", achievementsTitle: "업적 ({count}/4)", achievements_firstCorrect: "첫 정답", achievements_lightningSpeed: "빠른 계산", achievements_streakMaster: "콤보 왕", achievements_master: "마스터", achievementsTooltip_firstCorrect: "첫 문제를 맞혀보세요.", achievementsTooltip_lightningSpeed: "3초 안에 정답을 맞히세요.", achievementsTooltip_streakMaster: "5문제 연속 정답을 달성하세요.", achievementsTooltip_master: "고급 난이도에서 3문제 이상 정답을 맞히세요.", gameOverTitle: "게임 종료!", gameOverBadge: "끝", finalScoreLabel: "최종 점수", scoreUnit: "점", difficultyReachedLabel: "도달 난이도", bestStreakLabel: "최고 연속", itemUnit: "개", starsEarnedLabel: "획득 별", accuracyLabel: "정답률", achievementsEarnedLabel: "달성한 업적", gameOverMessage_great: "🎉 훌륭한 실력이에요!", gameOverMessage_good: "👍 잘 하셨어요!", gameOverMessage_tryAgain: "💪 다음엔 더 잘할 수 있어요!", playAgainButton: "다시 도전하기", tip: "💡 팁: 1분 안에 최대한 많은 문제를 정확히 풀어보세요!", howToPlayButton: "게임 방법", howToPlayTitle: "게임 방법", howToPlay_goal_title: "목표", howToPlay_goal_desc: "도형의 변과 꼭짓점의 합을 최대한 빨리 정확하게 맞히세요.", howToPlay_time_lives_title: "시간 & 생명력", howToPlay_time_lives_desc: "60초의 시간과 3개의 생명력이 주어집니다. 오답 시 생명력이 하나 줄어듭니다. 시간이 다 되지 않도록 주의하세요!", howToPlay_difficulty_title: "난이도", howToPlay_difficulty_desc: "게임은 당신의 실력에 맞춰집니다! 더 잘할수록 더 어려운 도형이 나오고 더 많은 점수를 얻습니다.", howToPlay_streak_title: "연속 정답 & 파워업", howToPlay_streak_desc: "연속으로 정답을 맞혀 보너스 점수를 획득하세요. ❄️ 시간 정지, ❤️ 추가 생명력, ⚡ 점수 2배와 같은 파워업을 무작위로 얻을 수 있습니다!", howToPlay_hints_title: "힌트", howToPlay_hints_desc: "막혔나요? 게임당 3개의 힌트를 사용할 수 있습니다. 하지만 해당 문제 점수의 50%가 차감되니 신중하게 사용하세요.", howToPlay_achievements_title: "업적", howToPlay_achievements_desc: "게임 내 특별한 목표를 달성하고 업적을 잠금 해제하세요.", closeButton: "알겠어요!", startGameButton: "게임 시작", shareResultButton: "결과 다운로드", shareSuccess: "✅ 이미지를 다운로드했습니다!", shareError: "❌ 다운로드에 실패했습니다."
  },
  es: {
    title: "Maestro de las Formas", subtitle: "El Secreto de Lados y Vértices", scoreLabel: "Puntuación", livesLabel: "Vidas", streakLabel: "Racha", timeLabel: "Tiempo", difficulty_1: "Principiante", difficulty_2: "Intermedio", difficulty_3: "Avanzado", question: "¿Cuál es la suma de los lados y vértices de esta figura?", answerPlaceholder: "Respuesta", submitButton: "Comprobar", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Pista ({remaining}/3)", hintButtonClose: "Cerrar Pista", hintLabel: "Pista:", hintUsedText: "(Pista usada, 50% de penalización)", hintSpecialShapeText: "Esta figura tiene una regla especial. ¡Intenta contarla como {count}! 🔵", hintNormalShapeText: "{sides} lados + {vertices} vértices = ?", feedbackCorrect: "¡Correcto! +{score} puntos", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorrecto. La respuesta es {correctAnswer}. 💔", achievementsTitle: "Logros ({count}/4)", achievements_firstCorrect: "Primer Acierto", achievements_lightningSpeed: "Veloz", achievements_streakMaster: "Racha", achievements_master: "Maestro", achievementsTooltip_firstCorrect: "Consigue tu primera respuesta correcta.", achievementsTooltip_lightningSpeed: "Responde en menos de 3 segundos.", achievementsTooltip_streakMaster: "Consigue una racha de 5 preguntas.", achievementsTooltip_master: "Responde correctamente a 3+ preguntas en dificultad Avanzada.", gameOverTitle: "¡Fin del Juego!", gameOverBadge: "Fin", finalScoreLabel: "Puntuación Final", scoreUnit: " pts", difficultyReachedLabel: "Dificultad Alcanzada", bestStreakLabel: "Mejor Racha", itemUnit: "", starsEarnedLabel: "Estrellas Ganadas", accuracyLabel: "Precisión", achievementsEarnedLabel: "Logros Desbloqueados", gameOverMessage_great: "🎉 ¡Excelente trabajo!", gameOverMessage_good: "👍 ¡Bien hecho!", gameOverMessage_tryAgain: "💪 ¡Puedes hacerlo mejor la próxima vez!", playAgainButton: "Jugar de Nuevo", tip: "💡 Consejo: ¡Responde correctamente tantas preguntas como puedas en 1 minuto!", howToPlayButton: "Cómo Jugar", howToPlayTitle: "Cómo Jugar", howToPlay_goal_title: "Meta", howToPlay_goal_desc: "Responde correctamente la suma de los lados y vértices de la figura tan rápido como puedas.", howToPlay_time_lives_title: "Tiempo & Vidas", howToPlay_time_lives_desc: "Tienes 60 segundos y 3 vidas. Una respuesta incorrecta cuesta una vida. ¡No dejes que se acabe el tiempo!", howToPlay_difficulty_title: "Dificultad", howToPlay_difficulty_desc: "¡El juego se adapta! Cuanto mejor juegues, más difíciles serán las figuras y más puntos ganarás.", howToPlay_streak_title: "Racha & Potenciadores", howToPlay_streak_desc: "Encadena respuestas correctas para obtener una bonificación por racha. ¡Gana potenciadores aleatorios como ❄️ Congelar Tiempo, ❤️ Vida Extra y ⚡ Puntuación Doble!", howToPlay_hints_title: "Pistas", howToPlay_hints_desc: "¿Atascado? Usa una de las 3 pistas por juego. Ten cuidado, te costará el 50% de la puntuación de esa pregunta.", howToPlay_achievements_title: "Logros", howToPlay_achievements_desc: "Desbloquea logros especiales por completar hitos en el juego.", closeButton: "¡Entendido!", startGameButton: "Empezar a jugar", shareResultButton: "Descargar Resultado", shareSuccess: "✅ ¡Imagen descargada!", shareError: "❌ Vaya, no se pudo descargar."
  },
  fr: {
    title: "Maître des Formes", subtitle: "Le Secret des Côtés et Sommets", scoreLabel: "Score", livesLabel: "Vies", streakLabel: "Série", timeLabel: "Temps", difficulty_1: "Débutant", difficulty_2: "Intermédiaire", difficulty_3: "Avancé", question: "Quelle est la somme des côtés et des sommets de cette figure ?", answerPlaceholder: "Réponse", submitButton: "Vérifier", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Indice ({remaining}/3)", hintButtonClose: "Fermer l'indice", hintLabel: "Indice:", hintUsedText: "(Indice utilisé, pénalité de 50%)", hintSpecialShapeText: "Cette figure a une règle speciale. Essayez de la compter comme {count} ! 🔵", hintNormalShapeText: "{sides} côtés + {vertices} sommets = ?", feedbackCorrect: "Correct ! +{score} points", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorrect. La réponse est {correctAnswer}. 💔", achievementsTitle: "Succès ({count}/4)", achievements_firstCorrect: "Premier Correct", achievements_lightningSpeed: "Rapide", achievements_streakMaster: "Série", achievements_master: "Maître", achievementsTooltip_firstCorrect: "Obtenez votre première bonne réponse.", achievementsTooltip_lightningSpeed: "Répondez en moins de 3 secondes.", achievementsTooltip_streakMaster: "Obtenez une série de 5 questions.", achievementsTooltip_master: "Répondez correctement à 3+ questions en difficulté Avancé.", gameOverTitle: "Partie Terminée !", gameOverBadge: "Fin", finalScoreLabel: "Score Final", scoreUnit: " pts", difficultyReachedLabel: "Difficulté Atteinte", bestStreakLabel: "Meilleure Série", itemUnit: "", starsEarnedLabel: "Étoiles Gagnées", accuracyLabel: "Précision", achievementsEarnedLabel: "Succès Débloqués", gameOverMessage_great: "🎉 Excellent travail !", gameOverMessage_good: "👍 Bien joué !", gameOverMessage_tryAgain: "💪 Vous pouvez faire mieux la prochaine fois !", playAgainButton: "Rejouer", tip: "💡 Astuce : Répondez correctly à autant de questions que possible en 1 minute !", howToPlayButton: "Comment Jouer", howToPlayTitle: "Comment Jouer", howToPlay_goal_title: "Objectif", howToPlay_goal_desc: "Répondez correctement à la somme des côtés et des sommets de la figure aussi vite que possible.", howToPlay_time_lives_title: "Temps & Vies", howToPlay_time_lives_desc: "Vous avez 60 secondes et 3 vies. Une mauvaise réponse coûte une vie. Ne laissez pas le chronomètre s'écouler !", howToPlay_difficulty_title: "Difficulté", howToPlay_difficulty_desc: "Le jeu s'adapte ! Mieux vous jouez, plus les formes deviennent difficiles, vous rapportant plus de points.", howToPlay_streak_title: "Série & Power-ups", howToPlay_streak_desc: "Enchaînez les bonnes réponses pour un bonus de série. Gagnez des power-ups aléatoires comme ❄️ Gel du Temps, ❤️ Vie Supplémentaire et ⚡ Score Double !", howToPlay_hints_title: "Indices", howToPlay_hints_desc: "Bloqué ? Utilisez l'un des 3 indices par partie. Attention, cela vous coûtera 50% du score pour cette question.", howToPlay_achievements_title: "Succès", howToPlay_achievements_desc: "Débloquez des succès spéciaux en accomplissant des jalons dans le jeu.", closeButton: "Compris !", startGameButton: "Commencer à jouer", shareResultButton: "Télécharger le résultat", shareSuccess: "✅ Image téléchargée !", shareError: "❌ Oups, impossible de télécharger."
  },
  de: {
    title: "Formen-Meister", subtitle: "Das Geheimnis der Seiten & Ecken", scoreLabel: "Punkte", livesLabel: "Leben", streakLabel: "Serie", timeLabel: "Zeit", difficulty_1: "Anfänger", difficulty_2: "Mittel", difficulty_3: "Fortgeschritten", question: "Was ist die Summe der Seiten und Ecken dieser Form?", answerPlaceholder: "Antwort", submitButton: "Prüfen", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Tipp ({remaining}/3)", hintButtonClose: "Tipp schließen", hintLabel: "Tipp:", hintUsedText: "(Tipp verwendet, 50% Abzug)", hintSpecialShapeText: "Diese Form hat eine Sonderregel. Zähle sie als {count}! 🔵", hintNormalShapeText: "{sides} Seiten + {vertices} Ecken = ?", feedbackCorrect: "Richtig! +{score} Punkte", feedbackEmojiCorrect: "🎉", feedbackWrong: "Falsch. Die Antwort ist {correctAnswer}. 💔", achievementsTitle: "Erfolge ({count}/4)", achievements_firstCorrect: "Erste Richtige", achievements_lightningSpeed: "Schnell", achievements_streakMaster: "Serie", achievements_master: "Meister", achievementsTooltip_firstCorrect: "Erziele deine erste richtige Antwort.", achievementsTooltip_lightningSpeed: "Antworte in weniger als 3 Sekunden.", achievementsTooltip_streakMaster: "Erreiche eine Serie von 5 Fragen.", achievementsTooltip_master: "Beantworte 3+ Fragen auf dem Schwierigkeitsgrad Fortgeschritten richtig.", gameOverTitle: "Spiel Vorbei!", gameOverBadge: "Ende", finalScoreLabel: "Endpunktzahl", scoreUnit: " Pkt", difficultyReachedLabel: "Erreichte Schwierigkeit", bestStreakLabel: "Beste Serie", itemUnit: "", starsEarnedLabel: "Verdiente Sterne", accuracyLabel: "Genauigkeit", achievementsEarnedLabel: "Freigeschaltete Erfolge", gameOverMessage_great: "🎉 Ausgezeichnete Arbeit!", gameOverMessage_good: "👍 Gut gemacht!", gameOverMessage_tryAgain: "💪 Nächstes Mal schaffst du das!", playAgainButton: "Nochmal Spielen", tip: "💡 Tipp: Beantworte so viele Fragen wie möglich in 1 Minute richtig!", howToPlayButton: "Spielanleitung", howToPlayTitle: "Spielanleitung", howToPlay_goal_title: "Ziel", howToPlay_goal_desc: "Beantworte die Summe der Seiten und Ecken der Form so schnell wie möglich richtig.", howToPlay_time_lives_title: "Zeit & Leben", howToPlay_time_lives_desc: "Du hast 60 Sekunden und 3 Leben. Eine falsche Antwort kostet ein Leben. Lass die Zeit nicht ablaufen!", howToPlay_difficulty_title: "Schwierigkeit", howToPlay_difficulty_desc: "Das Spiel passt sich an! Je besser du spielst, desto schwieriger werden die Formen und desto mehr Punkte erhältst du.", howToPlay_streak_title: "Serie & Power-ups", howToPlay_streak_desc: "Reihe richtige Antworten aneinander für einen Serienbonus. Verdiene zufällige Power-ups wie ❄️ Zeit Einfrieren, ❤️ Extraleben und ⚡ Doppel-Punkte!", howToPlay_hints_title: "Hinweise", howToPlay_hints_desc: "Steckst du fest? Nutze einen von 3 Hinweisen pro Spiel. Aber Vorsicht, es kostet dich 50% der Punkte für diese Frage.", howToPlay_achievements_title: "Erfolge", howToPlay_achievements_desc: "Schalte besondere Erfolge frei, indem du Meilensteine im Spiel erreichst.", closeButton: "Verstanden!", startGameButton: "Spiel starten", shareResultButton: "Ergebnis herunterladen", shareSuccess: "✅ Bild heruntergeladen!", shareError: "❌ Hoppla, konnte nicht heruntergeladen werden."
  },
  pt: {
    title: "Mestre das Formas", subtitle: "O Segredo dos Lados e Vértices", scoreLabel: "Pontos", livesLabel: "Vidas", streakLabel: "Sequência", timeLabel: "Tempo", difficulty_1: "Iniciante", difficulty_2: "Intermediário", difficulty_3: "Avançado", question: "Qual é a soma dos lados e vértices desta forma?", answerPlaceholder: "Resposta", submitButton: "Verificar", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Dica ({remaining}/3)", hintButtonClose: "Fechar Dica", hintLabel: "Dica:", hintUsedText: "(Dica usada, penalidade de 50%)", hintSpecialShapeText: "Esta forma tem uma regra especial. Tente contá-la como {count}! 🔵", hintNormalShapeText: "{sides} lados + {vertices} vértices = ?", feedbackCorrect: "Correto! +{score} pontos", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorreto. A resposta é {correctAnswer}. 💔", achievementsTitle: "Conquistas ({count}/4)", achievements_firstCorrect: "Primeiro Acerto", achievements_lightningSpeed: "Veloz", achievements_streakMaster: "Sequência", achievements_master: "Mestre", achievementsTooltip_firstCorrect: "Obtenha sua primeira resposta correta.", achievementsTooltip_lightningSpeed: "Responda em menos de 3 segundos.", achievementsTooltip_streakMaster: "Obtenha uma sequência de 5 perguntas.", achievementsTooltip_master: "Responda corretamente a 3+ perguntas na dificuldade Avançado.", gameOverTitle: "Fim de Jogo!", gameOverBadge: "Fim", finalScoreLabel: "Pontuação Final", scoreUnit: " pts", difficultyReachedLabel: "Dificuldade Atingida", bestStreakLabel: "Melhor Sequência", itemUnit: "", starsEarnedLabel: "Estrelas Ganhas", accuracyLabel: "Precisão", achievementsEarnedLabel: "Conquistas Desbloqueadas", gameOverMessage_great: "🎉 Excelente trabalho!", gameOverMessage_good: "👍 Muito bem!", gameOverMessage_tryAgain: "💪 Você consegue fazer melhor na próxima vez!", playAgainButton: "Jogar Novamente", tip: "💡 Dica: Responda corretamente ao maior número de perguntas que puder em 1 minuto!", howToPlayButton: "Como Jogar", howToPlayTitle: "Como Jogar", howToPlay_goal_title: "Objetivo", howToPlay_goal_desc: "Responda corretamente à soma dos lados e vértices da forma o mais rápido que puder.", howToPlay_time_lives_title: "Tempo & Vidas", howToPlay_time_lives_desc: "Você tem 60 segundos e 3 vidas. Uma resposta incorreta custa uma vida. Não deixe o tempo acabar!", howToPlay_difficulty_title: "Dificuldade", howToPlay_difficulty_desc: "O jogo se adapta! Quanto melhor você joga, mais difíceis as formas se tornam, rendendo mais pontos.", howToPlay_streak_title: "Sequência & Power-ups", howToPlay_streak_desc: "Acerte respostas em sequência para um bônus de combo. Ganhe power-ups aleatórios como ❄️ Congelar Tempo, ❤️ Vida Extra e ⚡ Pontuação em Dobro!", howToPlay_hints_title: "Dicas", howToPlay_hints_desc: "Empacou? Use uma das 3 dicas por jogo. Cuidado, isso custará 50% da pontuação daquela questão.", howToPlay_achievements_title: "Conquistas", howToPlay_achievements_desc: "Desbloqueie conquistas especiais ao completar marcos no jogo.", closeButton: "Entendi!", startGameButton: "Começar a jogar", shareResultButton: "Baixar resultado", shareSuccess: "✅ Imagem baixada!", shareError: "❌ Ops, não foi possível baixar."
  },
  it: {
    title: "Maestro delle Forme", subtitle: "Il Segreto di Lati e Vertici", scoreLabel: "Punteggio", livesLabel: "Vite", streakLabel: "Serie", timeLabel: "Tempo", difficulty_1: "Principiante", difficulty_2: "Intermedio", difficulty_3: "Avanzato", question: "Qual è la somma dei lati e dei vertici di questa forma?", answerPlaceholder: "Risposta", submitButton: "Controlla", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Suggerimento ({remaining}/3)", hintButtonClose: "Chiudi Suggerimento", hintLabel: "Suggerimento:", hintUsedText: "(Suggerimento usato, penalità 50%)", hintSpecialShapeText: "Questa forma ha una regola speciale. Prova a contarla come {count}! 🔵", hintNormalShapeText: "{sides} lati + {vertices} vertici = ?", feedbackCorrect: "Corretto! +{score} punti", feedbackEmojiCorrect: "🎉", feedbackWrong: "Sbagliato. La risposta è {correctAnswer}. 💔", achievementsTitle: "Obiettivi ({count}/4)", achievements_firstCorrect: "Primo Corretto", achievements_lightningSpeed: "Veloce", achievements_streakMaster: "Serie", achievements_master: "Maestro", achievementsTooltip_firstCorrect: "Ottieni la tua prima risposta corretta.", achievementsTooltip_lightningSpeed: "Rispondi in meno di 3 secondi.", achievementsTooltip_streakMaster: "Ottieni una serie di 5 domande.", achievementsTooltip_master: "Rispondi correttamente a 3+ domande in difficoltà Avanzato.", gameOverTitle: "Fine del Gioco!", gameOverBadge: "Fine", finalScoreLabel: "Punteggio Finale", scoreUnit: " pti", difficultyReachedLabel: "Difficoltà Raggiunta", bestStreakLabel: "Miglior Serie", itemUnit: "", starsEarnedLabel: "Stelle Guadagnate", accuracyLabel: "Precisione", achievementsEarnedLabel: "Obiettivi Sbloccati", gameOverMessage_great: "🎉 Ottimo lavoro!", gameOverMessage_good: "👍 Ben fatto!", gameOverMessage_tryAgain: "💪 Puoi fare di meglio la prossima volta!", playAgainButton: "Gioca Ancora", tip: "💡 Suggerimento: Rispondi correttamente a quante più domande puoi in 1 minuto!", howToPlayButton: "Come Giocare", howToPlayTitle: "Come Giocare", howToPlay_goal_title: "Obiettivo", howToPlay_goal_desc: "Rispondi correttamente alla somma dei lati e dei vertici della forma il più velocemente possibile.", howToPlay_time_lives_title: "Tempo & Vite", howToPlay_time_lives_desc: "Hai 60 secondi e 3 vite. Una risposta sbagliata costa una vita. Non far scadere il tempo!", howToPlay_difficulty_title: "Difficoltà", howToPlay_difficulty_desc: "Il gioco si adatta! Meglio giochi, più difficili diventano le forme, facendoti guadagnare più punti.", howToPlay_streak_title: "Serie & Power-up", howToPlay_streak_desc: "Incatena risposte corrette per un bonus di serie. Ottieni potenziamenti casuali come ❄️ Congela Tempo, ❤️ Vita Extra e ⚡ Punteggio Doppio!", howToPlay_hints_title: "Suggerimenti", howToPlay_hints_desc: "Bloccato? Usa uno dei 3 suggerimenti per partita. Attenzione, ti costerà il 50% del punteggio per quella domanda.", howToPlay_achievements_title: "Obiettivi", howToPlay_achievements_desc: "Sblocca obiettivi speciali completando traguardi nel gioco.", closeButton: "Capito!", startGameButton: "Inizia a giocare", shareResultButton: "Scarica risultato", shareSuccess: "✅ Immagine scaricata!", shareError: "❌ Ops, impossibile scaricare."
  },
  ru: {
    title: "Мастер Фигур", subtitle: "Секрет Сторон и Вершин", scoreLabel: "Счет", livesLabel: "Жизни", streakLabel: "Серия", timeLabel: "Время", difficulty_1: "Новичок", difficulty_2: "Средний", difficulty_3: "Продвинутый", question: "Какова сумма сторон и вершин этой фигуры?", answerPlaceholder: "Ответ", submitButton: "Проверить", doubleScoreActive: "⚡2x ({timeLeft}с)", hintButton: "💡 Подсказка ({remaining}/3)", hintButtonClose: "Закрыть подсказку", hintLabel: "Подсказка:", hintUsedText: "(Подсказка использована, штраф 50%)", hintSpecialShapeText: "У этой фигуры особое правило. Попробуйте посчитать ее как {count}! 🔵", hintNormalShapeText: "{sides} сторон + {vertices} вершин = ?", feedbackCorrect: "Правильно! +{score} очков", feedbackEmojiCorrect: "🎉", feedbackWrong: "Неправильно. Ответ: {correctAnswer}. 💔", achievementsTitle: "Достижения ({count}/4)", achievements_firstCorrect: "Первый верный", achievements_lightningSpeed: "Быстрый", achievements_streakMaster: "Серия", achievements_master: "Мастер", achievementsTooltip_firstCorrect: "Дайте свой первый правильный ответ.", achievementsTooltip_lightningSpeed: "Ответьте менее чем за 3 секунды.", achievementsTooltip_streakMaster: "Соберите серию из 5 вопросов.", achievementsTooltip_master: "Правильно ответьте на 3+ вопросов на Продвинутом уровне.", gameOverTitle: "Игра Окончена!", gameOverBadge: "Конец", finalScoreLabel: "Итоговый Счет", scoreUnit: " очк", difficultyReachedLabel: "Достигнутая Сложность", bestStreakLabel: "Лучшая Серия", itemUnit: "", starsEarnedLabel: "Заработано Звезд", accuracyLabel: "Точность", achievementsEarnedLabel: "Разблокированные Достижения", gameOverMessage_great: "🎉 Отличная работа!", gameOverMessage_good: "👍 Хорошо сделано!", gameOverMessage_tryAgain: "💪 В следующий раз у вас получится лучше!", playAgainButton: "Играть Снова", tip: "💡 Совет: Ответьте правильно на как можно больше вопросов за 1 минуту!", howToPlayButton: "Как играть", howToPlayTitle: "Как играть", howToPlay_goal_title: "Цель", howToPlay_goal_desc: "Правильно ответьте на сумму сторон и вершин фигуры как можно быстрее.", howToPlay_time_lives_title: "Время и жизни", howToPlay_time_lives_desc: "У вас есть 60 секунд и 3 жизни. Неправильный ответ стоит одной жизни. Не дайте времени истечь!", howToPlay_difficulty_title: "Сложность", howToPlay_difficulty_desc: "Игра адаптируется! Чем лучше вы играете, тем сложнее становятся фигуры, и тем больше очков вы получаете.", howToPlay_streak_title: "Серия и бонусы", howToPlay_streak_desc: "Составляйте цепочки правильных ответов для получения бонуса за серию. Получайте случайные бонусы, такие как ❄️ Заморозка времени, ❤️ Дополнительная жизнь и ⚡ Двойные очки!", howToPlay_hints_title: "Подсказки", howToPlay_hints_desc: "Застряли? Используйте одну из 3 подсказок за игру. Будьте осторожны, это будет стоить вам 50% очков за этот вопрос.", howToPlay_achievements_title: "Достижения", howToPlay_achievements_desc: "Открывайте особые достижения, выполняя важные этапы в игре.", closeButton: "Понятно!", startGameButton: "Начать игру", shareResultButton: "Скачать результат", shareSuccess: "✅ Изображение загружено!", shareError: "❌ Ой, не удалось скачать."
  },
  ar: {
    title: "سيد الأشكال", subtitle: "سر الأضلاع والرؤوس", scoreLabel: "النقاط", livesLabel: "الأرواح", streakLabel: "سلسلة", timeLabel: "الوقت", difficulty_1: "مبتدئ", difficulty_2: "متوسط", difficulty_3: "متقدم", question: "ما هو مجموع أضلاع ورؤوس هذا الشكل؟", answerPlaceholder: "الإجابة", submitButton: "تحقق", doubleScoreActive: "⚡2x ({timeLeft} ثانية)", hintButton: "💡 تلميح ({remaining}/3)", hintButtonClose: "إغلاق التلميح", hintLabel: "تلميح:", hintUsedText: "(تم استخدام تلميح، خصم 50%)", hintSpecialShapeText: "هذا الشكل له قاعدة خاصة. حاول عده كـ {count}! 🔵", hintNormalShapeText: "{sides} أضلاع + {vertices} رؤوس = ؟", feedbackCorrect: "صحيح! +{score} نقطة", feedbackEmojiCorrect: "🎉", feedbackWrong: "غير صحيح. الإجابة هي {correctAnswer}. 💔", achievementsTitle: "الإنجازات ({count}/4)", achievements_firstCorrect: "أول إجابة صحيحة", achievements_lightningSpeed: "سريع", achievements_streakMaster: "سلسلة", achievements_master: "محترف", achievementsTooltip_firstCorrect: "احصل على إجابتك الصحيحة الأولى.", achievementsTooltip_lightningSpeed: "أجب في أقل من 3 ثوان.", achievementsTooltip_streakMaster: "احصل على سلسلة من 5 أسئلة.", achievementsTooltip_master: "أجب بشكل صحيح على 3+ أسئلة في مستوى الصعوبة المتقدم.", gameOverTitle: "انتهت اللعبة!", gameOverBadge: "النهاية", finalScoreLabel: "النتيجة النهائية", scoreUnit: " نقطة", difficultyReachedLabel: "المستوى الذي تم الوصول إليه", bestStreakLabel: "أفضل سلسلة", itemUnit: "", starsEarnedLabel: "النجوم المكتسبة", accuracyLabel: "الدقة", achievementsEarnedLabel: "الإنجازات المفتوحة", gameOverMessage_great: "🎉 عمل ممتاز!", gameOverMessage_good: "👍 أحسنت!", gameOverMessage_tryAgain: "💪 يمكنك أن تفعل ما هو أفضل في المرة القادمة!", playAgainButton: "العب مرة أخرى", tip: "💡 نصيحة: أجب بشكل صحيح على أكبر عدد ممكن من الأسئلة في دقيقة واحدة!", howToPlayButton: "كيفية اللعب", howToPlayTitle: "كيفية اللعب", howToPlay_goal_title: "الهدف", howToPlay_goal_desc: "أجب بشكل صحيح على مجموع أضلاع ورؤوس الشكل بأسرع ما يمكن.", howToPlay_time_lives_title: "الوقت والأرواح", howToPlay_time_lives_desc: "لديك 60 ثانية و 3 أرواح. الإجابة غير الصحيحة تكلف روحًا واحدة. لا تدع الوقت ينفد!", howToPlay_difficulty_title: "الصعوبة", howToPlay_difficulty_desc: "اللعبة تتكيف! كلما لعبت بشكل أفضل، أصبحت الأشكال أصعب، مما يكسبك المزيد من النقاط.", howToPlay_streak_title: "السلسلة والتعزيزات", howToPlay_streak_desc: "اربط الإجابات الصحيحة للحصول على مكافأة سلسلة. اكسب تعزيزات عشوائية مثل ❄️ تجميد الوقت، ❤️ حياة إضافية، و ⚡ نقاط مضاعفة!", howToPlay_hints_title: "تلميحات", howToPlay_hints_desc: "هل أنت عالق؟ استخدم واحدًا من 3 تلميحات لكل لعبة. كن حذرًا، سيكلفك ذلك 50٪ من درجة هذا السؤال.", howToPlay_achievements_title: "الإنجازات", howToPlay_achievements_desc: "افتح الإنجازات الخاصة من خلال إكمال المعالم في اللعبة.", closeButton: "فهمت!", startGameButton: "ابدأ اللعبة", shareResultButton: "تنزيل النتيجة", shareSuccess: "✅ تم تنزيل الصورة!", shareError: "❌ عذراً، لم يتم التنزيل."
  },
  zh: {
    title: "图形大师", subtitle: "边与顶点的秘密", scoreLabel: "分数", livesLabel: "生命", streakLabel: "连击", timeLabel: "时间", difficulty_1: "初级", difficulty_2: "中级", difficulty_3: "高级", question: "这个图形的边和顶点总数是多少？", answerPlaceholder: "答案", submitButton: "检查", doubleScoreActive: "⚡2倍 ({timeLeft}秒)", hintButton: "💡 提示 ({remaining}/3)", hintButtonClose: "关闭提示", hintLabel: "提示:", hintUsedText: "(已使用提示，扣除50%分数)", hintSpecialShapeText: "这个图形有特殊规则。试着把它算作{count}！🔵", hintNormalShapeText: "{sides}条边 + {vertices}个顶点 = ?", feedbackCorrect: "正确！+{score}分", feedbackEmojiCorrect: "🎉", feedbackWrong: "错误。答案是{correctAnswer}。💔", achievementsTitle: "成就 ({count}/4)", achievements_firstCorrect: "首次正确", achievements_lightningSpeed: "神速", achievements_streakMaster: "连击", achievements_master: "大师", achievementsTooltip_firstCorrect: "获得你的第一次正确答案。", achievementsTooltip_lightningSpeed: "在3秒内回答。", achievementsTooltip_streakMaster: "获得5个问题的连胜。", achievementsTooltip_master: "在高级难度下正确回答3个以上问题。", gameOverTitle: "游戏结束！", gameOverBadge: "完", finalScoreLabel: "最终得分", scoreUnit: "分", difficultyReachedLabel: "达到的难度", bestStreakLabel: "最佳连击", itemUnit: "个", starsEarnedLabel: "获得的星星", accuracyLabel: "准确率", achievementsEarnedLabel: "已解锁成就", gameOverMessage_great: "🎉 太棒了！", gameOverMessage_good: "👍 做得好！", gameOverMessage_tryAgain: "💪 下次可以做得更好！", playAgainButton: "再玩一次", tip: "💡 提示：在1分钟内尽可能多地正确回答问题！", howToPlayButton: "游戏玩法", howToPlayTitle: "游戏玩法", howToPlay_goal_title: "目标", howToPlay_goal_desc: "尽快正确回答图形的边和顶点总数。", howToPlay_time_lives_title: "时间与生命", howToPlay_time_lives_desc: "你有60秒时间和3条生命。回答错误会损失一条生命。不要让时间耗尽！", howToPlay_difficulty_title: "难度", howToPlay_difficulty_desc: "游戏会适应你的水平！你玩得越好，图形就越难，获得的分数也越多。", howToPlay_streak_title: "连击与道具", howToPlay_streak_desc: "连续正确回答可获得连击奖励。赚取随机道具，如❄️时间冻结，❤️额外生命，和⚡双倍得分！", howToPlay_hints_title: "提示", howToPlay_hints_desc: "卡住了？每局游戏可以使用3次提示。但要小心，这会让你失去该问题一半的分数。", howToPlay_achievements_title: "成就", howToPlay_achievements_desc: "在游戏中完成里程碑，解锁特殊成就。", closeButton: "明白了！", startGameButton: "开始游戏", shareResultButton: "下载结果", shareSuccess: "✅ 图片已下载！", shareError: "❌ 哎呀，无法下载。"
  },
  ja: {
    title: "図形マスター", subtitle: "辺と頂点の秘密", scoreLabel: "スコア", livesLabel: "ライフ", streakLabel: "連続", timeLabel: "時間", difficulty_1: "初級", difficulty_2: "中級", difficulty_3: "上級", question: "この図形の辺と頂点の合計は？", answerPlaceholder: "答え", submitButton: "チェック", doubleScoreActive: "⚡2倍 ({timeLeft}秒)", hintButton: "💡 ヒント ({remaining}/3)", hintButtonClose: "ヒントを閉じる", hintLabel: "ヒント:", hintUsedText: "(ヒント使用、スコア50%減)", hintSpecialShapeText: "この図形には特別なルールがあります。{count}として数えてみてください！🔵", hintNormalShapeText: "辺{sides} + 頂点{vertices} = ?", feedbackCorrect: "正解！+{score}ポイント", feedbackEmojiCorrect: "🎉", feedbackWrong: "不正解。答えは{correctAnswer}です。💔", achievementsTitle: "実績 ({count}/4)", achievements_firstCorrect: "初正解", achievements_lightningSpeed: "電光石火", achievements_streakMaster: "連続", achievements_master: "マスター", achievementsTooltip_firstCorrect: "最初の正解をゲット。", achievementsTooltip_lightningSpeed: "3秒以内に回答する。", achievementsTooltip_streakMaster: "5問連続で正解する。", achievementsTooltip_master: "上級難易度で3問以上正解する。", gameOverTitle: "ゲームオーバー！", gameOverBadge: "終", finalScoreLabel: "最終スコア", scoreUnit: "点", difficultyReachedLabel: "到達した難易度", bestStreakLabel: "最高連続記録", itemUnit: "個", starsEarnedLabel: "獲得した星", accuracyLabel: "正解率", achievementsEarnedLabel: "解除した実績", gameOverMessage_great: "🎉 素晴らしい！", gameOverMessage_good: "👍 よくできました！", gameOverMessage_tryAgain: "💪 次はもっとうまくできますよ！", playAgainButton: "もう一度プレイ", tip: "💡 ヒント：1分以内にできるだけ多くの問題に正解しましょう！", howToPlayButton: "遊び方", howToPlayTitle: "遊び方", howToPlay_goal_title: "目標", howToPlay_goal_desc: "図形の辺と頂点の合計を、できるだけ速く正確に答えましょう。", howToPlay_time_lives_title: "時間とライフ", howToPlay_time_lives_desc: "持ち時間は60秒、ライフは3つです。間違えるとライフが1つ減ります。時間切れに注意！", howToPlay_difficulty_title: "難易度", howToPlay_difficulty_desc: "ゲームはあなたの腕前に適応します！上手にプレイするほど、図形は難しくなり、より多くのポイントを獲得できます。", howToPlay_streak_title: "連続正解とパワーアップ", howToPlay_streak_desc: "連続で正解して、連続ボーナスを獲得しましょう。❄️時間停止、❤️ライフ追加、⚡スコア2倍などのパワーアップをランダムに獲得できます！", howToPlay_hints_title: "ヒント", howToPlay_hints_desc: "行き詰まりましたか？1ゲームにつき3回までヒントを使えます。ただし、その問題のスコアの50%が引かれるので注意してください。", howToPlay_achievements_title: "実績", howToPlay_achievements_desc: "ゲームのマイルストーンを達成して、特別な実績を解除しましょう。", closeButton: "わかった！", startGameButton: "ゲーム開始", shareResultButton: "結果をダウンロード", shareSuccess: "✅ 画像をダウンロードしました！", shareError: "❌ ダウンロードできませんでした。"
  },
  vi: {
    title: "Bậc Thầy Hình Học", subtitle: "Bí Mật của Cạnh & Đỉnh", scoreLabel: "Điểm", livesLabel: "Mạng", streakLabel: "Chuỗi", timeLabel: "Thời gian", difficulty_1: "Mới bắt đầu", difficulty_2: "Trung bình", difficulty_3: "Nâng cao", question: "Tổng số cạnh và đỉnh của hình này là bao nhiêu?", answerPlaceholder: "Trả lời", submitButton: "Kiểm tra", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Gợi ý ({remaining}/3)", hintButtonClose: "Đóng gợi ý", hintLabel: "Gợi ý:", hintUsedText: "(Đã dùng gợi ý, trừ 50% điểm)", hintSpecialShapeText: "Hình này có quy tắc đặc biệt. Hãy thử đếm nó là {count}! 🔵", hintNormalShapeText: "{sides} cạnh + {vertices} đỉnh = ?", feedbackCorrect: "Chính xác! +{score} điểm", feedbackEmojiCorrect: "🎉", feedbackWrong: "Không chính xác. Đáp án là {correctAnswer}. 💔", achievementsTitle: "Thành tích ({count}/4)", achievements_firstCorrect: "Lần đầu đúng", achievements_lightningSpeed: "Nhanh", achievements_streakMaster: "Chuỗi", achievements_master: "Bậc Thầy", achievementsTooltip_firstCorrect: "Nhận câu trả lời đúng đầu tiên của bạn.", achievementsTooltip_lightningSpeed: "Trả lời trong vòng 3 giây.", achievementsTooltip_streakMaster: "Đạt được chuỗi 5 câu hỏi.", achievementsTooltip_master: "Trả lời đúng 3+ câu hỏi ở độ khó Nâng cao.", gameOverTitle: "Trò chơi kết thúc!", gameOverBadge: "Hết", finalScoreLabel: "Điểm cuối cùng", scoreUnit: " điểm", difficultyReachedLabel: "Độ khó đạt được", bestStreakLabel: "Chuỗi tốt nhất", itemUnit: "", starsEarnedLabel: "Số sao kiếm được", accuracyLabel: "Độ chính xác", achievementsEarnedLabel: "Thành tích đã mở khóa", gameOverMessage_great: "🎉 Làm tốt lắm!", gameOverMessage_good: "👍 Rất tốt!", gameOverMessage_tryAgain: "💪 Lần sau bạn có thể làm tốt hơn!", playAgainButton: "Chơi lại", tip: "💡 Mẹo: Trả lời đúng càng nhiều câu hỏi càng tốt trong 1 phút!", howToPlayButton: "Cách chơi", howToPlayTitle: "Cách chơi", howToPlay_goal_title: "Mục tiêu", howToPlay_goal_desc: "Trả lời đúng tổng số cạnh và đỉnh của hình nhanh nhất có thể.", howToPlay_time_lives_title: "Thời gian & Mạng", howToPlay_time_lives_desc: "Bạn có 60 giây và 3 mạng. Một câu trả lời sai sẽ mất một mạng. Đừng để hết giờ!", howToPlay_difficulty_title: "Độ khó", howToPlay_difficulty_desc: "Trò chơi sẽ thích ứng! Bạn chơi càng giỏi, các hình dạng càng khó, giúp bạn kiếm được nhiều điểm hơn.", howToPlay_streak_title: "Chuỗi & Vật phẩm hỗ trợ", howToPlay_streak_desc: "Trả lời đúng liên tiếp để nhận thưởng chuỗi. Nhận các vật phẩm hỗ trợ ngẫu nhiên như ❄️ Đóng băng thời gian, ❤️ Thêm mạng, và ⚡ Nhân đôi điểm!", howToPlay_hints_title: "Gợi ý", howToPlay_hints_desc: "Bị kẹt? Sử dụng một trong 3 gợi ý mỗi ván. Hãy cẩn thận, nó sẽ khiến bạn mất 50% số điểm cho câu hỏi đó.", howToPlay_achievements_title: "Thành tích", howToPlay_achievements_desc: "Mở khóa các thành tích đặc biệt bằng cách hoàn thành các cột mốc trong trò chơi.", closeButton: "Đã hiểu!", startGameButton: "Bắt đầu chơi", shareResultButton: "Tải xuống kết quả", shareSuccess: "✅ Đã tải xuống hình ảnh!", shareError: "❌ Rất tiếc, không thể tải xuống."
  },
  th: {
    title: "เจ้าแห่งรูปทรง", subtitle: "ความลับของด้านและจุดยอด", scoreLabel: "คะแนน", livesLabel: "ชีวิต", streakLabel: "สตรีค", timeLabel: "เวลา", difficulty_1: "เริ่มต้น", difficulty_2: "ปานกลาง", difficulty_3: "ขั้นสูง", question: "ผลรวมของด้านและจุดยอดของรูปนี้คือเท่าใด", answerPlaceholder: "คำตอบ", submitButton: "ตรวจสอบ", doubleScoreActive: "⚡2x ({timeLeft}วิ)", hintButton: "💡 คำใบ้ ({remaining}/3)", hintButtonClose: "ปิดคำใบ้", hintLabel: "คำใบ้:", hintUsedText: "(ใช้คำใบ้, คะแนนลด 50%)", hintSpecialShapeText: "รูปทรงนี้มีกฎพิเศษ ลองนับเป็น {count}! 🔵", hintNormalShapeText: "{sides} ด้าน + {vertices} จุดยอด = ?", feedbackCorrect: "ถูกต้อง! +{score} คะแนน", feedbackEmojiCorrect: "🎉", feedbackWrong: "ผิด. คำตอบคือ {correctAnswer} 💔", achievementsTitle: "ความสำเร็จ ({count}/4)", achievements_firstCorrect: "ถูกต้องครั้งแรก", achievements_lightningSpeed: "รวดเร็ว", achievements_streakMaster: "สตรีค", achievements_master: "มาสเตอร์", achievementsTooltip_firstCorrect: "ตอบคำถามถูกเป็นครั้งแรก", achievementsTooltip_lightningSpeed: "ตอบภายใน 3 วินาที", achievementsTooltip_streakMaster: "ทำสตรีค 5 คำถาม", achievementsTooltip_master: "ตอบคำถามถูกต้อง 3+ ข้อในระดับความยากขั้นสูง", gameOverTitle: "เกมจบแล้ว!", gameOverBadge: "จบ", finalScoreLabel: "คะแนนสุดท้าย", scoreUnit: " คะแนน", difficultyReachedLabel: "ระดับความยากที่ไปถึง", bestStreakLabel: "สตรีคสูงสุด", itemUnit: "", starsEarnedLabel: "ดาวที่ได้รับ", accuracyLabel: "ความแม่นยำ", achievementsEarnedLabel: "ความสำเร็จที่ปลดล็อค", gameOverMessage_great: "🎉 ยอดเยี่ยมมาก!", gameOverMessage_good: "👍 ทำได้ดี!", gameOverMessage_tryAgain: "💪 คราวหน้าต้องดีกว่านี้!", playAgainButton: "เล่นอีกครั้ง", tip: "💡 เคล็ดลับ: ตอบคำถามให้ถูกให้ได้มากที่สุดภายใน 1 นาที!", howToPlayButton: "วิธีเล่น", howToPlayTitle: "วิธีเล่น", howToPlay_goal_title: "เป้าหมาย", howToPlay_goal_desc: "ตอบผลรวมของด้านและจุดยอดของรูปทรงให้ถูกต้องและเร็วที่สุด", howToPlay_time_lives_title: "เวลา & ชีวิต", howToPlay_time_lives_desc: "คุณมีเวลา 60 วินาทีและ 3 ชีวิต การตอบผิดจะเสีย 1 ชีวิต อย่าปล่อยให้เวลาหมด!", howToPlay_difficulty_title: "ระดับความยาก", howToPlay_difficulty_desc: "เกมจะปรับตามฝีมือของคุณ! ยิ่งเล่นเก่ง รูปทรงก็จะยิ่งยากขึ้น และได้คะแนนมากขึ้น", howToPlay_streak_title: "สตรีค & ไอเทมเสริม", howToPlay_streak_desc: "ตอบถูกติดต่อกันเพื่อรับโบนัสสตรีค รับไอเทมเสริมแบบสุ่ม เช่น ❄️ หยุดเวลา, ❤️ เพิ่มชีวิต, และ ⚡ คะแนนสองเท่า!", howToPlay_hints_title: "คำใบ้", howToPlay_hints_desc: "ติดอยู่เหรอ? ใช้คำใบ้ได้ 3 ครั้งต่อเกม แต่ระวังนะ มันจะทำให้คุณเสียคะแนน 50% สำหรับคำถามนั้น", howToPlay_achievements_title: "ความสำเร็จ", howToPlay_achievements_desc: "ปลดล็อกความสำเร็จพิเศษโดยการบรรลุเป้าหมายในเกม", closeButton: "เข้าใจแล้ว!", startGameButton: "เริ่มเกม", shareResultButton: "ดาวน์โหลดผลลัพธ์", shareSuccess: "✅ ดาวน์โหลดรูปภาพแล้ว!", shareError: "❌ อ๊ะ ดาวน์โหลดไม่ได้"
  },
  id: {
    title: "Master Bentuk", subtitle: "Rahasia Sisi & Sudut", scoreLabel: "Skor", livesLabel: "Nyawa", streakLabel: "Beruntun", timeLabel: "Waktu", difficulty_1: "Pemula", difficulty_2: "Menengah", difficulty_3: "Lanjutan", question: "Berapakah jumlah sisi dan sudut dari bentuk ini?", answerPlaceholder: "Jawaban", submitButton: "Periksa", doubleScoreActive: "⚡2x ({timeLeft}d)", hintButton: "💡 Petunjuk ({remaining}/3)", hintButtonClose: "Tutup Petunjuk", hintLabel: "Petunjuk:", hintUsedText: "(Petunjuk digunakan, penalti skor 50%)", hintSpecialShapeText: "Bentuk ini memiliki aturan khusus. Coba hitung sebagai {count}! 🔵", hintNormalShapeText: "{sides} sisi + {vertices} sudut = ?", feedbackCorrect: "Benar! +{score} poin", feedbackEmojiCorrect: "🎉", feedbackWrong: "Salah. Jawabannya adalah {correctAnswer}. 💔", achievementsTitle: "Pencapaian ({count}/4)", achievements_firstCorrect: "Benar Pertama", achievements_lightningSpeed: "Cepat", achievements_streakMaster: "Beruntun", achievements_master: "Master", achievementsTooltip_firstCorrect: "Dapatkan jawaban benar pertama Anda.", achievementsTooltip_lightningSpeed: "Jawab dalam kurang dari 3 detik.", achievementsTooltip_streakMaster: "Dapatkan 5 pertanyaan beruntun.", achievementsTooltip_master: "Jawab 3+ pertanyaan dengan benar pada tingkat Lanjutan.", gameOverTitle: "Permainan Selesai!", gameOverBadge: "Selesai", finalScoreLabel: "Skor Akhir", scoreUnit: " poin", difficultyReachedLabel: "Tingkat Kesulitan Tercapai", bestStreakLabel: "Terbaik Beruntun", itemUnit: "", starsEarnedLabel: "Bintang yang Diperoleh", accuracyLabel: "Akurasi", achievementsEarnedLabel: "Pencapaian Terbuka", gameOverMessage_great: "🎉 Kerja bagus sekali!", gameOverMessage_good: "👍 Bagus sekali!", gameOverMessage_tryAgain: "💪 Anda bisa lebih baik lain kali!", playAgainButton: "Main Lagi", tip: "💡 Tip: Jawab pertanyaan dengan benar sebanyak mungkin dalam 1 menit!", howToPlayButton: "Cara Bermain", howToPlayTitle: "Cara Bermain", howToPlay_goal_title: "Tujuan", howToPlay_goal_desc: "Jawab jumlah sisi dan sudut bentuk dengan benar secepat mungkin.", howToPlay_time_lives_title: "Waktu & Nyawa", howToPlay_time_lives_desc: "Anda memiliki 60 detik dan 3 nyawa. Jawaban yang salah mengurangi satu nyawa. Jangan biarkan waktu habis!", howToPlay_difficulty_title: "Tingkat Kesulitan", howToPlay_difficulty_desc: "Permainan ini adaptif! Semakin baik Anda bermain, semakin sulit bentuknya, dan semakin banyak poin yang Anda dapatkan.", howToPlay_streak_title: "Beruntun & Power-up", howToPlay_streak_desc: "Rangkai jawaban yang benar untuk bonus beruntun. Dapatkan power-up acak seperti ❄️ Pembekuan Waktu, ❤️ Nyawa Ekstra, dan ⚡ Skor Ganda!", howToPlay_hints_title: "Petunjuk", howToPlay_hints_desc: "Butuh bantuan? Gunakan salah satu dari 3 petunjuk per permainan. Hati-hati, ini akan mengurangi 50% skor Anda untuk pertanyaan itu.", howToPlay_achievements_title: "Pencapaian", howToPlay_achievements_desc: "Buka pencapaian khusus dengan menyelesaikan tonggak sejarah dalam permainan.", closeButton: "Mengerti!", startGameButton: "Mulai permainan", shareResultButton: "Unduh Hasil", shareSuccess: "✅ Gambar diunduh!", shareError: "❌ Ups, tidak dapat mengunduh."
  }
};

const bgMusicTracks = [
  'https://soundimage.org/wp-content/uploads/2025/03/Pixel-Balloons_v2.mp3',
  'https://soundimage.org/wp-content/uploads/2025/03/Pixel-Balloons_v1.mp3',
  'https://soundimage.org/wp-content/uploads/2025/06/Bounce-Light-3.mp3',
  'https://soundimage.org/wp-content/uploads/2021/05/Brain-Teaser-3.mp3',
  'https://soundimage.org/wp-content/uploads/2021/04/Popsicle-Puzzles.mp3',
  'https://soundimage.org/wp-content/uploads/2017/08/Bubble-Gum-Puzzler-2.mp3',
  'https://soundimage.org/wp-content/uploads/2017/07/Cool-Puzzler.mp3',
  'https://soundimage.org/wp-content/uploads/2017/06/Sky-Puzzle.mp3',
  'https://soundimage.org/wp-content/uploads/2017/05/Hypnotic-Puzzle3.mp3',
];

// 3단계 난이도별 도형 분류 - 다양한 형태 추가
const shapesByDifficulty = {
  1: [ // 기초 단계 - 8가지 도형
    { id: 1, name: '정삼각형', sides: 3, vertices: 3, color: '#FF6B9D', path: 'M 50 20 L 20 80 L 80 80 Z', difficulty: 1 },
    { id: 2, name: '직각삼각형', sides: 3, vertices: 3, color: '#FF8E53', path: 'M 30 20 L 30 75 L 75 75 Z', difficulty: 1 },
    { id: 3, name: '정사각형', sides: 4, vertices: 4, color: '#4ECDC4', path: 'M 25 25 L 75 25 L 75 75 L 25 75 Z', difficulty: 1 },
    { id: 4, name: '직사각형', sides: 4, vertices: 4, color: '#B8E6B8', path: 'M 20 35 L 80 35 L 80 65 L 20 65 Z', difficulty: 1 },
    { id: 5, name: '원', sides: 0, vertices: 0, color: '#FFEAA7', path: 'M 50 50 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0', special: true, specialAnswer: 1, difficulty: 1 },
    { id: 6, name: '타원', sides: 0, vertices: 0, color: '#FDD8B5', path: 'M 50 50 m -30 0 a 30 20 0 1 0 60 0 a 30 20 0 1 0 -60 0', special: true, specialAnswer: 1, difficulty: 1 },
    { id: 7, name: '평행사변형', sides: 4, vertices: 4, color: '#85C1E9', path: 'M 20 25 L 65 25 L 80 75 L 35 75 Z', difficulty: 1 },
    { id: 8, name: '이등변삼각형', sides: 3, vertices: 3, color: '#F8C471', path: 'M 50 15 L 25 75 L 75 75 Z', difficulty: 1 }
  ],
  2: [ // 중급 단계 - 10가지 도형
    { id: 9, name: '정오각형', sides: 5, vertices: 5, color: '#45B7D1', path: 'M 50 15 L 65 35 L 60 55 L 40 55 L 35 35 Z', difficulty: 2 },
    { id: 10, name: '정육각형', sides: 6, vertices: 6, color: '#96CEB4', path: 'M 50 20 L 65 30 L 65 50 L 50 60 L 35 50 L 35 30 Z', difficulty: 2 },
    { id: 11, name: '다이아몬드', sides: 4, vertices: 4, color: '#FD79A8', path: 'M 50 20 L 70 50 L 50 80 L 30 50 Z', difficulty: 2 },
    { id: 12, name: '연꼴', sides: 4, vertices: 4, color: '#AED6F1', path: 'M 50 15 L 65 45 L 50 55 L 35 45 Z', difficulty: 2 },
    { id: 13, name: '사다리꼴', sides: 4, vertices: 4, color: '#DDA0DD', path: 'M 30 25 L 70 25 L 80 75 L 20 75 Z', difficulty: 2 },
    { id: 14, name: '집모양', sides: 5, vertices: 5, color: '#98FB98', path: 'M 50 15 L 75 40 L 75 75 L 25 75 L 25 40 Z', difficulty: 2 },
    { id: 15, name: '화살표', sides: 7, vertices: 7, color: '#FFB347', path: 'M 30 40 L 50 20 L 70 40 L 60 40 L 60 60 L 40 60 L 40 40 Z', difficulty: 2 },
    { id: 16, name: '십자가', sides: 12, vertices: 12, color: '#DEB887', path: 'M 40 20 L 60 20 L 60 40 L 80 40 L 80 60 L 60 60 L 60 80 L 40 80 L 40 60 L 20 60 L 20 40 L 40 40 Z', difficulty: 2 },
    { id: 19, name: '5각별', sides: 10, vertices: 10, color: '#FFD93D', path: 'M 50 10 L 54 35 L 70 35 L 58 50 L 65 75 L 50 60 L 35 75 L 42 50 L 30 35 L 46 35 Z', difficulty: 2 },
    { id: 18, name: '하트', sides: 2, vertices: 2, color: '#FFB6C1', path: 'M 50 75 Q 30 45 30 35 Q 30 20 40 20 Q 50 25 50 35 Q 50 25 60 20 Q 70 20 70 35 Q 70 45 50 75', special: true, specialAnswer: 4, difficulty: 2 }
  ],
  3: [ // 고급 단계 - 8가지 도형
    { id: 20, name: '정팔각형', sides: 8, vertices: 8, color: '#FF7F50', path: 'M 50 15 L 63 20 L 70 33 L 70 47 L 63 60 L 50 65 L 37 60 L 30 47 L 30 33 L 37 20 Z', difficulty: 3 },
    { id: 22, name: '8각별', sides: 16, vertices: 16, color: '#FF69B4', path: 'M 50 5 L 52 20 L 65 18 L 58 30 L 70 35 L 55 40 L 65 52 L 50 45 L 48 60 L 42 48 L 30 52 L 38 40 L 25 35 L 40 30 L 30 18 L 45 20 Z', difficulty: 3 },
    { id: 23, name: '기어모양', sides: 16, vertices: 16, color: '#808080', path: 'M 40 20 L 60 20 L 62 15 L 65 18 L 70 25 L 75 30 L 72 35 L 70 40 L 75 45 L 70 50 L 65 55 L 60 60 L 55 58 L 50 62 L 45 58 L 40 60 L 35 55 L 30 50 L 25 45 L 30 40 L 28 35 L 25 30 L 30 25 L 35 18 L 38 15 Z', difficulty: 3 },
    { id: 25, name: '나선형', sides: 1, vertices: 0, color: '#20B2AA', path: 'M 50 50 m -20 0 a 20 20 0 1 1 40 0 a 15 15 0 1 1 -30 0 a 10 10 0 1 1 20 0 a 5 5 0 1 1 -10 0', special: true, specialAnswer: 1, difficulty: 3 },
    { id: 26, name: '물방울', sides: 1, vertices: 1, color: '#87CEEB', path: 'M 50 20 Q 35 35 35 50 Q 35 65 50 65 Q 65 65 65 50 Q 65 35 50 20', special: true, specialAnswer: 2, difficulty: 3 },
    { id: 27, name: '초승달', sides: 2, vertices: 2, color: '#F0E68C', path: 'M 35 25 Q 25 50 35 75 Q 55 60 55 50 Q 55 40 35 25', special: true, specialAnswer: 4, difficulty: 3 },
    { id: 28, name: '무한대', sides: 2, vertices: 1, color: '#DDA0DD', path: 'M 30 50 Q 30 30 40 30 Q 50 30 50 50 Q 50 70 60 70 Q 70 70 70 50 Q 70 30 60 30 Q 50 30 50 50 Q 50 70 40 70 Q 30 70 30 50', special: true, specialAnswer: 3, difficulty: 3 },
    { id: 29, name: '번개', sides: 10, vertices: 10, color: '#FFD700', path: 'M 55 10 L 40 35 L 50 35 L 35 65 L 45 65 L 30 90 L 60 50 L 50 50 L 65 25 L 55 25 Z', difficulty: 3 }
  ]
};

const App = () => {
  // Language State
  const [languageCode, setLanguageCode] = useState<LanguageCode>('ko');
  const [isLangDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Help Modal State
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  // Game State
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  // 힌트 횟수 제한 추가
  const [hintsRemaining, setHintsRemaining] = useState(3);

  // 적응형 난이도 시스템
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [correctAnswersInCurrentDifficulty, setCorrectAnswersInCurrentDifficulty] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [advancedCorrectCount, setAdvancedCorrectCount] = useState(0);

  // Combo & Streak System
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Power-ups
  const [powerUps, setPowerUps] = useState({
    timeFreeze: 0,
    extraLife: 0,
    doubleScore: 0
  });
  const [doubleScoreActive, setDoubleScoreActive] = useState(false);
  const [doubleScoreTimeLeft, setDoubleScoreTimeLeft] = useState(0);
  const [timeFrozen, setTimeFrozen] = useState(false);

  // Achievements
  const [achievements, setAchievements] = useState({
    firstCorrect: false,
    lightningSpeed: false,
    streakMaster: false,
    master: false
  });

  // Statistics
  const [totalStars, setTotalStars] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [shownShapeIds, setShownShapeIds] = useState<number[]>([]);
  const allShapes = useMemo(() => Object.values(shapesByDifficulty).flat(), []);

  // Visual Effects
  const [particles, setParticles] = useState<{id: number, emoji: string, x: number, y: number, vx: number, vy: number}[]>([]);
  const [pulseWarning, setPulseWarning] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());

  const [currentShape, setCurrentShape] = useState(shapesByDifficulty[1][0]);

  // Share state
  const resultsRef = useRef<HTMLDivElement>(null);
  const [shareFeedback, setShareFeedback] = useState('');

  // Sound State
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      const randomTrack = bgMusicTracks[Math.floor(Math.random() * bgMusicTracks.length)];
      audioRef.current.src = randomTrack;
      audioRef.current.loop = true;
    }
  }, []);
  
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.muted = isMuted;
        if (['playing', 'correct', 'wrong'].includes(gameState) && !isMuted) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [isMuted, gameState]);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as LanguageCode;
    if (supportedLangs.some(l => l.code === browserLang)) {
      setLanguageCode(browserLang);
    } else {
      setLanguageCode('en');
    }
  }, []);
  
  useEffect(() => {
    const currentLang = supportedLangs.find(l => l.code === languageCode);
    if (currentLang) {
        document.documentElement.lang = currentLang.code;
        document.documentElement.dir = currentLang.dir;
    }
  }, [languageCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHelpModalOpen(false);
      }
    };

    if (isHelpModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHelpModalOpen]);

  const t = useCallback((key: keyof typeof translations['en'], replacements: Record<string, string | number> = {}) => {
    let translation = translations[languageCode]?.[key] || translations.en[key] || key;
    for (const rKey in replacements) {
        translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
    }
    return translation;
  }, [languageCode]);

  const placeholderText = t('answerPlaceholder');
  // A simple heuristic for CJK characters which are wider.
  const cjkRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf\uac00-\ud7af]/g;
  const cjkCharCount = (placeholderText.match(cjkRegex) || []).length;
  const nonCjkCharCount = placeholderText.length - cjkCharCount;
  // Adjust size: CJK chars are roughly 1.8x width of latin chars.
  // Add a base padding. Min size of 10.
  const inputSize = Math.max(10, Math.ceil(nonCjkCharCount + cjkCharCount * 1.8));

  // Timer Effect using requestAnimationFrame for precision
  useEffect(() => {
    if (gameState !== 'playing' || !deadline) {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        return;
    }

    const loop = () => {
        if (!timeFrozen) {
            const remaining = deadline - Date.now();
            const newTimeLeft = Math.max(0, Math.ceil(remaining / 1000));
            
            setTimeLeft(currentTime => {
                if (newTimeLeft !== currentTime) {
                    if (newTimeLeft <= 10 && currentTime > 10) {
                        setPulseWarning(true);
                    } else if (newTimeLeft > 10 && currentTime <= 10) {
                        setPulseWarning(false);
                    }
                    return newTimeLeft;
                }
                return currentTime;
            });

            if (remaining <= 0) {
                setGameState('gameover');
                return; // Stop loop
            }
        }
        timerRef.current = requestAnimationFrame(loop);
    };

    timerRef.current = requestAnimationFrame(loop);

    return () => {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
}, [gameState, deadline, timeFrozen]);


  // Double Score Timer
  useEffect(() => {
    if (doubleScoreActive && doubleScoreTimeLeft > 0 && !timeFrozen) {
      const timer = setTimeout(() => {
        setDoubleScoreTimeLeft(doubleScoreTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (doubleScoreTimeLeft === 0) {
      setDoubleScoreActive(false);
    }
  }, [doubleScoreActive, doubleScoreTimeLeft, timeFrozen]);

  const getDifficultyName = useCallback((level: number) => {
    return t(`difficulty_${level}` as keyof typeof translations['en']);
  }, [t]);

  const unlockAchievement = (type: keyof typeof achievements) => {
    if (!achievements[type]) {
      setAchievements(prev => ({ ...prev, [type]: true }));
      generateParticles('correct', 15);
    }
  };

  // 적응형 난이도 조정
  const adjustDifficulty = (isCorrect: boolean) => {
    if (isCorrect) {
      const newConsecutiveCorrect = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutiveCorrect);
      setConsecutiveWrong(0);
      const newCorrectInDifficulty = correctAnswersInCurrentDifficulty + 1;
      setCorrectAnswersInCurrentDifficulty(newCorrectInDifficulty);

      if ((newConsecutiveCorrect >= 3 || newCorrectInDifficulty >= 6) && difficultyLevel < 3) {
        setDifficultyLevel(prev => prev + 1);
        setConsecutiveCorrect(0);
        setCorrectAnswersInCurrentDifficulty(0);
      }
    } else {
      const newConsecutiveWrong = consecutiveWrong + 1;
      setConsecutiveWrong(newConsecutiveWrong);
      setConsecutiveCorrect(0);
      
      if (newConsecutiveWrong >= 2 && difficultyLevel > 1) {
        setDifficultyLevel(prev => prev - 1);
        setConsecutiveWrong(0);
        setCorrectAnswersInCurrentDifficulty(0);
      }
    }
  };

  const getCorrectAnswer = (shape: typeof currentShape) => {
    if (shape.special) return shape.specialAnswer;
    return shape.sides + shape.vertices;
  };

  const generateParticles = (type: 'correct' | 'wrong', count = 10, emojiOverride?: string) => {
    const newParticles: {id: number, emoji: string, x: number, y: number, vx: number, vy: number}[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        emoji: emojiOverride || (type === 'correct' ? ['🎉', '✨', '🌟', '💫'][Math.floor(Math.random() * 4)] : ['💥', '😵', '❌'][Math.floor(Math.random() * 3)]),
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  const generateNewShape = useCallback(() => {
    if (shownShapeIds.length >= allShapes.length) {
      setGameState('gameover');
      return;
    }

    const currentDifficultyKey = difficultyLevel as keyof typeof shapesByDifficulty;
    let pool = shapesByDifficulty[currentDifficultyKey].filter(s => !shownShapeIds.includes(s.id));

    if (pool.length === 0) {
      pool = allShapes.filter(s => !shownShapeIds.includes(s.id));
      if (pool.length === 0) {
        setGameState('gameover');
        return;
      }
    }
    
    const randomShape = pool[Math.floor(Math.random() * pool.length)];
      
    setCurrentShape(randomShape);
    setShownShapeIds(prev => [...prev, randomShape.id]);
    setUserAnswer('');
    setFeedback('');
    setShowHint(false);
    setHintUsed(false);
    setGameState('playing');
    setQuestionStartTime(Date.now());
    setPulseWarning(timeLeft <= 10);
  }, [difficultyLevel, shownShapeIds, allShapes, timeLeft]);

  const usePowerUp = (type: keyof typeof powerUps) => {
    if (powerUps[type] > 0) {
      setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
      
      switch (type) {
        case 'timeFreeze':
          if (!timeFrozen) {
            setTimeFrozen(true);
            setTimeout(() => setTimeFrozen(false), 7000);
          }
          break;
        case 'extraLife':
          setLives(prev => Math.min(prev + 1, 3));
          break;
        case 'doubleScore':
          setDoubleScoreActive(true);
          setDoubleScoreTimeLeft(10);
          break;
      }
    }
  };

  const calculateScore = (shape: typeof currentShape, responseTime: number) => {
    let baseScore = 0;
    if (difficultyLevel === 1) baseScore = 50;
    else if (difficultyLevel === 2) baseScore = 100;
    else baseScore = 150;
    
    let timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5;
    let streakBonus = streak * 10;
    
    let totalScore = baseScore + timeBonus + streakBonus;
    
    if (hintUsed) {
      totalScore = Math.floor(totalScore * 0.5);
    }
    
    if (doubleScoreActive) totalScore *= 2;
    
    return {
      total: totalScore,
      breakdown: { baseScore, timeBonus, streakBonus, hintPenalty: hintUsed, doubled: doubleScoreActive }
    };
  };

  const checkAnswer = () => {
    if (gameState !== 'playing' || !userAnswer) return;
    const correctAnswer = getCorrectAnswer(currentShape);
    const userNum = parseInt(userAnswer, 10);
    const responseTimeMs = Date.now() - questionStartTime;
    setResponseTime(responseTimeMs);
    setQuestionsAnswered(prev => prev + 1);

    if (userNum === correctAnswer) {
      setGameState('correct');
      setCorrectAnswers(prev => prev + 1);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      
      const scoreData = calculateScore(currentShape, responseTimeMs);
      setScore(prev => prev + scoreData.total);
      setTotalStars(prev => prev + difficultyLevel);
      
      adjustDifficulty(true);

      const timeBonusByDifficulty = { 1: 0, 2: 4, 3: 6 };
      const timeBonus = timeBonusByDifficulty[difficultyLevel as keyof typeof timeBonusByDifficulty] || 0;
      if (timeBonus > 0) {
          setDeadline(prev => {
              if (!prev) return null;
              const newDeadline = prev + timeBonus * 1000;
              return Math.min(newDeadline, Date.now() + 60000);
          });
      }

      if (newStreak > 0 && newStreak % 3 === 0) {
          if (Math.random() < 0.45) {
              const powerUpTypes: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
              const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
              setPowerUps(prev => ({ ...prev, [randomPowerUp]: prev[randomPowerUp] + 1 }));
              const powerUpEmoji = { timeFreeze: '❄️', extraLife: '❤️', doubleScore: '⚡' }[randomPowerUp];
              generateParticles('correct', 15, powerUpEmoji);
          }
      }
      
      const feedbackParts = [t('feedbackCorrect', { score: scoreData.total })];
      if (hintUsed) {
          feedbackParts.push(t('hintUsedText'));
      }
      feedbackParts.push(t('feedbackEmojiCorrect'));
      setFeedback(feedbackParts.join(' '));
      
      generateParticles('correct');
      
      // Achievement Checks
      if (!achievements.firstCorrect) unlockAchievement('firstCorrect');
      if (responseTimeMs < 3000) unlockAchievement('lightningSpeed');
      if (newStreak >= 5) unlockAchievement('streakMaster');
      
      if (difficultyLevel === 3) {
        const newAdvancedCount = advancedCorrectCount + 1;
        setAdvancedCorrectCount(newAdvancedCount);
        if (newAdvancedCount >= 3) {
          unlockAchievement('master');
        }
      }

      setTimeout(() => {
        generateNewShape();
      }, 1500);
    } else {
      setGameState('wrong');
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      
      adjustDifficulty(false);
      
      setFeedback(t('feedbackWrong', { correctAnswer: correctAnswer }));
      generateParticles('wrong');
      
      if (newLives <= 0) {
        setTimeout(() => setGameState('gameover'), 500);
      } else {
        setTimeout(() => {
          if (document.getElementById('root')) {
             generateNewShape();
          }
        }, 2000);
      }
    }
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setDeadline(null);
    setStreak(0);
    setDifficultyLevel(1);
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
    setHintUsed(false);
    setHintsRemaining(3);
    setCurrentShape(shapesByDifficulty[1][Math.floor(Math.random() * shapesByDifficulty[1].length)]);
    setUserAnswer('');
    setFeedback('');
    setShowHint(false);
    setGameState('idle');
    setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    setDoubleScoreActive(false);
    setTimeFrozen(false);
    setParticles([]);
    setPulseWarning(false);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setBestStreak(0);
    setTotalStars(0);
    setAdvancedCorrectCount(0);
    setCorrectAnswersInCurrentDifficulty(0);
    setShownShapeIds([]);
    setAchievements({
      firstCorrect: false,
      lightningSpeed: false,
      streakMaster: false,
      master: false
    });
  };
  
  const startGame = () => {
    setGameState('playing');
    setDeadline(Date.now() + 60 * 1000);
    setQuestionStartTime(Date.now());
    setShownShapeIds([currentShape.id]);
  };
  
  useEffect(() => {
    resetGame();
  }, []);

  const handleShare = async () => {
    if (!resultsRef.current) return;
  
    try {
      setShareFeedback('');

      const dataUrl = await htmlToImage.toPng(resultsRef.current, { 
        quality: 1, 
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `shape-master-result-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShareFeedback(t('shareSuccess'));
    } catch (err) {
      console.error('Failed to download image:', err);
      setShareFeedback(t('shareError'));
    } finally {
        setTimeout(() => setShareFeedback(''), 3000);
    }
  };
  
  const currentLangDir = supportedLangs.find(l => l.code === languageCode)?.dir || 'ltr';

  if (gameState === 'gameover') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-blue-500 flex items-center justify-center p-4">
        <div ref={resultsRef} className="bg-white rounded-2xl shadow-2xl p-6 text-center max-w-sm w-full relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          
          <div className="relative mb-4">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 animate-bounce" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
              {t('gameOverBadge')}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('gameOverTitle')}</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
            <div className="text-sm text-gray-600 mb-1">{t('finalScoreLabel')}</div>
            <div className="text-3xl font-bold text-blue-600 flex items-center justify-center">
              <Coins className="w-6 h-6 mr-2 text-yellow-500" />
              {score.toLocaleString()}{t('scoreUnit')}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="text-xs text-gray-600">{t('difficultyReachedLabel')}</div>
              <div className="font-bold text-purple-600 text-sm">
                {getDifficultyName(difficultyLevel)}
              </div>
              <div className="text-purple-500">{'⭐'.repeat(difficultyLevel)}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="text-xs text-gray-600">{t('bestStreakLabel')}</div>
              <div className="font-bold text-green-600 flex items-center justify-center text-sm">
                <Flame className="w-4 h-4 mr-1" />
                {bestStreak}{t('itemUnit')}
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="text-xs text-gray-600">{t('starsEarnedLabel')}</div>
              <div className="font-bold text-yellow-600 text-sm">
                {totalStars}⭐
              </div>
            </div>
            
            <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
              <div className="text-xs text-gray-600">{t('accuracyLabel')}</div>
              <div className="font-bold text-pink-600 text-sm">
                {questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0}%
              </div>
            </div>
          </div>
          
          {Object.values(achievements).some(Boolean) && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
              <div className="text-xs text-gray-600 mb-2 flex items-center justify-center">
                <Trophy className="w-3 h-3 mr-1" />
                {t('achievementsEarnedLabel')}
              </div>
              <div className="flex justify-center space-x-2">
                {achievements.firstCorrect && <span className="text-lg" title={t('achievementsTooltip_firstCorrect')}>🎯</span>}
                {achievements.lightningSpeed && <span className="text-lg" title={t('achievementsTooltip_lightningSpeed')}>⚡</span>}
                {achievements.streakMaster && <span className="text-lg" title={t('achievementsTooltip_streakMaster')}>🔥</span>}
                {achievements.master && <span className="text-lg" title={t('achievementsTooltip_master')}>👑</span>}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            {score >= 1000 ? (
              <div className="text-green-600 font-semibold text-sm">{t('gameOverMessage_great')}</div>
            ) : score >= 500 ? (
              <div className="text-blue-600 font-semibold text-sm">{t('gameOverMessage_good')}</div>
            ) : (
              <div className="text-purple-600 font-semibold text-sm">{t('gameOverMessage_tryAgain')}</div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={resetGame}
              className="flex-grow bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {t('playAgainButton')}
            </button>
            <button
              onClick={handleShare}
              aria-label={t('shareResultButton')}
              className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-700 p-3.5 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-5 mt-2 text-sm text-gray-600 font-semibold">{shareFeedback}</div>
          
        </div>
      </div>
    );
  }

  const HelpModal = () => (
    <div role="dialog" aria-modal="true" aria-labelledby="how-to-play-title" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity" onClick={() => setHelpModalOpen(false)}>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 max-w-md w-full relative transform transition-all flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <h2 id="how-to-play-title" className="text-2xl font-bold text-gray-800 text-center mb-4 flex-shrink-0">{t('howToPlayTitle')}</h2>
        <div className="space-y-3 pr-2 custom-scrollbar flex-grow overflow-y-auto">
            {[
                { icon: '🎯', title: 'howToPlay_goal_title', desc: 'howToPlay_goal_desc', color: 'purple' },
                { icon: '⏳', title: 'howToPlay_time_lives_title', desc: 'howToPlay_time_lives_desc', color: 'blue' },
                { icon: '⭐', title: 'howToPlay_difficulty_title', desc: 'howToPlay_difficulty_desc', color: 'yellow' },
                { icon: '🔥', title: 'howToPlay_streak_title', desc: 'howToPlay_streak_desc', color: 'orange' },
                { icon: '💡', title: 'howToPlay_hints_title', desc: 'howToPlay_hints_desc', color: 'green' },
                { icon: '🏆', title: 'howToPlay_achievements_title', desc: 'howToPlay_achievements_desc', color: 'pink' },
            ].map(item => (
                <div key={item.title} className={`flex items-start space-x-4 bg-white/50 p-3 rounded-xl border-l-4 border-${item.color}-300`}>
                    <span className="text-2xl pt-1">{item.icon}</span>
                    <div>
                        <h3 className={`font-semibold text-${item.color}-800`}>{t(item.title as keyof typeof translations['en'])}</h3>
                        <p className={`text-sm text-${item.color}-700`}>{t(item.desc as keyof typeof translations['en'])}</p>
                    </div>
                </div>
            ))}
        </div>
        <button 
            onClick={() => setHelpModalOpen(false)} 
            className="mt-4 w-full bg-purple-500 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-600 transition-all transform hover:scale-105 shadow-md flex-shrink-0">
            {t('closeButton')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 relative overflow-hidden">
       <audio ref={audioRef} />
       {isHelpModalOpen && <HelpModal />}
       <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <button
                    onClick={() => setHelpModalOpen(true)}
                    aria-label={t('howToPlayButton')}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-sm"
                >
                    <HelpCircle className="w-4 h-4" />
                    <span>{t('howToPlayButton')}</span>
                </button>
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                    className="flex items-center justify-center w-9 h-9 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-sm"
                >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
            </div>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setLangDropdownOpen(!isLangDropdownOpen)}
                    aria-label="Change language"
                    aria-haspopup="true"
                    aria-expanded={isLangDropdownOpen}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-sm"
                >
                    <span>{supportedLangs.find(l => l.code === languageCode)?.name}</span>
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangDropdownOpen && (
                    <div className={`absolute mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden ${currentLangDir === 'rtl' ? 'left-0' : 'right-0'}`}>
                        <ul role="menu" aria-orientation="vertical" aria-labelledby="language-menu">
                            {supportedLangs.map(lang => (
                                <li key={lang.code}>
                                    <button
                                        onClick={() => {
                                            setLanguageCode(lang.code);
                                            setLangDropdownOpen(false);
                                        }}
                                        role="menuitem"
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${languageCode === lang.code ? 'bg-purple-500 text-white' : 'text-gray-800 hover:bg-purple-100'}`}
                                    >
                                        {lang.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute text-2xl pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: 'float 2s ease-out forwards'
          }}
        >
          {particle.emoji}
        </div>
      ))}

      <div className="max-w-md mx-auto">
        <div className="text-center mb-2 pt-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">{t('title')}</h1>
            <p className="text-sm md:text-base text-white opacity-80">{t('subtitle')}</p>
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-white text-xs opacity-75">{t('scoreLabel')}</div>
              <div className="text-white text-lg font-bold flex items-center justify-center">
                <Coins className="w-4 h-4 mr-1 text-yellow-300" />
                {score}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-white text-xs opacity-75">{t('livesLabel')}</div>
              <div className="flex justify-center items-center space-x-1 pt-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 transition-all ${
                      i < lives ? 'text-red-500 fill-current' : 'text-white opacity-30'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-white text-xs opacity-75">{t('streakLabel')}</div>
              <div className="text-white text-lg font-bold flex items-center justify-center">
                <Flame className="w-4 h-4 mr-1 text-orange-300" />
                {streak}
              </div>
            </div>
          </div>
          
          {gameState === 'idle' ? (
              <button 
                onClick={startGame}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                  <Play className="w-5 h-5 mr-2" />
                  {t('startGameButton')}
              </button>
          ) : (
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 flex items-center gap-3">
                <div className={`flex items-center text-white font-bold text-lg ${ pulseWarning ? 'text-red-300 animate-pulse' : ''}`}>
                    <Clock className="w-4 h-4 mr-2" />
                    {timeLeft}s
                </div>
                <div className="flex-grow w-full bg-white bg-opacity-30 rounded-full h-2.5 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                    pulseWarning 
                        ? 'bg-gradient-to-r from-red-400 to-red-600 animate-pulse' 
                        : timeLeft <= 20
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                        : 'bg-gradient-to-r from-green-400 to-blue-500'
                    } ${timeFrozen ? 'bg-gradient-to-r from-blue-300 to-cyan-400' : ''}`}
                    style={{ 
                    width: `${(timeLeft / 60) * 100}%`,
                    transition: 'width 0.2s linear'
                    }}
                ></div>
                </div>
                {timeFrozen && <span className="text-blue-300 text-lg">❄️</span>}
            </div>
          )}
        </div>

        <div className="flex justify-center items-center gap-2 my-1 min-h-[24px]">
          {doubleScoreActive && (
            <div className="bg-yellow-400 bg-opacity-90 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              {t('doubleScoreActive', { timeLeft: doubleScoreTimeLeft })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mb-3">
          <div className="text-center">
             <div className="flex justify-between items-center gap-2 mb-3">
               <div className="flex items-center space-x-1">
                {Object.keys(powerUps).map((key) => {
                  const type = key as keyof typeof powerUps;
                  return (
                  <button
                    key={type}
                    onClick={() => usePowerUp(type)}
                    disabled={powerUps[type] === 0 || gameState !== 'playing'}
                    className={`relative w-9 h-9 rounded-full text-white flex items-center justify-center transition-all disabled:bg-gray-400 disabled:cursor-not-allowed ${
                      type === 'timeFreeze' ? 'bg-blue-500 hover:bg-blue-600' :
                      type === 'extraLife' ? 'bg-red-500 hover:bg-red-600' :
                      'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                  >
                    {type === 'timeFreeze' ? '❄️' : type === 'extraLife' ? '❤️' : '⚡'}
                    {powerUps[type] > 0 && <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{powerUps[type]}</span>}
                  </button>
                )})}
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-lg">{'⭐'.repeat(difficultyLevel)}</div>
                <div className="text-xs text-gray-600">{getDifficultyName(difficultyLevel)}</div>
              </div>
            </div>

            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                {t('question')}
            </h2>
            
            <div className="flex justify-center mb-4">
              <div className="relative">
                <svg 
                  width="250" 
                  height="180" 
                  viewBox="0 0 100 100" 
                  className="border-2 border-gray-200 rounded-lg bg-gray-50 shadow-inner"
                >
                  <path
                    d={currentShape.path}
                    fill={currentShape.color}
                    stroke="#333"
                    strokeWidth="1.5"
                  />
                </svg>
                {streak > 1 && (
                  <div className="absolute -top-3 -right-3 bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold animate-bounce">
                    {streak}x
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); checkAnswer(); }} className="flex justify-center items-center space-x-2 mb-4">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={placeholderText}
                size={inputSize}
                className="p-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                disabled={gameState !== 'playing'}
                autoFocus={gameState === 'playing'}
              />
              <button
                type="submit"
                disabled={!userAnswer || gameState !== 'playing'}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-md disabled:cursor-not-allowed"
              >
                {t('submitButton')}
              </button>
            </form>

            <div className="mb-4 h-16">
               {showHint ? (
                <div className={`border-l-4 p-2 rounded mt-2 text-sm text-left ${
                  hintUsed 
                    ? 'bg-orange-50 border-orange-400 text-orange-800' 
                    : 'bg-blue-50 border-blue-400 text-blue-800'
                }`}>
                  <p>
                    <strong>{t('hintLabel')}</strong>{' '}
                    {currentShape.special 
                        ? t('hintSpecialShapeText', { count: currentShape.specialAnswer }) 
                        : t('hintNormalShapeText', { sides: currentShape.sides, vertices: currentShape.vertices })
                    }
                   </p>
                </div>
              ) : feedback ? (
                 <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-all transform text-base ${
                    gameState === 'correct' 
                      ? 'bg-green-100 text-green-800 animate-bounce' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {gameState === 'correct' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <span className="font-semibold">{feedback}</span>
                  </div>
              ) : null}
            </div>

             <button
                onClick={() => { if (hintsRemaining > 0 && !showHint) { setShowHint(true); setHintUsed(true); setHintsRemaining(prev => prev - 1); } else if (showHint) {setShowHint(false);} }}
                disabled={(hintsRemaining === 0 && !showHint) || gameState !== 'playing'}
                className={`px-3 py-1 rounded-full text-xs transition-all w-32 ${
                  (hintsRemaining === 0 && !showHint) || gameState !== 'playing'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                }`}
              >
                {showHint ? t('hintButtonClose') : t('hintButton', { remaining: hintsRemaining })}
              </button>
          </div>
        </div>

        <div className="bg-white bg-opacity-90 rounded-lg p-3">
          <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
            {t('achievementsTitle', { count: Object.values(achievements).filter(Boolean).length })}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <div title={t('achievementsTooltip_firstCorrect')} className={`p-2 rounded-lg text-center transition-all ${achievements.firstCorrect ? 'bg-green-100 text-green-800 scale-110' : 'bg-gray-100 text-gray-400'}`}>
              <div className="text-lg mb-1">🎯</div>
              <div className="text-xs font-semibold">{t('achievements_firstCorrect')}</div>
            </div>
            <div title={t('achievementsTooltip_lightningSpeed')} className={`p-2 rounded-lg text-center transition-all ${achievements.lightningSpeed ? 'bg-yellow-100 text-yellow-800 scale-110' : 'bg-gray-100 text-gray-400'}`}>
              <div className="text-lg mb-1">⚡</div>
              <div className="text-xs font-semibold">{t('achievements_lightningSpeed')}</div>
            </div>
            <div title={t('achievementsTooltip_streakMaster')} className={`p-2 rounded-lg text-center transition-all ${achievements.streakMaster ? 'bg-purple-100 text-purple-800 scale-110' : 'bg-gray-100 text-gray-400'}`}>
              <div className="text-lg mb-1">🔥</div>
              <div className="text-xs font-semibold">{t('achievements_streakMaster')}</div>
            </div>
             <div title={t('achievementsTooltip_master')} className={`p-2 rounded-lg text-center transition-all ${achievements.master ? 'bg-blue-100 text-blue-800 scale-110' : 'bg-gray-100 text-gray-400'}`}>
              <div className="text-lg mb-1">👑</div>
              <div className="text-xs font-semibold">{t('achievements_master')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
