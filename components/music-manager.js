AFRAME.registerComponent('music-manager', {
    init () {
        this.onSoundEnded = this.onSoundEnded.bind(this)
        this.onMusicChange = this.onMusicChange.bind(this)
        this.onMusicPause = this.onMusicPause.bind(this)
        this.onMusicStop = this.onMusicStop.bind(this)
        this.onMusicResume = this.onMusicResume.bind(this)
        this.fadeInAudio = this.fadeInAudio.bind(this)
        this.fadeOutAudio = this.fadeOutAudio.bind(this)
    },
    play () {
        const {el,onMusicChange,onMusicPause,onMusicResume,onMusicStop} = this
        el.addEventListener('enter-vr',onMusicResume)
        el.addEventListener('exit-vr',onMusicPause)
        el.addEventListener('music-change',onMusicChange)
        el.addEventListener('music-pause',onMusicPause)
        el.addEventListener('music-stop',onMusicStop)
        el.addEventListener('music-resume',onMusicResume)
    },
    pause() {
        const {el,musicSrcDOM,onMusicChange,onMusicPause,onMusicResume,onMusicStop} = this
        musicSrcDOM.removeEventListener('ended', onSoundEnded)
        el.removeEventListener('enter-vr',onMusicResume)
        el.removeEventListener('exit-vr',onMusicPause)
        el.removeEventListener('music-change',onMusicChange)
        el.removeEventListener('music-pause',onMusicPause)
        el.removeEventListener('music-stop',onMusicStop)
        el.removeEventListener('music-resume',onMusicResume)
    },
    onSoundEnded(evt) {
        evt.stopPropagation() 
        if(!this.loop)
            return
        this.musicSrcDOM.play();
    },
    onMusicChange(evt) { 
        evt.stopPropagation()
        const {el,fadeInAudio,fadeOutAudio,onSoundEnded} = this
        this.loop = evt.detail.loop
        if(!this.musicSrcID){
            this.musicSrcID = evt.detail.newsource
            this.musicSrcDOM = document.querySelector(this.musicSrcID)
            AFRAME.scenes[0].emit('saveMusicBaseVolume', {audioID: this.musicSrcID, baseVolume:evt.detail.volume})
            this.musicSrcDOM.addEventListener('ended', onSoundEnded)
            this.cacheDuration = evt.detail.cacheDuration
            if(el.is('vr-mode')){
                fadeInAudio()
            }
            return
        }

        if(document.querySelector(evt.detail.newsource).src===this.musicSrcDOM.src)
            return
        fadeOutAudio("pause",this.cacheDuration)
        setTimeout(()=>{
            this.musicSrcID=evt.detail.newsource
            this.cacheDuration = evt.detail.cacheDuration
            AFRAME.scenes[0].emit('saveMusicBaseVolume', {audioID: this.musicSrcID, baseVolume:evt.detail.volume})
            this.musicSrcDOM = document.querySelector(this.musicSrcID)
            let appState = AFRAME.scenes[0].systems.state.state
            if(appState.musicRecords[this.musicSrcID])
                this.musicSrcDOM.currentTime = appState.musicRecords[this.musicSrcID]
            this.musicSrcDOM.addEventListener('ended', onSoundEnded)
            if(el.is('vr-mode')){
                fadeInAudio()
            }
        },1000)
    },
    onMusicResume(evt) { 
        evt.stopPropagation()
        this.fadeInAudio()
    },
    onMusicPause(evt) { 
        evt.stopPropagation()
        this.fadeOutAudio("pause",false)
    },
    onMusicStop(evt) { 
        evt.stopPropagation()
        this.fadeOutAudio("stop",false)
    },
    fadeInAudio() {
        let appState = AFRAME.scenes[0].systems.state.state
        let baseVolume =  appState.musicBaseVolumes[this.musicSrcID]
        let volIncrement = baseVolume/10
        this.musicSrcDOM.volume = 0
        this.musicSrcDOM.play()
        let fadeIn = setInterval(() => {
            if (this.musicSrcDOM.volume < baseVolume) {
                if(this.musicSrcDOM.volume + volIncrement >= baseVolume)
                    this.musicSrcDOM.volume=baseVolume
                else this.musicSrcDOM.volume += volIncrement;
            }
            if (this.musicSrcDOM.volume >= baseVolume) {
                clearInterval(fadeIn);
            }
        }, 100);
    },
    fadeOutAudio(type,cacheDuration) {
        let volIncrement = this.musicSrcDOM.volume/9
        let fadeOut = setInterval(() => {
            if (this.musicSrcDOM.volume > 0) {
                if(this.musicSrcDOM.volume - volIncrement <= 0)
                    this.musicSrcDOM.volume = 0
                else this.musicSrcDOM.volume -= volIncrement;
            }
            if (this.musicSrcDOM.volume === 0) {
                type==="pause" ? this.musicSrcDOM.pause() : this.musicSrcDOM.stop()
                if(cacheDuration)
                    AFRAME.scenes[0].emit('saveMusicRecords', {audioID: this.musicSrcID, resumeTime:this.musicSrcDOM.currentTime})
                this.musicSrcDOM.removeEventListener('ended', this.onSoundEnded)
                clearInterval(fadeOut);
            }
        }, 90);
    }
  });