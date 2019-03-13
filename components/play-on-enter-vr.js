AFRAME.registerComponent('play-on-enter-vr', {
    init: function () {
      this.playMedia = this.playMedia.bind(this);
      this.playMediaNextTick = this.playMediaNextTick.bind(this);
    },
    play: function ()  {
      window.addEventListener('vrdisplayactivate', this.playMedia);
      this.el.sceneEl.addEventListener('enter-vr', this.playMediaNextTick);
    },
    pause: function ()  {
      this.el.sceneEl.removeEventListener('enter-vr', this.playMediaNextTick);
      window.removeEventListener('vrdisplayactivate', this.playMedia);
    },
    playMediaNextTick: function ()  {
      if(!this.el.getAttribute('visible'))
        return
      setTimeout(this.playMedia);
    },
    playMedia: function ()  {
      if(!this.el.getAttribute('visible'))
        return
      let music = this.el.components.sound
      let sceneMusic = this.el.sceneEl.components.sound
      if(music)
        music.playSound();
      else if(sceneMusic)
        sceneMusic.playSound();
      var video = this.el.components.material.material.map.image;
      if (!video) { return; }
      video.play();
    }
  });