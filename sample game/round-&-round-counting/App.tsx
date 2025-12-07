
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

const enTranslations = { title: "Round & Round Counting", subtitle: "Pieces are spinning! Find and count all the matching friends!", scoreLabel: "Score", livesLabel: "Lives", streakLabel: "Streak", timeLabel: "Time", difficulty_1: "Beginner", difficulty_2: "Intermediate", difficulty_3: "Advanced", question: "Find them all!", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Hint ({remaining}/3)", hintButtonClose: "Close Hint", hintLabel: "Hint:", hintUsedText: "(Hint used, 50% score penalty)", hintText_reveal: "One of them is here!", feedbackCorrect: "Correct! +{score} points", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorrect. 💔", achievementsTitle: "Achievements ({count}/4)", achievements_firstCorrect: "First Find", achievements_lightningSpeed: "Quick Eye", achievements_streakMaster: "Combo Finder", achievements_master: "Counting Master", achievementsTooltip_firstCorrect: "Find your first emoji.", achievementsTooltip_lightningSpeed: "Answer in under 3 seconds.", achievementsTooltip_streakMaster: "Get a 5-puzzle streak.", achievementsTooltip_master: "Correctly solve 3+ puzzles on Advanced difficulty.", gameOverTitle: "Game Over!", gameOverBadge: "End", finalScoreLabel: "Final Score", scoreUnit: " pts", difficultyReachedLabel: "Difficulty Reached", bestStreakLabel: "Best Streak", itemUnit: "", accuracyLabel: "Accuracy", achievementsEarnedLabel: "Achievements Unlocked", starsEarnedLabel: "Stars Earned", gameOverMessage_great: "🎉 Excellent work!", gameOverMessage_good: "👍 Well done!", gameOverMessage_tryAgain: "💪 You can do better next time!", gameOverMessage_cleared: "🏆 You've mastered all puzzles! Legendary!", playAgainButton: "Play Again", downloadResult: "Download Result", imageDownloaded: "Image downloaded!", imageDownloadFailed: "Failed to download image.", howToPlayButton: "How to Play", howToPlayTitle: "How to Play", howToPlay_goal_title: "Goal", howToPlay_goal_desc: "Find all the matching emojis shown at the top. The grid will shuffle after each correct find, so pay attention!", howToPlay_time_lives_title: "Time & Lives", howToPlay_time_lives_desc: "You start with 60 seconds. Answering correctly on harder levels adds bonus time. Don't let the timer or your lives run out!", howToPlay_difficulty_title: "Difficulty", howToPlay_difficulty_desc: "The game adapts! The better you play, the harder it gets, with more emojis to find and more points to earn.", howToPlay_streak_title: "Streak & Power-ups", howToPlay_streak_desc: "Achieve a 3-puzzle streak for a chance to earn a random power-up like ❄️ Time Freeze, ❤️ Extra Life, and ⚡ Double Score!", howToPlay_hints_title: "Hints", howToPlay_hints_desc: "Stuck? Use a hint to briefly reveal one of the hidden emojis. Be careful, it will cost you 50% of the score for that puzzle.", howToPlay_achievements_title: "Achievements", howToPlay_achievements_desc: "Unlock special achievements for completing milestones in the game.", closeButton: "Got it!", soundOnTooltip: "Play Music", soundOffTooltip: "Mute Music", startGameButton: "Start Game", footer_copyright: "Puzzletic. All rights reserved.", footer_contact: "Business Contact:" };

