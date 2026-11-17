import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DestinationId,
  DialogueLine,
  GameScreen,
  HubCollectible,
  HubDestination,
  SavedProgress,
  ToastNotification,
} from './types/game';
import { ACHIEVEMENTS, DESIGNER_PROFILE, HUB_DESTINATIONS } from './data/portfolioData';
import { FOUNTAIN_CENTER } from './game/overworldMap';
import { soundEngine } from './audio/soundEngine';
import { TitleScreen } from './components/TitleScreen';
import { OverworldHubCanvas, HubTouchInput } from './components/OverworldHubCanvas';
import { DestinationEntrance } from './components/DestinationEntrance';
import { GameHUD } from './components/GameHUD';
import { DialogueBox } from './components/DialogueBox';
import { ToastBanner } from './components/ToastBanner';
import { PauseMenuModal } from './components/modals/PauseMenuModal';
import { PlayerProfileView } from './components/destinations/PlayerProfileView';
import { SkillLabView } from './components/destinations/SkillLabView';
import { MissionControlView } from './components/destinations/MissionControlView';
import { TrainingAcademyView } from './components/destinations/TrainingAcademyView';
import { TrophyGalleryView } from './components/destinations/TrophyGalleryView';
import { ConnectionPortalView } from './components/destinations/ConnectionPortalView';

const STORAGE_KEY = 'design_quest_overworld_v2';

const DEFAULT_PROGRESS: SavedProgress = {
  xp: 0,
  collectedIds: [],
  visitedDestinations: [],
  completedQuests: [],
  unlockedAchievements: [],
  bossDefeated: false,
  portalReached: false,
  foxPetCount: 0,
  secretPaletteUnlocked: false,
  secretPaletteActive: false,
  hubX: FOUNTAIN_CENTER.x,
  hubY: FOUNTAIN_CENTER.y + 84,
};

function loadProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export default function App() {
  const [progress, setProgress] = useState<SavedProgress>(() => loadProgress());
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [activeDestId, setActiveDestId] = useState<DestinationId | null>(null);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [dialogue, setDialogue] = useState<DialogueLine[] | null>(null);
  const [nearbyDest, setNearbyDest] = useState<HubDestination | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [muted, setMuted] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [justLaunchedHub, setJustLaunchedHub] = useState(false);
  const [heroIntroCompleted, setHeroIntroCompleted] = useState(false);
  const [focusedDestId, setFocusedDestId] = useState<DestinationId | null>(null);

  const appScrollRef = useRef<HTMLDivElement | null>(null);
  const hubPosRef = useRef<{ x: number; y: number }>({
    x: progress.hubX || FOUNTAIN_CENTER.x,
    y: progress.hubY || FOUNTAIN_CENTER.y + 84,
  });
  const touchInputRef = useRef<HubTouchInput>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    if ((screen === 'DESTINATION' || screen === 'ENTRANCE') && appScrollRef.current) {
      appScrollRef.current.scrollTop = 0;
    }
  }, [screen, activeDestId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...progress,
          hubX: Math.round(hubPosRef.current.x),
          hubY: Math.round(hubPosRef.current.y),
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const pushToast = useCallback(
    (title: string, subtitle: string, kind: ToastNotification['kind'] = 'xp') => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, subtitle, kind }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  const unlockAchievement = useCallback(
    (achievementId: string) => {
      const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!def) return;
      setProgress((prev) => {
        if (prev.unlockedAchievements.includes(achievementId)) return prev;
        soundEngine.playSuccess();
        pushToast(
          `TROPHY: ${def.title}`,
          `+${def.xpBonus} XP · ${def.description}`,
          'achievement'
        );
        return {
          ...prev,
          xp: prev.xp + def.xpBonus,
          unlockedAchievements: [...prev.unlockedAchievements, achievementId],
        };
      });
    },
    [pushToast]
  );

  const enterDestination = useCallback(
    (dest: HubDestination) => {
      soundEngine.playInteract();
      setPauseOpen(false);
      setDialogue(null);
      setFocusedDestId(null);
      setActiveDestId(dest.id);
      setScreen('ENTRANCE');

      setProgress((prev) => {
        const firstVisit = !prev.visitedDestinations.includes(dest.id);
        return {
          ...prev,
          xp: firstVisit ? prev.xp + dest.xpReward : prev.xp,
          visitedDestinations: firstVisit
            ? [...prev.visitedDestinations, dest.id]
            : prev.visitedDestinations,
          portalReached: prev.portalReached || dest.id === 'portal',
        };
      });

      if (dest.id === 'profile') unlockAchievement('first_steps');
      if (dest.id === 'skills') unlockAchievement('skill_explorer');
      if (dest.id === 'portal') {
        soundEngine.playVictory();
        unlockAchievement('champion');
      }
    },
    [unlockAchievement]
  );

  const navigateById = useCallback(
    (id: DestinationId) => {
      const target = HUB_DESTINATIONS.find((d) => d.id === id);
      if (target) enterDestination(target);
    },
    [enterDestination]
  );

  const startHub = useCallback(() => {
    soundEngine.playStartGame();
    setJustLaunchedHub(true);
    setScreen('HUB');
    if (progress.visitedDestinations.length === 0 && progress.xp === 0) {
      setDialogue([
        {
          speaker: DESIGNER_PROFILE.name.toUpperCase(),
          portrait: 'meera',
          text: `Welcome to the Design Quest Overworld! Walk with WASD / Arrows or click any landmark to enter its world.`,
        },
        {
          speaker: DESIGNER_PROFILE.name.toUpperCase(),
          portrait: 'meera',
          text: `Explore Mission Control for case studies, Skill Lab for tools & UX thinking, or warp directly using the quick bar below.`,
        },
      ]);
    }
  }, [progress.visitedDestinations.length, progress.xp]);

  const handleReturnToHub = useCallback(() => {
    soundEngine.playInteract();
    setPauseOpen(false);
    setActiveDestId(null);
    setJustLaunchedHub(false);
    setScreen('HUB');
  }, []);

  const handleCollect = useCallback(
    (item: HubCollectible) => {
      setProgress((prev) => {
        if (prev.collectedIds.includes(item.id)) return prev;
        const isSecret = item.kind === 'secret_key';
        if (isSecret) {
          pushToast('SECRET RELIC FOUND!', `${item.label} · Game Boy Mode Unlocked`, 'secret');
        }
        return {
          ...prev,
          xp: prev.xp + item.xpValue,
          collectedIds: [...prev.collectedIds, item.id],
          secretPaletteUnlocked: prev.secretPaletteUnlocked || isSecret,
        };
      });
      if (item.kind === 'secret_key') {
        unlockAchievement('secret_hunter');
      }
    },
    [pushToast, unlockAchievement]
  );

  useEffect(() => {
    if (progress.collectedIds.length >= 6 && !progress.unlockedAchievements.includes('star_collector')) {
      unlockAchievement('star_collector');
    }
  }, [progress.collectedIds.length, progress.unlockedAchievements, unlockAchievement]);

  const handlePetFox = useCallback(() => {
    setProgress((prev) => {
      const nextCount = prev.foxPetCount + 1;
      return {
        ...prev,
        foxPetCount: nextCount,
        xp: prev.xp + (nextCount === 1 ? 50 : 5),
      };
    });
    if (progress.foxPetCount === 0) {
      unlockAchievement('secret_hunter');
      setDialogue([
        {
          speaker: 'PIXEL FOX',
          portrait: 'fox',
          text: 'Yip! ★ Secret companion bond unlocked! Hint: check behind the Northeast Skill Lab trees for a hidden Golden Key.',
        },
      ]);
    } else {
      pushToast('Pixel Fox Companion', 'Happy tail wag! (+5 XP)', 'secret');
    }
  }, [progress.foxPetCount, pushToast, unlockAchievement]);

  const handleInspectFountain = useCallback(() => {
    setDialogue([
      {
        speaker: 'CENTRAL PLAZA COMPASS',
        portrait: 'system',
        text: 'North: Mission Control (Case Studies) · West: Player Profile & Training Academy · East: Skill Lab & Trophy Gallery · South: Connection Portal.',
      },
    ]);
  }, []);

  const handleCompleteQuest = useCallback(
    (questId: string) => {
      setProgress((prev) => {
        if (prev.completedQuests.includes(questId)) return prev;
        return {
          ...prev,
          xp: prev.xp + 100,
          completedQuests: [...prev.completedQuests, questId],
        };
      });
      unlockAchievement('first_mission');
    },
    [unlockAchievement]
  );

  const handleDefeatBoss = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      xp: prev.bossDefeated ? prev.xp : prev.xp + 200,
      bossDefeated: true,
    }));
    unlockAchievement('boss_slayer');
  }, [unlockAchievement]);

  const handleResetGame = useCallback(() => {
    soundEngine.playInteract();
    localStorage.removeItem(STORAGE_KEY);
    setProgress(DEFAULT_PROGRESS);
    hubPosRef.current = { x: FOUNTAIN_CENTER.x, y: FOUNTAIN_CENTER.y + 84 };
    setPauseOpen(false);
    setDialogue(null);
    setActiveDestId(null);
    setScreen('TITLE');
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'HUB' && screen !== 'DESTINATION') return;
      if (e.key === 'Escape') {
        if (pauseOpen) {
          setPauseOpen(false);
        } else if (dialogue) {
          setDialogue(null);
        } else {
          setPauseOpen(true);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, pauseOpen, dialogue]);

  const hasSavedProgress =
    progress.xp > 0 ||
    progress.collectedIds.length > 0 ||
    progress.visitedDestinations.length > 0;

  return (
    <div
      ref={appScrollRef}
      className={`relative w-screen h-screen bg-[#06060E] ${
        screen === 'DESTINATION' ? 'overflow-y-auto retro-scroll' : 'overflow-hidden'
      } ${progress.secretPaletteActive ? 'gb-palette-mode' : ''}`}
    >
      {screen === 'TITLE' && (
        <TitleScreen
          xp={progress.xp}
          hasSavedProgress={hasSavedProgress}
          muted={muted}
          skipIntro={heroIntroCompleted}
          onIntroComplete={() => setHeroIntroCompleted(true)}
          onToggleMute={() => setMuted(soundEngine.toggleMute())}
          onHeroBonusXp={(amount, label) => {
            setProgress((prev) => ({ ...prev, xp: prev.xp + amount }));
            pushToast(label, `+${amount} XP`, 'secret');
          }}
          onStartHub={startHub}
          onDirectProjects={() => navigateById('missions')}
        />
      )}

      {screen === 'HUB' && (
        <>
          <OverworldHubCanvas
            hubPosRef={hubPosRef}
            collectedIds={progress.collectedIds}
            visitedDestinations={progress.visitedDestinations}
            focusedDestId={focusedDestId}
            secretTrailActive={progress.secretPaletteUnlocked}
            isOverlayOpen={pauseOpen || Boolean(dialogue)}
            playEntranceReveal={justLaunchedHub}
            touchInputRef={touchInputRef}
            onCollect={handleCollect}
            onEnterDestination={enterDestination}
            onPetFox={handlePetFox}
            onInspectFountain={handleInspectFountain}
            onNearbyDestChange={setNearbyDest}
            onHoverDestChange={setFocusedDestId}
          />
          <div className="pointer-events-none fixed inset-0 crt-scanlines opacity-15 z-10" />
        </>
      )}

      {screen === 'ENTRANCE' && activeDestId && (
        <DestinationEntrance
          destinationId={activeDestId}
          playerHubPos={hubPosRef.current}
          onComplete={() => setScreen('DESTINATION')}
        />
      )}

      {screen === 'DESTINATION' && activeDestId === 'profile' && (
        <PlayerProfileView
          scrollContainerRef={appScrollRef}
          onNavigateDestination={navigateById}
          onUnlockSecret={() => {
            unlockAchievement('secret_hunter');
            setProgress((prev) => ({ ...prev, xp: prev.xp + 75 }));
          }}
        />
      )}

      {screen === 'DESTINATION' && activeDestId === 'skills' && (
        <SkillLabView bossDefeated={progress.bossDefeated} onDefeatBoss={handleDefeatBoss} />
      )}

      {screen === 'DESTINATION' && activeDestId === 'missions' && (
        <MissionControlView
          scrollContainerRef={appScrollRef}
          completedQuests={progress.completedQuests}
          muted={muted}
          onCompleteQuest={handleCompleteQuest}
          onReturnToHub={handleReturnToHub}
          onToggleMute={() => setMuted(soundEngine.toggleMute())}
          onOpenPause={() => {
            soundEngine.playInteract();
            setFocusedDestId(null);
            setPauseOpen(true);
          }}
        />
      )}

      {screen === 'DESTINATION' && activeDestId === 'academy' && (
        <TrainingAcademyView onNavigateDestination={navigateById} />
      )}

      {screen === 'DESTINATION' && activeDestId === 'trophies' && (
        <TrophyGalleryView
          unlockedAchievements={progress.unlockedAchievements}
          collectedIds={progress.collectedIds}
          secretPaletteUnlocked={progress.secretPaletteUnlocked}
          secretPaletteActive={progress.secretPaletteActive}
          onToggleSecretPalette={() => {
            soundEngine.playSecret();
            setProgress((prev) => ({
              ...prev,
              secretPaletteActive: !prev.secretPaletteActive,
            }));
          }}
        />
      )}

      {screen === 'DESTINATION' && activeDestId === 'portal' && (
        <ConnectionPortalView
          xp={progress.xp}
          collectedCount={progress.collectedIds.length}
          visitedCount={progress.visitedDestinations.length}
          unlockedAchievements={progress.unlockedAchievements}
        />
      )}

      {(screen === 'HUB' || (screen === 'DESTINATION' && activeDestId !== 'missions')) && (
        <GameHUD
          mode={screen === 'HUB' ? 'HUB' : 'DESTINATION'}
          activeDestinationId={activeDestId}
          focusedDestId={focusedDestId}
          visitedDestinations={progress.visitedDestinations}
          xp={progress.xp}
          collectedCount={progress.collectedIds.length}
          visitedCount={progress.visitedDestinations.length}
          nearbyDest={pauseOpen || dialogue ? null : nearbyDest}
          muted={muted}
          touchInputRef={touchInputRef}
          onSelectDestination={enterDestination}
          onHoverDestination={setFocusedDestId}
          onReturnToHub={handleReturnToHub}
          onOpenPause={() => {
            soundEngine.playInteract();
            setFocusedDestId(null);
            setPauseOpen(true);
          }}
          onToggleMute={() => setMuted(soundEngine.toggleMute())}
          onActivateNearby={() => {
            if (nearbyDest) enterDestination(nearbyDest);
          }}
        />
      )}

      <ToastBanner toasts={toasts} />

      {screen === 'HUB' && dialogue && !pauseOpen && (
        <DialogueBox lines={dialogue} onClose={() => setDialogue(null)} />
      )}

      {pauseOpen && (
        <PauseMenuModal
          isInsideDestination={screen === 'DESTINATION'}
          activeDestinationId={activeDestId}
          muted={muted}
          bgmEnabled={bgmEnabled}
          secretPaletteUnlocked={progress.secretPaletteUnlocked}
          secretPaletteActive={progress.secretPaletteActive}
          onResume={() => setPauseOpen(false)}
          onReturnToHub={handleReturnToHub}
          onSelectDestination={enterDestination}
          onToggleMute={() => setMuted(soundEngine.toggleMute())}
          onToggleBgm={() => setBgmEnabled(soundEngine.toggleBgm())}
          onToggleSecretPalette={() =>
            setProgress((prev) => ({
              ...prev,
              secretPaletteActive: !prev.secretPaletteActive,
            }))
          }
          onResetGame={handleResetGame}
        />
      )}
    </div>
  );
}
