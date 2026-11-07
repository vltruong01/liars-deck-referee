// Original procedural effects: all sound is generated locally after a user gesture.
export class AudioDirector {
  constructor() { this.ctx=null; this.volume=.45; }
  unlock() {
    try {
      if(!this.ctx) {
        this.ctx=new (window.AudioContext||window.webkitAudioContext)();
        this.master=this.ctx.createGain();
        const limiter=this.ctx.createDynamicsCompressor(); limiter.threshold.value=-8; limiter.ratio.value=12;
        this.master.connect(limiter); limiter.connect(this.ctx.destination);
      }
      this.master.gain.setValueAtTime(this.volume,this.ctx.currentTime);
      const resumed=this.ctx.resume(); resumed?.catch(()=>{});
    } catch { /* Visual gameplay remains available if the device has no audio. */ }
  }
  setVolume(value) { this.volume=value; if(this.ctx) this.master.gain.setTargetAtTime(value,this.ctx.currentTime,.03); }
  tone(freq,duration,volume=.2,type='sine',delay=0,endFreq=freq) {
    if(!this.ctx) return;
    const t=this.ctx.currentTime+delay, osc=this.ctx.createOscillator(), gain=this.ctx.createGain();
    osc.type=type; osc.frequency.setValueAtTime(freq,t); osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq,1),t+duration);
    gain.gain.setValueAtTime(.0001,t); gain.gain.exponentialRampToValueAtTime(volume,t+.006); gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(gain); gain.connect(this.master); osc.start(t); osc.stop(t+duration+.02);
  }
  noise(duration,volume,cutoff=3000,delay=0) {
    if(!this.ctx) return;
    const t=this.ctx.currentTime+delay, buffer=this.ctx.createBuffer(1,Math.ceil(this.ctx.sampleRate*duration),this.ctx.sampleRate), data=buffer.getChannelData(0);
    // Audio texture only. Never used for gameplay randomness.
    for(let i=0;i<data.length;i++) data[i]=Math.random()*2-1;
    const source=this.ctx.createBufferSource(), filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();
    source.buffer=buffer; filter.type='lowpass'; filter.frequency.value=cutoff;
    gain.gain.setValueAtTime(volume,t); gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    source.connect(filter); filter.connect(gain); gain.connect(this.master); source.start(t);
  }
  select() { this.tone(145,.5,.08,'sine',0,55); this.noise(.15,.07,1500); }
  cock() { this.noise(.085,.35,5500); this.tone(760,.08,.08,'triangle'); }
  heartbeat() { this.tone(65,.18,.3,'sine',0,34); this.tone(60,.19,.2,'sine',.23,30); }
  breathe() {
    if(!this.ctx)return;
    const t=this.ctx.currentTime, duration=1.02;
    const buffer=this.ctx.createBuffer(1,Math.ceil(this.ctx.sampleRate*duration),this.ctx.sampleRate);
    const samples=buffer.getChannelData(0);
    for(let i=0;i<samples.length;i++){
      const u=i/samples.length;
      // Two soft, asymmetric air envelopes: inhale then a longer nervous exhale.
      const envelope=u<.36?Math.sin(Math.PI*u/.36)*.5:Math.sin(Math.PI*(u-.36)/.64)*.85;
      samples[i]=(Math.random()*2-1)*Math.max(0,envelope);
    }
    const air=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();
    air.buffer=buffer;filter.type='bandpass';filter.frequency.setValueAtTime(950,t);filter.frequency.linearRampToValueAtTime(520,t+duration);filter.Q.value=.65;
    gain.gain.value=.16;air.connect(filter);filter.connect(gain);gain.connect(this.master);air.start(t);
  }
  click() { this.noise(.045,.55,6500); this.tone(1300,.035,.12,'triangle',.01,180); }
  bang() {
    this.noise(.065,.95,11000); this.noise(.65,.6,3400,.025);
    this.tone(140,.65,.65,'sine',0,24);
    this.noise(1.7,.16,270,.1); // Low-pass aftermath, followed by a fading ear ring.
    this.tone(2400,1.8,.025,'sine',.12,1700);
  }
}
