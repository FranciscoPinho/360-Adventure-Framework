AFRAME.registerComponent('video-looper', {
    schema : {
      loopBegin:{type:"number",default:0.1},
      loopEnd:{type:"number",default:-1},
      muted:{type:"boolean",default:false}
    },
    init:  function () {
      this.onTrackedVideoFrame = this.onTrackedVideoFrame.bind(this)
      this.video = this.el.components.material.material.map.image;
      this.video.muted=this.data.muted
      this.video.ontimeupdate=this.onTrackedVideoFrame
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