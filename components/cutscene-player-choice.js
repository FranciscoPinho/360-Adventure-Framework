AFRAME.registerComponent('cutscene-player-choice', {
    schema : {
        triggerTimestamp:{type:"number"},
        choices:{type:"string"},
        sfx:{type:"string"},
        newFlag:{type:'string',default:"seen"},
        destination:{type:'string',default:""},
        newURL:{type:'string',default:""}
    },
    init() {
      this.choiceActivated = false
      this.tick = AFRAME.utils.throttleTick(this.tick, 500, this);
      this.video = document.querySelector(this.el.getAttribute('src'))
    },
    tick(t, dt) {
      const {triggerTimestamp,choices,newFlag} = this.data
      const {el,video,choiceActivated} = this
      if(video.currentTime>=triggerTimestamp && !choiceActivated){
        AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
        AFRAME.scenes[0].emit('addFlag',{flagKey:el.getAttribute('id'),flagValue:newFlag})
        el.setAttribute('dialogue',choices)
        video.pause()
        this.choiceActivated = true
      }
      else if(video.currentTime>=video.duration){
        const {newURL,destination}=this.data;
        if(newURL){
            AFRAME.scenes[0].emit('changeURL',{newURL:newURL})
            return
        }
        if(destination){
          const eventDetail = {
              origin:el,
              destinationURL:destination
          }
          el.sceneEl.emit('clickNavigation',eventDetail,true)
        }
      }
    }
  });