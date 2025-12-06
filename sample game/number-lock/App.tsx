
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
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
  Lock,
  Star,
  Download,
  Volume2,
  VolumeX,
} from 'lucide-react';

type LanguageCode = 'en' | 'ko' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'ru' | 'ar' | 'zh' | 'ja' | 'vi' | 'th' | 'id';
type GameState = 'idle' | 'playing' | 'correct' | 'wrong' | 'gameover';
type GameOverReason = 'time' | 'lives' | 'cleared' | null;

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
    title: "Number Lock", subtitle: "Crack the code with math", scoreLabel: "Score", livesLabel: "Lives", streakLabel: "Streak", timeLabel: "Time", difficulty_1: "Beginner", difficulty_2: "Intermediate", difficulty_3: "Advanced", question: "Make the target number:", submitButton: "Check", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Hint ({remaining}/3)", hintButtonClose: "Close Hint", hintLabel: "Hint:", hintUsedText: "(Hint used, 50% score penalty)", hintText: "One of the elements is '{element}'.", feedbackCorrect: "Unlocked! +{score} points", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorrect. Try again. 💔", achievementsTitle: "Achievements ({count}/4)", achievements_firstCorrect: "First Crack", achievements_lightningSpeed: "Speedy Solver", achievements_streakMaster: "Combo King", achievements_master: "Master Cracker", achievementsTooltip_firstCorrect: "Get your first answer correct.", achievementsTooltip_lightningSpeed: "Answer in under 3 seconds.", achievementsTooltip_streakMaster: "Get a 5-puzzle streak.", achievementsTooltip_master: "Correctly solve 3+ puzzles on Advanced difficulty.", gameOverTitle: "Game Over!", gameOverBadge: "End", finalScoreLabel: "Final Score", scoreUnit: " pts", difficultyReachedLabel: "Difficulty Reached", bestStreakLabel: "Best Streak", itemUnit: "", accuracyLabel: "Accuracy", achievementsEarnedLabel: "Achievements Unlocked", starsEarnedLabel: "Stars Earned", gameOverMessage_great: "🎉 Excellent work!", gameOverMessage_good: "👍 Well done!", gameOverMessage_tryAgain: "💪 You can do better next time!", gameOverMessage_cleared: "🏆 You've cleared all puzzles! Legendary!", playAgainButton: "Play Again", downloadResult: "Download Result", imageDownloaded: "Image downloaded!", imageDownloadFailed: "Failed to download image.", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "How to Play", howToPlayTitle: "How to Play", howToPlay_goal_title: "Goal", howToPlay_goal_desc: "Select two numbers and one operator from the grid to match the target number on the lock.", howToPlay_time_lives_title: "Time & Bonus", howToPlay_time_lives_desc: "You start with 60 seconds. Answering correctly awards bonus time (up to 60s max) based on difficulty. Don't let the timer or your lives run out!", howToPlay_difficulty_title: "Difficulty", howToPlay_difficulty_desc: "The game adapts! The better you play, the harder the puzzles get, earning you more points.", howToPlay_streak_title: "Streak & Power-ups", howToPlay_streak_desc: "Achieve a 3-puzzle streak for a chance to earn a random power-up like ❄️ Time Freeze, ❤️ Extra Life, and ⚡ Double Score!", howToPlay_hints_title: "Hints", howToPlay_hints_desc: "Stuck? Use one of 3 hints per game. Be careful, it will cost you 50% of the score for that puzzle.", howToPlay_achievements_title: "Achievements", howToPlay_achievements_desc: "Unlock special achievements for completing milestones in the game.", closeButton: "Got it!", startGameButton: "Start Game", footer_copyright: "Puzzletic. All rights reserved.", footer_contact: "Business Contact:", sound_on: "Mute", sound_off: "Unmute"
  },
  ko: {
    title: "숫자 자물쇠", subtitle: "연산으로 비밀번호 풀기", scoreLabel: "점수", livesLabel: "생명력", streakLabel: "연속", timeLabel: "시간", difficulty_1: "기초", difficulty_2: "중급", difficulty_3: "고급", question: "목표 숫자를 만드세요", submitButton: "확인", doubleScoreActive: "⚡2배 ({timeLeft}초)", hintButton: "💡 힌트 ({remaining}/3)", hintButtonClose: "힌트 닫기", hintLabel: "힌트:", hintUsedText: "(힌트 사용으로 50% 차감)", hintText: "필요한 요소 중 하나는 '{element}'입니다.", feedbackCorrect: "정답! +{score}점", feedbackEmojiCorrect: "🎉", feedbackWrong: "틀렸습니다. 다시 시도하세요. 💔", achievementsTitle: "업적 ({count}/4)", achievements_firstCorrect: "첫 정답", achievements_lightningSpeed: "빠른 계산", achievements_streakMaster: "콤보 왕", achievements_master: "마스터", achievementsTooltip_firstCorrect: "첫 문제를 맞혀보세요.", achievementsTooltip_lightningSpeed: "3초 안에 정답을 맞히세요.", achievementsTooltip_streakMaster: "5문제 연속 정답을 달성하세요.", achievementsTooltip_master: "고급 난이도에서 3문제 이상 정답을 맞히세요.", gameOverTitle: "게임 종료!", gameOverBadge: "끝", finalScoreLabel: "최종 점수", scoreUnit: "점", difficultyReachedLabel: "도달 난이도", bestStreakLabel: "최고 연속", itemUnit: "개", starsEarnedLabel: "획득 별", accuracyLabel: "정답률", achievementsEarnedLabel: "달성한 업적", gameOverMessage_great: "🎉 훌륭한 실력이에요!", gameOverMessage_good: "👍 잘 하셨어요!", gameOverMessage_tryAgain: "💪 다음엔 더 잘할 수 있어요!", gameOverMessage_cleared: "🏆 모든 문제를 해결했어요! 전설적인 실력!", playAgainButton: "재도전하기", downloadResult: "결과 다운로드", imageDownloaded: "이미지를 다운로드했습니다!", imageDownloadFailed: "이미지 다운로드에 실패했습니다.", tip: "💡 팁: 정답을 맞혀 보너스 시간을 얻고, 최고 기록에 도전하세요!", howToPlayButton: "게임 방법", howToPlayTitle: "게임 방법", howToPlay_goal_title: "목표", howToPlay_goal_desc: "격자에서 숫자 두 개와 연산자 하나를 선택하여 자물쇠의 목표 숫자와 일치시키세요.", howToPlay_time_lives_title: "시간 & 보너스", howToPlay_time_lives_desc: "60초로 시작하며, 정답을 맞히면 난이도에 따라 보너스 시간을 얻습니다(최대 60초). 시간이나 생명력이 다 떨어지지 않게 주의하세요!", howToPlay_difficulty_title: "난이도", howToPlay_difficulty_desc: "게임은 당신의 실력에 맞춰집니다! 더 잘할수록 더 어려운 퍼즐이 나오고 더 많은 점수를 얻습니다.", howToPlay_streak_title: "연속 정답 & 아이템", howToPlay_streak_desc: "3연속 정답을 달성하면 ❄️ 시간 정지, ❤️ 추가 생명력, ⚡ 점수 2배와 같은 아이템을 무작위로 얻을 기회가 생깁니다!", howToPlay_hints_title: "힌트", howToPlay_hints_desc: "막혔나요? 게임당 3개의 힌트를 사용할 수 있습니다. 하지만 해당 문제 점수의 50%가 차감되니 신중하게 사용하세요.", howToPlay_achievements_title: "업적", howToPlay_achievements_desc: "게임 내 특별한 목표를 달성하고 업적을 잠금 해제하세요.", closeButton: "알겠어요!", startGameButton: "게임 시작", footer_copyright: "Puzzletic. 모든 권리 보유.", footer_contact: "비즈니스 문의:", sound_on: "음소거", sound_off: "음소거 해제"
  },
  es: { title: "Bloqueo Numérico", subtitle: "Descifra el código con matemáticas", scoreLabel: "Puntos", livesLabel: "Vidas", streakLabel: "Racha", timeLabel: "Tiempo", difficulty_1: "Principiante", difficulty_2: "Intermedio", difficulty_3: "Avanzado", question: "Crea el número objetivo:", submitButton: "Comprobar", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Pista ({remaining}/3)", hintButtonClose: "Cerrar Pista", hintLabel: "Pista:", hintUsedText: "(Pista usada, 50% de penalización)", hintText: "Uno de los elementos es '{element}'.", feedbackCorrect: "¡Desbloqueado! +{score} puntos", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorrecto. Inténtalo de nuevo. 💔", achievementsTitle: "Logros ({count}/4)", achievements_firstCorrect: "Primer Acierto", achievements_lightningSpeed: "Solucionador Veloz", achievements_streakMaster: "Rey de la Racha", achievements_master: "Maestro Descifrador", achievementsTooltip_firstCorrect: "Acierta tu primera respuesta.", achievementsTooltip_lightningSpeed: "Responde en menos de 3 segundos.", achievementsTooltip_streakMaster: "Consigue una racha de 5 aciertos.", achievementsTooltip_master: "Resuelve 3+ puzzles en dificultad Avanzada.", gameOverTitle: "¡Fin del Juego!", gameOverBadge: "Fin", finalScoreLabel: "Puntuación Final", scoreUnit: " pts", difficultyReachedLabel: "Dificultad Alcanzada", bestStreakLabel: "Mejor Racha", itemUnit: "", accuracyLabel: "Precisión", achievementsEarnedLabel: "Logros Desbloqueados", starsEarnedLabel: "Estrellas Ganadas", gameOverMessage_great: "🎉 ¡Excelente trabajo!", gameOverMessage_good: "👍 ¡Bien hecho!", gameOverMessage_tryAgain: "💪 ¡Puedes hacerlo mejor la próxima vez!", gameOverMessage_cleared: "🏆 ¡Has resuelto todos los puzzles! ¡Legendario!", playAgainButton: "Jugar de Nuevo", downloadResult: "Descargar Resultado", imageDownloaded: "¡Imagen descargada!", imageDownloadFailed: "Error al descargar la imagen.", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "Cómo Jugar", howToPlayTitle: "Cómo Jugar", howToPlay_goal_title: "Objetivo", howToPlay_goal_desc: "Selecciona dos números y un operador de la cuadrícula para igualar el número objetivo del candado.", howToPlay_time_lives_title: "Tiempo y Bonus", howToPlay_time_lives_desc: "Empiezas con 60 segundos. Responder correctamente otorga tiempo extra (hasta 60 segundos máximo) según la dificultad. ¡No dejes que el temporizador o tus vidas se agoten!", howToPlay_difficulty_title: "Dificultad", howToPlay_difficulty_desc: "¡El juego se adapta! Cuanto mejor juegues, más difíciles serán los puzzles y más puntos ganarás.", howToPlay_streak_title: "Racha y Potenciadores", howToPlay_streak_desc: "¡Logra una racha de 3 puzzles para tener la oportunidad de ganar un potenciador aleatorio como ❄️ Congelar Tiempo, ❤️ Vida Extra y ⚡ Puntuación Doble!", howToPlay_hints_title: "Pistas", howToPlay_hints_desc: "¿Atascado? Usa una de las 3 pistas por juego. Ten cuidado, te costará el 50% de la puntuación de ese puzzle.", howToPlay_achievements_title: "Logros", howToPlay_achievements_desc: "Desbloquea logros especiales por completar hitos en el juego.", closeButton: "¡Entendido!", startGameButton: "Empezar Juego", footer_copyright: "Puzzletic. Todos los derechos reservados.", footer_contact: "Contacto comercial:", sound_on: "Silenciar", sound_off: "Activar sonido" },
  fr: { title: "Cadenas à Chiffres", subtitle: "Craquez le code avec les maths", scoreLabel: "Score", livesLabel: "Vies", streakLabel: "Série", timeLabel: "Temps", difficulty_1: "Débutant", difficulty_2: "Intermédiaire", difficulty_3: "Avancé", question: "Faites le nombre cible :", submitButton: "Vérifier", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Indice ({remaining}/3)", hintButtonClose: "Fermer l'Indice", hintLabel: "Indice :", hintUsedText: "(Indice utilisé, 50% de pénalité)", hintText: "L'un des éléments est '{element}'.", feedbackCorrect: "Déverrouillé ! +{score} points", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorrect. Réessayez. 💔", achievementsTitle: "Succès ({count}/4)", achievements_firstCorrect: "Premier Succès", achievements_lightningSpeed: "Solution Rapide", achievements_streakMaster: "Roi du Combo", achievements_master: "Maître Craqueur", achievementsTooltip_firstCorrect: "Obtenez votre première bonne réponse.", achievementsTooltip_lightningSpeed: "Répondez en moins de 3 secondes.", achievementsTooltip_streakMaster: "Obtenez une série de 5 puzzles.", achievementsTooltip_master: "Résolvez 3+ puzzles en difficulté Avancé.", gameOverTitle: "Partie Terminée !", gameOverBadge: "Fin", finalScoreLabel: "Score Final", scoreUnit: " pts", difficultyReachedLabel: "Difficulté Atteinte", bestStreakLabel: "Meilleure Série", itemUnit: "", accuracyLabel: "Précision", achievementsEarnedLabel: "Succès Déverrouillés", starsEarnedLabel: "Étoiles Obtenues", gameOverMessage_great: "🎉 Excellent travail !", gameOverMessage_good: "👍 Bien joué !", gameOverMessage_tryAgain: "💪 Vous pouvez faire mieux la prochaine fois !", gameOverMessage_cleared: "🏆 Vous avez résolu toutes les énigmes ! Légendaire !", playAgainButton: "Rejouer", downloadResult: "Télécharger le résultat", imageDownloaded: "Image téléchargée !", imageDownloadFailed: "Échec du téléchargement de l'image.", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "Comment Jouer", howToPlayTitle: "Comment Jouer", howToPlay_goal_title: "But", howToPlay_goal_desc: "Sélectionnez deux nombres et un opérateur de la grille pour correspondre au nombre cible sur le cadenas.", howToPlay_time_lives_title: "Temps et Bonus", howToPlay_time_lives_desc: "Vous commencez avec 60 secondes. Répondre correctement octroie du temps bonus (jusqu'à 60s max) selon la difficulté. Ne laissez pas le temps ou vos vies s'épuiser !", howToPlay_difficulty_title: "Difficulté", howToPlay_difficulty_desc: "Le jeu s'adapte ! Mieux vous jouez, plus les puzzles deviennent difficiles, vous rapportant plus de points.", howToPlay_streak_title: "Série & Power-ups", howToPlay_streak_desc: "Réalisez une série de 3 puzzles pour avoir une chance de gagner un power-up aléatoire comme ❄️ Gel du Temps, ❤️ Vie Supplémentaire et ⚡ Score Double !", howToPlay_hints_title: "Indices", howToPlay_hints_desc: "Bloqué ? Utilisez l'un des 3 indices par partie. Attention, cela vous coûtera 50% du score pour ce puzzle.", howToPlay_achievements_title: "Succès", howToPlay_achievements_desc: "Déverrouillez des succès spéciaux en accomplissant des jalons dans le jeu.", closeButton: "Compris !", startGameButton: "Commencer la Partie", footer_copyright: "Puzzletic. Tous droits réservés.", footer_contact: "Contact professionnel:", sound_on: "Muet", sound_off: "Activer le son" },
  de: { title: "Zahlenschloss", subtitle: "Knacke den Code mit Mathe", scoreLabel: "Punkte", livesLabel: "Leben", streakLabel: "Serie", timeLabel: "Zeit", difficulty_1: "Anfänger", difficulty_2: "Mittel", difficulty_3: "Fortgeschritten", question: "Erreiche die Zielzahl:", submitButton: "Prüfen", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Tipp ({remaining}/3)", hintButtonClose: "Tipp schließen", hintLabel: "Tipp:", hintUsedText: "(Tipp verwendet, 50% Punktabzug)", hintText: "Eines der Elemente ist '{element}'.", feedbackCorrect: "Entsperrt! +{score} Punkte", feedbackEmojiCorrect: "🎉", feedbackWrong: "Falsch. Versuche es erneut. 💔", achievementsTitle: "Erfolge ({count}/4)", achievements_firstCorrect: "Erster Treffer", achievements_lightningSpeed: "Schneller Löser", achievements_streakMaster: "Serienkönig", achievements_master: "Meisterknacker", achievementsTooltip_firstCorrect: "Gib deine erste richtige Antwort.", achievementsTooltip_lightningSpeed: "Antworte in unter 3 Sekunden.", achievementsTooltip_streakMaster: "Erreiche eine Serie von 5 Rätseln.", achievementsTooltip_master: "Löse 3+ Rätsel auf Schwierigkeit Fortgeschritten.", gameOverTitle: "Spiel Vorbei!", gameOverBadge: "Ende", finalScoreLabel: "Endpunktzahl", scoreUnit: " Pkt", difficultyReachedLabel: "Erreichte Schwierigkeit", bestStreakLabel: "Beste Serie", itemUnit: "", accuracyLabel: "Genauigkeit", achievementsEarnedLabel: "Freigeschaltete Erfolge", starsEarnedLabel: "Erhaltene Sterne", gameOverMessage_great: "🎉 Ausgezeichnete Arbeit!", gameOverMessage_good: "👍 Gut gemacht!", gameOverMessage_tryAgain: "💪 Nächstes Mal schaffst du das!", gameOverMessage_cleared: "🏆 Du hast alle Rätsel gelöst! Legendär!", playAgainButton: "Nochmal Spielen", downloadResult: "Ergebnis herunterladen", imageDownloaded: "Bild heruntergeladen!", imageDownloadFailed: "Bild konnte nicht heruntergeladen werden.", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "Spielanleitung", howToPlayTitle: "Spielanleitung", howToPlay_goal_title: "Ziel", howToPlay_goal_desc: "Wähle zwei Zahlen und einen Operator aus dem Gitter, um die Zielzahl auf dem Schloss zu erreichen.", howToPlay_time_lives_title: "Zeit und Bonus", howToPlay_time_lives_desc: "Du startest mit 60 Sekunden. Richtige Antworten geben Bonuszeit (bis zu 60s max) je nach Schwierigkeit. Lass weder die Zeit noch deine Leben ausgehen!", howToPlay_difficulty_title: "Schwierigkeit", howToPlay_difficulty_desc: "Das Spiel passt sich an! Je besser du spielst, desto schwieriger werden die Rätsel und desto mehr Punkte erhältst du.", howToPlay_streak_title: "Serie & Power-Ups", howToPlay_streak_desc: "Erreiche eine 3er-Serie für die Chance auf ein zufälliges Power-Up wie ❄️ Zeitstopp, ❤️ Extraleben und ⚡ Doppelte Punkte!", howToPlay_hints_title: "Tipps", howToPlay_hints_desc: "Steckst du fest? Nutze einen von 3 Tipps pro Spiel. Sei vorsichtig, es kostet dich 50% der Punkte für dieses Rätsel.", howToPlay_achievements_title: "Erfolge", howToPlay_achievements_desc: "Schalte besondere Erfolge frei, indem du Meilensteine im Spiel erreichst.", closeButton: "Verstanden!", startGameButton: "Spiel Starten", footer_copyright: "Puzzletic. Alle Rechte vorbehalten.", footer_contact: "Geschäftskontakt:", sound_on: "Stumm", sound_off: "Ton an" },
  pt: { title: "Cadeado Numérico", subtitle: "Decifre o código com matemática", scoreLabel: "Pontos", livesLabel: "Vidas", streakLabel: "Sequência", timeLabel: "Tempo", difficulty_1: "Iniciante", difficulty_2: "Intermediário", difficulty_3: "Avançado", question: "Faça o número alvo:", submitButton: "Verificar", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Dica ({remaining}/3)", hintButtonClose: "Fechar Dica", hintLabel: "Dica:", hintUsedText: "(Dica usada, 50% de penalidade)", hintText: "Um dos elementos é '{element}'.", feedbackCorrect: "Destravado! +{score} pontos", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorreto. Tente novamente. 💔", achievementsTitle: "Conquistas ({count}/4)", achievements_firstCorrect: "Primeiro Acerto", achievements_lightningSpeed: "Solucionador Rápido", achievements_streakMaster: "Rei da Sequência", achievements_master: "Mestre Decifrador", achievementsTooltip_firstCorrect: "Acerte sua primeira resposta.", achievementsTooltip_lightningSpeed: "Responda em menos de 3 segundos.", achievementsTooltip_streakMaster: "Obtenha uma sequência de 5 quebra-cabeças.", achievementsTooltip_master: "Resolva 3+ quebra-cabeças na dificuldade Avançado.", gameOverTitle: "Fim de Jogo!", gameOverBadge: "Fim", finalScoreLabel: "Pontuação Final", scoreUnit: " pts", difficultyReachedLabel: "Dificuldade Alcançada", bestStreakLabel: "Melhor Sequência", itemUnit: "", accuracyLabel: "Precisão", achievementsEarnedLabel: "Conquistas Desbloqueadas", starsEarnedLabel: "Estrelas Ganhas", gameOverMessage_great: "🎉 Excelente trabalho!", gameOverMessage_good: "👍 Bem feito!", gameOverMessage_tryAgain: "💪 Você consegue fazer melhor da próxima vez!", gameOverMessage_cleared: "🏆 Você limpou todos os quebra-cabeças! Lendário!", playAgainButton: "Jogar Novamente", downloadResult: "Baixar Resultado", imageDownloaded: "Imagem baixada!", imageDownloadFailed: "Falha ao baixar a imagem.", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "Como Jogar", howToPlayTitle: "Como Jogar", howToPlay_goal_title: "Objetivo", howToPlay_goal_desc: "Selecione dois números e um operador da grade para corresponder ao número alvo no cadeado.", howToPlay_time_lives_title: "Tempo e Bônus", howToPlay_time_lives_desc: "Você começa com 60 segundos. Responder corretamente concede tempo bônus (até 60s no máximo) com base na dificuldade. Não deixe o tempo ou suas vidas acabarem!", howToPlay_difficulty_title: "Dificuldade", howToPlay_difficulty_desc: "O jogo se adapta! Quanto melhor você joga, mais difíceis os quebra-cabeças se tornam, e mais pontos você ganha.", howToPlay_streak_title: "Sequência e Power-ups", howToPlay_streak_desc: "Alcance uma sequência de 3 quebra-cabeças para ter a chance de ganhar um power-up aleatório como ❄️ Congelar Tempo, ❤️ Vida Extra e ⚡ Pontuação em Dobro!", howToPlay_hints_title: "Dicas", howToPlay_hints_desc: "Preso? Use uma das 3 dicas por jogo. Cuidado, custará 50% dos pontos do quebra-cabeça.", howToPlay_achievements_title: "Conquistas", howToPlay_achievements_desc: "Desbloqueie conquistas especiais ao completar marcos no jogo.", closeButton: "Entendi!", startGameButton: "Começar Jogo", footer_copyright: "Puzzletic. Todos os direitos reservados.", footer_contact: "Contato comercial:", sound_on: "Silenciar", sound_off: "Ativar som" },
  it: { title: "Lucchetto Numerico", subtitle: "Decifra il codice con la matematica", scoreLabel: "Punteggio", livesLabel: "Vite", streakLabel: "Serie", timeLabel: "Tempo", difficulty_1: "Principiante", difficulty_2: "Intermedio", difficulty_3: "Avanzato", question: "Crea il numero target:", submitButton: "Controlla", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Suggerimento ({remaining}/3)", hintButtonClose: "Chiudi Suggerimento", hintLabel: "Suggerimento:", hintUsedText: "(Suggerimento usato, penalità 50%)", hintText: "Uno degli elementi è '{element}'.", feedbackCorrect: "Sbloccato! +{score} punti", feedbackEmojiCorrect: "🎉", feedbackWrong: "Errato. Riprova. 💔", achievementsTitle: "Obiettivi ({count}/4)", achievements_firstCorrect: "Primo Colpo", achievements_lightningSpeed: "Risolutore Veloce", achievements_streakMaster: "Re della Serie", achievements_master: "Maestro Scassinatore", achievementsTooltip_firstCorrect: "Ottieni la tua prima risposta corretta.", achievementsTooltip_lightningSpeed: "Rispondi in meno di 3 secondi.", achievementsTooltip_streakMaster: "Ottieni una serie di 5 puzzle.", achievementsTooltip_master: "Risolvi 3+ puzzle a difficoltà Avanzato.", gameOverTitle: "Fine Partita!", gameOverBadge: "Fine", finalScoreLabel: "Punteggio Finale", scoreUnit: " pti", difficultyReachedLabel: "Difficoltà Raggiunta", bestStreakLabel: "Miglior Serie", itemUnit: "", accuracyLabel: "Precisione", achievementsEarnedLabel: "Obiettivi Sbloccati", starsEarnedLabel: "Stelle Ottenute", gameOverMessage_great: "🎉 Ottimo lavoro!", gameOverMessage_good: "👍 Ben fatto!", gameOverMessage_tryAgain: "💪 La prossima volta andrà meglio!", gameOverMessage_cleared: "🏆 Hai risolto tutti i puzzle! Leggendario!", playAgainButton: "Gioca Ancora", downloadResult: "Scarica Risultato", imageDownloaded: "Immagine scaricata!", imageDownloadFailed: "Download dell'immagine non riuscito.", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "Come Giocare", howToPlayTitle: "Come Giocare", howToPlay_goal_title: "Obiettivo", howToPlay_goal_desc: "Seleziona due numeri e un operatore dalla griglia per eguagliare il numero target sul lucchetto.", howToPlay_time_lives_title: "Tempo e Bonus", howToPlay_time_lives_desc: "Inizi con 60 secondi. Rispondere correttamente assegna tempo bonus (fino a 60s max) in base alla difficoltà. Non lasciare che il timer o le tue vite si esauriscano!", howToPlay_difficulty_title: "Difficoltà", howToPlay_difficulty_desc: "Il gioco si adatta! Meglio giochi, più difficili diventano i puzzle, facendoti guadagnare più punti.", howToPlay_streak_title: "Serie & Potenziamenti", howToPlay_streak_desc: "Ottieni una serie di 3 puzzle per avere la possibilità di guadagnare un potenziamento casuale come ❄️ Congela Tempo, ❤️ Vita Extra e ⚡ Punteggio Doppio!", howToPlay_hints_title: "Suggerimenti", howToPlay_hints_desc: "Bloccato? Usa uno dei 3 suggerimenti per partita. Attenzione, ti costerà il 50% del punteggio per quel puzzle.", howToPlay_achievements_title: "Obiettivi", howToPlay_achievements_desc: "Sblocca obiettivi speciali completando traguardi nel gioco.", closeButton: "Capito!", startGameButton: "Inizia Partita", footer_copyright: "Puzzletic. Tutti i diritti riservati.", footer_contact: "Contatto commerciale:", sound_on: "Muto", sound_off: "Attiva audio" },
  ru: { title: "Числовой Замок", subtitle: "Взломай код с помощью математики", scoreLabel: "Счет", livesLabel: "Жизни", streakLabel: "Серия", timeLabel: "Время", difficulty_1: "Новичок", difficulty_2: "Средний", difficulty_3: "Продвинутый", question: "Составьте целевое число:", submitButton: "Проверить", doubleScoreActive: "⚡x ({timeLeft}с)", hintButton: "💡 Подсказка ({remaining}/3)", hintButtonClose: "Закрыть подсказку", hintLabel: "Подсказка:", hintUsedText: "(Подсказка использована, штраф 50%)", hintText: "Один из элементов - '{element}'.", feedbackCorrect: "Открыто! +{score} очков", feedbackEmojiCorrect: "🎉", feedbackWrong: "Неверно. Попробуйте еще. 💔", achievementsTitle: "Достижения ({count}/4)", achievements_firstCorrect: "Первый успех", achievements_lightningSpeed: "Быстрый решатель", achievements_streakMaster: "Король серий", achievements_master: "Мастер-взломщик", achievementsTooltip_firstCorrect: "Дайте первый правильный ответ.", achievementsTooltip_lightningSpeed: "Ответьте менее чем за 3 секунды.", achievementsTooltip_streakMaster: "Соберите серию из 5 головоломок.", achievementsTooltip_master: "Решите 3+ головоломки на сложности 'Продвинутый'.", gameOverTitle: "Игра Окончена!", gameOverBadge: "Конец", finalScoreLabel: "Итоговый Счет", scoreUnit: " очк", difficultyReachedLabel: "Достигнутая Сложность", bestStreakLabel: "Лучшая Серия", itemUnit: "", accuracyLabel: "Точность", achievementsEarnedLabel: "Открытые Достижения", starsEarnedLabel: "Заработано звёзд", gameOverMessage_great: "🎉 Отличная работа!", gameOverMessage_good: "👍 Хорошо сделано!", gameOverMessage_tryAgain: "💪 В следующий раз у вас получится лучше!", gameOverMessage_cleared: "🏆 Вы решили все головоломки! Легендарно!", playAgainButton: "Играть Снова", downloadResult: "Скачать результат", imageDownloaded: "Изображение скачано!", imageDownloadFailed: "Не удалось скачать изображение.", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "Как играть", howToPlayTitle: "Как играть", howToPlay_goal_title: "Цель", howToPlay_goal_desc: "Выберите два числа и один оператор из сетки, чтобы получить целевое число на замке.", howToPlay_time_lives_title: "Время и Бонус", howToPlay_time_lives_desc: "Вы начинаете с 60 секунд. Правильный ответ дает бонусное время (до 60с макс) в зависимости от сложности. Не позволяйте таймеру или вашим жизням закончиться!", howToPlay_difficulty_title: "Сложность", howToPlay_difficulty_desc: "Игра адаптируется! Чем лучше вы играете, тем сложнее становятся головоломки и тем больше очков вы зарабатываете.", howToPlay_streak_title: "Серия и Усиления", howToPlay_streak_desc: "Соберите серию из 3 головоломок, чтобы получить шанс на случайное усиление, такое как ❄️ Заморозка Времени, ❤️ Дополнительная Жизнь и ⚡ Двойной Счет!", howToPlay_hints_title: "Подсказки", howToPlay_hints_desc: "Застряли? Используйте одну из 3 подсказок за игру. Будьте осторожны, это будет стоить вам 50% очков за эту головоломку.", howToPlay_achievements_title: "Достижения", howToPlay_achievements_desc: "Открывайте особые достижения, выполняя важные этапы в игре.", closeButton: "Понятно!", startGameButton: "Начать Игру", footer_copyright: "Puzzletic. Все права защищены.", footer_contact: "Деловой контакт:", sound_on: "Выкл. звук", sound_off: "Вкл. звук" },
  ar: { title: "القفل الرقمي", subtitle: "فك الشفرة بالرياضيات", scoreLabel: "النقاط", livesLabel: "الأرواح", streakLabel: "سلسلة", timeLabel: "الوقت", difficulty_1: "مبتدئ", difficulty_2: "متوسط", difficulty_3: "متقدم", question: "كوّن الرقم المستهدف:", submitButton: "تحقق", doubleScoreActive: "⚡x ({timeLeft} ث)", hintButton: "💡 تلميح ({remaining}/3)", hintButtonClose: "إغلاق التلميح", hintLabel: "تلميح:", hintUsedText: "(تم استخدام تلميح, خصم 50%)", hintText: "أحد العناصر هو '{element}'.", feedbackCorrect: "تم الفتح! +{score} نقطة", feedbackEmojiCorrect: "🎉", feedbackWrong: "غير صحيح. حاول مرة أخرى. 💔", achievementsTitle: "الإنجازات ({count}/4)", achievements_firstCorrect: "الفتحة الأولى", achievements_lightningSpeed: "الحلال السريع", achievements_streakMaster: "ملك السلسلة", achievements_master: "الخبير الفاتح", achievementsTooltip_firstCorrect: "احصل على إجابتك الصحيحة الأولى.", achievementsTooltip_lightningSpeed: "أجب في أقل من 3 ثوان.", achievementsTooltip_streakMaster: "حقق سلسلة من 5 ألغاز.", achievementsTooltip_master: "حل 3+ ألغاز على صعوبة متقدم.", gameOverTitle: "انتهت اللعبة!", gameOverBadge: "النهاية", finalScoreLabel: "النتيجة النهائية", scoreUnit: " نقطة", difficultyReachedLabel: "الصعوبة التي تم الوصول إليها", bestStreakLabel: "أفضل سلسلة", itemUnit: "", accuracyLabel: "الدقة", achievementsEarnedLabel: "الإنجازات المكتسبة", starsEarnedLabel: "النجوم المكتسبة", gameOverMessage_great: "🎉 عمل ممتاز!", gameOverMessage_good: "👍 أحسنت صنعًا!", gameOverMessage_tryAgain: "💪 يمكنك أن تفعل ما هو أفضل في المرة القادمة!", gameOverMessage_cleared: "🏆 لقد قمت بحل جميع الألغاز! أسطوري!", playAgainButton: "العب مرة أخرى", downloadResult: "تنزيل النتيجة", imageDownloaded: "تم تنزيل الصورة!", imageDownloadFailed: "فشل تنزيل الصورة.", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "كيفية اللعب", howToPlayTitle: "كيفية اللعب", howToPlay_goal_title: "الهدف", howToPlay_goal_desc: "اختر رقمين وعاملًا واحدًا من الشبكة لمطابقة الرقم المستهدف على القفل.", howToPlay_time_lives_title: "الوقت والمكافأة", howToPlay_time_lives_desc: "تبدأ بـ 60 ثانية. الإجابة الصحيحة تمنح وقتًا إضافيًا (بحد أقصى 60 ثانية) بناءً على الصعوبة. لا تدع الوقت أو حياتك تنفد!", howToPlay_difficulty_title: "الصعوبة", howToPlay_difficulty_desc: "اللعبة تتكيف! كلما لعبت بشكل أفضل، أصبحت الألغاز أصعب، وكسبت المزيد من النقاط.", howToPlay_streak_title: "السلسلة والتعزيزات", howToPlay_streak_desc: "حقق سلسلة من 3 ألغاز للحصول على فرصة لربح تعزيز عشوائي مثل ❄️ تجميد الوقت، ❤️ حياة إضافية، و ⚡ نقاط مضاعفة!", howToPlay_hints_title: "تلميحات", howToPlay_hints_desc: "عالق؟ استخدم واحدة من 3 تلميحات لكل لعبة. كن حذرًا، ستكلفك 50٪ من نقاط هذا اللغز.", howToPlay_achievements_title: "الإنجازات", howToPlay_achievements_desc: "افتح الإنجازات الخاصة لإكمال المعالم في اللعبة.", closeButton: "فهمت!", startGameButton: "ابدأ اللعبة", footer_copyright: "Puzzletic. جميع الحقوق محفوظة.", footer_contact: "اتصال تجاري:", sound_on: "كتم الصوت", sound_off: "إلغاء كتم الصوت" },
  zh: { title: "数字锁", subtitle: "用数学破解密码", scoreLabel: "分数", livesLabel: "生命", streakLabel: "连击", timeLabel: "时间", difficulty_1: "初级", difficulty_2: "中级", difficulty_3: "高级", question: "凑出目标数字：", submitButton: "检查", doubleScoreActive: "⚡x ({timeLeft}秒)", hintButton: "💡 提示 ({remaining}/3)", hintButtonClose: "关闭提示", hintLabel: "提示：", hintUsedText: "(已用提示, 扣除50%分数)", hintText: "其中一个元素是 '{element}'。", feedbackCorrect: "已解锁！+{score}分", feedbackEmojiCorrect: "🎉", feedbackWrong: "错误，再试一次。💔", achievementsTitle: "成就 ({count}/4)", achievements_firstCorrect: "首次破解", achievements_lightningSpeed: "速解者", achievements_streakMaster: "连击之王", achievements_master: "破解大师", achievementsTooltip_firstCorrect: "获得你的第一个正确答案。", achievementsTooltip_lightningSpeed: "在3秒内回答。", achievementsTooltip_streakMaster: "获得5个谜题的连击。", achievementsTooltip_master: "在高级难度下正确解决3个以上谜题。", gameOverTitle: "游戏结束！", gameOverBadge: "完", finalScoreLabel: "最终得分", scoreUnit: "分", difficultyReachedLabel: "达到的难度", bestStreakLabel: "最佳连击", itemUnit: "个", accuracyLabel: "准确率", achievementsEarnedLabel: "已解锁成就", starsEarnedLabel: "获得星数", gameOverMessage_great: "🎉 太棒了！", gameOverMessage_good: "👍 做得好！", gameOverMessage_tryAgain: "💪 下次可以做得更好！", gameOverMessage_cleared: "🏆 你已经解开了所有谜题！太传奇了！", playAgainButton: "再玩一次", downloadResult: "下载结果", imageDownloaded: "图片已下载！", imageDownloadFailed: "图片下载失败。", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "怎么玩", howToPlayTitle: "游戏玩法", howToPlay_goal_title: "目标", howToPlay_goal_desc: "从网格中选择两个数字和一个运算符，以匹配锁上的目标数字。", howToPlay_time_lives_title: "时间与奖励", howToPlay_time_lives_desc: "你从60秒开始。正确回答会根据难度奖励额外时间（最多60秒）。不要让计时器或你的生命耗尽！", howToPlay_difficulty_title: "难度", howToPlay_difficulty_desc: "游戏会适应！你玩得越好，谜题就越难，你获得的分数就越多。", howToPlay_streak_title: "连击与道具", howToPlay_streak_desc: "连续完成3个谜题，有机会获得随机道具，如❄️时间冻结、❤️额外生命和⚡双倍分数！", howToPlay_hints_title: "提示", howToPlay_hints_desc: "卡住了？每局游戏可使用3次提示。小心，这会让你失去该谜题50%的分数。", howToPlay_achievements_title: "成就", howToPlay_achievements_desc: "完成游戏中的里程碑，解锁特殊成就。", closeButton: "好的！", startGameButton: "开始游戏", footer_copyright: "Puzzletic. 版权所有。", footer_contact: "商务联系：", sound_on: "静音", sound_off: "取消静音" },
  ja: { title: "ナンバーロック", subtitle: "数学でコードを解読しよう", scoreLabel: "スコア", livesLabel: "ライフ", streakLabel: "ストリーク", timeLabel: "時間", difficulty_1: "初級", difficulty_2: "中級", difficulty_3: "上級", question: "目標の数字を作ってください：", submitButton: "チェック", doubleScoreActive: "⚡x ({timeLeft}秒)", hintButton: "💡 ヒント ({remaining}/3)", hintButtonClose: "ヒントを閉じる", hintLabel: "ヒント：", hintUsedText: "(ヒント使用、スコア50%減)", hintText: "要素の一つは「{element}」です。", feedbackCorrect: "解錠！+{score}ポイント", feedbackEmojiCorrect: "🎉", feedbackWrong: "不正解です。再試行してください。💔", achievementsTitle: "実績 ({count}/4)", achievements_firstCorrect: "初解錠", achievements_lightningSpeed: "スピードソルバー", achievements_streakMaster: "コンボキング", achievements_master: "マスタークラッカー", achievementsTooltip_firstCorrect: "最初の正解を出す。", achievementsTooltip_lightningSpeed: "3秒以内に回答する。", achievementsTooltip_streakMaster: "5問連続で正解する。", achievementsTooltip_master: "上級難易度で3問以上正解する。", gameOverTitle: "ゲームオーバー！", gameOverBadge: "終", finalScoreLabel: "最終スコア", scoreUnit: "点", difficultyReachedLabel: "到達難易度", bestStreakLabel: "最高ストリーク", itemUnit: "個", accuracyLabel: "正解率", achievementsEarnedLabel: "解除された実績", starsEarnedLabel: "獲得した星", gameOverMessage_great: "🎉 素晴らしい！", gameOverMessage_good: "👍 よくできました！", gameOverMessage_tryAgain: "💪 次はもっとうまくできる！", gameOverMessage_cleared: "🏆 全てのパズルをクリアしました！伝説的です！", playAgainButton: "もう一度プレイ", downloadResult: "結果をダウンロード", imageDownloaded: "画像をダウンロードしました！", imageDownloadFailed: "画像のダウンロードに失敗しました。", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "遊び方", howToPlayTitle: "遊び方", howToPlay_goal_title: "目標", howToPlay_goal_desc: "グリッドから2つの数字と1つの演算子を選び、ロックの目標数字と一致させます。", howToPlay_time_lives_title: "時間とボーナス", howToPlay_time_lives_desc: "60秒でスタートします。正解すると難易度に応じてボーナスタイムがもらえます（最大60秒）。時間やライフが尽きないように注意してください！", howToPlay_difficulty_title: "難易度", howToPlay_difficulty_desc: "ゲームはあなたの腕前に適応します！上手にプレイするほどパズルは難しくなり、より多くのポイントを獲得できます。", howToPlay_streak_title: "ストリークとパワーアップ", howToPlay_streak_desc: "3問連続正解すると、❄️時間停止、❤️追加ライフ、⚡スコア2倍などのパワーアップをランダムで獲得するチャンスがあります！", howToPlay_hints_title: "ヒント", howToPlay_hints_desc: "行き詰まりましたか？1ゲームにつき3つのヒントを使えます。注意：そのパズルのスコアの50%が引かれます。", howToPlay_achievements_title: "実績", howToPlay_achievements_desc: "ゲーム内のマイルストーンを達成して、特別な実績を解除しましょう。", closeButton: "わかった！", startGameButton: "ゲーム開始", footer_copyright: "Puzzletic. 全著作権所有。", footer_contact: "ビジネスお問い合わせ：", sound_on: "ミュート", sound_off: "ミュート解除" },
  vi: { title: "Khóa Số", subtitle: "Phá mã bằng toán học", scoreLabel: "Điểm", livesLabel: "Mạng", streakLabel: "Chuỗi", timeLabel: "Thời gian", difficulty_1: "Người mới bắt đầu", difficulty_2: "Trung bình", difficulty_3: "Nâng cao", question: "Tạo số mục tiêu:", submitButton: "Kiểm tra", doubleScoreActive: "⚡x ({timeLeft}s)", hintButton: "💡 Gợi ý ({remaining}/3)", hintButtonClose: "Đóng gợi ý", hintLabel: "Gợi ý:", hintUsedText: "(Đã dùng gợi ý, trừ 50% điểm)", hintText: "Một trong các yếu tố là '{element}'.", feedbackCorrect: "Đã mở khóa! +{score} điểm", feedbackEmojiCorrect: "🎉", feedbackWrong: "Sai rồi. Thử lại đi. 💔", achievementsTitle: "Thành tích ({count}/4)", achievements_firstCorrect: "Lần phá đầu tiên", achievements_lightningSpeed: "Người giải nhanh", achievements_streakMaster: "Vua chuỗi", achievements_master: "Bậc thầy phá khóa", achievementsTooltip_firstCorrect: "Có câu trả lời đúng đầu tiên.", achievementsTooltip_lightningSpeed: "Trả lời trong vòng 3 giây.", achievementsTooltip_streakMaster: "Đạt chuỗi 5 câu đố.", achievementsTooltip_master: "Giải đúng 3+ câu đố ở độ khó Nâng cao.", gameOverTitle: "Trò chơi kết thúc!", gameOverBadge: "Hết", finalScoreLabel: "Điểm cuối cùng", scoreUnit: " điểm", difficultyReachedLabel: "Độ khó đạt được", bestStreakLabel: "Chuỗi tốt nhất", itemUnit: "", accuracyLabel: "Độ chính xác", achievementsEarnedLabel: "Thành tích đã mở khóa", starsEarnedLabel: "Sao kiếm được", gameOverMessage_great: "🎉 Làm tốt lắm!", gameOverMessage_good: "👍 Hay lắm!", gameOverMessage_tryAgain: "💪 Bạn có thể làm tốt hơn vào lần sau!", gameOverMessage_cleared: "🏆 Bạn đã giải hết các câu đố! Huyền thoại!", playAgainButton: "Chơi lại", downloadResult: "Tải xuống kết quả", imageDownloaded: "Đã tải xuống hình ảnh!", imageDownloadFailed: "Không tải được hình ảnh.", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "Cách chơi", howToPlayTitle: "Cách chơi", howToPlay_goal_title: "Mục tiêu", howToPlay_goal_desc: "Chọn hai số và một toán tử từ lưới để khớp với số mục tiêu trên khóa.", howToPlay_time_lives_title: "Thời gian & Tiền thưởng", howToPlay_time_lives_desc: "Bạn bắt đầu với 60 giây. Trả lời đúng sẽ nhận được thời gian thưởng (tối đa 60 giây) dựa trên độ khó. Đừng để hết giờ hoặc mạng!", howToPlay_difficulty_title: "Độ khó", howToPlay_difficulty_desc: "Trò chơi sẽ thích ứng! Bạn chơi càng giỏi, câu đố càng khó, bạn càng kiếm được nhiều điểm.", howToPlay_streak_title: "Chuỗi & Vật phẩm hỗ trợ", howToPlay_streak_desc: "Đạt được chuỗi 3 câu đố để có cơ hội nhận được vật phẩm hỗ trợ ngẫu nhiên như ❄️ Đóng băng thời gian, ❤️ Thêm mạng, và ⚡ Nhân đôi điểm!", howToPlay_hints_title: "Gợi ý", howToPlay_hints_desc: "Bị kẹt? Sử dụng một trong 3 gợi ý mỗi trò chơi. Cẩn thận, bạn sẽ bị trừ 50% điểm cho câu đố đó.", howToPlay_achievements_title: "Thành tích", howToPlay_achievements_desc: "Mở khóa các thành tích đặc biệt bằng cách hoàn thành các cột mốc trong trò chơi.", closeButton: "Đã hiểu!", startGameButton: "Bắt đầu chơi", footer_copyright: "Puzzletic. Mọi quyền được bảo lưu.", footer_contact: "Liên hệ kinh doanh:", sound_on: "Tắt tiếng", sound_off: "Bật tiếng" },
  th: { title: "ล็อคตัวเลข", subtitle: "ถอดรหัสด้วยคณิตศาสตร์", scoreLabel: "คะแนน", livesLabel: "ชีวิต", streakLabel: "สตรีค", timeLabel: "เวลา", difficulty_1: "เริ่มต้น", difficulty_2: "ปานกลาง", difficulty_3: "ขั้นสูง", question: "สร้างตัวเลขเป้าหมาย:", submitButton: "ตรวจสอบ", doubleScoreActive: "⚡x ({timeLeft}วิ)", hintButton: "💡 คำใบ้ ({remaining}/3)", hintButtonClose: "ปิดคำใบ้", hintLabel: "คำใบ้:", hintUsedText: "(ใช้คำใบ้, หัก 50% คะแนน)", hintText: "หนึ่งในองค์ประกอบคือ '{element}'", feedbackCorrect: "ปลดล็อคแล้ว! +{score} คะแนน", feedbackEmojiCorrect: "🎉", feedbackWrong: "ไม่ถูกต้อง ลองอีกครั้ง 💔", achievementsTitle: "ความสำเร็จ ({count}/4)", achievements_firstCorrect: "แคร็กแรก", achievements_lightningSpeed: "นักแก้ปัญหาความเร็ว", achievements_streakMaster: "ราชาคอมโบ", achievements_master: "มาสเตอร์แคร็กเกอร์", achievementsTooltip_firstCorrect: "ตอบถูกครั้งแรก", achievementsTooltip_lightningSpeed: "ตอบภายใน 3 วินาที", achievementsTooltip_streakMaster: "ทำสตรีค 5 ปริศนา", achievementsTooltip_master: "แก้ปริศนา 3+ ข้อในระดับความยากขั้นสูง", gameOverTitle: "เกมจบแล้ว!", gameOverBadge: "จบ", finalScoreLabel: "คะแนนสุดท้าย", scoreUnit: " คะแนน", difficultyReachedLabel: "ระดับความยากที่ไปถึง", bestStreakLabel: "สตรีคสูงสุด", itemUnit: "", accuracyLabel: "ความแม่นยำ", achievementsEarnedLabel: "ความสำเร็จที่ปลดล็อค", starsEarnedLabel: "ดาวที่ได้รับ", gameOverMessage_great: "🎉 ยอดเยี่ยมมาก!", gameOverMessage_good: "👍 ทำได้ดีมาก!", gameOverMessage_tryAgain: "💪 ครั้งหน้าต้องดีกว่านี้!", gameOverMessage_cleared: "🏆 คุณเคลียร์ปริศนาทั้งหมดแล้ว! สุดยอด!", playAgainButton: "เล่นอีกครั้ง", downloadResult: "ดาวน์โหลดผลลัพธ์", imageDownloaded: "ดาวน์โหลดรูปภาพแล้ว!", imageDownloadFailed: "ดาวน์โหลดรูปภาพไม่สำเร็จ", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "วิธีเล่น", howToPlayTitle: "วิธีเล่น", howToPlay_goal_title: "เป้าหมาย", howToPlay_goal_desc: "เลือกตัวเลขสองตัวและตัวดำเนินการหนึ่งตัวจากตารางเพื่อให้ตรงกับตัวเลขเป้าหมายบนล็อค", howToPlay_time_lives_title: "เวลาและโบนัส", howToPlay_time_lives_desc: "คุณเริ่มต้นด้วยเวลา 60 วินาที การตอบถูกจะได้รับเวลาโบนัส (สูงสุด 60 วินาที) ตามระดับความยาก อย่าปล่อยให้เวลาหรือชีวิตหมด!", howToPlay_difficulty_title: "ระดับความยาก", howToPlay_difficulty_desc: "เกมจะปรับตาม! ยิ่งคุณเล่นเก่ง ปริศนาก็จะยิ่งยากขึ้น และคุณจะได้รับคะแนนมากขึ้น", howToPlay_streak_title: "สตรีคและพาวเวอร์อัป", howToPlay_streak_desc: "ทำสตรีค 3 ปริศนาเพื่อลุ้นรับพาวเวอร์อัปแบบสุ่ม เช่น ❄️ หยุดเวลา, ❤️ ชีวิตพิเศษ, และ ⚡ คะแนนสองเท่า!", howToPlay_hints_title: "คำใบ้", howToPlay_hints_desc: "ติดขัด? ใช้ 1 ใน 3 คำใบ้ต่อเกม ระวัง มันจะหักคะแนน 50% สำหรับปริศนานั้น", howToPlay_achievements_title: "ความสำเร็จ", howToPlay_achievements_desc: "ปลดล็อคความสำเร็จพิเศษโดยการบรรลุเป้าหมายในเกม", closeButton: "เข้าใจแล้ว!", startGameButton: "เริ่มเกม", footer_copyright: "Puzzletic. สงวนลิขสิทธิ์", footer_contact: "ติดต่อธุรกิจ:", sound_on: "ปิดเสียง", sound_off: "เปิดเสียง" },
  id: { title: "Kunci Angka", subtitle: "Pecahkan kode dengan matematika", scoreLabel: "Skor", livesLabel: "Nyawa", streakLabel: "Runtutan", timeLabel: "Waktu", difficulty_1: "Pemula", difficulty_2: "Menengah", difficulty_3: "Lanjutan", question: "Buat angka target:", submitButton: "Periksa", doubleScoreActive: "⚡x ({timeLeft}d)", hintButton: "💡 Petunjuk ({remaining}/3)", hintButtonClose: "Tutup Petunjuk", hintLabel: "Petunjuk:", hintUsedText: "(Petunjuk digunakan, penalti skor 50%)", hintText: "Salah satu elemennya adalah '{element}'.", feedbackCorrect: "Terbuka! +{score} poin", feedbackEmojiCorrect: "🎉", feedbackWrong: "Salah. Coba lagi. 💔", achievementsTitle: "Pencapaian ({count}/4)", achievements_firstCorrect: "Retakan Pertama", achievements_lightningSpeed: "Penyelesai Cepat", achievements_streakMaster: "Raja Runtutan", achievements_master: "Master Pemecah", achievementsTooltip_firstCorrect: "Dapatkan jawaban benar pertamamu.", achievementsTooltip_lightningSpeed: "Jawab dalam kurang dari 3 detik.", achievementsTooltip_streakMaster: "Dapatkan runtutan 5 teka-teki.", achievementsTooltip_master: "Selesaikan 3+ teka-teki pada kesulitan Lanjutan.", gameOverTitle: "Permainan Selesai!", gameOverBadge: "Selesai", finalScoreLabel: "Skor Akhir", scoreUnit: " poin", difficultyReachedLabel: "Kesulitan Tercapai", bestStreakLabel: "Runtutan Terbaik", itemUnit: "", accuracyLabel: "Akurasi", achievementsEarnedLabel: "Pencapaian Terbuka", starsEarnedLabel: "Bintang Diperoleh", gameOverMessage_great: "🎉 Kerja bagus!", gameOverMessage_good: "👍 Bagus sekali!", gameOverMessage_tryAgain: "💪 Kamu bisa lebih baik lain kali!", gameOverMessage_cleared: "🏆 Anda telah menyelesaikan semua teka-teki! Legendaris!", playAgainButton: "Main Lagi", downloadResult: "Unduh Hasil", imageDownloaded: "Gambar diunduh!", imageDownloadFailed: "Gagal mengunduh gambar.", tip: "💡 Tip: Answer correctly to get bonus time and challenge the high score!", howToPlayButton: "Cara Bermain", howToPlayTitle: "Cara Bermain", howToPlay_goal_title: "Tujuan", howToPlay_goal_desc: "Pilih dua angka dan satu operator dari kisi untuk mencocokkan angka target pada gembok.", howToPlay_time_lives_title: "Waktu & Bonus", howToPlay_time_lives_desc: "Anda mulai dengan 60 detik. Menjawab dengan benar memberikan waktu bonus (maksimal 60 detik) berdasarkan kesulitan. Jangan biarkan waktu atau nyawa Anda habis!", howToPlay_difficulty_title: "Kesulitan", howToPlay_difficulty_desc: "Permainan ini adaptif! Semakin baik kamu bermain, semakin sulit teka-tekinya, dan semakin banyak poin yang kamu dapatkan.", howToPlay_streak_title: "Runtutan & Power-up", howToPlay_streak_desc: "Raih runtutan 3 teka-teki untuk kesempatan mendapatkan power-up acak seperti ❄️ Pembekuan Waktu, ❤️ Nyawa Ekstra, dan ⚡ Skor Ganda!", howToPlay_hints_title: "Petunjuk", howToPlay_hints_desc: "Tersangkut? Gunakan salah satu dari 3 petunjuk per permainan. Hati-hati, itu akan mengurangi 50% skormu untuk teka-teki itu.", howToPlay_achievements_title: "Pencapaian", howToPlay_achievements_desc: "Buka pencapaian khusus dengan menyelesaikan tonggak sejarah dalam permainan.", closeButton: "Mengerti!", startGameButton: "Mulai Permainan", footer_copyright: "Puzzletic. Hak cipta dilindungi undang-undang.", footer_contact: "Kontak Bisnis:", sound_on: "Bisukan", sound_off: "Aktifkan suara" }
};

type Operator = '+' | '-' | '×' | '÷';
type Problem = {
  id: number;
  target: number;
  grid: (number | Operator)[];
  solution: {
    numbers: [number, number];
    operator: Operator;
  };
  difficulty: number;
};

const BGM_URLS = [
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

const generateProblem = (difficulty: number): Problem => {
    let num1: number, num2: number, target: number;
    let operator: Operator;

    // 1. Generate core problem based on simplified difficulty
    if (difficulty === 1) { // Beginner: +, - (Elementary level)
        operator = Math.random() < 0.5 ? '+' : '-';
        if (operator === '+') {
            num1 = Math.floor(Math.random() * 10) + 1; // 1-10
            num2 = Math.floor(Math.random() * 10) + 1; // 1-10
            target = num1 + num2; // Target: 2-20
        } else { // -
            num1 = Math.floor(Math.random() * 18) + 2; // Minuend: 2-19
            num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // Subtrahend < Minuend
            target = num1 - num2; // Target: 1-18
        }
    } else if (difficulty === 2) { // Intermediate: × (Times tables)
        operator = '×';
        num1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
        num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
        target = num1 * num2;
    } else { // Advanced: ÷ (Inverse of times tables)
        operator = '÷';
        num2 = Math.floor(Math.random() * 8) + 2; // Divisor from 2 to 9
        target = Math.floor(Math.random() * 8) + 2; // Result from 2 to 9
        num1 = num2 * target; // Dividend
    }

    const solution = { numbers: [num1, num2].sort((a,b) => b-a) as [number, number], operator };
    const gridNumbers: number[] = [num1, num2];

    // 2. Generate a pool of "smart" distractors
    const distractorPool = new Set<number>();

    // - Distractors from incorrect operations
    if (operator !== '+') distractorPool.add(num1 + num2);
    if (operator !== '-' && num1 - num2 > 0) distractorPool.add(num1 - num2);
    if (operator !== '×' && num1 * num2 < 100) distractorPool.add(num1 * num2);
    if (operator !== '÷' && num2 !== 0 && num1 % num2 === 0) distractorPool.add(num1 / num2);

    // - Distractors near the solution numbers
    distractorPool.add(num1 + 1);
    distractorPool.add(num1 - 1);
    distractorPool.add(num2 + 1);
    distractorPool.add(num2 - 1);
    
    // - Distractors related to the target
    distractorPool.add(target + 1);
    distractorPool.add(target - 1);
    distractorPool.add(target + 2);
    distractorPool.add(target - 2);

    // - Difficulty-specific distractors
    if (difficulty === 1) {
        if (target < 15) distractorPool.add(target + 10);
        if (target > 5) distractorPool.add(target - 5);
    } else if (difficulty === 2) {
        if ((num1 + 1) * num2 < 100) distractorPool.add((num1 + 1) * num2);
        if (num1 * (num2 - 1) < 100) distractorPool.add(num1 * (num2 - 1));
    } else if (difficulty === 3) {
        const closeDividend = num1 + (Math.random() < 0.5 ? 1 : -1);
        if (closeDividend % num2 === 0) distractorPool.add(closeDividend / num2);
    }

    // Clean the pool: remove solution numbers, target, zero/negative, and duplicates
    distractorPool.delete(num1);
    distractorPool.delete(num2);
    distractorPool.delete(target);
    distractorPool.forEach(dist => {
        if (dist <= 0 || dist >= 100) {
            distractorPool.delete(dist);
        }
    });

    // Shuffle and pick from the pool to fill the grid
    const distractorsToAdd = Array.from(distractorPool);
    for (let i = distractorsToAdd.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [distractorsToAdd[i], distractorsToAdd[j]] = [distractorsToAdd[j], distractorsToAdd[i]];
    }

    while (gridNumbers.length < 8 && distractorsToAdd.length > 0) {
        const dist = distractorsToAdd.pop();
        if (dist && !gridNumbers.includes(dist)) {
            gridNumbers.push(dist);
        }
    }
    
    // 3. Fill the remaining spots with more constrained random numbers
    const maxVal = difficulty === 1 ? 25 : (difficulty === 2 ? 81 : 99);
    while (gridNumbers.length < 8) {
        const randomDistractor = Math.floor(Math.random() * maxVal) + 1;
        if (!gridNumbers.includes(randomDistractor) && randomDistractor !== target && !solution.numbers.includes(randomDistractor)) {
            gridNumbers.push(randomDistractor);
        }
    }

    // 4. Combine numbers and operator, then shuffle the final grid
    const grid: (number | Operator)[] = [...gridNumbers, operator];
    for (let i = grid.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [grid[i], grid[j]] = [grid[j], grid[i]];
    }

    return { id: Math.random(), target, grid, solution, difficulty };
};

const Footer = ({ t }: { t: (key: string, replacements?: Record<string, string | number>) => string }) => (
    <footer className="text-center text-white/80 text-xs py-4 flex-shrink-0">
        <p>© {new Date().getFullYear()} {t('footer_copyright')}</p>
        <p>
            {t('footer_contact')}{' '}
            <a href="mailto:puzzletic.biz@gmail.com" className="underline hover:text-white transition-colors">
                puzzletic.biz@gmail.com
            </a>
        </p>
    </footer>
);


const App = () => {
  const [languageCode, setLanguageCode] = useState<LanguageCode>('ko');
  const [isLangDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  const [problems, setProblems] = useState<{[key: number]: Problem[]}>({ 1: [], 2: [], 3: [] });
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);

  // Game State
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [correctAnswersAtCurrentDifficulty, setCorrectAnswersAtCurrentDifficulty] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [advancedCorrectCount, setAdvancedCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
  const [doubleScoreActive, setDoubleScoreActive] = useState(false);
  const [doubleScoreTimeLeft, setDoubleScoreTimeLeft] = useState(0);
  const [timeFrozen, setTimeFrozen] = useState(false);
  const [timeBonusFeedback, setTimeBonusFeedback] = useState<{ id: number; text: string } | null>(null);
  const [achievements, setAchievements] = useState({ firstCorrect: false, lightningSpeed: false, streakMaster: false, master: false });
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [particles, setParticles] = useState<{id: number, emoji: string, x: number, y: number, vx: number, vy: number}[]>([]);
  const [pulseWarning, setPulseWarning] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());
  const [selection, setSelection] = useState<{ value: number | Operator; index: number }[]>([]);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const gameOverCardRef = useRef<HTMLDivElement>(null);
  
  // Sound state
  const [isSoundOn, setIsSoundOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as LanguageCode;
    if (supportedLangs.some(l => l.code === browserLang)) {
      setLanguageCode(browserLang);
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
      if (event.key === 'Escape') setHelpModalOpen(false);
    };
    if (isHelpModalOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isHelpModalOpen]);

  const t = useCallback((key: string, replacements: Record<string, string | number> = {}) => {
    let translation = translations[languageCode]?.[key] || translations.en[key] || key;
    for (const rKey in replacements) {
        translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
    }
    return translation;
  }, [languageCode]);

  // Timer Effect
  useEffect(() => {
    if (gameState !== 'playing' || !deadline) {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        return;
    }
    const loop = () => {
        if (!timeFrozen) {
            const remaining = deadline - Date.now();
            const newTimeLeft = Math.max(0, Math.ceil(remaining / 1000));
            setTimeLeft(newTimeLeft);
            if (newTimeLeft <= 10 && timeLeft > 10) setPulseWarning(true);
            if (newTimeLeft > 10 && timeLeft <=10) setPulseWarning(false);
            if (remaining <= 0) {
                setGameOverReason('time');
                setGameState('gameover');
                return;
            }
        }
        timerRef.current = requestAnimationFrame(loop);
    };
    timerRef.current = requestAnimationFrame(loop);
    return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current) };
  }, [gameState, deadline, timeFrozen, timeLeft]);
  
  // Pause music on game over
  useEffect(() => {
    if (gameState === 'gameover' && audioRef.current) {
        audioRef.current.pause();
    }
  }, [gameState]);


  // Double Score Timer
  useEffect(() => {
    if (doubleScoreActive && doubleScoreTimeLeft > 0 && !timeFrozen) {
      const timer = setTimeout(() => setDoubleScoreTimeLeft(doubleScoreTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (doubleScoreTimeLeft === 0) {
      setDoubleScoreActive(false);
    }
  }, [doubleScoreActive, doubleScoreTimeLeft, timeFrozen]);

  const getDifficultyName = useCallback((level: number) => t(`difficulty_${level}`), [t]);

  const unlockAchievement = (type: keyof typeof achievements) => {
    if (!achievements[type]) {
      setAchievements(prev => ({ ...prev, [type]: true }));
      generateParticles('correct', 15);
    }
  };

  const adjustDifficulty = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
        const newConsecutiveCorrect = consecutiveCorrect + 1;
        const newCorrectAtCurrentDifficulty = correctAnswersAtCurrentDifficulty + 1;

        if (difficultyLevel < 3 && (newConsecutiveCorrect >= 3 || newCorrectAtCurrentDifficulty >= 6)) {
            setDifficultyLevel(d => d + 1);
            setConsecutiveCorrect(0);
            setCorrectAnswersAtCurrentDifficulty(0);
        } else {
            setConsecutiveCorrect(newConsecutiveCorrect);
            setCorrectAnswersAtCurrentDifficulty(newCorrectAtCurrentDifficulty);
        }
        setConsecutiveWrong(0);
    } else { // isWrong
        const newConsecutiveWrong = consecutiveWrong + 1;
        if (difficultyLevel > 1 && newConsecutiveWrong >= 2) {
            setDifficultyLevel(d => d - 1);
            setConsecutiveWrong(0);
            setCorrectAnswersAtCurrentDifficulty(0);
        } else {
            setConsecutiveWrong(newConsecutiveWrong);
        }
        setConsecutiveCorrect(0);
    }
  }, [consecutiveCorrect, correctAnswersAtCurrentDifficulty, difficultyLevel, consecutiveWrong]);

  const generateParticles = (type: 'correct' | 'wrong', count = 10, emojiOverride?: string) => {
    const newParticles: typeof particles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        emoji: emojiOverride || (type === 'correct' ? ['🎉', '✨', '🌟', '💫'][Math.floor(Math.random() * 4)] : ['💥', '😵', '❌'][Math.floor(Math.random() * 3)]),
        x: Math.random() * 100, y: Math.random() * 100, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  const generateNewProblem = useCallback(() => {
    const problemSet = problems[difficultyLevel as keyof typeof problems];
    const availableProblems = problemSet?.filter(p => p.id !== currentProblem?.id) || [];

    if (availableProblems.length === 0) {
      setGameOverReason('cleared');
      setGameState('gameover');
      return;
    }
    
    const problemIndex = Math.floor(Math.random() * availableProblems.length);
    setCurrentProblem(availableProblems[problemIndex]);

    setSelection([]);
    setFeedback('');
    setShowHint(false);
    setHintUsed(false);
    setGameState('playing');
    setQuestionStartTime(Date.now());
    setPulseWarning(timeLeft <= 10);
  }, [difficultyLevel, problems, timeLeft, currentProblem]);

  const usePowerUp = (type: keyof typeof powerUps) => {
    if (powerUps[type] > 0) {
      setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
      if (type === 'timeFreeze' && !timeFrozen) {
        setTimeFrozen(true);
        setTimeout(() => setTimeFrozen(false), 7000);
      }
      if (type === 'extraLife') setLives(prev => Math.min(prev + 1, 3));
      if (type === 'doubleScore') {
        setDoubleScoreActive(true);
        setDoubleScoreTimeLeft(10);
      }
    }
  };

  const calculateScore = (responseTime: number) => {
    let baseScore = 0;
    if (difficultyLevel === 1) baseScore = 50;
    else if (difficultyLevel === 2) baseScore = 100;
    else if (difficultyLevel === 3) baseScore = 150;

    let timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5;
    let streakBonus = streak * 25;
    let totalScore = baseScore + timeBonus + streakBonus;
    if (hintUsed) totalScore = Math.floor(totalScore * 0.5);
    if (doubleScoreActive) totalScore *= 2;
    return totalScore;
  };
  
  const checkAnswer = (numbers: number[], operator: Operator) => {
    if (gameState !== 'playing' || !currentProblem) return;
    
    const responseTimeMs = Date.now() - questionStartTime;
    setQuestionsAnswered(prev => prev + 1);

    let result = -1;
    switch (operator) {
        case '+': result = numbers[0] + numbers[1]; break;
        case '-': result = Math.max(numbers[0] - numbers[1], numbers[1] - numbers[0]); break;
        case '×': result = numbers[0] * numbers[1]; break;
        case '÷': 
            if (numbers[1] !== 0 && numbers[0] % numbers[1] === 0) result = numbers[0] / numbers[1];
            else if (numbers[0] !== 0 && numbers[1] % numbers[0] === 0) result = numbers[1] / numbers[0];
            break;
    }
    
    const isCorrect = result === currentProblem.target;

    adjustDifficulty(isCorrect);

    if (isCorrect) {
      setGameState('correct');
      setCorrectAnswers(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      
      const scoreGained = calculateScore(responseTimeMs);
      setScore(prev => prev + scoreGained);
      
      let timeBonusMs = 0;
      if (currentProblem.difficulty === 1) timeBonusMs = 0;
      else if (currentProblem.difficulty === 2) timeBonusMs = 4000;
      else if (currentProblem.difficulty === 3) timeBonusMs = 6000;

      if (timeBonusMs > 0) {
        setDeadline(prev => {
          if (!prev) return null;
          const newDeadline = prev + timeBonusMs;
          const maxDeadline = Date.now() + 60 * 1000;
          return Math.min(newDeadline, maxDeadline);
        });
        const bonusSeconds = timeBonusMs / 1000;
        setTimeBonusFeedback({ id: Date.now(), text: `+${bonusSeconds}s` });
        setTimeout(() => setTimeBonusFeedback(null), 1500);
      }

      if (newStreak > 0 && newStreak % 3 === 0) {
        if (Math.random() < 0.42) {
          const powerUpTypes: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
          const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
          setPowerUps(prev => ({ ...prev, [randomPowerUp]: prev[randomPowerUp] + 1 }));
          const itemEmoji = randomPowerUp === 'timeFreeze' ? '❄️' : randomPowerUp === 'extraLife' ? '❤️' : '⚡';
          generateParticles('correct', 20, itemEmoji);
        }
      }
      
      let feedbackMsg = t('feedbackCorrect', { score: scoreGained });
      if (hintUsed) feedbackMsg += ` ${t('hintUsedText')}`;
      setFeedback(`${feedbackMsg} ${t('feedbackEmojiCorrect')}`);
      
      generateParticles('correct');
      
      if (!achievements.firstCorrect) unlockAchievement('firstCorrect');
      if (responseTimeMs < 3000) unlockAchievement('lightningSpeed');
      if (newStreak >= 5) unlockAchievement('streakMaster');
      if (difficultyLevel === 3) {
        setAdvancedCorrectCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 3) unlockAchievement('master');
            return newCount;
        });
      }

      const solvedProblem = currentProblem;
      setProblems(prev => ({
        ...prev,
        [solvedProblem.difficulty]: prev[solvedProblem.difficulty].filter(p => p.id !== solvedProblem.id)
      }));

      setTimeout(generateNewProblem, 1500);
    } else {
      setGameState('wrong');
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback(t('feedbackWrong'));
      generateParticles('wrong');
      
      if (newLives <= 0) {
        setGameOverReason('lives');
        setTimeout(() => setGameState('gameover'), 1500);
      } else {
        setTimeout(() => {
          setSelection([]);
          setFeedback('');
          setGameState('playing');
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (selection.length === 3) {
      const numbers = selection.filter(s => typeof s.value === 'number').map(s => s.value as number);
      const operators = selection.filter(s => typeof s.value === 'string').map(s => s.value as Operator);

      if (numbers.length === 2 && operators.length === 1) {
        checkAnswer(numbers, operators[0]);
      } else {
        setFeedback('Error: Select 2 numbers and 1 operator.');
        setTimeout(() => {
            setSelection([]);
            setFeedback('');
        }, 1500);
      }
    }
  }, [selection, gameState, checkAnswer]);

  const resetGame = useCallback(() => {
    // --- Audio Logic ---
    // Create audio element only once
    if (!audioRef.current) {
        const audio = new Audio();
        audio.loop = true;
        audioRef.current = audio;
    }
    // Pause any existing music and set a new random track
    if (audioRef.current) {
        audioRef.current.pause();
        const randomSong = BGM_URLS[Math.floor(Math.random() * BGM_URLS.length)];
        audioRef.current.src = randomSong;
    }

    // --- Game State Reset ---
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setDeadline(null);
    setStreak(0);
    setDifficultyLevel(1);
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
    setCorrectAnswersAtCurrentDifficulty(0);
    setHintUsed(false);
    setHintsRemaining(3);
    setSelection([]);
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
    setAdvancedCorrectCount(0);
    setAchievements({ firstCorrect: false, lightningSpeed: false, streakMaster: false, master: false });
    setGameOverReason(null);
    
    // --- Problem Generation ---
    const newProblems = {
      1: Array.from({ length: 40 }, () => generateProblem(1)),
      2: Array.from({ length: 40 }, () => generateProblem(2)),
      3: Array.from({ length: 30 }, () => generateProblem(3)),
    };
    setProblems(newProblems);
    const problemSet = newProblems[1];
    setCurrentProblem(problemSet[Math.floor(Math.random() * problemSet.length)]);
  }, []);
  
  const startGame = () => {
    if (gameState === 'idle' && currentProblem) {
      setGameState('playing');
      setDeadline(Date.now() + 60 * 1000);
      setQuestionStartTime(Date.now());
      if (isSoundOn && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed on start:", e));
      }
    }
  };

  useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  const handleSelection = (value: number | Operator, index: number) => {
    if (gameState !== 'playing' || selection.some(s => s.index === index)) return;

    const newSelection = [...selection, { value, index }];

    const numbers = newSelection.filter(s => typeof s.value === 'number');
    const operators = newSelection.filter(s => typeof s.value === 'string');

    if (numbers.length > 2 || operators.length > 1) {
      return;
    }
    
    setSelection(newSelection);
  };
  
  const toggleSound = () => {
    setIsSoundOn(prevIsOn => {
      const newIsOn = !prevIsOn;
      if (audioRef.current) {
        if (newIsOn) {
          // Only play if the game is currently active
          if (gameState === 'playing' || gameState === 'correct' || gameState === 'wrong') {
            audioRef.current.play().catch(e => console.error("Audio play failed on unmute", e));
          }
        } else {
          audioRef.current.pause();
        }
      }
      return newIsOn;
    });
  };

  const handleDownloadImage = useCallback(() => {
    if (gameOverCardRef.current === null) {
      return;
    }
    setToast(null); // Clear previous toast if any

    toPng(gameOverCardRef.current, { 
      cacheBust: true,
      pixelRatio: 2, // For higher resolution images
      backgroundColor: '#ffffff'
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'number-lock-result.png';
        link.href = dataUrl;
        link.click();
        setToast({ message: t('imageDownloaded'), type: 'success' });
        setTimeout(() => setToast(null), 3000);
      })
      .catch((err) => {
        console.error('Failed to generate image', err);
        setToast({ message: t('imageDownloadFailed'), type: 'error' });
        setTimeout(() => setToast(null), 3000);
      });
  }, [t]);
  
  if (gameState === 'gameover') {
    const getGameOverMessage = () => {
      if (gameOverReason === 'cleared') {
        return { message: t('gameOverMessage_cleared'), emoji: '🏆', color: 'text-yellow-600' };
      }
      if (score >= 1000) {
        return { message: t('gameOverMessage_great'), emoji: '🎉', color: 'text-green-600' };
      }
      if (score >= 500) {
        return { message: t('gameOverMessage_good'), emoji: '👍', color: 'text-blue-600' };
      }
      return { message: t('gameOverMessage_tryAgain'), emoji: '💪', color: 'text-purple-600' };
    };
    const { message, emoji, color } = getGameOverMessage();
    
    const earnedAchievements = Object.entries(achievements).filter(([, value]) => value);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4 font-sans">
        <main className="flex-grow flex items-center justify-center w-full">
            <div className="w-full max-w-sm">
                <div ref={gameOverCardRef} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center w-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <div className="relative mb-2">
                     <div className="absolute -top-4 right-0">
                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl shadow-md">{t('gameOverBadge')}</div>
                    </div>
                    <Trophy className="w-16 h-16 mx-auto text-yellow-400 drop-shadow-lg" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('gameOverTitle')}</h2>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-gray-200 shadow-inner">
                    <div className="text-sm text-gray-600 mb-1">{t('finalScoreLabel')}</div>
                    <div className="text-5xl font-bold text-blue-600 flex items-center justify-center">
                      <Coins className="w-10 h-10 mr-2 text-yellow-500" />
                      {score.toLocaleString()}<span className="text-3xl ml-1">{t('scoreUnit')}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                     <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="text-xs text-gray-500 mb-1">{t('difficultyReachedLabel')}</div>
                      <div className="font-bold text-purple-700 flex items-center justify-center space-x-1"><Star className="w-4 h-4 text-purple-400" /><span>{getDifficultyName(difficultyLevel)}</span></div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-500 mb-1">{t('bestStreakLabel')}</div>
                      <div className="font-bold text-green-700 flex items-center justify-center space-x-1"><Flame className="w-4 h-4 text-green-500" /><span>{bestStreak}{t('itemUnit')}</span></div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="text-xs text-gray-500 mb-1">{t('starsEarnedLabel')}</div>
                      <div className="font-bold text-yellow-700 flex items-center justify-center space-x-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /><span>{correctAnswers}</span></div>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                      <div className="text-xs text-gray-500 mb-1">{t('accuracyLabel')}</div>
                      <div className="font-bold text-pink-700">{questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0}%</div>
                    </div>
                  </div>
                     {earnedAchievements.length > 0 && (
                         <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 col-span-2 mb-4">
                             <div className="text-xs text-gray-500 mb-2 flex items-center justify-center"><Trophy className="w-3 h-3 mr-1" />{t('achievementsEarnedLabel')}</div>
                             <div className="flex justify-center space-x-3">
                                 {achievements.firstCorrect && <span className="text-2xl" title={t('achievementsTooltip_firstCorrect')}>🎯</span>}
                                 {achievements.lightningSpeed && <span className="text-2xl" title={t('achievementsTooltip_lightningSpeed')}>⚡</span>}
                                 {achievements.streakMaster && <span className="text-2xl" title={t('achievementsTooltip_streakMaster')}>🔥</span>}
                                 {achievements.master && <span className="text-2xl" title={t('achievementsTooltip_master')}>👑</span>}
                             </div>
                         </div>
                     )}
                  <div className={`mb-4 ${color} font-semibold text-base`}>
                    <span className="mr-2">{emoji}</span>{message}
                  </div>
                </div>

                <div className="flex items-stretch gap-2 mt-4">
                    <button onClick={resetGame} className="flex-grow bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 mr-2" />{t('playAgainButton')}
                    </button>
                    <button 
                        onClick={handleDownloadImage}
                        aria-label={t('downloadResult')}
                        className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                    >
                        <Download className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </main>
        <Footer t={t} />
      </div>
    );
  }

  const HelpModal = () => (
    <div role="dialog" aria-modal="true" aria-labelledby="how-to-play-title" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity" onClick={() => setHelpModalOpen(false)}>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 max-w-md w-full relative transform transition-all flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <h2 id="how-to-play-title" className="text-2xl font-bold text-gray-800 text-center mb-4 flex-shrink-0">{t('howToPlayTitle')}</h2>
        <div className="space-y-3 pr-2 custom-scrollbar flex-grow overflow-y-auto">
            {[ { icon: '🎯', title: 'howToPlay_goal_title', desc: 'howToPlay_goal_desc', color: 'purple' }, { icon: '⏳', title: 'howToPlay_time_lives_title', desc: 'howToPlay_time_lives_desc', color: 'blue' }, { icon: '⭐', title: 'howToPlay_difficulty_title', desc: 'howToPlay_difficulty_desc', color: 'yellow' }, { icon: '🔥', title: 'howToPlay_streak_title', desc: 'howToPlay_streak_desc', color: 'orange' }, { icon: '💡', title: 'howToPlay_hints_title', desc: 'howToPlay_hints_desc', color: 'green' }, { icon: '🏆', title: 'howToPlay_achievements_title', desc: 'howToPlay_achievements_desc', color: 'pink' } ].map(item => (
                <div key={item.title} className={`flex items-start space-x-4 bg-white/50 p-3 rounded-xl border-l-4 border-${item.color}-300`}>
                    <span className="text-2xl pt-1">{item.icon}</span>
                    <div><h3 className={`font-semibold text-${item.color}-800`}>{t(item.title)}</h3><p className={`text-sm text-${item.color}-700`}>{t(item.desc)}</p></div>
                </div>
            ))}
        </div>
        <button onClick={() => setHelpModalOpen(false)} className="mt-4 w-full bg-purple-500 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-600 transition-all transform hover:scale-105 shadow-md flex-shrink-0">{t('closeButton')}</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 relative overflow-hidden font-sans flex flex-col">
      {isHelpModalOpen && <HelpModal />}
       {toast && (
            <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md text-white shadow-lg transition-opacity duration-300 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {toast.message}
            </div>
        )}
      <main className="flex-grow">
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={() => setHelpModalOpen(true)} aria-label={t('howToPlayButton')} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-sm"><HelpCircle className="w-4 h-4" /><span>{t('howToPlayButton')}</span></button>
                    <button onClick={toggleSound} aria-label={isSoundOn ? t('sound_on') : t('sound_off')} className="p-2 text-white bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-sm">
                      {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </div>
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setLangDropdownOpen(!isLangDropdownOpen)} aria-label="Change language" aria-haspopup="true" aria-expanded={isLangDropdownOpen} className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-sm"><span>{supportedLangs.find(l => l.code === languageCode)?.name}</span><ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} /></button>
                    {isLangDropdownOpen && ( <div className={`absolute mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden ${supportedLangs.find(l=>l.code === languageCode)?.dir === 'rtl' ? 'left-0' : 'right-0'}`}><ul role="menu">{supportedLangs.map(lang => ( <li key={lang.code}><button onClick={() => { setLanguageCode(lang.code); setLangDropdownOpen(false); }} role="menuitem" className={`w-full text-left px-4 py-2 text-sm transition-colors ${languageCode === lang.code ? 'bg-purple-500 text-white' : 'text-gray-800 hover:bg-purple-100'}`}>{lang.name}</button></li>))}</ul></div>)}
                </div>
          </div>
          {particles.map(p => <div key={p.id} className="absolute text-2xl pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, animation: 'float 2s ease-out forwards' }}>{p.emoji}</div>)}

          <div className="max-w-md mx-auto">
            <div className="text-center mb-2 pt-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">{t('title')}</h1>
                <p className="text-sm md:text-base text-white opacity-80">{t('subtitle')}</p>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center"><div className="text-white text-xs opacity-75">{t('scoreLabel')}</div><div className="text-white text-lg font-bold flex items-center justify-center"><Coins className="w-4 h-4 mr-1 text-yellow-300" />{score}</div></div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center"><div className="text-white text-xs opacity-75">{t('livesLabel')}</div><div className="flex justify-center items-center space-x-1 pt-1">{[...Array(3)].map((_, i) => ( <Heart key={i} className={`w-5 h-5 transition-all ${ i < lives ? 'text-red-500 fill-current' : 'text-white opacity-30' }`} /> ))}</div></div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center"><div className="text-white text-xs opacity-75">{t('streakLabel')}</div><div className="text-white text-lg font-bold flex items-center justify-center"><Flame className="w-4 h-4 mr-1 text-orange-300" />{streak}</div></div>
              </div>
              
              {gameState === 'idle' && currentProblem ? (
                  <div className="h-[41px] flex items-center justify-center">
                    <button onClick={startGame} className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"><Play className="w-5 h-5 mr-2" />{t('startGameButton')}</button>
                  </div>
              ) : (
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 flex items-center gap-3">
                    <div className="relative">
                       <div className={`flex items-center text-white font-bold text-lg ${ pulseWarning ? 'text-red-300 animate-pulse' : ''}`}><Clock className="w-4 h-4 mr-2" />{timeLeft}s</div>
                       {timeBonusFeedback && <div key={timeBonusFeedback.id} className="absolute -top-5 left-1/2 -translate-x-1/2 text-green-300 font-bold animate-float-up whitespace-nowrap">{timeBonusFeedback.text}</div>}
                    </div>
                    <div className="flex-grow w-full bg-white bg-opacity-30 rounded-full h-2.5 overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ease-linear ${ pulseWarning ? 'bg-gradient-to-r from-red-400 to-red-600 animate-pulse' : timeLeft <= 20 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-green-400 to-blue-500' } ${timeFrozen ? 'bg-gradient-to-r from-blue-300 to-cyan-400' : ''}`} style={{ width: `${(timeLeft / 60) * 100}%`}}></div></div>
                    {timeFrozen && <span className="text-blue-300 text-lg">❄️</span>}
                </div>
              )}
            </div>

            <div className="flex justify-center items-center gap-2 my-1 min-h-[24px]">
              {doubleScoreActive && (<div className="bg-yellow-400 bg-opacity-90 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">{t('doubleScoreActive', { timeLeft: doubleScoreTimeLeft })}</div>)}
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mb-3">
              <div className="text-center">
                 <div className="flex justify-between items-center gap-2 mb-3">
                   <div className="flex items-center space-x-1">{Object.keys(powerUps).map((key) => { const type = key as keyof typeof powerUps; return ( <button key={type} onClick={() => usePowerUp(type)} disabled={powerUps[type] === 0 || gameState !== 'playing'} className={`relative w-9 h-9 rounded-full text-white flex items-center justify-center transition-all disabled:bg-gray-400 disabled:cursor-not-allowed ${ type === 'timeFreeze' ? 'bg-blue-500 hover:bg-blue-600' : type === 'extraLife' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600' }`}>{type === 'timeFreeze' ? '❄️' : type === 'extraLife' ? '❤️' : '⚡'}{powerUps[type] > 0 && <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{powerUps[type]}</span>}</button> )})}</div>
                  <div className="flex flex-col items-center"><div className="text-lg">{'⭐'.repeat(difficultyLevel)}</div><div className="text-xs text-gray-600">{getDifficultyName(difficultyLevel)}</div></div>
                </div>

                {currentProblem ? (
                  <div className="flex flex-col items-center w-full max-w-xs mx-auto">
                      {/* Horizontal Lock Display */}
                      <div className="w-full flex justify-center items-center mb-4">
                          {/* Shackle */}
                          <div className={`w-12 h-20 bg-gray-300 border-4 border-r-0 border-gray-400 rounded-l-full flex-shrink-0 transition-transform duration-500 ease-in-out origin-bottom-right ${gameState === 'correct' ? '-rotate-[25deg] -translate-x-1 -translate-y-1' : ''}`}></div>
                          {/* Body */}
                          <div className="bg-gray-200 border-4 border-gray-400 rounded-r-2xl px-4 py-2 w-full h-28 shadow-lg text-center flex flex-col justify-center">
                              <div className="text-gray-500 text-sm font-bold">{t('question')}</div>
                              <div className="text-5xl font-bold text-gray-800">{currentProblem.target}</div>
                          </div>
                      </div>
                      
                      {/* Rectangular Buttons Grid */}
                      <div className="w-full grid grid-cols-3 gap-2">
                          {currentProblem.grid.map((item, index) => {
                              const isSelected = selection.some(s => s.index === index);
                              const isOperator = typeof item === 'string';
                              
                              return (
                                  <button
                                      key={index}
                                      onClick={() => handleSelection(item, index)}
                                      disabled={gameState !== 'playing' || isSelected}
                                      className={`h-14 text-2xl font-bold rounded-lg transition-all transform active:scale-90 shadow-md flex items-center justify-center
                                          ${isOperator ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'}
                                          ${isSelected ? 'ring-4 ring-yellow-400 scale-105 opacity-75' : 'hover:scale-105'}
                                          ${gameState !== 'playing' && gameState !== 'idle' ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60' : ''}
                                          ${gameState === 'idle' && isSelected ? 'ring-4 ring-yellow-400 scale-105 opacity-75' : ''}
                                          ${gameState === 'idle' ? 'cursor-default' : ''}
                                      `}
                                  >
                                      {item}
                                  </button>
                              );
                          })}
                      </div>
                  </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center">
                         <Lock className="w-24 h-24 text-gray-300" />
                    </div>
                )}
                
                <div className="mb-4 h-16 mt-4">
                   {showHint ? (
                    <div className={`border-l-4 p-2 rounded mt-2 text-sm text-left bg-orange-50 border-orange-400 text-orange-800`}>
                      <p><strong>{t('hintLabel')}</strong> {t('hintText', {element: currentProblem?.solution.numbers[0] ?? ''})} {hintUsed && t('hintUsedText')}</p>
                    </div>
                  ) : feedback ? (
                     <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-all transform text-base ${ gameState === 'correct' ? 'bg-green-100 text-green-800 animate-bounce' : 'bg-red-100 text-red-800' }`}>
                        {gameState === 'correct' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        <span className="font-semibold">{feedback}</span>
                      </div>
                  ) : null}
                </div>

                 <button
                    onClick={() => { if (hintsRemaining > 0 && !showHint) { setShowHint(true); setHintUsed(true); setHintsRemaining(prev => prev - 1); } else if (showHint) {setShowHint(false);} }}
                    disabled={(hintsRemaining === 0 && !showHint) || gameState !== 'playing'}
                    className={`px-3 py-1 rounded-full text-xs transition-all w-32 ${ (hintsRemaining === 0 && !showHint) || gameState !== 'playing' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900' }`}
                  >
                    {showHint ? t('hintButtonClose') : t('hintButton', { remaining: hintsRemaining })}
                  </button>
              </div>
            </div>

            <div className="bg-white bg-opacity-90 rounded-lg p-3">
              <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center justify-center"><Trophy className="w-4 h-4 mr-1 text-yellow-500" />{t('achievementsTitle', { count: Object.values(achievements).filter(Boolean).length })}</h3>
              <div className="grid grid-cols-4 gap-2">
                <div title={t('achievementsTooltip_firstCorrect')} className={`p-2 rounded-lg text-center transition-all ${achievements.firstCorrect ? 'bg-green-100 text-green-800 scale-110' : 'bg-gray-100 text-gray-400'}`}><div className="text-lg mb-1">🔐</div><div className="text-xs font-semibold">{t('achievements_firstCorrect')}</div></div>
                <div title={t('achievementsTooltip_lightningSpeed')} className={`p-2 rounded-lg text-center transition-all ${achievements.lightningSpeed ? 'bg-yellow-100 text-yellow-800 scale-110' : 'bg-gray-100 text-gray-400'}`}><div className="text-lg mb-1">⚡</div><div className="text-xs font-semibold">{t('achievements_lightningSpeed')}</div></div>
                <div title={t('achievementsTooltip_streakMaster')} className={`p-2 rounded-lg text-center transition-all ${achievements.streakMaster ? 'bg-purple-100 text-purple-800 scale-110' : 'bg-gray-100 text-gray-400'}`}><div className="text-lg mb-1">🔥</div><div className="text-xs font-semibold">{t('achievements_streakMaster')}</div></div>
                 <div title={t('achievementsTooltip_master')} className={`p-2 rounded-lg text-center transition-all ${achievements.master ? 'bg-blue-100 text-blue-800 scale-110' : 'bg-gray-100 text-gray-400'}`}><div className="text-lg mb-1">👑</div><div className="text-xs font-semibold">{t('achievements_master')}</div></div>
              </div>
            </div>
          </div>
      </main>
      <Footer t={t} />
    </div>
  );
};

export default App;
