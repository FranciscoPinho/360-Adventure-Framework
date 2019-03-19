AFRAME.registerComponent('music-manager', {
    init : function () {
        this.onSoundEnded = this.onSoundEnded.bind(this)
        this.onMusicChange = this.onMusicChange.bind(this)
        this.onMusicPause = this.onMusicPause.bind(this)
        this.onMusicStop = this.onMusicStop.bind(this)
        this.onMusicResume = this.onMusicResume.bind(this)
    },
    play : function () {
        this.el.addEventListener('sound-ended', this.onSoundEnded)
        this.el.addEventListener('enter-vr',this.onMusicResume)
        this.el.addEventListener('exit-vr',this.onMusicPause)
        this.el.addEventListener('music-change',this.onMusicChange)
        this.el.addEventListener('music-pause',this.onMusicPause)
        this.el.addEventListener('music-stop',this.onMusicStop)
        this.el.addEventListener('music-resume',this.onMusicResume)
    },
    pause: function () {
        this.el.removeEventListener('sound-ended', this.onSoundEnded)
        this.el.removeEventListener('enter-vr',this.onMusicResume)
        this.el.removeEventListener('exit-vr',this.onMusicPause)
        this.el.removeEventListener('music-change',this.onMusicChange)
        this.el.removeEventListener('music-pause',this.onMusicPause)
        this.el.removeEventListener('music-resume',this.onMusicResume)
    },
    onSoundEnded: function (evt) {
        if(!this.loop)
            return
        evt.stopPropagation() 
        this.el.components.sound.playSound()
    },
    onMusicChange: function (evt) { 
        evt.stopPropagation()
        this.loop = evt.detail.loop
        if(!this.el.components.sound){
            this.el.setAttribute('sound',{src:evt.detail.newsource})
            if(!document.querySelector('.a-enter-vr.a-hidden'))
                this.el.components.sound.playSound()
            return
        }
        if(document.querySelector(evt.detail.newsource).getAttribute('src')===this.el.getAttribute('sound').src)
            return
        this.el.components.sound.stopSound()
        this.el.setAttribute('sound',{src:evt.detail.newsource})
        if(!document.querySelector('.a-enter-vr.a-hidden'))
            this.el.components.sound.playSound()
    },
    onMusicResume: function (evt) { 
        evt.stopPropagation()
        this.el.components.sound.playSound();
    },
    onMusicPause: function (evt) { 
        evt.stopPropagation()
        this.el.components.sound.pauseSound();
    },
    onMusicStop: function (evt) { 
        evt.stopPropagation()
        this.el.components.sound.stopSound();
    }
  });