
import { useState, useEffect } from 'react'
import './App.css'
import { PetRoom } from './components/PetRoom/PetRoom'
import { createCharacter } from './data/characters'
import type { CharacterAction, CharacterMood, Character, EvolutionStage } from './types/character'
import { NurturingProvider, useNurturing } from './contexts/NurturingContext'
import { SoundProvider } from './contexts/SoundContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { preloadSounds, playJelloClickSound } from './utils/sound'

// React Router
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'

// Pages
import { PlayPage } from './pages/PlayPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { StatsPage } from './pages/StatsPage'
import { GalleryPage } from './pages/GalleryPage'

import { CHARACTER_SPECIES, type CharacterSpeciesId } from './data/species';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Or a splash screen
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppContent() {
  const navigate = useNavigate();
  // currentPage state is removed in favor of URL routing
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

  // Sync speciesId from Nurturing Context
  useEffect(() => {
    if (nurturing.speciesId && nurturing.speciesId !== selectedSpeciesId) {
      console.log('🔄 Restoring species from persistence:', nurturing.speciesId);
      const restoredId = nurturing.speciesId as CharacterSpeciesId;
      setSelectedSpeciesId(restoredId);
      setCharacter(() => createCharacter(restoredId));
    }
  }, [nurturing.speciesId]); // Only trigger when persisted speciesId changes

  const handleCharacterSelect = (speciesId: string, stage: EvolutionStage = 1) => {
    const id = speciesId as CharacterSpeciesId;
    setSelectedSpeciesId(id)

    // Update context
    nurturing.setSpeciesId(id);

    const newCharacter = createCharacter(id);
    newCharacter.evolutionStage = stage; // Set the specific stage
    setCharacter(newCharacter);

    // Reset mood and action when changing character
    setMood('neutral')
    setAction('idle')
    // Navigate to home after selection
    navigate('/home');
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
    // Pick a random species dynamically
    const validSpecies = Object.keys(CHARACTER_SPECIES) as CharacterSpeciesId[];
    const randomSpecies = validSpecies[Math.floor(Math.random() * validSpecies.length)];

    // Create new character
    const newCharacter = createCharacter(randomSpecies);
    setSelectedSpeciesId(randomSpecies);
    setCharacter(newCharacter);

    // Mark character as created in persistent state
    nurturing.completeCharacterCreation();
    nurturing.setSpeciesId(randomSpecies);

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
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route path="/home" element={
        <ProtectedRoute>
          <PetRoom
            character={character}
            speciesId={selectedSpeciesId}
            onStatsChange={handleStatsChange}
            mood={mood}
            action={action}
            showGiftBox={!nurturing.hasCharacter}
            onOpenGift={handleGiftOpen}
            onMoodChange={handleMoodChange}
            onActionChange={handleActionChange}
          />
        </ProtectedRoute>
      } />

      <Route path="/play" element={
        <ProtectedRoute>
          <PlayPage />
        </ProtectedRoute>
      } />

      <Route path="/play/:gameId" element={
        <ProtectedRoute>
          <PlayPage />
        </ProtectedRoute>
      } />

      <Route path="/stats" element={
        <ProtectedRoute>
          <StatsPage
            character={character}
            selectedSpeciesId={selectedSpeciesId}
            mood={mood}
            action={action}
            onMoodChange={handleMoodChange}
            onActionChange={handleActionChange}
          />
        </ProtectedRoute>
      } />

      <Route path="/gallery" element={
        <ProtectedRoute>
          <GalleryPage onCharacterSelect={handleCharacterSelect} />
        </ProtectedRoute>
      } />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SoundProvider>
        <AuthProvider>
          <NurturingProvider>
            <AppContent />
          </NurturingProvider>
        </AuthProvider>
      </SoundProvider>
    </BrowserRouter>
  )
}

export default App
