AFRAME.registerComponent('music-manager', {
    init : function () {
        this.onSoundEnded = this.onSoundEnded.bind(this)
        this.onMusicChange = this.onMusicChange.bind(this)
        this.onMusicPause = this.onMusicPause.bind(this)
        this.onMusicStop = this.onMusicStop.bind(this)
        this.onMusicResume = this.onMusicResume.bind(this)
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
            this.musicSrcDOM.volume=evt.detail.volume
            this.musicSrcDOM.addEventListener('ended', this.onSoundEnded)
            this.cacheDuration = evt.detail.cacheDuration
            if(this.el.is('vr-mode')){
                this.musicSrcDOM.play()
                //this.musicSrcDOM.animate({volume:1})
            }
            return
        }
        if(document.querySelector(evt.detail.newsource).src===this.musicSrcDOM.src)
            return
        //this.musicSrcDOM.animate({volume:0})
        let appState = AFRAME.scenes[0].systems.state.state
        if(this.cacheDuration)
            AFRAME.scenes[0].emit('saveMusicRecords', {audioID: this.musicSrcID, resumeTime:this.musicSrcDOM.currentTime})
        this.musicSrcDOM.pause()
        this.musicSrcDOM.removeEventListener('ended', this.onSoundEnded)
        this.musicSrcID=evt.detail.newsource
        this.cacheDuration = evt.detail.cacheDuration
        this.musicSrcDOM = document.querySelector(this.musicSrcID)
        if(appState.musicRecords[this.musicSrcID])
            this.musicSrcDOM.currentTime = appState.musicRecords[this.musicSrcID]
        this.musicSrcDOM.volume=evt.detail.volume
        this.musicSrcDOM.addEventListener('ended', this.onSoundEnded)
        if(this.el.is('vr-mode')){
            this.musicSrcDOM.play()
            //this.musicSrcDOM.animate({volume:1})
        }
    },
    onMusicResume: function (evt) { 
        evt.stopPropagation()
        this.musicSrcDOM.play()
        //this.musicSrcDOM.animate({volume:1})
    },
    onMusicPause: function (evt) { 
        evt.stopPropagation()
        //this.musicSrcDOM.animate({volume:0})
        AFRAME.scenes[0].emit('saveMusicRecords', {audioID: this.musicSrcID, resumeTime:this.musicSrcDOM.currentTime})
        this.musicSrcDOM.pause()
    },
    onMusicStop: function (evt) { 
        evt.stopPropagation()
        //this.musicSrcDOM.animate({volume:0})
        AFRAME.scenes[0].emit('saveMusicRecords', {audioID: this.musicSrcID, resumeTime:0})
        this.musicSrcDOM.stop()
    }
  });