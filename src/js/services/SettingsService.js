export class SettingsService {
    constructor(storageKey = 'bn-settings') {
        this.key = storageKey;
        this.defaults = {
            language: 'es',
            bgmVolume: 0.6, // 0..1
            sfxVolume: 0.8, // 0..1
            muted: false
        };
        this.state = this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(this.key);
            const parsed = raw ? JSON.parse(raw) : {};
            return { ...this.defaults, ...parsed };
        } catch (e) {
            console.warn('Settings load error:', e);
            return { ...this.defaults };
        }
    }

    save() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.state));
        } catch (e) {
            console.warn('Settings save error:', e);
        }
    }

    getSettings() { return { ...this.state }; }

    setLanguage(lang) {
        if (!['es', 'en'].includes(lang)) return;
        this.state.language = lang;
        this.save();
    }

    setBGMVolume(v) {
        const vol = Math.max(0, Math.min(1, Number(v)));
        this.state.bgmVolume = isNaN(vol) ? this.defaults.bgmVolume : vol;
        this.save();
    }

    setSFXVolume(v) {
        const vol = Math.max(0, Math.min(1, Number(v)));
        this.state.sfxVolume = isNaN(vol) ? this.defaults.sfxVolume : vol;
        this.save();
    }

    setMuted(flag) {
        this.state.muted = !!flag;
        this.save();
    }
}