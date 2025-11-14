import { useState } from 'react'
import './App.css'
import { CharacterAdmin } from './pages/CharacterAdmin'
import { PetRoom } from './components/PetRoom/PetRoom'
import { CHARACTERS } from './components/characters'
import { createCharacter } from './data/characters'
import type { CharacterAction, CharacterMood, Character } from './types/character'
import { NurturingProvider } from './contexts/NurturingContext'

type Page = 'home' | 'gallery' | 'stats';
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

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<CharacterSpeciesId>('yellowJello')
  const [character, setCharacter] = useState(() => createCharacter('yellowJello'))
  const [mood, setMood] = useState<CharacterMood>('neutral')
  const [action, setAction] = useState<CharacterAction>('idle')

  const handleMoodChange = (newMood: CharacterMood) => {
    setMood(newMood)
  }

  const handleActionChange = (newAction: CharacterAction) => {
    setAction(newAction)
    // Reset to idle after animation
    if (newAction !== 'idle') {
      setTimeout(() => setAction('idle'), 2000)
    }
  }

  const handleCharacterSelect = (speciesId: string) => {
    const validSpecies: CharacterSpeciesId[] = [
      'yellowJello', 'redJello', 'limeJello', 'mintJello',
      'blueJello', 'creamJello', 'purpleJello', 'skyJello',
      'brownJello', 'orangeJello', 'oliveJello', 'cyanJello'
    ];

    if (validSpecies.includes(speciesId as CharacterSpeciesId)) {
      setSelectedSpeciesId(speciesId as CharacterSpeciesId)
      setCharacter(createCharacter(speciesId))
      setCurrentPage('home')
      // Reset mood and action when changing character
      setMood('neutral')
      setAction('idle')
    }
  }

  const handleStatsChange = (newStats: Partial<Character['stats']>) => {
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        ...newStats,
      },
    }))
  }

  // Show Character Gallery page
  if (currentPage === 'gallery') {
    return (
      <>
        <div className="page-nav">
          <button onClick={() => setCurrentPage('home')}>🏠 Home</button>
          <button onClick={() => setCurrentPage('stats')}>📊 Stats</button>
        </div>
        <CharacterAdmin onCharacterSelect={handleCharacterSelect} />
      </>
    );
  }

  // Show Stats page (old game page)
  if (currentPage === 'stats') {
    return (
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
    );
  }

  // Show Home page (Pet Room)
  return (
    <NurturingProvider>
      <div className="page-nav page-nav--floating">
        <button onClick={() => setCurrentPage('gallery')}>🖼️</button>
        <button onClick={() => setCurrentPage('stats')}>📊</button>
      </div>
      <PetRoom
        character={character}
        speciesId={selectedSpeciesId}
        onStatsChange={handleStatsChange}
      />
    </NurturingProvider>
  )
}

export default App
