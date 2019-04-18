AFRAME.registerComponent('video-player', {
    init() {
      this.playVideo = this.playVideo.bind(this);
      this.playVideoNextTick = this.playVideoNextTick.bind(this);
      this.pauseVideo = this.pauseVideo.bind(this)
      this.video = document.querySelector(this.el.getAttribute('src'))
    },
    play()  {
      const {el,playVideo,playVideoNextTick,pauseVideo} = this
      this.video.currentTime=0
      if(el.sceneEl.is('vr-mode')){
        el.emit('set-image-fade-in')
        playVideo()
      }
      window.addEventListener('vrdisplayactivate', playVideo);
      el.sceneEl.addEventListener('enter-vr', playVideoNextTick);
      el.sceneEl.addEventListener('exit-vr', pauseVideo)
    },
    pause()  {
      const {el,playVideo,playVideoNextTick,pauseVideo} = this
      el.sceneEl.removeEventListener('enter-vr', playVideoNextTick);
      el.sceneEl.removeEventListener('exit-vr', pauseVideo)
      window.removeEventListener('vrdisplayactivate', playVideo);
    },
    playVideoNextTick()  {
      setTimeout(this.playVideo);
    },
    playVideo()  {
        const {video,playVideo} = this
        video.readyState === 4 ? video.play() : setTimeout(()=>playVideo(),50)
    },
    pauseVideo() {
      this.video.pause()
    }
  });