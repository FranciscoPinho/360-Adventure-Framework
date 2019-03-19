AFRAME.registerComponent('video-looper', {
    schema : {
      loopBegin:{type:"number",default:1},
      loopEnd:{type:"number",default:-1}
    },
    init:  function () {
      this.onTrackedVideoFrame = this.onTrackedVideoFrame.bind(this);
      this.loaded = this.loaded.bind(this);
    },
    play: function () {
      this.video = document.querySelector(this.el.getAttribute('src'))
      this.video.ontimeupdate=this.onTrackedVideoFrame
      //this.el.addEventListener('loaded',this.loaded)
    },
    loaded: function () {
      setTimeout(()=>{
        if(!this.video)
        if(this.el.components.material.material.map){
          this.video = this.el.components.material.material.map.image;
          this.video.ontimeupdate=this.onTrackedVideoFrame
        }
      },100)
    },
    pause: function () {
      this.el.removeEventListener('loaded',this.loaded)
      this.video.ontimeupdate=undefined
    },
    onTrackedVideoFrame: function (event) {
      const {loopBegin,loopEnd} = this.data
      if(loopEnd===-1){
        if(this.video.currentTime>=this.video.duration-1)
          this.video.currentTime=loopBegin
      }
      else{
        if(this.video.currentTime>=loopEnd)
          this.video.currentTime=loopBegin
      }
    }
  });