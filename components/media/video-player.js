AFRAME.registerComponent('video-player', {
    schema:{
      cutscene:{type:"boolean",default:false},
      removeEntityOnEnd:{type:"boolean",default:false},
      videoVolume:{type:"number",default:1},
      pauseBackgroundSong:{type:"boolean",default:false},
      flatCutscene:{type:"boolean",default:false},
      playOnce:{type:"boolean",default:false},
      endTime:{type:"number"}
    },
    init() {
      this.playVideo = this.playVideo.bind(this);
      this.playVideoNextTick = this.playVideoNextTick.bind(this);
      this.pauseVideo = this.pauseVideo.bind(this)
      this.appState = AFRAME.scenes[0].systems.state.state
      this.video = document.querySelector(this.el.getAttribute('src'))
      this.tick = AFRAME.utils.throttleTick(this.tick, this.data.endTime ? 250:50000, this);
      this.alreadyPlayed=false
    },
    tick(){
      if(!this.data.endTime)
        return
      const {cutscene,flatCutscene,endTime,removeEntityOnEnd,pauseBackgroundSong} = this.data
      const {el,video} = this
      if(video.currentTime>=endTime && !el.getAttribute('video-looper')){
        video.pause()
        el.removeAttribute('subtitles')
        this.alreadyPlayed=true
        if(cutscene || flatCutscene)
          AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
        AFRAME.scenes[0].emit('addFlag',{flagKey:el.id,flagValue:"seen"})
        if(pauseBackgroundSong)
          el.sceneEl.emit('music-resume')
        if(removeEntityOnEnd)
          el.parentNode.removeChild(el)
        this.tick = AFRAME.utils.throttleTick(()=>{}, 50000, this);
      }
    },
    play()  {
      const {el,playVideo,playVideoNextTick,pauseVideo,video,appState} = this
      const {cutscene,videoVolume,removeEntityOnEnd,pauseBackgroundSong,flatCutscene,playOnce,endTime} = this.data
      if(appState.playOnceSources.indexOf(el.getAttribute('src'))!==-1){
        el.removeAttribute('video-player')
        return
      }
      video.currentTime = 0
      video.volume=videoVolume
      if(el.sceneEl.is('vr-mode')){
        el.emit('set-image-fade-in')
        playVideo()
      }
      if(playOnce)
        AFRAME.scenes[0].emit('addPlayOnceSources', {source:el.getAttribute('src')});
      if(cutscene || flatCutscene){
        if(pauseBackgroundSong)
          el.sceneEl.emit('music-pause')
        AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
        if(!endTime)
          video.addEventListener('ended',()=>{
            if(!el.getAttribute('video-looper'))
              this.alreadyPlayed=true
            AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
            AFRAME.scenes[0].emit('addFlag',{flagKey:el.id,flagValue:"seen"})
            if(pauseBackgroundSong)
              el.sceneEl.emit('music-resume')
            if(removeEntityOnEnd)
              el.parentNode.removeChild(el)
          },{once:true})
      }
      window.addEventListener('vrdisplayactivate', playVideo);
      el.sceneEl.addEventListener('enter-vr', playVideoNextTick);
      el.sceneEl.addEventListener('exit-vr', pauseVideo)
      el.sceneEl.addEventListener('resume-video', playVideo)
      el.sceneEl.addEventListener('pause-video', pauseVideo)
    },
    pause()  {
      const {el,playVideo,playVideoNextTick,pauseVideo} = this
      el.sceneEl.removeEventListener('enter-vr', playVideoNextTick);
      el.sceneEl.removeEventListener('exit-vr', pauseVideo)
      el.sceneEl.removeEventListener('pause-video', pauseVideo)
      el.sceneEl.removeEventListener('resume-video', playVideo)
      window.removeEventListener('vrdisplayactivate', playVideo);
    },
    playVideoNextTick()  {
      setTimeout(this.playVideo);
    },
    playVideo()  {
        const {video,playVideo,alreadyPlayed} = this
        if(alreadyPlayed)
          return
        video.readyState === 4 ? video.play() : setTimeout(()=>playVideo(),50)
    },
    pauseVideo() {
      this.video.pause()
    }
  });