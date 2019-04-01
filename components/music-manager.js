AFRAME.registerComponent('music-manager', {
    init : function () {
        this.onSoundEnded = this.onSoundEnded.bind(this)
        this.onMusicChange = this.onMusicChange.bind(this)
        this.onMusicPause = this.onMusicPause.bind(this)
        this.onMusicStop = this.onMusicStop.bind(this)
        this.onMusicResume = this.onMusicResume.bind(this)
        this.FadeInAudio = this.FadeInAudio.bind(this)
        this.FadeOutAudio = this.FadeOutAudio.bind(this)
        let queryResults = document.querySelectorAll('audio')
        queryResults.forEach((audio)=>{
            audio.load()
        })
    },
    play : function () {
        this.el.addEventListener('enter-vr',this.onMusicResume)
        this.el.addEventListener('exit-vr',this.onMusicPause)
        this.el.addEventListener('music-change',this.onMusicChange)
        this.el.addEventListener('music-pause',this.onMusicPause)
        this.el.addEventListener('music-stop',this.onMusicStop)
        this.el.addEventListener('music-resume',this.onMusicResume)
    },
    pause: function () {
        this.musicSrcDOM.removeEventListener('ended', this.onSoundEnded)
        this.el.removeEventListener('enter-vr',this.onMusicResume)
        this.el.removeEventListener('exit-vr',this.onMusicPause)
        this.el.removeEventListener('music-change',this.onMusicChange)
        this.el.removeEventListener('music-pause',this.onMusicPause)
        this.el.removeEventListener('music-stop',this.onMusicStop)
        this.el.removeEventListener('music-resume',this.onMusicResume)
    },
    onSoundEnded: function (evt) {
        evt.stopPropagation() 
        if(!this.loop)
            return
        this.musicSrcDOM.play();
    },
    onMusicChange: function (evt) { 
        evt.stopPropagation()
        this.loop = evt.detail.loop
        if(!this.musicSrcID){
            this.musicSrcID = evt.detail.newsource
            this.musicSrcDOM = document.querySelector(this.musicSrcID)
            AFRAME.scenes[0].emit('saveMusicBaseVolume', {audioID: this.musicSrcID, baseVolume:evt.detail.volume})
            this.musicSrcDOM.addEventListener('ended', this.onSoundEnded)
            this.cacheDuration = evt.detail.cacheDuration
            if(this.el.is('vr-mode')){
                this.FadeInAudio()
            }
            return
        }

        if(document.querySelector(evt.detail.newsource).src===this.musicSrcDOM.src)
            return

        this.FadeOutAudio("pause",this.cacheDuration)
        setTimeout(()=>{
            this.musicSrcID=evt.detail.newsource
            this.cacheDuration = evt.detail.cacheDuration
            AFRAME.scenes[0].emit('saveMusicBaseVolume', {audioID: this.musicSrcID, baseVolume:evt.detail.volume})
            this.musicSrcDOM = document.querySelector(this.musicSrcID)
            let appState = AFRAME.scenes[0].systems.state.state
            if(appState.musicRecords[this.musicSrcID])
                this.musicSrcDOM.currentTime = appState.musicRecords[this.musicSrcID]
            this.musicSrcDOM.addEventListener('ended', this.onSoundEnded)
            if(this.el.is('vr-mode')){
                this.FadeInAudio()
            }
        },1000)
    },
    onMusicResume: function (evt) { 
        evt.stopPropagation()
        this.FadeInAudio()
    },
    onMusicPause: function (evt) { 
        evt.stopPropagation()
        this.FadeOutAudio("pause",false)
    },
    onMusicStop: function (evt) { 
        evt.stopPropagation()
        this.FadeOutAudio("stop",false)
    },
    FadeInAudio: function () {
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
    FadeOutAudio: function (type,cacheDuration) {
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