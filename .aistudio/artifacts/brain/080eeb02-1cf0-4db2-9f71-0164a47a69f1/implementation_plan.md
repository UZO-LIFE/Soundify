# Soundify: Robust Audio Playback Engine Specification & Implementation Plan

A modular, provider-independent, and resilient audio playback engine for Soundify. Built on a central HTML5 `HTMLAudioElement` instance with strict separation between audio playback primitives, audio source resolution adapters, queue management, and UI consumers.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> This revision scopes work exclusively to the core audio engine and its verification harness, strictly respecting the scope constraint not to build catalogue pages or unrelated features.

- **Central Audio Singleton**: A single `HTMLAudioElement` instance lives outside the React component tree (in an event-driven `AudioPlaybackEngine` class) to completely eliminate race conditions, multiple tracks playing simultaneously, and audio cutoff on component unmount/re-renders.
- **Provider-Independent Source Adapters**: Track metadata (ID, title, artist, album art, duration) is decoupled from audio streams via an `AudioSourceAdapter` interface. Different stream resolvers (e.g., standard HTTP CDN streams, authorized provider URLs, signed streaming tokens) can be plugged in without changing engine code. If an audio source is missing or unauthorized, the engine emits a typed `Error` state instead of falsely reporting success.
- **Non-Destructive Queue & Shuffle**: The original queue order is immutably preserved. When shuffle is enabled, a shuffled index projection is used for traversal so disabling shuffle seamlessly restores original playlist ordering.
- **Strict State Truthfulness**: States (`idle`, `loading`, `playing`, `paused`, `buffering`, `ended`, `error`) are strictly driven by real DOM audio events (`playing`, `pause`, `waiting`, `canplay`, `timeupdate`, `ended`, `error`), guaranteeing the UI never displays a "playing" state unless the underlying audio element is actively outputting sound.

---

## 1. Overview & Core Concept

The Soundify Audio Engine provides a production-grade, reusable foundation for all audio playback across the application.

```
┌────────────────────────────────────────────────────────────────────────┐
│ UI Layer (React Components / Hooks)                                   │
│  useAudioEngine() · usePlaybackProgress() · Player Controls / Queue UI │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Dispatches Actions / Subscribes to State
┌──────────────────────────────────▼─────────────────────────────────────┐
│ AudioEngine (Core Controller & State Store)                            │
│  - Playback State Machine (idle, loading, playing, paused, buffering)  │
│  - Queue Manager (original queue, shuffle mapping, repeat logic)       │
│  - Volume & Seeking Controller                                         │
│  - Browser Autoplay Restriction Resolver                               │
└──────────────────┬──────────────────────────────────┬──────────────────┘
                   │ Resolves stream URL              │ Controls audio
┌──────────────────▼──────────────────┐ ┌─────────────▼──────────────────┐
│ AudioSourceAdapter Registry          │ │ HTML5 Audio Singleton          │
│  - StandardHttpSourceAdapter        │ │  - Single <audio> element      │
│  - AuthorizedProviderSourceAdapter   │ │  - Native DOM event listeners  │
│  - Fallback / Mock Tester Adapter   │ │  - Error & buffer handlers     │
└─────────────────────────────────────┘ └────────────────────────────────┘
```

- **What It Does**: Manages audio loading, playback, seeking, buffering, volume/mute, queue sequencing, and error recovery through a clean TypeScript API and React hook interface.
- **Target Audience**: All current and future Soundify playback surfaces (desktop player bar, mobile mini-player, full-screen player, playlist row triggers, keyboard shortcut handlers).
- **Key Value**: Rock-solid audio reliability with zero UI desynchronization, resilient error recovery, and seamless provider extensibility.

---

## 2. User Experience & Visual Design (Engine Verification Harness)

While the full Soundify client UI is preserved for subsequent phases, an isolated, dedicated **Audio Engine Interactive Test Harness** will be mounted in `App.tsx` to rigorously test and prove all requirements:

- **State & Telemetry Readout**: Real-time display of current state (`idle`, `loading`, `playing`, `paused`, `buffering`, `ended`, `error`), exact playback timestamps, buffered range percentages, active volume, and track details.
- **Comprehensive Transport Controls**:
  - Play / Pause / Stop
  - Previous Track / Next Track (with auto-transition testing)
  - Interactive scrub slider (click and drag seeking)
  - Volume slider and Mute toggle
  - Shuffle toggle with visual indicator of original vs shuffled order
  - Repeat mode cycle (`Off` ➔ `All` ➔ `One`)
- **Queue Management Inspector**:
  - Add test tracks to queue (including valid high-fidelity audio streams and intentionally invalid/unauthorized sources to verify error handling)
  - Remove track from queue
  - Reorder tracks (move up/down)
  - Click to jump to any track in queue