const translations: Record<LanguageCode, typeof enTranslations> = {
  en: enTranslations,
  ko: { ...enTranslations, title: "동글동글 카운팅", subtitle: "조각들이 빙글빙글! 같은 친구들을 정확히 세어보세요!", scoreLabel: "점수", livesLabel: "생명력", streakLabel: "연속", timeLabel: "시간", difficulty_1: "초급", difficulty_2: "중급", difficulty_3: "고급", question: "모두 찾아보세요!", doubleScoreActive: "⚡2배 ({timeLeft}초)", hintButton: "💡 힌트 ({remaining}/3)", hintButtonClose: "힌트 닫기", hintLabel: "힌트:", hintUsedText: "(힌트 사용으로 50% 차감)", hintText_reveal: "여기 하나 있어요!", feedbackCorrect: "정답! +{score}점", feedbackEmojiCorrect: "🎉", feedbackWrong: "틀렸습니다. 💔", achievementsTitle: "업적 ({count}/4)", achievements_firstCorrect: "첫 발견", achievements_lightningSpeed: "날카로운 눈", achievements_streakMaster: "콤보왕", achievements_master: "찾기 마스터", achievementsTooltip_firstCorrect: "첫 이모지를 찾아보세요.", achievementsTooltip_lightningSpeed: "3초 안에 정답을 맞히세요.", achievementsTooltip_streakMaster: "5문제 연속 정답을 달성하세요.", achievementsTooltip_master: "고급 난이도에서 3문제 이상 정답을 맞히세요.", gameOverTitle: "게임 종료!", gameOverBadge: "끝", finalScoreLabel: "최종 점수", scoreUnit: "점", difficultyReachedLabel: "도달 난이도", bestStreakLabel: "최고 연속", itemUnit: "개", starsEarnedLabel: "획득 별", accuracyLabel: "정답률", achievementsEarnedLabel: "달성한 업적", gameOverMessage_great: "🎉 훌륭한 실력이에요!", gameOverMessage_good: "👍 잘 하셨어요!", gameOverMessage_tryAgain: "💪 다음엔 더 잘할 수 있어요!", gameOverMessage_cleared: "🏆 모든 퍼즐을 마스터했어요! 전설급 실력!", playAgainButton: "재도전하기", downloadResult: "결과 다운로드", imageDownloaded: "이미지를 다운로드했습니다!", imageDownloadFailed: "이미지 다운로드에 실패했습니다.", howToPlayButton: "게임 방법", howToPlayTitle: "게임 방법", howToPlay_goal_title: "목표", howToPlay_goal_desc: "상단에 제시된 이모지를 모두 찾으세요. 정답을 하나 찾을 때마다 그리드가 빙글빙글 섞이니 집중하세요!", howToPlay_time_lives_title: "시간 & 생명력", howToPlay_time_lives_desc: "60초로 시작하며, 어려운 레벨에서 정답을 맞히면 보너스 시간을 얻습니다. 시간이나 생명력이 다 떨어지지 않게 주의하세요!", howToPlay_difficulty_title: "난이도", howToPlay_difficulty_desc: "게임은 당신의 실력에 맞춰집니다! 더 잘할수록 더 많은 이모지를 찾아야 하고, 더 많은 점수를 얻습니다.", howToPlay_streak_title: "연속 정답 & 아이템", howToPlay_streak_desc: "3연속 정답을 달성하면 ❄️ 시간 정지, ❤️ 추가 생명력, ⚡ 점수 2배와 같은 아이템을 무작위로 얻을 기회가 생깁니다!", howToPlay_hints_title: "힌트", howToPlay_hints_desc: "막혔나요? 힌트를 사용해 숨겨진 이모지 하나의 위치를 잠시 확인할 수 있습니다. 하지만 해당 문제 점수의 50%가 차감되니 신중하게 사용하세요.", howToPlay_achievements_title: "업적", howToPlay_achievements_desc: "게임 내 특별한 목표를 달성하고 업적을 잠금 해제하세요.", closeButton: "알겠어요!", soundOnTooltip: "음악 재생", soundOffTooltip: "음악 음소거", startGameButton: "게임 시작", footer_copyright: "Puzzletic. 모든 권리 보유.", footer_contact: "비즈니스 문의:" },
  es: { ...enTranslations, title: "Contando en Círculos", subtitle: "¡Las piezas giran! ¡Encuentra y cuenta a todos los amigos iguales!", scoreLabel: "Puntos", livesLabel: "Vidas", streakLabel: "Racha", timeLabel: "Tiempo", difficulty_1: "Principiante", difficulty_2: "Intermedio", difficulty_3: "Avanzado", question: "¡Encuéntralos todos!", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Pista ({remaining}/3)", hintButtonClose: "Cerrar Pista", hintLabel: "Pista:", hintUsedText: "(Pista usada, 50% de penalización)", hintText_reveal: "¡Aquí hay uno!", feedbackCorrect: "¡Correcto! +{score} puntos", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorrecto. 💔", achievementsTitle: "Logros ({count}/4)", achievements_firstCorrect: "Primer Hallazgo", achievements_lightningSpeed: "Ojo Rápido", achievements_streakMaster: "Rey del Combo", achievements_master: "Maestro Contador", achievementsTooltip_firstCorrect: "Encuentra tu primer emoji.", achievementsTooltip_lightningSpeed: "Responde en menos de 3 segundos.", achievementsTooltip_streakMaster: "Consigue una racha de 5 aciertos.", achievementsTooltip_master: "Resuelve 3+ puzles en dificultad Avanzada.", gameOverTitle: "¡Fin del Juego!", gameOverBadge: "Fin", finalScoreLabel: "Puntuación Final", scoreUnit: " pts", difficultyReachedLabel: "Dificultad Alcanzada", bestStreakLabel: "Mejor Racha", itemUnit: "", accuracyLabel: "Precisión", achievementsEarnedLabel: "Logros Desbloqueados", starsEarnedLabel: "Estrellas Ganadas", gameOverMessage_great: "🎉 ¡Excelente trabajo!", gameOverMessage_good: "👍 ¡Bien hecho!", gameOverMessage_tryAgain: "💪 ¡Puedes hacerlo mejor la próxima vez!", gameOverMessage_cleared: "🏆 ¡Has dominado todos los puzles! ¡Legendario!", playAgainButton: "Jugar de Nuevo", downloadResult: "Descargar Resultado", imageDownloaded: "¡Imagen descargada!", imageDownloadFailed: "Error al descargar la imagen.", howToPlayButton: "Cómo Jugar", howToPlayTitle: "Cómo Jugar", howToPlay_goal_title: "Objetivo", howToPlay_goal_desc: "Encuentra todos los emojis iguales que se muestran arriba. La cuadrícula se mezclará después de cada acierto, ¡así que presta atención!", howToPlay_time_lives_title: "Tiempo y Vidas", howToPlay_time_lives_desc: "Empiezas con 60 segundos. Responder correctamente en niveles más difíciles añade tiempo extra. ¡No dejes que el temporizador o tus vidas se agoten!", howToPlay_difficulty_title: "Dificultad", howToPlay_difficulty_desc: "¡El juego se adapta! Cuanto mejor juegues, más difícil será, con más emojis que encontrar y más puntos que ganar.", howToPlay_streak_title: "Racha y Potenciadores", howToPlay_streak_desc: "¡Logra una racha de 3 puzles para tener la oportunidad de ganar un potenciador aleatorio como ❄️ Congelar Tiempo, ❤️ Vida Extra y ⚡ Puntuación Doble!", howToPlay_hints_title: "Pistas", howToPlay_hints_desc: "¿Atascado? Usa una pista para revelar brevemente uno de los emojis ocultos. Ten cuidado, te costará el 50% de la puntuación de ese puzle.", howToPlay_achievements_title: "Logros", howToPlay_achievements_desc: "Desbloquea logros especiales por completar hitos en el juego.", closeButton: "¡Entendido!", soundOnTooltip: "Reproducir música", soundOffTooltip: "Silenciar música", startGameButton: "Empezar Juego", footer_copyright: "Puzzletic. Todos los derechos reservados.", footer_contact: "Contacto comercial:" },
  fr: { ...enTranslations, title: "Compter en Rondes", subtitle: "Les pièces tournent ! Trouve et compte tous les amis correspondants !", scoreLabel: "Score", livesLabel: "Vies", streakLabel: "Série", timeLabel: "Temps", difficulty_1: "Débutant", difficulty_2: "Intermédiaire", difficulty_3: "Avancé", question: "Trouvez-les tous !", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Indice ({remaining}/3)", hintButtonClose: "Fermer l'indice", hintLabel: "Indice :", hintUsedText: "(Indice utilisé, pénalité de 50% du score)", hintText_reveal: "En voilà un ici !", feedbackCorrect: "Correct ! +{score} points", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorrect. 💔", achievementsTitle: "Succès ({count}/4)", achievements_firstCorrect: "Première Trouvaille", achievements_lightningSpeed: "Œil de Lynx", achievements_streakMaster: "Pro du Combo", achievements_master: "Maître du Comptage", achievementsTooltip_firstCorrect: "Trouvez votre premier emoji.", achievementsTooltip_lightningSpeed: "Répondez en moins de 3 secondes.", achievementsTooltip_streakMaster: "Obtenez une série de 5 puzzles.", achievementsTooltip_master: "Résolvez correctement 3+ puzzles en difficulté Avancé.", gameOverTitle: "Partie Terminée !", gameOverBadge: "Fin", finalScoreLabel: "Score Final", scoreUnit: " pts", difficultyReachedLabel: "Difficulté Atteinte", bestStreakLabel: "Meilleure Série", itemUnit: "", accuracyLabel: "Précision", achievementsEarnedLabel: "Succès Débloqués", starsEarnedLabel: "Étoiles Gagnées", gameOverMessage_great: "🎉 Excellent travail !", gameOverMessage_good: "👍 Bien joué !", gameOverMessage_tryAgain: "💪 Vous pouvez faire mieux la prochaine fois !", gameOverMessage_cleared: "🏆 Vous avez maîtrisé tous les puzzles ! Légendaire !", playAgainButton: "Rejouer", downloadResult: "Télécharger le Résultat", imageDownloaded: "Image téléchargée !", imageDownloadFailed: "Échec du téléchargement de l'image.", howToPlayButton: "Comment Jouer", howToPlayTitle: "Comment Jouer", howToPlay_goal_title: "Objectif", howToPlay_goal_desc: "Trouvez tous les emojis correspondants affichés en haut. La grille se mélangera après chaque bonne trouvaille, alors soyez attentif !", howToPlay_time_lives_title: "Temps & Vies", howToPlay_time_lives_desc: "Vous commencez avec 60 secondes. Répondre correctement aux niveaux plus difficiles ajoute du temps bonus. Ne laissez pas le temps ou vos vies s'épuiser !", howToPlay_difficulty_title: "Difficulté", howToPlay_difficulty_desc: "Le jeu s'adapte ! Mieux vous jouez, plus ça devient difficile, avec plus d'emojis à trouver et plus de points à gagner.", howToPlay_streak_title: "Série & Power-ups", howToPlay_streak_desc: "Réalisez une série de 3 puzzles pour avoir une chance de gagner un power-up aléatoire comme ❄️ Gel du Temps, ❤️ Vie Supplémentaire et ⚡ Score Double !", howToPlay_hints_title: "Indices", howToPlay_hints_desc: "Bloqué ? Utilisez un indice pour révéler brièvement l'un des emojis cachés. Attention, cela vous coûtera 50% du score pour ce puzzle.", howToPlay_achievements_title: "Succès", howToPlay_achievements_desc: "Débloquez des succès spéciaux en accomplissant des jalons dans le jeu.", closeButton: "Compris !", soundOnTooltip: "Activer la musique", soundOffTooltip: "Désactiver la musique", startGameButton: "Commencer le Jeu", footer_copyright: "Puzzletic. Tous droits réservés.", footer_contact: "Contact professionnel :" },
  de: { ...enTranslations, title: "Rund und Rund Zählen", subtitle: "Die Teile drehen sich! Finde und zähle alle passenden Freunde!", scoreLabel: "Punktzahl", livesLabel: "Leben", streakLabel: "Serie", timeLabel: "Zeit", difficulty_1: "Anfänger", difficulty_2: "Mittel", difficulty_3: "Fortgeschritten", question: "Finde sie alle!", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Tipp ({remaining}/3)", hintButtonClose: "Tipp schließen", hintLabel: "Tipp:", hintUsedText: "(Tipp verwendet, 50% Punktabzug)", hintText_reveal: "Hier ist einer!", feedbackCorrect: "Richtig! +{score} Punkte", feedbackEmojiCorrect: "🎉", feedbackWrong: "Falsch. 💔", achievementsTitle: "Erfolge ({count}/4)", achievements_firstCorrect: "Erster Fund", achievements_lightningSpeed: "Schnelles Auge", achievements_streakMaster: "Kombomeister", achievements_master: "Zählmeister", achievementsTooltip_firstCorrect: "Finde dein erstes Emoji.", achievementsTooltip_lightningSpeed: "Antworte in weniger als 3 Sekunden.", achievementsTooltip_streakMaster: "Erreiche eine Serie von 5 Puzzles.", achievementsTooltip_master: "Löse 3+ Puzzles auf dem Schwierigkeitsgrad Fortgeschritten.", gameOverTitle: "Spiel Beendet!", gameOverBadge: "Ende", finalScoreLabel: "Endpunktzahl", scoreUnit: " Pkt.", difficultyReachedLabel: "Erreichte Schwierigkeit", bestStreakLabel: "Beste Serie", itemUnit: "", accuracyLabel: "Genauigkeit", achievementsEarnedLabel: "Freigeschaltete Erfolge", starsEarnedLabel: "Verdiente Sterne", gameOverMessage_great: "🎉 Ausgezeichnete Arbeit!", gameOverMessage_good: "👍 Gut gemacht!", gameOverMessage_tryAgain: "💪 Nächstes Mal schaffst du das besser!", gameOverMessage_cleared: "🏆 Du hast alle Puzzles gemeistert! Legendär!", playAgainButton: "Nochmal Spielen", downloadResult: "Ergebnis Herunterladen", imageDownloaded: "Bild heruntergeladen!", imageDownloadFailed: "Fehler beim Herunterladen des Bildes.", howToPlayButton: "Spielanleitung", howToPlayTitle: "Spielanleitung", howToPlay_goal_title: "Ziel", howToPlay_goal_desc: "Finde alle passenden Emojis, die oben angezeigt werden. Das Gitter mischt sich nach jedem richtigen Fund, also pass auf!", howToPlay_time_lives_title: "Zeit & Leben", howToPlay_time_lives_desc: "Du beginnst mit 60 Sekunden. Bei richtigen Antworten in schwierigeren Levels erhältst du Bonuszeit. Lass weder den Timer noch deine Leben ablaufen!", howToPlay_difficulty_title: "Schwierigkeit", howToPlay_difficulty_desc: "Das Spiel passt sich an! Je besser du spielst, desto schwieriger wird es, mit mehr Emojis zu finden und mehr Punkten zu verdienen.", howToPlay_streak_title: "Serie & Power-ups", howToPlay_streak_desc: "Erreiche eine 3er-Serie für die Chance auf ein zufälliges Power-up wie ❄️ Zeitstopp, ❤️ Extraleben und ⚡ doppelte Punkte!", howToPlay_hints_title: "Tipps", howToPlay_hints_desc: "Steckst du fest? Nutze einen Tipp, um kurz eines der versteckten Emojis aufzudecken. Sei vorsichtig, es kostet dich 50% der Punkte für dieses Puzzle.", howToPlay_achievements_title: "Erfolge", howToPlay_achievements_desc: "Schalte besondere Erfolge frei, indem du Meilensteine im Spiel erreichst.", closeButton: "Verstanden!", soundOnTooltip: "Musik abspielen", soundOffTooltip: "Musik stummschalten", startGameButton: "Spiel Starten", footer_copyright: "Puzzletic. Alle Rechte vorbehalten.", footer_contact: "Geschäftlicher Kontakt:" },
  pt: { ...enTranslations, title: "Contagem Circular", subtitle: "As peças estão a girar! Encontra e conta todos os amigos iguais!", scoreLabel: "Pontuação", livesLabel: "Vidas", streakLabel: "Sequência", timeLabel: "Tempo", difficulty_1: "Iniciante", difficulty_2: "Intermediário", difficulty_3: "Avançado", question: "Encontra todos!", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Dica ({remaining}/3)", hintButtonClose: "Fechar Dica", hintLabel: "Dica:", hintUsedText: "(Dica usada, penalidade de 50% na pontuação)", hintText_reveal: "Aqui está um!", feedbackCorrect: "Correto! +{score} pontos", feedbackEmojiCorrect: "🎉", feedbackWrong: "Incorreto. 💔", achievementsTitle: "Conquistas ({count}/4)", achievements_firstCorrect: "Primeiro Encontro", achievements_lightningSpeed: "Olho Rápido", achievements_streakMaster: "Mestre da Sequência", achievements_master: "Mestre da Contagem", achievementsTooltip_firstCorrect: "Encontra o teu primeiro emoji.", achievementsTooltip_lightningSpeed: "Responde em menos de 3 segundos.", achievementsTooltip_streakMaster: "Obtém uma sequência de 5 quebra-cabeças.", achievementsTooltip_master: "Resolve corretamente 3+ quebra-cabeças na dificuldade Avançado.", gameOverTitle: "Fim de Jogo!", gameOverBadge: "Fim", finalScoreLabel: "Pontuação Final", scoreUnit: " pts", difficultyReachedLabel: "Dificuldade Atingida", bestStreakLabel: "Melhor Sequência", itemUnit: "", accuracyLabel: "Precisão", achievementsEarnedLabel: "Conquistas Desbloqueadas", starsEarnedLabel: "Estrelas Ganhas", gameOverMessage_great: "🎉 Excelente trabalho!", gameOverMessage_good: "👍 Muito bem!", gameOverMessage_tryAgain: "💪 Podes fazer melhor da próxima vez!", gameOverMessage_cleared: "🏆 Dominaste todos os quebra-cabeças! Lendário!", playAgainButton: "Jogar Novamente", downloadResult: "Descarregar Resultado", imageDownloaded: "Imagem descarregada!", imageDownloadFailed: "Falha ao descarregar a imagem.", howToPlayButton: "Como Jogar", howToPlayTitle: "Como Jogar", howToPlay_goal_title: "Objetivo", howToPlay_goal_desc: "Encontra todos os emojis correspondentes mostrados no topo. A grelha irá baralhar após cada acerto, por isso presta atenção!", howToPlay_time_lives_title: "Tempo & Vidas", howToPlay_time_lives_desc: "Começas com 60 segundos. Responder corretamente nos níveis mais difíceis adiciona tempo bónus. Não deixes o tempo ou as tuas vidas acabarem!", howToPlay_difficulty_title: "Dificuldade", howToPlay_difficulty_desc: "O jogo adapta-se! Quanto melhor jogares, mais difícil fica, com mais emojis para encontrar e mais pontos para ganhar.", howToPlay_streak_title: "Sequência & Power-ups", howToPlay_streak_desc: "Alcança uma sequência de 3 quebra-cabeças para teres a chance de ganhar um power-up aleatório como ❄️ Congelar Tempo, ❤️ Vida Extra e ⚡ Pontuação a Dobrar!", howToPlay_hints_title: "Dicas", howToPlay_hints_desc: "Preso? Usa uma dica para revelar brevemente um dos emojis escondidos. Cuidado, irá custar-te 50% da pontuação desse quebra-cabeça.", howToPlay_achievements_title: "Conquistas", howToPlay_achievements_desc: "Desbloqueia conquistas especiais ao completar marcos no jogo.", closeButton: "Entendido!", soundOnTooltip: "Tocar música", soundOffTooltip: "Silenciar música", startGameButton: "Começar Jogo", footer_copyright: "Puzzletic. Todos os direitos reservados.", footer_contact: "Contato comercial:" },
  it: { ...enTranslations, title: "Gira e Conta", subtitle: "I pezzi girano! Trova e conta tutti gli amici corrispondenti!", scoreLabel: "Punteggio", livesLabel: "Vite", streakLabel: "Serie", timeLabel: "Tempo", difficulty_1: "Principiante", difficulty_2: "Intermedio", difficulty_3: "Avanzato", question: "Trovali tutti!", doubleScoreActive: "⚡2x ({timeLeft}s)", hintButton: "💡 Suggerimento ({remaining}/3)", hintButtonClose: "Chiudi Suggerimento", hintLabel: "Suggerimento:", hintUsedText: "(Suggerimento usato, -50% punteggio)", hintText_reveal: "Eccone uno!", feedbackCorrect: "Corretto! +{score} punti", feedbackEmojiCorrect: "🎉", feedbackWrong: "Sbagliato. 💔", achievementsTitle: "Obiettivi ({count}/4)", achievements_firstCorrect: "Primo Trovato", achievements_lightningSpeed: "Occhio Veloce", achievements_streakMaster: "Re della Combo", achievements_master: "Maestro del Conteggio", achievementsTooltip_firstCorrect: "Trova il tuo primo emoji.", achievementsTooltip_lightningSpeed: "Rispondi in meno di 3 secondi.", achievementsTooltip_streakMaster: "Ottieni una serie di 5 puzzle.", achievementsTooltip_master: "Risolvi correttamente 3+ puzzle a difficoltà Avanzato.", gameOverTitle: "Fine Partita!", gameOverBadge: "Fine", finalScoreLabel: "Punteggio Finale", scoreUnit: " pti", difficultyReachedLabel: "Difficoltà Raggiunta", bestStreakLabel: "Miglior Serie", itemUnit: "", accuracyLabel: "Precisione", achievementsEarnedLabel: "Obiettivi Sbloccati", starsEarnedLabel: "Stelle Guadagnate", gameOverMessage_great: "🎉 Ottimo lavoro!", gameOverMessage_good: "👍 Ben fatto!", gameOverMessage_tryAgain: "💪 Puoi fare di meglio la prossima volta!", gameOverMessage_cleared: "🏆 Hai superato tutti i puzzle! Leggendario!", playAgainButton: "Gioca Ancora", downloadResult: "Scarica Risultato", imageDownloaded: "Immagine scaricata!", imageDownloadFailed: "Download dell'immagine non riuscito.", howToPlayButton: "Come Giocare", howToPlayTitle: "Come Giocare", howToPlay_goal_title: "Obiettivo", howToPlay_goal_desc: "Trova tutti gli emoji corrispondenti mostrati in alto. La griglia si mescolerà dopo ogni risposta esatta, quindi fai attenzione!", howToPlay_time_lives_title: "Tempo & Vite", howToPlay_time_lives_desc: "Inizi con 60 secondi. Rispondere correttamente ai livelli più difficili aggiunge tempo bonus. Non far scadere il tempo o esaurire le vite!", howToPlay_difficulty_title: "Difficoltà", howToPlay_difficulty_desc: "Il gioco si adatta! Meglio giochi, più difficile diventa, con più emoji da trovare e più punti da guadagnare.", howToPlay_streak_title: "Serie & Potenziamenti", howToPlay_streak_desc: "Raggiungi una serie di 3 puzzle per avere la possibilità di ottenere un potenziamento casuale come ❄️ Congela Tempo, ❤️ Vita Extra e ⚡ Punteggio Doppio!", howToPlay_hints_title: "Suggerimenti", howToPlay_hints_desc: "Bloccato? Usa un suggerimento per rivelare brevemente uno degli emoji nascosti. Attenzione, ti costerà il 50% del punteggio di quel puzzle.", howToPlay_achievements_title: "Obiettivi", howToPlay_achievements_desc: "Sblocca obiettivi speciali completando traguardi nel gioco.", closeButton: "Capito!", soundOnTooltip: "Riproduci musica", soundOffTooltip: "Muta musica", startGameButton: "Inizia Partita", footer_copyright: "Puzzletic. Tutti i diritti riservati.", footer_contact: "Contatto commerciale:" },
  ru: { ...enTranslations, title: "Считаем по кругу", subtitle: "Фигурки вращаются! Найди и сосчитай всех одинаковых друзей!", scoreLabel: "Счет", livesLabel: "Жизни", streakLabel: "Серия", timeLabel: "Время", difficulty_1: "Новичок", difficulty_2: "Средний", difficulty_3: "Эксперт", question: "Найди их всех!", doubleScoreActive: "⚡x2 ({timeLeft}с)", hintButton: "💡 Подсказка ({remaining}/3)", hintButtonClose: "Закрыть подсказку", hintLabel: "Подсказка:", hintUsedText: "(Подсказка использована, -50% очков)", hintText_reveal: "Один из них здесь!", feedbackCorrect: "Верно! +{score} очков", feedbackEmojiCorrect: "🎉", feedbackWrong: "Неверно. 💔", achievementsTitle: "Достижения ({count}/4)", achievements_firstCorrect: "Первая Находка", achievements_lightningSpeed: "Быстрый Глаз", achievements_streakMaster: "Мастер Серий", achievements_master: "Мастер Счета", achievementsTooltip_firstCorrect: "Найди свой первый эмодзи.", achievementsTooltip_lightningSpeed: "Ответь менее чем за 3 секунды.", achievementsTooltip_streakMaster: "Собери серию из 5 головоломок.", achievementsTooltip_master: "Реши правильно 3+ головоломки на сложности Эксперт.", gameOverTitle: "Игра Окончена!", gameOverBadge: "Конец", finalScoreLabel: "Итоговый Счет", scoreUnit: " очк.", difficultyReachedLabel: "Достигнутая Сложность", bestStreakLabel: "Лучшая Серия", itemUnit: "", accuracyLabel: "Точность", achievementsEarnedLabel: "Полученные Достижения", starsEarnedLabel: "Заработано Звезд", gameOverMessage_great: "🎉 Отличная работа!", gameOverMessage_good: "👍 Хорошо сделано!", gameOverMessage_tryAgain: "💪 В следующий раз у тебя получится лучше!", gameOverMessage_cleared: "🏆 Ты прошел все головоломки! Легендарно!", playAgainButton: "Играть Снова", downloadResult: "Скачать Результат", imageDownloaded: "Изображение загружено!", imageDownloadFailed: "Не удалось загрузить изображение.", howToPlayButton: "Как Играть", howToPlayTitle: "Как Играть", howToPlay_goal_title: "Цель", howToPlay_goal_desc: "Найди все одинаковые эмодзи, показанные наверху. Сетка будет перемешиваться после каждой правильной находки, так что будь внимателен!", howToPlay_time_lives_title: "Время и Жизни", howToPlay_time_lives_desc: "Ты начинаешь с 60 секунд. Правильные ответы на сложных уровнях дают бонусное время. Не дай таймеру или жизням закончиться!", howToPlay_difficulty_title: "Сложность", howToPlay_difficulty_desc: "Игра адаптируется! Чем лучше ты играешь, тем сложнее она становится, с большим количеством эмодзи для поиска и очков для заработка.", howToPlay_streak_title: "Серия и Бонусы", howToPlay_streak_desc: "Собери серию из 3 головоломок, чтобы получить шанс на случайный бонус, такой как ❄️ Заморозка Времени, ❤️ Дополнительная Жизнь и ⚡ Двойные Очки!", howToPlay_hints_title: "Подсказки", howToPlay_hints_desc: "Застрял? Используй подсказку, чтобы на короткое время увидеть один из спрятанных эмодзи. Будь осторожен, это будет стоить 50% очков за эту головоломку.", howToPlay_achievements_title: "Достижения", howToPlay_achievements_desc: "Открывай особые достижения за выполнение этапов в игре.", closeButton: "Понятно!", soundOnTooltip: "Включить музыку", soundOffTooltip: "Выключить музыку", startGameButton: "Начать Игру", footer_copyright: "Puzzletic. Все права защищены.", footer_contact: "Деловой контакт:" },
  ar: { ...enTranslations, title: "العد الدائري", subtitle: "القطع تدور! ابحث عن جميع الأصدقاء المتطابقين وعدّهم!", scoreLabel: "النقاط", livesLabel: "الأرواح", streakLabel: "سلسلة", timeLabel: "الوقت", difficulty_1: "مبتدئ", difficulty_2: "متوسط", difficulty_3: "متقدم", question: "اعثر عليهم جميعًا!", doubleScoreActive: "⚡2x ({timeLeft} ثانية)", hintButton: "💡 تلميح ({remaining}/3)", hintButtonClose: "إغلاق التلميح", hintLabel: "تلميح:", hintUsedText: "(تم استخدام تلميح، خصم 50% من النقاط)", hintText_reveal: "واحد منهم هنا!", feedbackCorrect: "صحيح! +{score} نقطة", feedbackEmojiCorrect: "🎉", feedbackWrong: "غير صحيح. 💔", achievementsTitle: "الإنجازات ({count}/4)", achievements_firstCorrect: "أول اكتشاف", achievements_lightningSpeed: "عين سريعة", achievements_streakMaster: "محترف السلاسل", achievements_master: "سيد العد", achievementsTooltip_firstCorrect: "اعثر على أول رمز تعبيري لك.", achievementsTooltip_lightningSpeed: "أجب في أقل من 3 ثوانٍ.", achievementsTooltip_streakMaster: "حقق سلسلة من 5 ألغاز.", achievementsTooltip_master: "حل 3+ ألغاز بشكل صحيح على صعوبة متقدم.", gameOverTitle: "انتهت اللعبة!", gameOverBadge: "النهاية", finalScoreLabel: "النتيجة النهائية", scoreUnit: " نقطة", difficultyReachedLabel: "الصعوبة التي تم الوصول إليها", bestStreakLabel: "أفضل سلسلة", itemUnit: "", accuracyLabel: "الدقة", achievementsEarnedLabel: "الإنجازات المحققة", starsEarnedLabel: "النجوم المكتسبة", gameOverMessage_great: "🎉 عمل ممتاز!", gameOverMessage_good: "👍 أحسنت صنعًا!", gameOverMessage_tryAgain: "💪 يمكنك أن تفعل ما هو أفضل في المرة القادمة!", gameOverMessage_cleared: "🏆 لقد أتقنت جميع الألغاز! أسطوري!", playAgainButton: "العب مرة أخرى", downloadResult: "تنزيل النتيجة", imageDownloaded: "تم تنزيل الصورة!", imageDownloadFailed: "فشل تنزيل الصورة.", howToPlayButton: "كيفية اللعب", howToPlayTitle: "كيفية اللعب", howToPlay_goal_title: "الهدف", howToPlay_goal_desc: "اعثر على جميع الرموز التعبيرية المتطابقة المعروضة في الأعلى. سيتم خلط الشبكة بعد كل اكتشاف صحيح، لذا انتبه!", howToPlay_time_lives_title: "الوقت والأرواح", howToPlay_time_lives_desc: "تبدأ بـ 60 ثانية. الإجابة الصحيحة في المستويات الأصعب تضيف وقتًا إضافيًا. لا تدع الوقت أو أرواحك تنفد!", howToPlay_difficulty_title: "الصعوبة", howToPlay_difficulty_desc: "اللعبة تتكيف! كلما لعبت بشكل أفضل، أصبحت أصعب، مع المزيد من الرموز التعبيرية للعثور عليها والمزيد من النقاط لكسبها.", howToPlay_streak_title: "السلسلة والمعززات", howToPlay_streak_desc: "حقق سلسلة من 3 ألغاز للحصول على فرصة لربح معزز عشوائي مثل ❄️ تجميد الوقت، ❤️ حياة إضافية، و ⚡ نقاط مضاعفة!", howToPlay_hints_title: "تلميحات", howToPlay_hints_desc: "عالق؟ استخدم تلميحًا للكشف لفترة وجيزة عن أحد الرموز التعبيرية المخفية. كن حذرًا، سيكلفك ذلك 50٪ من نقاط هذا اللغز.", howToPlay_achievements_title: "الإنجازات", howToPlay_achievements_desc: "افتح إنجازات خاصة من خلال إكمال المعالم في اللعبة.", closeButton: "فهمت!", soundOnTooltip: "تشغيل الموسيقى", soundOffTooltip: "كتم الموسيقى", startGameButton: "ابدأ اللعبة", footer_copyright: "Puzzletic. جميع الحقوق محفوظة.", footer_contact: "جهة الاتصال التجارية:" },
  zh: { ...enTranslations, title: "转圈数数", subtitle: "碎片在旋转！找到并数出所有匹配的小伙伴！", scoreLabel: "分数", livesLabel: "生命", streakLabel: "连击", timeLabel: "时间", difficulty_1: "初级", difficulty_2: "中级", difficulty_3: "高级", question: "找到所有！", doubleScoreActive: "⚡2倍 ({timeLeft}秒)", hintButton: "💡 提示 ({remaining}/3)", hintButtonClose: "关闭提示", hintLabel: "提示:", hintUsedText: "(已使用提示，得分减少50%)", hintText_reveal: "这里有一个！", feedbackCorrect: "正确！+{score}分", feedbackEmojiCorrect: "🎉", feedbackWrong: "错误. 💔", achievementsTitle: "成就 ({count}/4)", achievements_firstCorrect: "首次发现", achievements_lightningSpeed: "眼疾手快", achievements_streakMaster: "连击大师", achievements_master: "计数大师", achievementsTooltip_firstCorrect: "找到你的第一个表情符号。", achievementsTooltip_lightningSpeed: "在3秒内回答。", achievementsTooltip_streakMaster: "获得5个谜题的连击。", achievementsTooltip_master: "在高级难度下正确解决3个以上谜题。", gameOverTitle: "游戏结束！", gameOverBadge: "结束", finalScoreLabel: "最终得分", scoreUnit: "分", difficultyReachedLabel: "达到的难度", bestStreakLabel: "最佳连击", itemUnit: "", accuracyLabel: "准确率", achievementsEarnedLabel: "已解锁成就", starsEarnedLabel: "获得的星星", gameOverMessage_great: "🎉 太棒了！", gameOverMessage_good: "👍 做得好！", gameOverMessage_tryAgain: "💪 下次可以做得更好！", gameOverMessage_cleared: "🏆 你已经掌握了所有谜题！传奇！", playAgainButton: "再玩一次", downloadResult: "下载结果", imageDownloaded: "图片已下载！", imageDownloadFailed: "下载图片失败。", howToPlayButton: "怎么玩", howToPlayTitle: "怎么玩", howToPlay_goal_title: "目标", howToPlay_goal_desc: "找到顶部显示的所有匹配的表情符号。每次正确找到后，网格都会洗牌，所以要集中注意力！", howToPlay_time_lives_title: "时间与生命", howToPlay_time_lives_desc: "你从60秒开始。在更难的关卡上正确回答会增加奖励时间。不要让计时器或你的生命耗尽！", howToPlay_difficulty_title: "难度", howToPlay_difficulty_desc: "游戏会适应！你玩得越好，难度就越大，需要找到的表情符号越多，能获得的分数也越多。", howToPlay_streak_title: "连击与道具", howToPlay_streak_desc: "实现3个谜题的连击，有机会获得随机道具，如❄️时间冻结，❤️额外生命，和⚡双倍得分！", howToPlay_hints_title: "提示", howToPlay_hints_desc: "卡住了？使用提示可以短暂显示一个隐藏的表情符号。小心，这会让你失去该谜题50%的分数。", howToPlay_achievements_title: "成就", howToPlay_achievements_desc: "在游戏中完成里程碑，解锁特殊成就。", closeButton: "好的！", soundOnTooltip: "播放音乐", soundOffTooltip: "静音", startGameButton: "开始游戏", footer_copyright: "Puzzletic. 保留所有权利。", footer_contact: "商务联系:" },
  ja: { ...enTranslations, title: "ぐるぐるカウンティング", subtitle: "ピースがくるくる！同じ仲間をすべて見つけて数えよう！", scoreLabel: "スコア", livesLabel: "ライフ", streakLabel: "連続", timeLabel: "時間", difficulty_1: "初級", difficulty_2: "中級", difficulty_3: "上級", question: "すべて見つけよう！", doubleScoreActive: "⚡2倍 ({timeLeft}秒)", hintButton: "💡 ヒント ({remaining}/3)", hintButtonClose: "ヒントを閉じる", hintLabel: "ヒント:", hintUsedText: "(ヒント使用、スコア50%減)", hintText_reveal: "ここに1つあります！", feedbackCorrect: "正解！+{score}ポイント", feedbackEmojiCorrect: "🎉", feedbackWrong: "不正解. 💔", achievementsTitle: "実績 ({count}/4)", achievements_firstCorrect: "初発見", achievements_lightningSpeed: "速い目", achievements_streakMaster: "コンボの達人", achievements_master: "カウンティングマスター", achievementsTooltip_firstCorrect: "最初の絵文字を見つけよう。", achievementsTooltip_lightningSpeed: "3秒以内に答えよう。", achievementsTooltip_streakMaster: "5パズルの連続正解を達成しよう。", achievementsTooltip_master: "上級難易度で3つ以上のパズルを正解しよう。", gameOverTitle: "ゲームオーバー！", gameOverBadge: "終了", finalScoreLabel: "最終スコア", scoreUnit: "点", difficultyReachedLabel: "到達難易度", bestStreakLabel: "最高連続記録", itemUnit: "", accuracyLabel: "正解率", achievementsEarnedLabel: "ロック解除された実績", starsEarnedLabel: "獲得した星", gameOverMessage_great: "🎉 素晴らしい！", gameOverMessage_good: "👍 よくできました！", gameOverMessage_tryAgain: "💪 次はもっとうまくできる！", gameOverMessage_cleared: "🏆 すべてのパズルをマスターしました！伝説的！", playAgainButton: "もう一度プレイ", downloadResult: "結果をダウンロード", imageDownloaded: "画像をダウンロードしました！", imageDownloadFailed: "画像のダウンロードに失敗しました。", howToPlayButton: "遊び方", howToPlayTitle: "遊び方", howToPlay_goal_title: "目標", howToPlay_goal_desc: "一番上に表示されている同じ絵文字をすべて見つけてください。正解するたびにグリッドがシャッフルされるので、注意してください！", howToPlay_time_lives_title: "時間とライフ", howToPlay_time_lives_desc: "60秒からスタートします。難しいレベルで正解するとボーナスタイムが加算されます。タイマーやライフが尽きないように！", howToPlay_difficulty_title: "難易度", howToPlay_difficulty_desc: "ゲームはあなたの腕前に適応します！上達するほど難しくなり、見つける絵文字が増え、獲得できるポイントも増えます。", howToPlay_streak_title: "連続正解とパワーアップ", howToPlay_streak_desc: "3パズル連続正解を達成すると、❄️時間停止、❤️追加ライフ、⚡スコア2倍などのランダムなパワーアップを獲得するチャンスがあります！", howToPlay_hints_title: "ヒント", howToPlay_hints_desc: "行き詰まったら？ヒントを使って隠された絵文字の1つを一時的に表示させましょう。ただし、そのパズルのスコアの50%が引かれるので注意してください。", howToPlay_achievements_title: "実績", howToPlay_achievements_desc: "ゲーム内のマイルストーンを達成して、特別な実績をアンロックしましょう。", closeButton: "わかった！", soundOnTooltip: "音楽を再生", soundOffTooltip: "音楽をミュート", startGameButton: "ゲーム開始", footer_copyright: "Puzzletic. 無断複写・転載を禁じます。", footer_contact: "ビジネスに関するお問い合わせ:" },
  vi: { ...enTranslations, title: "Đếm Vòng Quanh", subtitle: "Các mảnh ghép đang xoay! Tìm và đếm tất cả những người bạn giống nhau!", scoreLabel: "Điểm", livesLabel: "Mạng", streakLabel: "Chuỗi", timeLabel: "Thời gian", difficulty_1: "Người mới bắt đầu", difficulty_2: "Trung bình", difficulty_3: "Nâng cao", question: "Tìm tất cả!", doubleScoreActive: "⚡2x ({timeLeft}giây)", hintButton: "💡 Gợi ý ({remaining}/3)", hintButtonClose: "Đóng Gợi ý", hintLabel: "Gợi ý:", hintUsedText: "(Đã dùng gợi ý, trừ 50% điểm)", hintText_reveal: "Một cái ở đây!", feedbackCorrect: "Chính xác! +{score} điểm", feedbackEmojiCorrect: "🎉", feedbackWrong: "Không chính xác. 💔", achievementsTitle: "Thành tích ({count}/4)", achievements_firstCorrect: "Lần tìm đầu tiên", achievements_lightningSpeed: "Mắt nhanh", achievements_streakMaster: "Bậc thầy chuỗi", achievements_master: "Bậc thầy đếm", achievementsTooltip_firstCorrect: "Tìm biểu tượng cảm xúc đầu tiên của bạn.", achievementsTooltip_lightningSpeed: "Trả lời trong vòng dưới 3 giây.", achievementsTooltip_streakMaster: "Đạt chuỗi 5 câu đố.", achievementsTooltip_master: "Giải đúng 3+ câu đố ở độ khó Nâng cao.", gameOverTitle: "Trò chơi kết thúc!", gameOverBadge: "Kết thúc", finalScoreLabel: "Điểm cuối cùng", scoreUnit: " điểm", difficultyReachedLabel: "Độ khó đạt được", bestStreakLabel: "Chuỗi tốt nhất", itemUnit: "", accuracyLabel: "Độ chính xác", achievementsEarnedLabel: "Thành tích đã mở khóa", starsEarnedLabel: "Sao đã kiếm được", gameOverMessage_great: "🎉 Làm tốt lắm!", gameOverMessage_good: "👍 Hay lắm!", gameOverMessage_tryAgain: "💪 Bạn có thể làm tốt hơn vào lần tới!", gameOverMessage_cleared: "🏆 Bạn đã thành thạo tất cả các câu đố! Huyền thoại!", playAgainButton: "Chơi lại", downloadResult: "Tải xuống kết quả", imageDownloaded: "Đã tải xuống hình ảnh!", imageDownloadFailed: "Không thể tải xuống hình ảnh.", howToPlayButton: "Cách chơi", howToPlayTitle: "Cách chơi", howToPlay_goal_title: "Mục tiêu", howToPlay_goal_desc: "Tìm tất cả các biểu tượng cảm xúc phù hợp được hiển thị ở trên cùng. Lưới sẽ xáo trộn sau mỗi lần tìm đúng, vì vậy hãy chú ý!", howToPlay_time_lives_title: "Thời gian & Mạng", howToPlay_time_lives_desc: "Bạn bắt đầu với 60 giây. Trả lời đúng ở các cấp độ khó hơn sẽ cộng thêm thời gian thưởng. Đừng để hết giờ hoặc hết mạng!", howToPlay_difficulty_title: "Độ khó", howToPlay_difficulty_desc: "Trò chơi sẽ thích ứng! Bạn chơi càng giỏi, trò chơi càng khó, với nhiều biểu tượng cảm xúc hơn để tìm và nhiều điểm hơn để kiếm.", howToPlay_streak_title: "Chuỗi & Vật phẩm hỗ trợ", howToPlay_streak_desc: "Đạt được chuỗi 3 câu đố để có cơ hội nhận được một vật phẩm hỗ trợ ngẫu nhiên như ❄️ Đóng băng thời gian, ❤️ Thêm mạng và ⚡ Nhân đôi điểm!", howToPlay_hints_title: "Gợi ý", howToPlay_hints_desc: "Bị kẹt? Sử dụng gợi ý để tiết lộ nhanh một trong những biểu tượng cảm xúc bị ẩn. Hãy cẩn thận, nó sẽ khiến bạn mất 50% số điểm cho câu đố đó.", howToPlay_achievements_title: "Thành tích", howToPlay_achievements_desc: "Mở khóa các thành tích đặc biệt bằng cách hoàn thành các cột mốc trong trò chơi.", closeButton: "Đã hiểu!", soundOnTooltip: "Phát nhạc", soundOffTooltip: "Tắt nhạc", startGameButton: "Bắt đầu trò chơi", footer_copyright: "Puzzletic. Đã đăng ký bản quyền.", footer_contact: "Liên hệ kinh doanh:" },
  th: { ...enTranslations, title: "นับไปหมุนไป", subtitle: "ชิ้นส่วนกำลังหมุน! ค้นหาและนับเพื่อนที่ตรงกันทั้งหมด!", scoreLabel: "คะแนน", livesLabel: "ชีวิต", streakLabel: "สตรีค", timeLabel: "เวลา", difficulty_1: "เริ่มต้น", difficulty_2: "ปานกลาง", difficulty_3: "ขั้นสูง", question: "หาให้เจอทั้งหมด!", doubleScoreActive: "⚡2x ({timeLeft}วิ)", hintButton: "💡 คำใบ้ ({remaining}/3)", hintButtonClose: "ปิดคำใบ้", hintLabel: "คำใบ้:", hintUsedText: "(ใช้คำใบ้, คะแนนลด 50%)", hintText_reveal: "หนึ่งในนั้นอยู่ที่นี่!", feedbackCorrect: "ถูกต้อง! +{score} คะแนน", feedbackEmojiCorrect: "🎉", feedbackWrong: "ไม่ถูกต้อง. 💔", achievementsTitle: "ความสำเร็จ ({count}/4)", achievements_firstCorrect: "การค้นพบครั้งแรก", achievements_lightningSpeed: "ตาไว", achievements_streakMaster: "เจ้าแห่งคอมโบ", achievements_master: "จ้าวแห่งการนับ", achievementsTooltip_firstCorrect: "ค้นหาอีโมจิตัวแรกของคุณ", achievementsTooltip_lightningSpeed: "ตอบภายใน 3 วินาที", achievementsTooltip_streakMaster: "ทำสตรีคปริศนา 5 ครั้ง", achievementsTooltip_master: "ไขปริศนาในระดับความยากขั้นสูงให้ถูก 3+ ครั้ง", gameOverTitle: "เกมจบแล้ว!", gameOverBadge: "จบ", finalScoreLabel: "คะแนนสุดท้าย", scoreUnit: " คะแนน", difficultyReachedLabel: "ระดับความยากที่ไปถึง", bestStreakLabel: "สตรีคสูงสุด", itemUnit: "", accuracyLabel: "ความแม่นยำ", achievementsEarnedLabel: "ความสำเร็จที่ปลดล็อค", starsEarnedLabel: "ดาวที่ได้รับ", gameOverMessage_great: "🎉 ยอดเยี่ยมมาก!", gameOverMessage_good: "👍 ทำได้ดีมาก!", gameOverMessage_tryAgain: "💪 ครั้งหน้าคุณทำได้ดีกว่านี้แน่นอน!", gameOverMessage_cleared: "🏆 คุณเชี่ยวชาญทุกปริศนาแล้ว! ระดับตำนาน!", playAgainButton: "เล่นอีกครั้ง", downloadResult: "ดาวน์โหลดผลลัพธ์", imageDownloaded: "ดาวน์โหลดรูปภาพแล้ว!", imageDownloadFailed: "ดาวน์โหลดรูปภาพล้มเหลว", howToPlayButton: "วิธีเล่น", howToPlayTitle: "วิธีเล่น", howToPlay_goal_title: "เป้าหมาย", howToPlay_goal_desc: "ค้นหาอีโมจิที่ตรงกันทั้งหมดที่แสดงอยู่ด้านบน ตารางจะสับเปลี่ยนหลังจากการค้นหาที่ถูกต้องแต่ละครั้ง ดังนั้นโปรดตั้งใจ!", howToPlay_time_lives_title: "เวลาและชีวิต", howToPlay_time_lives_desc: "คุณเริ่มต้นด้วยเวลา 60 วินาที การตอบถูกในระดับที่ยากขึ้นจะเพิ่มเวลาโบนัส อย่าให้เวลาหรือชีวิตของคุณหมด!", howToPlay_difficulty_title: "ระดับความยาก", howToPlay_difficulty_desc: "เกมจะปรับตามฝีมือของคุณ! ยิ่งคุณเล่นเก่งเท่าไหร่ เกมก็จะยิ่งยากขึ้น โดยมีอีโมจิให้ค้นหามากขึ้นและคะแนนให้ได้รับมากขึ้น", howToPlay_streak_title: "สตรีคและไอเทมเสริม", howToPlay_streak_desc: "ทำสตรีคปริศนา 3 ครั้งเพื่อลุ้นรับไอเทมเสริมแบบสุ่ม เช่น ❄️ หยุดเวลา, ❤️ ชีวิตเพิ่ม, และ ⚡ คะแนนสองเท่า!", howToPlay_hints_title: "คำใบ้", howToPlay_hints_desc: "ติดอยู่เหรอ? ใช้คำใบ้เพื่อเปิดเผยอีโมจิที่ซ่อนอยู่หนึ่งตัวชั่วคราว ระวังนะ มันจะทำให้คุณเสียคะแนน 50% สำหรับปริศนานั้น", howToPlay_achievements_title: "ความสำเร็จ", howToPlay_achievements_desc: "ปลดล็อคความสำเร็จพิเศษโดยการบรรลุเป้าหมายในเกม", closeButton: "เข้าใจแล้ว!", soundOnTooltip: "เล่นเพลง", soundOffTooltip: "ปิดเพลง", startGameButton: "เริ่มเกม", footer_copyright: "Puzzletic. สงวนลิขสิทธิ์", footer_contact: "ติดต่อธุรกิจ:" },
  id: { ...enTranslations, title: "Hitung Berputar", subtitle: "Potongan-potongan berputar! Temukan dan hitung semua teman yang cocok!", scoreLabel: "Skor", livesLabel: "Nyawa", streakLabel: "Runtunan", timeLabel: "Waktu", difficulty_1: "Pemula", difficulty_2: "Menengah", difficulty_3: "Mahir", question: "Temukan semuanya!", doubleScoreActive: "⚡2x ({timeLeft}d)", hintButton: "💡 Petunjuk ({remaining}/3)", hintButtonClose: "Tutup Petunjuk", hintLabel: "Petunjuk:", hintUsedText: "(Petunjuk digunakan, penalti skor 50%)", hintText_reveal: "Salah satunya di sini!", feedbackCorrect: "Benar! +{score} poin", feedbackEmojiCorrect: "🎉", feedbackWrong: "Salah. 💔", achievementsTitle: "Pencapaian ({count}/4)", achievements_firstCorrect: "Penemuan Pertama", achievements_lightningSpeed: "Mata Cepat", achievements_streakMaster: "Jagoan Kombo", achievements_master: "Master Berhitung", achievementsTooltip_firstCorrect: "Temukan emoji pertamamu.", achievementsTooltip_lightningSpeed: "Jawab dalam waktu kurang dari 3 detik.", achievementsTooltip_streakMaster: "Dapatkan runtunan 5 teka-teki.", achievementsTooltip_master: "Selesaikan 3+ teka-teki dengan benar pada tingkat kesulitan Mahir.", gameOverTitle: "Permainan Selesai!", gameOverBadge: "Selesai", finalScoreLabel: "Skor Akhir", scoreUnit: " poin", difficultyReachedLabel: "Tingkat Kesulitan Tercapai", bestStreakLabel: "Runtunan Terbaik", itemUnit: "", accuracyLabel: "Akurasi", achievementsEarnedLabel: "Pencapaian Terbuka", starsEarnedLabel: "Bintang yang Diperoleh", gameOverMessage_great: "🎉 Kerja bagus sekali!", gameOverMessage_good: "👍 Bagus sekali!", gameOverMessage_tryAgain: "💪 Kamu bisa lebih baik lain kali!", gameOverMessage_cleared: "🏆 Kamu telah menguasai semua teka-teki! Legendaris!", playAgainButton: "Main Lagi", downloadResult: "Unduh Hasil", imageDownloaded: "Gambar diunduh!", imageDownloadFailed: "Gagal mengunduh gambar.", howToPlayButton: "Cara Bermain", howToPlayTitle: "Cara Bermain", howToPlay_goal_title: "Tujuan", howToPlay_goal_desc: "Temukan semua emoji yang cocok yang ditampilkan di atas. Kotak akan diacak setelah setiap temuan yang benar, jadi perhatikan!", howToPlay_time_lives_title: "Waktu & Nyawa", howToPlay_time_lives_desc: "Anda mulai dengan 60 detik. Menjawab dengan benar di level yang lebih sulit akan menambah waktu bonus. Jangan biarkan waktu atau nyawa Anda habis!", howToPlay_difficulty_title: "Tingkat Kesulitan", howToPlay_difficulty_desc: "Permainan ini beradaptasi! Semakin baik Anda bermain, semakin sulit, dengan lebih banyak emoji untuk ditemukan dan lebih banyak poin untuk didapatkan.", howToPlay_streak_title: "Runtunan & Power-up", howToPlay_streak_desc: "Raih runtunan 3 teka-teki untuk kesempatan mendapatkan power-up acak seperti ❄️ Pembekuan Waktu, ❤️ Nyawa Ekstra, dan ⚡ Skor Ganda!", howToPlay_hints_title: "Petunjuk", howToPlay_hints_desc: "Buntu? Gunakan petunjuk untuk mengungkap salah satu emoji tersembunyi secara singkat. Hati-hati, itu akan memotong 50% skor Anda untuk teka-teki itu.", howToPlay_achievements_title: "Pencapaian", howToPlay_achievements_desc: "Buka pencapaian khusus dengan menyelesaikan tonggak sejarah dalam permainan.", closeButton: "Mengerti!", soundOnTooltip: "Putar Musik", soundOffTooltip: "Matikan Musik", startGameButton: "Mulai Permainan", footer_copyright: "Puzzletic. Hak cipta dilindungi undang-undang.", footer_contact: "Kontak Bisnis:" },
};

type GridItem = {
    id: number;
    emoji: string;
    isTarget: boolean;
};

type Problem = {
    id: number;
    targetEmoji: string;
    targetCount: number;
    gridItems: GridItem[];
    difficulty: number;
};

const ITEMS = [
    // Mammals (full body only)
    '🐒', '🦍', '🦧', '🐕', '🐩', '🐈‍⬛', '🐅', '🐆', '🐎', '🦌', '🦬', '🐂', '🐃', '🐄', '🐖', '🐏', '🐐', '🐪', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐁', '🐀', '🐇', '🐿️', '🦫', '🦔', '🦇', '🦥', '🦦', '🦨', '🦘', '🦡', '🦝', '🦓',
    // Birds
    '🦃', '🐓', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🦩', '🦜', '🐦',
    // Reptiles & Amphibians
    '🐊', '🐢', '🦎', '🐍', '🦕', '🦖',
    // Sea Creatures
    '🐳', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🦐', '🦞', '🦀', '🪼',
    // Bugs & Insects
    '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🕷️', '🦂'
];

const musicTracks = [
    'https://soundimage.org/wp-content/uploads/2025/03/Pixel-Balloons_v2.mp3',
    'https://soundimage.org/wp-content/uploads/2025/03/Pixel-Balloons_v1.mp3',
    'https://soundimage.org/wp-content/uploads/2025/06/Bounce-Light-3.mp3',
    'https://soundimage.org/wp-content/uploads/2021/05/Brain-Teaser-3.mp3',
    'https://soundimage.org/wp-content/uploads/2021/04/Popsicle-Puzzles.mp3',
    'https://soundimage.org/wp-content/uploads/2017/08/Bubble-Gum-Puzzler-2.mp3',
    'https://soundimage.org/wp-content/uploads/2017/07/Cool-Puzzler.mp3',
    'https://soundimage.org/wp-content/uploads/2017/06/Sky-Puzzle.mp3',
    'https://soundimage.org/wp-content/uploads/2017/05/Hypnotic-Puzzle3.mp3'
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateProblem = (difficulty: number): Problem => {
    const gridSize = 16;
    let targetCount: number;
    let distractorCount: number;

    if (difficulty === 1) { // Beginner: 1-4
        const min = 1, max = 4;
        targetCount = Math.floor(Math.random() * (max - min + 1)) + min;
        distractorCount = 4;
    } else if (difficulty === 2) { // Intermediate: 3-7
        const min = 3, max = 7;
        targetCount = Math.floor(Math.random() * (max - min + 1)) + min;
        distractorCount = 6;
    } else { // Advanced: 5-9
        const min = 5, max = 9;
        targetCount = Math.floor(Math.random() * (max - min + 1)) + min;
        distractorCount = 8;
    }

    const targetEmoji = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const distractors = shuffleArray(ITEMS.filter(i => i !== targetEmoji)).slice(0, distractorCount);

    const gridItems: GridItem[] = [];
    
    // Add targets
    for (let i = 0; i < targetCount; i++) {
        gridItems.push({ id: Math.random(), emoji: targetEmoji, isTarget: true });
    }

    // Add distractors
    let currentDistractorIndex = 0;
    for (let i = 0; i < gridSize - targetCount; i++) {
        gridItems.push({ id: Math.random(), emoji: distractors[currentDistractorIndex], isTarget: false });
        currentDistractorIndex = (currentDistractorIndex + 1) % distractors.length;
    }

    return {
        id: Math.random(),
        targetEmoji,
        targetCount,
        gridItems: shuffleArray(gridItems),
        difficulty,
    };
};

const Footer = ({ t }: { t: (key: keyof typeof enTranslations, replacements?: Record<string, string | number>) => string }) => (
    <footer className="text-center text-slate-700 text-xs py-4 flex-shrink-0">
        <p>© {new Date().getFullYear()} {t('footer_copyright')}</p>
        <p>
            {t('footer_contact')}{' '}
            <a href="mailto:puzzletic.app@gmail.com" className="underline hover:text-slate-900 transition-colors">
                puzzletic.app@gmail.com
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
  const [foundIds, setFoundIds] = useState<number[]>([]);
  const [incorrectClickIndex, setIncorrectClickIndex] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Game State
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintRevealIndex, setHintRevealIndex] = useState<number | null>(null);
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
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const gameOverCardRef = useRef<HTMLDivElement>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as LanguageCode;
    if (supportedLangs.some(l => l.code === browserLang)) setLanguageCode(browserLang);
  }, []);

  useEffect(() => {
    const randomTrack = musicTracks[Math.floor(Math.random() * musicTracks.length)];
    audioRef.current = new Audio(randomTrack);
    audioRef.current.loop = true;
    return () => { if(audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  useEffect(() => {
    const currentLang = supportedLangs.find(l => l.code === languageCode);
    if (currentLang) { document.documentElement.lang = currentLang.code; document.documentElement.dir = currentLang.dir; }
  }, [languageCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setLangDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setHelpModalOpen(false); };
    if (isHelpModalOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isHelpModalOpen]);

  const t = useCallback((key: keyof typeof enTranslations, replacements: Record<string, string | number> = {}) => {
    let translation = translations[languageCode]?.[key] || translations.en[key] || key;
    for (const rKey in replacements) translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
    return translation;
  }, [languageCode]);
  
  const toggleSound = useCallback(() => {
    const newSoundEnabledState = !isSoundEnabled;
    setIsSoundEnabled(newSoundEnabledState);

    if (audioRef.current) {
      if (newSoundEnabledState) {
        if (gameState === 'playing' && !isMusicPlaying) {
          audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(console.error);
        }
      } else {
        if (isMusicPlaying) {
          audioRef.current.pause();
          setIsMusicPlaying(false);
        }
      }
    }
  }, [isSoundEnabled, isMusicPlaying, gameState]);

  useEffect(() => {
    if (gameState === 'gameover' && isMusicPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  }, [gameState, isMusicPlaying]);

  useEffect(() => {
    if (gameState !== 'playing' || !deadline) { if (timerRef.current) cancelAnimationFrame(timerRef.current); return; }
    const loop = () => {
        if (!timeFrozen) {
            const remaining = deadline - Date.now();
            const newTimeLeft = Math.max(0, Math.ceil(remaining / 1000));
            setTimeLeft(newTimeLeft);
            if (newTimeLeft <= 10 && timeLeft > 10) setPulseWarning(true);
            if (newTimeLeft > 10 && timeLeft <=10) setPulseWarning(false);
            if (remaining <= 0) { setGameOverReason('time'); setGameState('gameover'); return; }
        }
        timerRef.current = requestAnimationFrame(loop);
    };
    timerRef.current = requestAnimationFrame(loop);
    return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current) };
  }, [gameState, deadline, timeFrozen, timeLeft]);

  useEffect(() => {
    if (doubleScoreActive && doubleScoreTimeLeft > 0 && !timeFrozen) {
      const timer = setTimeout(() => setDoubleScoreTimeLeft(doubleScoreTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (doubleScoreTimeLeft === 0) setDoubleScoreActive(false);
  }, [doubleScoreActive, doubleScoreTimeLeft, timeFrozen]);

  const getDifficultyName = useCallback((level: number) => t(`difficulty_${level as 1|2|3}`), [t]);

  const unlockAchievement = (type: keyof typeof achievements) => {
    if (!achievements[type]) { setAchievements(prev => ({ ...prev, [type]: true })); generateParticles('correct', 15); }
  };

  const adjustDifficulty = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
        const newConsecutiveCorrect = consecutiveCorrect + 1;
        const newCorrectAtCurrentDifficulty = correctAnswersAtCurrentDifficulty + 1;
        if (difficultyLevel < 3 && (newConsecutiveCorrect >= 3 || newCorrectAtCurrentDifficulty >= 6)) {
            setDifficultyLevel(d => d + 1); setConsecutiveCorrect(0); setCorrectAnswersAtCurrentDifficulty(0);
        } else { setConsecutiveCorrect(newConsecutiveCorrect); setCorrectAnswersAtCurrentDifficulty(newCorrectAtCurrentDifficulty); }
        setConsecutiveWrong(0);
    } else {
        const newConsecutiveWrong = consecutiveWrong + 1;
        if (difficultyLevel > 1 && newConsecutiveWrong >= 2) {
            setDifficultyLevel(d => d - 1); setConsecutiveWrong(0); setCorrectAnswersAtCurrentDifficulty(0);
        } else setConsecutiveWrong(newConsecutiveWrong);
        setConsecutiveCorrect(0);
    }
  }, [consecutiveCorrect, correctAnswersAtCurrentDifficulty, difficultyLevel, consecutiveWrong]);

  const generateParticles = (type: 'correct' | 'wrong', count = 10, emojiOverride?: string) => {
    const newParticles: typeof particles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        emoji: emojiOverride || (type === 'correct' ? ['🎉', '✨', '🌟'][Math.floor(Math.random() * 3)] : ['💥', '😵', '❌'][Math.floor(Math.random() * 3)]),
        x: Math.random() * 100, y: Math.random() * 100, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  const generateNewProblem = useCallback(() => {
    const problemSet = problems[difficultyLevel as keyof typeof problems];
    const availableProblems = problemSet?.filter(p => p.id !== currentProblem?.id) || [];
    if (availableProblems.length === 0) { setGameOverReason('cleared'); setGameState('gameover'); return; }
    const newProblem = availableProblems[Math.floor(Math.random() * availableProblems.length)];
    setCurrentProblem(newProblem);
    setFoundIds([]);
    setFeedback(''); setShowHint(false); setHintUsed(false); setHintRevealIndex(null);
    setGameState('playing'); setQuestionStartTime(Date.now()); setPulseWarning(timeLeft <= 10);
  }, [difficultyLevel, problems, timeLeft, currentProblem]);

  useEffect(() => {
    if (gameState === 'correct') {
      const timer = setTimeout(generateNewProblem, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, generateNewProblem]);

  const usePowerUp = (type: keyof typeof powerUps) => {
    if (powerUps[type] > 0) {
      setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
      if (type === 'timeFreeze' && !timeFrozen) { setTimeFrozen(true); setTimeout(() => setTimeFrozen(false), 7000); }
      if (type === 'extraLife') setLives(prev => Math.min(prev + 1, 3));
      if (type === 'doubleScore') { setDoubleScoreActive(true); setDoubleScoreTimeLeft(10); }
    }
  };

  const calculateScore = (responseTime: number) => {
    let baseScore = 0;
    if (difficultyLevel === 1) baseScore = 50; else if (difficultyLevel === 2) baseScore = 100; else if (difficultyLevel === 3) baseScore = 150;
    let timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5; let streakBonus = streak * 10;
    let totalScore = baseScore + timeBonus + streakBonus;
    if (hintUsed) totalScore = Math.floor(totalScore * 0.5);
    if (doubleScoreActive) totalScore *= 2;
    return totalScore;
  };
  
  const processAnswer = (isCorrect: boolean) => {
    const responseTimeMs = Date.now() - questionStartTime;
    setQuestionsAnswered(prev => prev + 1);
    adjustDifficulty(isCorrect);

    if (isCorrect) {
      setGameState('correct'); 
      setCorrectAnswers(prev => prev + 1);
      const newStreak = streak + 1; setStreak(newStreak); setBestStreak(prev => Math.max(prev, newStreak));
      const scoreGained = calculateScore(responseTimeMs); setScore(prev => prev + scoreGained);
      let timeBonusMs = 0;
      if (currentProblem?.difficulty === 2) timeBonusMs = 4000; else if (currentProblem?.difficulty === 3) timeBonusMs = 6000;
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
        if (Math.random() < 0.48) {
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
            const newCount = prev + 1; if (newCount >= 3) unlockAchievement('master'); return newCount;
        });
      }
      const solvedProblem = currentProblem;
      if(solvedProblem) setProblems(prev => ({...prev, [solvedProblem.difficulty]: prev[solvedProblem.difficulty].filter(p => p.id !== solvedProblem.id)}));
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
      }
      else { 
        setTimeout(() => { setGameState('playing'); setFeedback(''); }, 1500); 
      }
    }
  };

  const handleItemClick = (index: number) => {
    if (gameState !== 'playing' || isShuffling || incorrectClickIndex !== null) return;
    const clickedItem = currentProblem?.gridItems[index];
    if (!clickedItem || foundIds.includes(clickedItem.id)) return;

    if (clickedItem.isTarget) {
        const newFoundIds = [...foundIds, clickedItem.id];
        setFoundIds(newFoundIds);

        if (newFoundIds.length === currentProblem.targetCount) {
            processAnswer(true);
        } else {
            // Fade out, shuffle, then fade in
            setIsShuffling(true);
            setTimeout(() => {
                setCurrentProblem(prev => {
                    if (!prev) return null;
                    const newGrid = shuffleArray(prev.gridItems);
                    return { ...prev, gridItems: newGrid };
                });
                setIsShuffling(false);
            }, 300); // Corresponds to the fade-out duration
        }
    } else { // Incorrect click
        setIncorrectClickIndex(index);
        setTimeout(() => setIncorrectClickIndex(null), 500);
        processAnswer(false);
    }
  };

  const setupNewGame = useCallback(() => {
    const newProblems = {
      1: Array.from({ length: 40 }, () => generateProblem(1)),
      2: Array.from({ length: 40 }, () => generateProblem(2)),
      3: Array.from({ length: 30 }, () => generateProblem(3)),
    };
    setProblems(newProblems as any);
    const newProblem = newProblems[1][Math.floor(Math.random() * newProblems[1].length)];
    setCurrentProblem(newProblem);
    setFoundIds([]);
  }, []);

  const resetGame = useCallback(() => {
    setScore(0); setLives(3); setTimeLeft(60); setDeadline(null); setStreak(0);
    setDifficultyLevel(1); setConsecutiveCorrect(0); setConsecutiveWrong(0); setCorrectAnswersAtCurrentDifficulty(0);
    setHintUsed(false); setHintsRemaining(3); setFeedback(''); setShowHint(false); setGameState('idle');
    setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 }); setDoubleScoreActive(false);
    setTimeFrozen(false); setParticles([]); setPulseWarning(false); setQuestionsAnswered(0);
    setCorrectAnswers(0); setBestStreak(0); setAdvancedCorrectCount(0);
    setAchievements({ firstCorrect: false, lightningSpeed: false, streakMaster: false, master: false });
    setGameOverReason(null); setIsShuffling(false); setIncorrectClickIndex(null);
    setupNewGame();
  }, [setupNewGame]);
  
  const startGame = () => {
    if (gameState === 'idle' && currentProblem) {
      setGameState('playing');
      setDeadline(Date.now() + 60 * 1000);
      setQuestionStartTime(Date.now());
      if (isSoundEnabled && audioRef.current && !isMusicPlaying) {
          audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(console.error);
      }
    }
  };

  useEffect(() => { resetGame(); }, [resetGame]);

  const handleDownloadImage = useCallback(() => {
    if (gameOverCardRef.current === null) return;
    setToast(null);
    toPng(gameOverCardRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'round-n-round-result.png';
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

  const handleHint = () => {
    if (showHint) { setShowHint(false); setHintRevealIndex(null); return; }
    if (hintsRemaining > 0 && currentProblem) {
        setHintUsed(true); setHintsRemaining(prev => prev - 1); setShowHint(true);
        const unrevealedTargets = currentProblem.gridItems
            .map((item, index) => ({ item, index }))
            .filter(x => x.item.isTarget && !foundIds.includes(x.item.id));
        if (unrevealedTargets.length > 0) {
            const randomTarget = unrevealedTargets[Math.floor(Math.random() * unrevealedTargets.length)];
            setHintRevealIndex(randomTarget.index);
            setTimeout(() => { setHintRevealIndex(null); setShowHint(false); }, 1000);
        }
    }
  };
  
  if (gameState === 'gameover') {
    const getGameOverMessage = () => {
      if (gameOverReason === 'cleared') return { message: t('gameOverMessage_cleared'), emoji: '🏆', color: 'text-yellow-600' };
      if (score >= 1000) return { message: t('gameOverMessage_great'), emoji: '🎉', color: 'text-green-600' };
      if (score >= 500) return { message: t('gameOverMessage_good'), emoji: '👍', color: 'text-blue-600' };
      return { message: t('gameOverMessage_tryAgain'), emoji: '💪', color: 'text-purple-600' };
    };
    const { message, emoji, color } = getGameOverMessage();
    const earnedAchievements = Object.entries(achievements).filter(([, value]) => value);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d1c4e9] via-[#b1b2fb] to-[#f8bbd0] flex flex-col items-center justify-center p-4 font-sans">
        <main className="flex-grow flex items-center justify-center w-full">
            <div className="w-full max-w-sm">
                <div ref={gameOverCardRef} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center w-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <div className="mb-2">
                    <h1 className="text-xl font-bold text-gray-700">{t('title')}</h1>
                    <p className="text-xs text-gray-500">{t('subtitle')}</p>
                  </div>
                  <div className="relative mb-2"><div className="absolute -top-4 right-0"><div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl shadow-md">{t('gameOverBadge')}</div></div><Trophy className="w-16 h-16 mx-auto text-yellow-400 drop-shadow-lg" /></div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('gameOverTitle')}</h2>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-gray-200 shadow-inner"><div className="text-sm text-gray-600 mb-1">{t('finalScoreLabel')}</div><div className="text-5xl font-bold text-blue-600 flex items-center justify-center"><Coins className="w-10 h-10 mr-2 text-yellow-500" />{score.toLocaleString()}<span className="text-3xl ml-1">{t('scoreUnit')}</span></div></div>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                     <div className="bg-purple-50 rounded-lg p-3 border border-purple-200"><div className="text-xs text-gray-500 mb-1">{t('difficultyReachedLabel')}</div><div className="font-bold text-purple-700 flex items-center justify-center space-x-1"><Star className="w-4 h-4 text-purple-400" /><span>{getDifficultyName(difficultyLevel)}</span></div></div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200"><div className="text-xs text-gray-500 mb-1">{t('bestStreakLabel')}</div><div className="font-bold text-green-700 flex items-center justify-center space-x-1"><Flame className="w-4 h-4 text-green-500" /><span>{bestStreak}{t('itemUnit')}</span></div></div>
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200"><div className="text-xs text-gray-500 mb-1">{t('starsEarnedLabel')}</div><div className="font-bold text-yellow-700 flex items-center justify-center space-x-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /><span>{correctAnswers}</span></div></div>
                    <div className="bg-pink-50 rounded-lg p-3 border border-pink-200"><div className="text-xs text-gray-500 mb-1">{t('accuracyLabel')}</div><div className="font-bold text-pink-700">{questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0}%</div></div>
                  </div>
                     {earnedAchievements.length > 0 && (<div className="bg-gray-50 rounded-lg p-3 border border-gray-200 col-span-2 mb-4"><div className="text-xs text-gray-500 mb-2 flex items-center justify-center"><Trophy className="w-3 h-3 mr-1" />{t('achievementsEarnedLabel')}</div><div className="flex justify-center space-x-3">{achievements.firstCorrect && <span className="text-2xl" title={t('achievementsTooltip_firstCorrect')}>🎯</span>}{achievements.lightningSpeed && <span className="text-2xl" title={t('achievementsTooltip_lightningSpeed')}>⚡</span>}{achievements.streakMaster && <span className="text-2xl" title={t('achievementsTooltip_streakMaster')}>🔥</span>}{achievements.master && <span className="text-2xl" title={t('achievementsTooltip_master')}>👑</span>}</div></div>)}
                  <div className={`mb-4 ${color} font-semibold text-base`}><span className="mr-2">{emoji}</span>{message}</div>
                </div>
                <div className="flex items-stretch gap-2 mt-4"><button onClick={resetGame} className="flex-grow bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"><RotateCcw className="w-5 h-5 mr-2" />{t('playAgainButton')}</button><button onClick={handleDownloadImage} aria-label={t('downloadResult')} className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"><Download className="w-6 h-6" /></button></div>
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
        <div className="space-y-3 pr-2 custom-scrollbar flex-grow overflow-y-auto">{[{ icon: '🎯', title: 'howToPlay_goal_title', desc: 'howToPlay_goal_desc', color: 'purple' }, { icon: '⏳', title: 'howToPlay_time_lives_title', desc: 'howToPlay_time_lives_desc', color: 'blue' }, { icon: '⭐', title: 'howToPlay_difficulty_title', desc: 'howToPlay_difficulty_desc', color: 'yellow' }, { icon: '🔥', title: 'howToPlay_streak_title', desc: 'howToPlay_streak_desc', color: 'orange' }, { icon: '💡', title: 'howToPlay_hints_title', desc: 'howToPlay_hints_desc', color: 'green' }, { icon: '🏆', title: 'howToPlay_achievements_title', desc: 'howToPlay_achievements_desc', color: 'pink' } ].map(item => (<div key={item.title} className={`flex items-start space-x-4 bg-white/50 p-3 rounded-xl border-l-4 border-${item.color}-300`}><span className="text-2xl pt-1">{item.icon}</span><div><h3 className={`font-semibold text-${item.color}-800`}>{t(item.title as keyof typeof enTranslations)}</h3><p className={`text-sm text-${item.color}-700`}>{t(item.desc as keyof typeof enTranslations)}</p></div></div>))}</div>
        <button onClick={() => setHelpModalOpen(false)} className="mt-4 w-full bg-purple-500 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-600 transition-all transform hover:scale-105 shadow-md flex-shrink-0">{t('closeButton')}</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d1c4e9] via-[#b1b2fb] to-[#f8bbd0] p-4 relative overflow-hidden font-sans flex flex-col">
      {isHelpModalOpen && <HelpModal />}
       {toast && (<div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md text-white shadow-lg transition-opacity duration-300 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toast.message}</div>)}
      <main className="flex-grow">
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center"><div className="flex items-center gap-2"><button onClick={() => setHelpModalOpen(true)} aria-label={t('howToPlayButton')} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-800 bg-black/5 hover:bg-black/10 rounded-full transition-all backdrop-blur-sm"><HelpCircle className="w-4 h-4" /><span>{t('howToPlayButton')}</span></button><button onClick={toggleSound} aria-label={isSoundEnabled ? t('soundOffTooltip') : t('soundOnTooltip')} title={isSoundEnabled ? t('soundOffTooltip') : t('soundOnTooltip')} className="p-2 text-sm font-medium text-slate-800 bg-black/5 hover:bg-black/10 rounded-full transition-all backdrop-blur-sm">{isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</button></div><div className="relative" ref={dropdownRef}><button onClick={() => setLangDropdownOpen(!isLangDropdownOpen)} aria-label="Change language" aria-haspopup="true" aria-expanded={isLangDropdownOpen} className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-800 bg-black/5 hover:bg-black/10 rounded-full transition-all backdrop-blur-sm"><span>{supportedLangs.find(l => l.code === languageCode)?.name}</span><ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} /></button>{isLangDropdownOpen && ( <div className={`absolute mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden ${supportedLangs.find(l=>l.code === languageCode)?.dir === 'rtl' ? 'left-0' : 'right-0'}`}><ul role="menu">{supportedLangs.map(lang => ( <li key={lang.code}><button onClick={() => { setLanguageCode(lang.code); setLangDropdownOpen(false); }} role="menuitem" className={`w-full text-left px-4 py-2 text-sm transition-colors ${languageCode === lang.code ? 'bg-purple-500 text-white' : 'text-gray-800 hover:bg-purple-100'}`}>{lang.name}</button></li>))}</ul></div>)}</div></div>
          {particles.map(p => <div key={p.id} className="absolute text-2xl pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, animation: 'float 2s ease-out forwards' }}>{p.emoji}</div>)}

          <div className="max-w-md mx-auto">
            <div className="text-center mb-2 pt-10"><h1 className="text-3xl md:text-4xl font-bold text-slate-800 drop-shadow-md">{t('title')}</h1><p className="text-sm md:text-base text-slate-600">{t('subtitle')}</p></div>
            <div className="space-y-2"><div className="grid grid-cols-3 gap-2"><div className="bg-black/5 backdrop-blur-sm rounded-lg p-2 text-center"><div className="text-slate-600 text-xs">{t('scoreLabel')}</div><div className="text-slate-800 text-lg font-bold flex items-center justify-center"><Coins className="w-4 h-4 mr-1 text-yellow-300" />{score}</div></div><div className="bg-black/5 backdrop-blur-sm rounded-lg p-2 text-center"><div className="text-slate-600 text-xs">{t('livesLabel')}</div><div className="flex justify-center items-center space-x-1 pt-1">{[...Array(3)].map((_, i) => ( <Heart key={i} className={`w-5 h-5 transition-all ${ i < lives ? 'text-red-500 fill-current' : 'text-slate-800 opacity-30' }`} /> ))}</div></div><div className="bg-black/5 backdrop-blur-sm rounded-lg p-2 text-center"><div className="text-slate-600 text-xs">{t('streakLabel')}</div><div className="text-slate-800 text-lg font-bold flex items-center justify-center"><Flame className="w-4 h-4 mr-1 text-orange-300" />{streak}</div></div></div>
              {gameState === 'idle' && currentProblem ? (<div className="h-[41px] flex items-center justify-center"><button onClick={startGame} className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"><Play className="w-5 h-5 mr-2" />{t('startGameButton')}</button></div>) : (<div className="bg-black/5 backdrop-blur-sm rounded-lg p-2 flex items-center gap-3"><div className="relative"><div className={`flex items-center text-slate-800 font-bold text-lg ${ pulseWarning ? 'text-red-500 animate-pulse' : ''}`}><Clock className="w-4 h-4 mr-2" />{timeLeft}s</div>{timeBonusFeedback && <div key={timeBonusFeedback.id} className="absolute -top-5 left-1/2 -translate-x-1/2 text-green-400 font-bold animate-float-up whitespace-nowrap">{timeBonusFeedback.text}</div>}</div><div className="flex-grow w-full bg-black/10 rounded-full h-2.5 overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ease-linear ${ pulseWarning ? 'bg-gradient-to-r from-red-400 to-red-600 animate-pulse' : timeLeft <= 20 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-green-400 to-blue-500' } ${timeFrozen ? 'bg-gradient-to-r from-blue-300 to-cyan-400' : ''}`} style={{ width: `${(timeLeft / 60) * 100}%`}}></div></div>{timeFrozen && <span className="text-blue-300 text-lg">❄️</span>}</div>)}
            </div>
            <div className="flex justify-center items-center gap-2 my-1 min-h-[24px]">{doubleScoreActive && (<div className="bg-yellow-400 bg-opacity-90 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">{t('doubleScoreActive', { timeLeft: doubleScoreTimeLeft })}</div>)}</div>
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mb-3 min-h-[570px] bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="text-center relative">
                 <div className="flex justify-between items-start gap-2 mb-3"><div className="flex items-center space-x-1">{Object.keys(powerUps).map((key) => { const type = key as keyof typeof powerUps; return ( <button key={type} onClick={() => usePowerUp(type)} disabled={powerUps[type] === 0 || gameState !== 'playing'} className={`relative w-9 h-9 rounded-full text-white flex items-center justify-center transition-all disabled:bg-gray-400 disabled:cursor-not-allowed ${ type === 'timeFreeze' ? 'bg-blue-500 hover:bg-blue-600' : type === 'extraLife' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600' }`}>{type === 'timeFreeze' ? '❄️' : type === 'extraLife' ? '❤️' : '⚡'}{powerUps[type] > 0 && <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{powerUps[type]}</span>}</button> )})}</div><div className="flex flex-col items-center"><div className="text-lg">{'⭐'.repeat(difficultyLevel)}</div><div className="text-xs text-gray-600">{getDifficultyName(difficultyLevel)}</div></div></div>
                {currentProblem ? (
                  <div className="flex flex-col items-center w-full">
                    <p className="text-lg font-semibold text-gray-700 mb-2">{t('question')}</p>
                    <div className="bg-white shadow-inner p-3 rounded-xl mb-4 w-full flex items-center justify-center gap-4">
                      <span className="text-5xl">{currentProblem.targetEmoji}</span>
                      <span className="text-5xl font-bold text-gray-800">{currentProblem.targetCount}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2.5">
                      {currentProblem.gridItems.map((item, index) => {
                        const isFound = foundIds.includes(item.id);
                        const isIncorrect = incorrectClickIndex === index;
                        const isRevealed = hintRevealIndex === index;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(index)}
                            disabled={isFound || gameState !== 'playing' || isShuffling}
                            className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl transform
                              transition-all duration-300 ease-in-out
                              ${isFound ? 'bg-green-200 opacity-50 cursor-not-allowed animate-found' : 'bg-purple-200 hover:scale-110 hover:bg-purple-300 active:scale-100'}
                              ${isIncorrect ? 'animate-shake bg-red-300' : ''}
                              ${isRevealed ? 'ring-4 ring-yellow-400' : ''}
                              ${isShuffling ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                          >
                            {item.emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : ( <div className="h-[400px] flex items-center justify-center"><Lock className="w-24 h-24 text-gray-300" /></div> )}
                <div className="h-16 mt-4">
                   {showHint && !hintRevealIndex ? (<div className={`border-l-4 p-2 rounded mt-2 text-sm text-left bg-orange-50 border-orange-400 text-orange-800`}><p><strong>{t('hintLabel')}</strong> {t('hintText_reveal')} {t('hintUsedText')}</p></div>) : 
                   feedback ? (<div className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-all transform text-base ${ gameState === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>{gameState === 'correct' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}<span className="font-semibold">{feedback}</span></div>) : null}
                </div>
                 <button onClick={handleHint} disabled={(hintsRemaining === 0 && !showHint) || gameState !== 'playing'} className={`px-3 py-1 rounded-full text-xs transition-all w-32 ${ (hintsRemaining === 0 && !showHint) || gameState !== 'playing' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900' }`}>{showHint ? t('hintButtonClose') : t('hintButton', { remaining: hintsRemaining })}</button>
              </div>
            </div>
            <div className="bg-white bg-opacity-90 rounded-lg p-3">
              <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center justify-center"><Trophy className="w-4 h-4 mr-1 text-yellow-500" />{t('achievementsTitle', { count: Object.values(achievements).filter(Boolean).length })}</h3>
              <div className="grid grid-cols-4 gap-2">
                <div title={t('achievementsTooltip_firstCorrect')} className={`p-2 rounded-lg text-center transition-all ${achievements.firstCorrect ? 'bg-green-100 text-green-800 scale-110' : 'bg-gray-100 text-gray-400'}`}><div className="text-lg mb-1">🎯</div><div className="text-xs font-semibold">{t('achievements_firstCorrect')}</div></div>
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
