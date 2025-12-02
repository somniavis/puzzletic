import { useState, useEffect } from 'react'
import './App.css'
import { CharacterAdmin } from './pages/CharacterAdmin'
import { PetRoom } from './components/PetRoom/PetRoom'
import { CHARACTERS } from './components/characters'
import { createCharacter } from './data/characters'
import type { CharacterAction, CharacterMood, Character } from './types/character'
import { NurturingProvider, useNurturing } from './contexts/NurturingContext'
import { SoundProvider } from './contexts/SoundContext'
import { preloadSounds, playJelloClickSound } from './utils/sound'

import { PlayPage } from './pages/PlayPage'

type Page = 'home' | 'gallery' | 'stats' | 'play';
type CharacterSpeciesId =
  | 'yellowJello'
  | 'redJello'
  | 'limeJello'
  | 'mintJello'
  | 'blueJello'
  | 'creamJello'
  | 'purpleJello'
  | 'skyJello'
  | 'brownJello'
  | 'orangeJello'
  | 'oliveJello'
  | 'cyanJello';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<CharacterSpeciesId>('yellowJello')
  const [character, setCharacter] = useState(() => createCharacter('yellowJello'))
  const [mood, setMood] = useState<CharacterMood>('neutral')
  const [action, setAction] = useState<CharacterAction>('idle')

  const nurturing = useNurturing();

  // Handle character mood updates based on nurturing state
  useEffect(() => {
    if (nurturing.condition.isSick) {
      setMood('sad')
      setAction('idle')
    } else if (nurturing.condition.isHungry) {
      setMood('sad')
    } else if (nurturing.stats.happiness > 80) {
      setMood('happy')
    } else {
      setMood('neutral')
    }
  }, [nurturing.condition, nurturing.stats.happiness])

  // 앱 시작 시 사운드 프리로드
  useEffect(() => {
    preloadSounds();
  }, []);

  const handleCharacterSelect = (speciesId: string) => {
    const id = speciesId as CharacterSpeciesId;
    setSelectedSpeciesId(id)
    setCharacter(createCharacter(id))
    setCurrentPage('home')
    // Reset mood and action when changing character
    setMood('neutral')
    setAction('idle')
  }

  const handleMoodChange = (newMood: CharacterMood) => {
    setMood(newMood)
    if (newMood === 'happy' || newMood === 'excited') {
      playJelloClickSound()
    }
  }

  const handleActionChange = (newAction: CharacterAction) => {
    setAction(newAction)
    // Reset to idle after animation
    if (newAction !== 'idle') {
      setTimeout(() => setAction('idle'), 2000)
    }
    if (newAction === 'jumping' || newAction === 'playing') {
      playJelloClickSound()
    }
  }

  const handleStatsChange = (newStats: Partial<Character['stats']>) => {
    // Stats are now handled via context, this might be redundant or for local UI updates
    console.log('Stats changed:', newStats)
  }

  const handleGiftOpen = () => {
    // Pick a random species
    const validSpecies: CharacterSpeciesId[] = ['yellowJello', 'blueJello', 'purpleJello', 'limeJello', 'orangeJello', 'creamJello'];
    const randomSpecies = validSpecies[Math.floor(Math.random() * validSpecies.length)];

    // Create new character
    const newCharacter = createCharacter(randomSpecies);
    setSelectedSpeciesId(randomSpecies);
    setCharacter(newCharacter);

    // Mark character as created in persistent state
    nurturing.completeCharacterCreation();

    // Trigger excitement
    setMood('excited');
    setAction('jumping');

    // Reset to normal after a delay
    setTimeout(() => {
      setMood('neutral');
      setAction('idle');
    }, 3000);
  };

  return (
    <>
      {currentPage === 'play' ? (
        <PlayPage onNavigate={(page) => setCurrentPage(page as Page)} />
      ) : currentPage === 'gallery' ? (
        <>
          <div className="page-nav">
            <button onClick={() => setCurrentPage('home')}>🏠 Home</button>
            <button onClick={() => setCurrentPage('stats')}>📊 Stats</button>
          </div>
          <CharacterAdmin onCharacterSelect={handleCharacterSelect} />
        </>
      ) : currentPage === 'stats' ? (
        <>
          <div className="page-nav">
            <button onClick={() => setCurrentPage('home')}>🏠 Home</button>
            <button onClick={() => setCurrentPage('gallery')}>🖼️ Gallery</button>
          </div>
          <div className="app">
            <div className="app-header">
              <h1>Puzzletic - Stats</h1>
              <p>Character Details & Controls</p>
            </div>

            <div className="character-stage">
              {(() => {
                const CharacterComponent = CHARACTERS[selectedSpeciesId];
                return (
                  <CharacterComponent
                    character={character}
                    size="large"
                    mood={mood}
                    action={action}
                    onClick={() => handleActionChange('jumping')}
                  />
                );
              })()}
            </div>

            <div className="controls">
              <div className="control-section">
                <h3>Mood</h3>
                <div className="button-group">
                  <button onClick={() => handleMoodChange('happy')}>Happy</button>
                  <button onClick={() => handleMoodChange('neutral')}>Neutral</button>
                  <button onClick={() => handleMoodChange('sad')}>Sad</button>
                  <button onClick={() => handleMoodChange('excited')}>Excited</button>
                  <button onClick={() => handleMoodChange('sleeping')}>Sleeping</button>
                </div>
              </div>

              <div className="control-section">
                <h3>Actions</h3>
                <div className="button-group">
                  <button onClick={() => handleActionChange('idle')}>Idle</button>
                  <button onClick={() => handleActionChange('jumping')}>Jump</button>
                  <button onClick={() => handleActionChange('happy')}>Wiggle</button>
                  <button onClick={() => handleActionChange('playing')}>Play</button>
                </div>
              </div>
            </div>

            <div className="character-info">
              <h3>{character.name}</h3>
              <div className="stats">
                <div className="stat">
                  <span>Level:</span> <strong>{character.level}</strong>
                </div>
                <div className="stat">
                  <span>Health:</span> <strong>{character.stats.health}%</strong>
                </div>
                <div className="stat">
                  <span>Happiness:</span> <strong>{character.stats.happiness}%</strong>
                </div>
                <div className="stat">
                  <span>Hunger:</span> <strong>{character.stats.hunger}%</strong>
                </div>
                <div className="stat">
                  <span>Hygiene:</span> <strong>{character.stats.hygiene}%</strong>
                </div>
                <div className="stat">
                  <span>Fatigue:</span> <strong>{character.stats.fatigue}%</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <PetRoom
          character={character}
          speciesId={selectedSpeciesId}
          onStatsChange={handleStatsChange}
          onNavigate={(page) => setCurrentPage(page as Page)}
          mood={mood}
          action={action}
          showGiftBox={!nurturing.hasCharacter}
          onOpenGift={handleGiftOpen}
          onMoodChange={handleMoodChange}
          onActionChange={handleActionChange}
        />
      )}
    </>
  )
}

function App() {
  return (
    <SoundProvider>
      <NurturingProvider>
        <AppContent />
      </NurturingProvider>
    </SoundProvider>
  )
}

export default App
