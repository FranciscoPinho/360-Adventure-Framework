AFRAME.registerComponent('play-on-enter-vr', {
    init: function () {
      this.playVideo = this.playVideo.bind(this);
      this.playVideoNextTick = this.playVideoNextTick.bind(this);
    },
    play: function ()  {
      window.addEventListener('vrdisplayactivate', this.playVideo);
      this.el.sceneEl.addEventListener('enter-vr', this.playVideoNextTick);
    },
    pause: function ()  {
      this.el.sceneEl.removeEventListener('enter-vr', this.playVideoNextTick);
      window.removeEventListener('vrdisplayactivate', this.playVideo);
    },
    playVideoNextTick: function ()  {
      if(!this.el.getAttribute('visible'))
        return
      setTimeout(this.playVideo);
    },
    playVideo: function ()  {
      if(!this.el.getAttribute('visible'))
        return
      if(!this.el.components.material) { return; }
      var video = this.el.components.material.material.map.image;
      if (!video) { return; }
      video.play();
    }
  });