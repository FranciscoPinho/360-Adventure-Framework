AFRAME.registerComponent('video-looper', {
    schema : {
      loopBegin:{type:"number",default:0.1},
      loopEnd:{type:"number",default:-1}
    },
    init() {
      this.onTrackedVideoFrame = this.onTrackedVideoFrame.bind(this)
    },
    play() {  
      this.video = document.querySelector(this.el.getAttribute('src'))
      this.video.ontimeupdate=this.onTrackedVideoFrame
    },
    pause() {
      this.video.ontimeupdate=undefined
    },
    onTrackedVideoFrame(event) {
      const {loopBegin,loopEnd} = this.data
      if(loopEnd===-1){
        if(this.video.currentTime>=this.video.duration-0.1){
          this.el.sceneEl.emit('looped-video')
          this.video.currentTime=loopBegin
          this.video.play()
        }
      }
      else{
        if(this.video.currentTime>=loopEnd){
          this.el.sceneEl.emit('looped-video')
          this.video.currentTime=loopBegin
          this.video.play();
        }
      }
    }
  });