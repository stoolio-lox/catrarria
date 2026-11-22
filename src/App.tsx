import { useCallback, useEffect, useRef, useState } from 'react';
import { ChestModal } from './components/ChestModal';
import { DebugModal } from './components/DebugModal';
import { GameHud } from './components/GameHud';
import { InventoryModal } from './components/InventoryModal';
import { SettingsModal } from './components/SettingsModal';
import { StatusModal } from './components/StatusModal';
import { TitleScreen } from './components/TitleScreen';
import { sound } from './game/audio';
import { KotarriaEngine } from './game/engine';
import { loadSettings } from './game/settings';
import { GameSettings, HudSnapshot } from './game/types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<KotarriaEngine | null>(null);

  const [hud, setHud] = useState<HudSnapshot | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [debugUnlocked, setDebugUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());

  const inventoryOpenRef = useRef(false);
  inventoryOpenRef.current = inventoryOpen;
  const debugOpenRef = useRef(false);
  debugOpenRef.current = debugOpen;
  const settingsOpenRef = useRef(false);
  settingsOpenRef.current = settingsOpen;
  const chestOpenRef = useRef(false);
  chestOpenRef.current = Boolean(hud?.activeChest);

  useEffect(() => {
    engineRef.current?.setUiModalOpen(
      inventoryOpen || debugOpen || settingsOpen || Boolean(hud?.activeChest),
    );
  }, [inventoryOpen, debugOpen, settingsOpen, hud?.activeChest]);

  const handleSettingsChange = useCallback((next: GameSettings) => {
    setSettings(next);
    engineRef.current?.applySettings(next);
  }, []);

  const handleStart = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    sound.unlock();
    setInventoryOpen(false);
    setHelpOpen(false);
    setDebugOpen(false);
    setSettingsOpen(false);
    engine.startNewGame();
    canvasRef.current?.focus();
  }, []);

  const handleTogglePause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (settingsOpenRef.current) {
      setSettingsOpen(false);
      return;
    }
    if (chestOpenRef.current) {
      engine.closeChest();
      return;
    }
    if (inventoryOpenRef.current) {
      setInventoryOpen(false);
      return;
    }
    if (engine.phase === 'playing') {
      engine.setPhase('paused');
    } else if (engine.phase === 'paused') {
      engine.setPhase('playing');
      canvasRef.current?.focus();
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      sound.muted = next;
      sound.applySettings({
        musicEnabled: settings.musicEnabled,
        musicVolume: settings.musicVolume,
        sfxEnabled: settings.sfxEnabled,
        sfxVolume: settings.sfxVolume,
        muted: next,
      });
      return next;
    });
  }, [settings]);

  useEffect(() => {
    const engine = new KotarriaEngine((snap) => {
      setHud(snap);
    });
    engineRef.current = engine;

    const canvas = canvasRef.current;
    if (canvas) {
      engine.attachCanvas(canvas);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      engine.startNewGame();
    } else {
      engine.setPhase('title');
    }

    const ro = new ResizeObserver(() => {
      engine.resizeCanvas();
    });
    if (canvas) ro.observe(canvas);

    const onKeyDown = (e: KeyboardEvent) => {
      sound.unlock();
      if (engine.phase === 'title') {
        if (settingsOpenRef.current) {
          if (e.code === 'Escape') {
            e.preventDefault();
            setSettingsOpen(false);
          }
          return;
        }
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          setInventoryOpen(false);
          engine.startNewGame();
          canvasRef.current?.focus();
        }
        return;
      }

      const activeTag = (e.target as HTMLElement | null)?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        if (e.code === 'Escape') {
          e.preventDefault();
          setDebugOpen(false);
          setSettingsOpen(false);
        }
        return;
      }

      if (e.code === 'KeyM') {
        setMuted((prev) => {
          const next = !prev;
          sound.muted = next;
          sound.applySettings({
            musicEnabled: engine.settings.musicEnabled,
            musicVolume: engine.settings.musicVolume,
            sfxEnabled: engine.settings.sfxEnabled,
            sfxVolume: engine.settings.sfxVolume,
            muted: next,
          });
          return next;
        });
        return;
      }

      if (e.code === 'F9') {
        e.preventDefault();
        if (engine.phase === 'playing') {
          engine.clearInputs();
          setInventoryOpen(false);
          setSettingsOpen(false);
          engine.closeChest();
          setDebugOpen((v) => !v);
        }
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (debugOpenRef.current && e.code === 'KeyP') {
          return;
        }
        e.preventDefault();
        if (settingsOpenRef.current) {
          setSettingsOpen(false);
          return;
        }
        if (debugOpenRef.current) {
          setDebugOpen(false);
          return;
        }
        if (chestOpenRef.current) {
          engine.closeChest();
          return;
        }
        if (inventoryOpenRef.current) {
          setInventoryOpen(false);
          return;
        }
        if (engine.phase === 'playing') {
          engine.setPhase('paused');
        } else if (engine.phase === 'paused') {
          engine.setPhase('playing');
          canvasRef.current?.focus();
        }
        return;
      }

      if (engine.phase !== 'playing') return;
      if (debugOpenRef.current || settingsOpenRef.current) return;

      if (e.code === 'KeyE' || e.code === 'Tab') {
        e.preventDefault();
        engine.clearInputs();
        engine.closeChest();
        setInventoryOpen((v) => !v);
        return;
      }

      if (e.code === 'KeyH') {
        setHelpOpen((v) => !v);
        return;
      }

      if (inventoryOpenRef.current || chestOpenRef.current) return;

      if (e.code === 'Space') {
        e.preventDefault();
      }
      engine.handleKeyDown(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      engine.handleKeyUp(e.code);
    };

    const onBlur = () => {
      engine.clearInputs();
    };

    const onVisibility = () => {
      if (document.hidden) {
        engine.clearInputs();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      engine.detach();
    };
  }, []);

  const anyModalBlockingCanvas =
    inventoryOpen || debugOpen || settingsOpen || Boolean(hud?.activeChest);

  return (
    <main className="relative w-full h-full overflow-hidden bg-[#0b1628]">
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        tabIndex={0}
        onContextMenu={(e) => e.preventDefault()}
        onMouseMove={(e) => {
          if (hud?.phase === 'playing' && !anyModalBlockingCanvas) {
            engineRef.current?.handleMouseMove(e.clientX, e.clientY);
          }
        }}
        onMouseDown={(e) => {
          if (hud?.phase === 'playing' && !anyModalBlockingCanvas) {
            engineRef.current?.handleMouseDown(e.button, e.clientX, e.clientY);
          }
        }}
        onMouseUp={(e) => {
          engineRef.current?.handleMouseUp(e.button);
        }}
        onWheel={(e) => {
          if (hud?.phase !== 'playing' || anyModalBlockingCanvas || !hud) return;
          const dir = e.deltaY > 0 ? 1 : -1;
          const next = (hud.selectedSlot + dir + 9) % 9;
          engineRef.current?.selectHotbarSlot(next);
        }}
        className="block w-full h-full outline-none cursor-crosshair"
      />

      {hud?.phase === 'title' && (
        <TitleScreen
          onStart={handleStart}
          onOpenSettings={() => {
            sound.unlock();
            setSettingsOpen(true);
          }}
        />
      )}

      {hud && hud.phase !== 'title' && (
        <GameHud
          hud={hud}
          muted={muted}
          inventoryOpen={inventoryOpen}
          helpOpen={helpOpen}
          debugOpen={debugOpen}
          settingsOpen={settingsOpen}
          onSelectSlot={(idx) => engineRef.current?.selectHotbarSlot(idx)}
          onToggleInventory={() => {
            engineRef.current?.clearInputs();
            engineRef.current?.closeChest();
            setDebugOpen(false);
            setSettingsOpen(false);
            setInventoryOpen((v) => !v);
          }}
          onToggleBuildMode={() => engineRef.current?.toggleToolMode()}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
          onToggleHelp={() => setHelpOpen((v) => !v)}
          onToggleDebug={() => {
            engineRef.current?.clearInputs();
            engineRef.current?.closeChest();
            setInventoryOpen(false);
            setSettingsOpen(false);
            setDebugOpen((v) => !v);
          }}
          onOpenSettings={() => {
            engineRef.current?.clearInputs();
            engineRef.current?.closeChest();
            setInventoryOpen(false);
            setDebugOpen(false);
            setSettingsOpen(true);
          }}
          onSummonBoss={() => engineRef.current?.summonNightBoss()}
          onOpenChest={() => engineRef.current?.openNearestChest()}
          onPetStool={() => engineRef.current?.petNearestStool()}
          onDismissStoolSpeech={() => engineRef.current?.dismissStoolSpeech()}
          onCopyStoolUrl={() => engineRef.current?.copyStoolUrlAgain()}
          onDropSelected={(dropAll) => engineRef.current?.dropSelectedHotbarItem(dropAll)}
        />
      )}

      {hud && hud.phase === 'playing' && hud.activeChest && !inventoryOpen && !debugOpen && !settingsOpen && (
        <ChestModal
          chest={hud.activeChest}
          onTakeItem={(idx) => engineRef.current?.takeChestItem(idx)}
          onTakeAll={() => engineRef.current?.takeAllChestLoot()}
          onClose={() => {
            engineRef.current?.closeChest();
            canvasRef.current?.focus();
          }}
        />
      )}

      {hud && hud.phase === 'playing' && inventoryOpen && (
        <InventoryModal
          hud={hud}
          onClose={() => {
            setInventoryOpen(false);
            canvasRef.current?.focus();
          }}
          onSwapSlots={(fa, fi, ta, ti) => engineRef.current?.swapSlots(fa, fi, ta, ti)}
          onDropSlot={(area, idx, amount) => engineRef.current?.dropSlotItem(area, idx, amount)}
          onCraft={(recipeId) => engineRef.current?.tryCraft(recipeId)}
          onSelectHotbar={(idx) => engineRef.current?.selectHotbarSlot(idx)}
        />
      )}

      {hud && hud.phase === 'playing' && debugOpen && (
        <DebugModal
          hud={hud}
          unlocked={debugUnlocked}
          onUnlock={() => setDebugUnlocked(true)}
          onClose={() => {
            setDebugOpen(false);
            canvasRef.current?.focus();
          }}
          onToggleGodMode={() => engineRef.current?.setGodMode(!hud.godMode)}
          onRestoreVitals={() => engineRef.current?.restoreVitals()}
          onSetTime={(preset) => engineRef.current?.setTimePreset(preset)}
          onGiveKit={(kind) => engineRef.current?.giveDebugKit(kind)}
          onSpawnEnemy={(kind) => engineRef.current?.spawnDebugEnemy(kind)}
          onClearEnemies={() => engineRef.current?.clearAllEnemies()}
          onTeleportSpawn={() => engineRef.current?.teleportToSpawn()}
          onBoostDefense={(delta) => engineRef.current?.boostDefense(delta)}
        />
      )}

      {hud && (hud.phase === 'paused' || hud.phase === 'gameover') && !settingsOpen && (
        <StatusModal
          mode={hud.phase}
          stats={hud.stats}
          onResume={hud.phase === 'paused' ? handleTogglePause : undefined}
          onOpenSettings={hud.phase === 'paused' ? () => setSettingsOpen(true) : undefined}
          onRestart={handleStart}
          onTitle={() => {
            setInventoryOpen(false);
            setDebugOpen(false);
            setSettingsOpen(false);
            engineRef.current?.setPhase('title');
          }}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onChange={handleSettingsChange}
          onClose={() => {
            setSettingsOpen(false);
            if (hud?.phase === 'playing') {
              canvasRef.current?.focus();
            }
          }}
        />
      )}
    </main>
  );
}
