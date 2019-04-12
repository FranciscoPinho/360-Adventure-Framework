AFRAME.registerComponent('video-looper', {
    schema : {
      loopBegin:{type:"number",default:1},
      loopEnd:{type:"number",default:-1}
    },
    init:  function () {
      this.onTrackedVideoFrame = this.onTrackedVideoFrame.bind(this);;
    },
    play: function () {
      this.video = document.querySelector(this.el.getAttribute('src'))
      this.video.ontimeupdate=this.onTrackedVideoFrame
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