

import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import './App.css'
import { PetRoom } from './components/PetRoom/PetRoom'

import { createCharacter } from './data/characters'
import type { CharacterAction, CharacterMood, EvolutionStage } from './types/character'
import { NurturingProvider, useNurturing } from './contexts/NurturingContext'
import { SoundProvider } from './contexts/SoundContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { preloadSounds, playJelloClickSound } from './utils/sound'
import { useTranslation } from 'react-i18next'

// React Router
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'

import { CHARACTER_SPECIES, type CharacterSpeciesId, getEvolutionName } from './data/species';
import { useSmartImagePreloader } from './hooks/useSmartImagePreloader';

// Lazy Load Pages
const PlayPage = lazy(() => import('./pages/PlayPage').then(module => ({ default: module.PlayPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(module => ({ default: module.SignupPage })));
const StatsPage = lazy(() => import('./pages/StatsPage').then(module => ({ default: module.StatsPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(module => ({ default: module.GalleryPage })));
const EncyclopediaPage = lazy(() => import('./pages/EncyclopediaPage').then(module => ({ default: module.EncyclopediaPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const SharePage = lazy(() => import('./pages/SharePage').then(module => ({ default: module.SharePage })));
const DebugLayoutPreview = lazy(() => import('./pages/DebugLayoutPreview').then(module => ({ default: module.DebugLayoutPreview })));

// Simple Loading Component
const Loading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    Loading...
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  if (loading) return <div>{t('common.loading')}</div>; // Or a splash screen
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

  // Smart Image Preloader: Cache images for owned Jellos
  useSmartImagePreloader(nurturing.unlockedJellos);

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

  // Sync speciesId AND evolutionStage from Nurturing Context
  useEffect(() => {
    const contextSpeciesId = nurturing.speciesId as CharacterSpeciesId;
    const contextStage = nurturing.evolutionStage as EvolutionStage;

    if (!contextSpeciesId) return;

    // Check if we need to update
    const needsUpdate =
      contextSpeciesId !== character.speciesId ||
      contextStage !== character.evolutionStage ||
      (nurturing.characterName && nurturing.characterName !== character.name);

    if (needsUpdate) {
      console.log('🔄 Syncing character from context:', {
        from: { id: character.speciesId, stage: character.evolutionStage, name: character.name },
        to: { id: contextSpeciesId, stage: contextStage, name: nurturing.characterName }
      });

      setSelectedSpeciesId(contextSpeciesId);

      setCharacter(() => {
        // Create new character base
        const newChar = createCharacter(contextSpeciesId);
        // FORCE update stage and name
        newChar.evolutionStage = contextStage || 1;
        newChar.level = newChar.evolutionStage; // Sync level with stage (Fixes profile display mismatch)

        // Sync Name: Use persisted name if available, otherwise default to evolution name
        if (nurturing.characterName) {
          newChar.name = nurturing.characterName;
        } else {
          newChar.name = getEvolutionName(contextSpeciesId, newChar.evolutionStage);
        }

        // Preserve other transient stats if needed
        // Note: Resetting character here effectively resets mood/action unless preserved
        return newChar;
      });
    }
  }, [nurturing.speciesId, nurturing.evolutionStage, nurturing.characterName, character.speciesId, character.evolutionStage, character.name]);

  const handleCharacterSelect = (speciesId: string, stage: EvolutionStage = 1) => {
    const id = speciesId as CharacterSpeciesId;
    setSelectedSpeciesId(id)

    // Update context
    nurturing.setCharacterState(id, stage);

    const newCharacter = createCharacter(id);
    newCharacter.evolutionStage = stage; // Set the specific stage
    newCharacter.level = stage; // Sync level for profile display
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



  // Prevent double-click/race conditions during gift opening
  const isOpeningRef = useRef(false);

  // Reset the lock when there is no character (Gift Box is visible)
  // This ensures that if a user resets the game or logs out/in, the box can be opened again.
  useEffect(() => {
    if (!nurturing.hasCharacter) {
      isOpeningRef.current = false;
    }
  }, [nurturing.hasCharacter]);

  const handleGiftOpen = () => {
    if (isOpeningRef.current) return;
    isOpeningRef.current = true;

    // Pick a random species dynamically
    const validSpecies = Object.keys(CHARACTER_SPECIES) as CharacterSpeciesId[];
    const randomSpecies = validSpecies[Math.floor(Math.random() * validSpecies.length)];

    // Create new character
    const newCharacter = createCharacter(randomSpecies);
    setSelectedSpeciesId(randomSpecies);
    setCharacter(newCharacter);

    // Mark character as created in persistent state
    nurturing.completeCharacterCreation();
    nurturing.setCharacterState(randomSpecies, 1);

    // Trigger excitement
    setMood('excited');
    setAction('jumping');

    // Reset to normal after a delay
    setTimeout(() => {
      setMood('neutral');
      setAction('idle');
      // No need to reset ref as GiftBox should disappear
    }, 3000);
  };

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/share" element={<SharePage />} />

        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <PetRoom
              character={character}
              speciesId={selectedSpeciesId}

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

        <Route path="/jellobox" element={
          <ProtectedRoute>
            <EncyclopediaPage />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/debug/layouts" element={
          <ProtectedRoute>
            <DebugLayoutPreview />
          </ProtectedRoute>
        } />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SoundProvider>
          <NurturingProvider>
            <AppContent />
          </NurturingProvider>
        </SoundProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
