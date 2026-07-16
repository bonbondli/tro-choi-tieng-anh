/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private isMuted: boolean = false;

  constructor() {
    // Check localStorage for mute preference
    const savedMute = localStorage.getItem("crossword_muted");
    this.isMuted = savedMute === "true";
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem("crossword_muted", String(this.isMuted));
    return this.isMuted;
  }

  getMuteState(): boolean {
    return this.isMuted;
  }

  private playTone(frequency: number, type: OscillatorType, duration: number, startTimeOffset: number = 0) {
    if (this.isMuted) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTimeOffset);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime + startTimeOffset);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTimeOffset + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime + startTimeOffset);
      osc.stop(ctx.currentTime + startTimeOffset + duration);
    } catch (e) {
      console.warn("Audio Context is blocked or not supported yet", e);
    }
  }

  playSuccess() {
    // A cheerful ascending arpeggio (C5 -> E5 -> G5)
    this.playTone(523.25, "sine", 0.15, 0);     // C5
    this.playTone(659.25, "sine", 0.15, 0.08);  // E5
    this.playTone(783.99, "sine", 0.25, 0.16);  // G5
  }

  playFailure() {
    // A sad descending buzz
    this.playTone(220.00, "triangle", 0.2, 0);  // A3
    this.playTone(185.00, "triangle", 0.3, 0.1); // F#3
  }

  playCellInput() {
    // Tiny subtle tap sound
    this.playTone(800, "sine", 0.05, 0);
  }

  playLevelComplete() {
    // Big happy celebration sound!
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // C5 to C6 scale
    notes.forEach((freq, idx) => {
      this.playTone(freq, "sine", 0.2, idx * 0.08);
    });
  }

  playBadgeUnlocked() {
    // High majestic fantasy chord
    this.playTone(440.00, "sine", 0.3, 0);      // A4
    this.playTone(554.37, "sine", 0.3, 0.05);   // C#5
    this.playTone(659.25, "sine", 0.3, 0.1);    // E5
    this.playTone(880.00, "sine", 0.5, 0.15);   // A5
  }
}

export const sound = new SoundManager();
