export class AudioService {
    constructor(settingsService) {
        this.settings = settingsService;
        this.bgm = null; // HTMLAudioElement for music
        this.currentBgm = null;
        this.sfxCache = new Map(); // name -> HTMLAudioElement
        this.base = 'src/assets/sounds';
        // mapping names to filenames
        this.bgmFiles = {
            menu: ['bgm/menu_theme.mp3', 'bgm/menu_theme.ogg'],
            game: ['bgm/game_theme.mp3', 'bgm/game_theme.ogg']
        };
        this.sfxFiles = {
            click: ['sfx/click.wav', 'sfx/click.mp3', 'sfx/click.ogg'],
            confirm: ['sfx/confirm.wav', 'sfx/confirm.mp3', 'sfx/confirm.ogg'],
            cancel: ['sfx/cancel.wav', 'sfx/cancel.mp3', 'sfx/cancel.ogg'],
            place_ship: ['sfx/place_ship.mp3'],
            rotate_ship: ['sfx/rotate_ship.mp3'],
            hit: ['sfx/hit.mp3'],
            miss: ['sfx/miss.mp3'],
            sink: ['sfx/sink.mp3'],
            victory: ['sfx/victory.mp3'],
            defeat: ['sfx/defeat.mp3']
        };
    }

    init() {
        // Prepare a single BGM element
        this.bgm = new Audio();
        this.bgm.loop = true;
        this.applyVolumes();
        console.log('🔊 AudioService initialized - SFX volume:', this.sfxVolume);
        // Try to unlock audio on first user gesture
        const unlock = () => {
            try { this.bgm.play().then(() => { this.bgm.pause(); }); } catch {}
            console.log('🔓 Audio unlocked on user gesture');
            window.removeEventListener('pointerdown', unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: true });
    }

    applyVolumes() {
        const s = this.settings?.getSettings?.() ?? { bgmVolume: 0.6, sfxVolume: 0.8 };
        if (this.bgm) this.bgm.volume = s.bgmVolume;
        this.sfxVolume = s.sfxVolume;
    }

    setBGMVolume(v) { if (this.bgm) this.bgm.volume = Math.max(0, Math.min(1, v)); }
    setSFXVolume(v) { this.sfxVolume = Math.max(0, Math.min(1, v)); }

    stopBGM() { try { this.bgm.pause(); } catch {} }

    playBGM(kind = 'menu') {
        const files = this.bgmFiles[kind];
        if (!files) return;
        const src = this.pickExisting(files);
        if (!src) return;
        if (this.currentBgm === src) return; // already set
        this.currentBgm = src;
        this.bgm.src = `${this.base}/${src}`;
        this.applyVolumes();
        // try to play, may be blocked until first interaction
        this.bgm.play().catch(() => {/* ignored until gesture */});
    }

    playSFX(name) {
        console.log(`🎵 Attempting to play SFX: ${name}`);
        const files = this.sfxFiles[name];
        if (!files) {
            console.warn(`❌ SFX not found in mapping: ${name}`);
            return;
        }
        const src = this.pickExisting(files);
        if (!src) {
            console.warn(`❌ No source file for SFX: ${name}`);
            return;
        }
        
        const fullPath = `${this.base}/${src}`;
        console.log(`🔊 Playing SFX from: ${fullPath}, volume: ${this.sfxVolume ?? 0.8}`);
        
        try {
            // Create a new Audio instance each time to allow overlapping sounds
            const audio = new Audio(fullPath);
            const vol = this.sfxVolume ?? 0.8;
            audio.volume = vol;
            
            audio.addEventListener('loadeddata', () => {
                console.log(`✅ SFX loaded: ${name}`);
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`❌ SFX load error for ${name}:`, e);
                this.playBeepFallback(name);
            });
            
            audio.play().then(() => {
                console.log(`▶️ SFX playing: ${name}`);
            }).catch(err => {
                console.warn(`⚠️ SFX play failed for ${name}:`, err.message);
                this.playBeepFallback(name);
            });
        } catch (err) {
            console.error(`❌ SFX exception for ${name}:`, err);
            this.playBeepFallback(name);
        }
    }

    pickExisting(candidates) {
        // Basic pick: return first candidate; actual file existence isn't
        // checked here due to browser restrictions, but this allows fallbacks.
        return candidates[0];
    }

    playBeepFallback(tag) {
        try {
            const ctx = this._ctx || (this._ctx = new (window.AudioContext || window.webkitAudioContext)());
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime;
            // Frequency mapping simple
            const freqMap = {
                hit: 520,
                miss: 300,
                sink: 180,
                victory: 640,
                defeat: 160,
                place_ship: 440,
                rotate_ship: 480,
                click: 400,
                confirm: 500,
                cancel: 260
            };
            osc.frequency.value = freqMap[tag] || 400;
            osc.type = 'sine';
            gain.gain.setValueAtTime((this.sfxVolume ?? 0.5) * 0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.27);
            console.log(`🔁 Fallback beep for '${tag}'`);
        } catch (e) {
            console.warn('Fallback beep failed:', e);
        }
    }
}