AFRAME.registerComponent('play-on-enter-vr', {
    init: function () {
      this.playVideo = this.playVideo.bind(this);
      this.playVideoNextTick = this.playVideoNextTick.bind(this);
      this.pauseVideo = this.pauseVideo.bind(this)
    },
    play: function ()  {
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
      if(!this.el.components.material) { return; }
      var video = this.el.components.material.material.map.image;
      if (!video) { return; }
      video.play();
    },
    pauseVideo: function () {
      if(!this.el.components.material) { return; }
      var video = this.el.components.material.material.map.image;
      if (!video) { return; }
      video.pause();
    }
  });