- **Edge-Case Simulation Triggers**:
  - Simulate network interruption / 404 stream error
  - Simulate unauthorized audio source
  - Simulate browser autoplay block with user gesture recovery

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Pure TypeScript Engine Core vs React-Managed Audio
- **Chosen Approach**: Pure TypeScript class `AudioEngine` maintaining the `HTMLAudioElement` singleton with an event emitter / subscriber pattern, wrapped by a lightweight React context and custom hooks.
- **Why**: React component lifecycles (mount/unmount/HMR/re-renders) frequently cause duplicate audio playback, memory leaks, and stuttering when audio elements are owned inside JSX. An external singleton completely decouples playback survival from view navigation.
- **Alternatives Considered**: Audio element in root `App.tsx` state (rejected due to re-render cascading and complex ref management across deeply nested components).

### Decision 2: Provider-Independent Audio Source Adapter
- **Chosen Approach**: An `AudioSourceAdapter` abstraction that receives a `Track` object and asynchronously resolves an authorized playable stream (`PlayableSource`).
- **Why**: Future-proofs the codebase for real API integrations (OAuth-secured streaming URLs, signed CDN links, HLS/DASH streams, or cloud storage) without altering playback logic.
- **Error Transparency**: If a source is unauthorized or unavailable, the adapter returns `{ status: 'unauthorized' | 'not_found' | 'error' }`, triggering a clean, descriptive engine error rather than fake playback or silent failure.

### Decision 3: Non-Destructive Queue & Shuffle Logic
- **Chosen Approach**: The `queue` array remains unchanged. An internal `shuffleOrder: number[]` array (generated via Fisher-Yates shuffle) maps playback position when shuffle is active.
- **Why**: Toggling shuffle on and off preserves the user's curated or album track order without data loss.

---

## 4. Technical Architecture & Data Strategy

### A. Core State Machine & TypeScript Interfaces

```typescript
export type PlaybackStatus = 
  | 'idle' 
  | 'loading' 
  | 'playing' 
  | 'paused' 
  | 'buffering' 
  | 'ended' 
  | 'error';

export type RepeatMode = 'off' | 'all' | 'one';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  durationMs?: number;
  sourceProvider: string; // e.g. 'direct_http', 'authorized_cdn'
  sourceReference: string; // Stream URL, token reference, or asset URI
}

export interface PlaybackState {
  status: PlaybackStatus;
  currentTrack: Track | null;
  currentTimeSec: number;
  durationSec: number;
  bufferedPercent: number;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  currentIndex: number;
  errorMessage: string | null;
}

export interface AudioSourceAdapter {
  id: string;
  canHandle(track: Track): boolean;
  resolveSource(track: Track): Promise<PlayableAudioSource>;
}

export interface PlayableAudioSource {
  streamUrl: string;
  format?: string;
  expiresAt?: number;
}
```

### B. Event Lifecycle & Synchronization Flow

```
User Click Play ──► engine.play()
                        │
                        ├─► Set state: 'loading'
                        ├─► Adapter resolves playable stream URL
                        ├─► audio.src = streamUrl; audio.load()
                        │
    ┌───────────────────┴───────────────────┐
    ▼                                       ▼
audio.onplay ──► Set 'loading'          audio.onerror ──► Set 'error'
audio.onplaying ──► Set 'playing'                          Emit error message
audio.onwaiting ──► Set 'buffering'
audio.ontimeupdate ──► Update currentTimeSec & progress
audio.onended ──► Check repeatMode:
                    - 'one': seek(0) & play()
                    - 'all' / 'off': advanceToNextTrack()
```

### C. File & Module Structure

- `src/audio/types.ts`: Comprehensive TypeScript interfaces, enums, and types.
- `src/audio/AudioSourceAdapter.ts`: Adapter registry and standard source resolvers.
- `src/audio/AudioEngine.ts`: The central singleton class encapsulating `HTMLAudioElement`, event listeners, queue management, volume, and playback state.
- `src/audio/AudioContext.tsx`: React Context and custom hooks (`useAudioEngine`, `usePlaybackProgress`) providing optimal rendering with zero unnecessary re-renders.
- `src/audio/testSources.ts`: Legitimate, verified open-access audio test tracks (high-fidelity CC audio streams + intentional error test cases).
- `src/App.tsx`: Clean, focused testing harness rendering real-time telemetry, transport controls, queue inspector, and test buttons.

---

## 5. Execution Steps

1. **Audio Types & Contracts**: Define all engine types, states, track models, and adapter contracts in `src/audio/types.ts`.
2. **Audio Source Adapters**: Implement `AudioSourceAdapter` registry supporting direct streaming URLs and provider resolution with explicit error handling.
3. **Core `AudioEngine` Singleton**: Implement the central engine class with native HTML5 Audio bindings, complete state machine, seeking, buffering, volume, shuffle projection, and queue mechanics.
4. **React Integration & Hooks**: Create `AudioContext.tsx` with optimized selectors (`useAudioEngine`, `usePlaybackProgress`) ensuring progress updates do not trigger heavy re-renders across static controls.
5. **Verification Harness & Testing**: Assemble a diagnostic test harness in `App.tsx` verifying all 8 specification requirements (play, pause, next, prev, seek, volume, mute, shuffle, repeat, queue reorder, buffering, error recovery, autoplay handling).
6. **Compilation & Lint Verification**: Run `compile_applet` and `lint_applet` to verify clean build and type safety.
