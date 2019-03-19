AFRAME.registerComponent('music-manager', {
    init : function () {
        this.onSoundEnded = this.onSoundEnded.bind(this)
        this.onMusicChange = this.onMusicChange.bind(this)
        this.onMusicPause = this.onMusicPause.bind(this)
        this.onMusicStop = this.onMusicStop.bind(this)
        this.onMusicResume = this.onMusicResume.bind(this)
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
        document.querySelector(this.musicSrc).removeEventListener('ended', this.onSoundEnded)
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
        document.querySelector(this.musicSrc).play();
    },
    onMusicChange: function (evt) { 
        evt.stopPropagation()
        this.loop = evt.detail.loop
        if(!this.musicSrc){
            this.musicSrc = evt.detail.newsource
            document.querySelector(this.musicSrc).addEventListener('ended', this.onSoundEnded)  
            document.querySelector(this.musicSrc).load()
            if(this.el.is('vr-mode')){
                document.querySelector(this.musicSrc).volume=0.1
                document.querySelector(this.musicSrc).play()
                //document.querySelector(this.musicSrc).animate({volume:1})
            }
            return
        }
        if(document.querySelector(evt.detail.newsource).src===document.querySelector(this.musicSrc).src)
            return
        
        //document.querySelector(this.musicSrc).animate({volume:0})
        document.querySelector(this.musicSrc).pause()
        document.querySelector(this.musicSrc).removeEventListener('ended', this.onSoundEnded)
        this.musicSrc=evt.detail.newsource
        document.querySelector(this.musicSrc).addEventListener('ended', this.onSoundEnded)
        document.querySelector(this.musicSrc).load()
        if(this.el.is('vr-mode')){
            document.querySelector(this.musicSrc).volume=0.1
            document.querySelector(this.musicSrc).play()
            //document.querySelector(this.musicSrc).animate({volume:1})
        }
    },
    onMusicResume: function (evt) { 
        evt.stopPropagation()
        document.querySelector(this.musicSrc).volume=0.1
        document.querySelector(this.musicSrc).play()
        //document.querySelector(this.musicSrc).animate({volume:1})
    },
    onMusicPause: function (evt) { 
        evt.stopPropagation()
        //document.querySelector(this.musicSrc).animate({volume:0})
        document.querySelector(this.musicSrc).pause()
    },
    onMusicStop: function (evt) { 
        evt.stopPropagation()
        //document.querySelector(this.musicSrc).animate({volume:0})
        document.querySelector(this.musicSrc).stop()
    }
  });