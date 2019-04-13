AFRAME.registerComponent('music-manager', {
    init () {
        this.onSoundEnded = this.onSoundEnded.bind(this)
        this.onMusicChange = this.onMusicChange.bind(this)
        this.onMusicPause = this.onMusicPause.bind(this)
        this.onMusicResume = this.onMusicResume.bind(this)
        this.fadeInAudio = this.fadeInAudio.bind(this)
        this.fadeOutAudio = this.fadeOutAudio.bind(this)
    },
    play () {
        const {el,onMusicChange,onMusicPause,onMusicResume} = this
        el.addEventListener('enter-vr',onMusicResume)
        el.addEventListener('exit-vr',onMusicPause)
        el.addEventListener('music-change',onMusicChange)
        el.addEventListener('music-pause',onMusicPause)
        el.addEventListener('music-resume',onMusicResume)
    },
    pause() {
        const {el,musicSrcDOM,onMusicChange,onMusicPause,onMusicResume} = this
        musicSrcDOM.removeEventListener('ended', onSoundEnded)
        el.removeEventListener('enter-vr',onMusicResume)
        el.removeEventListener('exit-vr',onMusicPause)
        el.removeEventListener('music-change',onMusicChange)
        el.removeEventListener('music-pause',onMusicPause)
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
            this.cacheDuration = evt.detail.cacheDuration
            AFRAME.scenes[0].emit('saveMusicBaseVolume', {audioID: this.musicSrcID, baseVolume:evt.detail.volume})
            this.musicSrcDOM.addEventListener('ended', onSoundEnded)
            if(el.is('vr-mode')){
                fadeInAudio()
            }
            return
        }
        if(document.querySelector(evt.detail.newsource).src===this.musicSrcDOM.src)
            return
        fadeOutAudio(this.cacheDuration)
        setTimeout(()=>{
            if(this.musicSrcDOM.volume!==0){
                this.musicSrcDOM.volume=0
                this.musicSrcDOM.pause()
            }
            this.musicSrcID=evt.detail.newsource
            this.cacheDuration = evt.detail.cacheDuration
            this.musicSrcDOM = document.querySelector(this.musicSrcID)
            const {musicSrcDOM,musicSrcID,onSoundEnded} = this
            AFRAME.scenes[0].emit('saveMusicBaseVolume', {audioID: musicSrcID, baseVolume:evt.detail.volume})
            let appState = AFRAME.scenes[0].systems.state.state
            if(appState.musicRecords[musicSrcID])
                musicSrcDOM.currentTime = appState.musicRecords[musicSrcID]
            musicSrcDOM.addEventListener('ended', onSoundEnded)
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
        this.fadeOutAudio(false)
    },
    fadeInAudio() {
        const {musicSrcID,musicSrcDOM,onSoundEnded} = this
        if(!musicSrcDOM)
            return
        let appState = AFRAME.scenes[0].systems.state.state
        let baseVolume =  appState.musicBaseVolumes[musicSrcID]
        let volIncrement = baseVolume/10
        musicSrcDOM.volume = 0
        musicSrcDOM.play()
        let fadeIn = setInterval(() => {
            if (musicSrcDOM.volume < baseVolume) {
                if(musicSrcDOM.volume + volIncrement >= baseVolume)
                    musicSrcDOM.volume=baseVolume
                else musicSrcDOM.volume += volIncrement;
            }
            if (musicSrcDOM.volume >= baseVolume) {
                clearInterval(fadeIn);
            }
        }, 100);
    },
    fadeOutAudio(cacheDuration) {
        const {musicSrcID,musicSrcDOM,onSoundEnded} = this
        if(!musicSrcDOM)
            return
        let volIncrement = musicSrcDOM.volume/8
        let fadeOut = setInterval(() => {
            if (musicSrcDOM.volume > 0) {
                if(musicSrcDOM.volume - volIncrement <= 0)
                    musicSrcDOM.volume = 0
                else musicSrcDOM.volume -= volIncrement;
            }
            if (musicSrcDOM.volume === 0) {
                musicSrcDOM.pause()
                if(cacheDuration)
                    AFRAME.scenes[0].emit('saveMusicRecords', {audioID: musicSrcID, resumeTime:musicSrcDOM.currentTime})
                else musicSrcDOM.currentTime=0
                musicSrcDOM.removeEventListener('ended', onSoundEnded)
                clearInterval(fadeOut);
            }
        }, 80);
    }
  });