AFRAME.registerComponent('video-player', {
    init: function () {
      this.playVideo = this.playVideo.bind(this);
      this.playVideoNextTick = this.playVideoNextTick.bind(this);
      this.pauseVideo = this.pauseVideo.bind(this)
      this.video = document.querySelector(this.el.getAttribute('src'))
      this.video.load()
    },
    play: function ()  {
      if(this.el.sceneEl.is('vr-mode')){
        this.el.emit('set-image-fade-in')
        if (this.video.readyState === 4 ) {
          this.video.play()
        }
        else setTimeout(this.playVideo,50)
      }
      window.addEventListener('vrdisplayactivate', this.playVideo);
      this.el.sceneEl.addEventListener('enter-vr', this.playVideoNextTick);
      this.el.sceneEl.addEventListener('exit-vr',this.pauseVideo)
    },
    pause: function ()  {
      this.el.sceneEl.removeEventListener('enter-vr', this.playVideoNextTick);
      this.el.sceneEl.removeEventListener('exit-vr',this.pauseVideo)
      window.removeEventListener('vrdisplayactivate', this.playVideo);
    },
    playVideoNextTick: function ()  {
      setTimeout(this.playVideo);
    },
    playVideo: function ()  {
      if ( this.video.readyState === 4 ) {
        this.video.play()
      }
      else setTimeout(this.playVideo,50)
    },
    pauseVideo: function () {
      this.video.pause()
    }
  });