AFRAME.registerComponent('cutscene-player-choice', {
    schema : {
        triggerTimestamp:{type:"number"},
        choices:{type:"string"},
        sfx:{type:"string"},
        newFlag:{type:'string',default:"seen"},
        destination:{type:'string',default:""},
        newURL:{type:'string',default:""}
    },
    init:  function () {
      this.onTrackedVideoFrame = this.onTrackedVideoFrame.bind(this);
      this.choiceActivated = false
    },
    play: function () {
      this.video = document.querySelector(this.el.getAttribute('src'))
      this.video.ontimeupdate=this.onTrackedVideoFrame
    },
    onTrackedVideoFrame: function (event) {
      const {triggerTimestamp,choices} = this.data
      const {el,video,choiceActivated} = this
      if(video.currentTime>=triggerTimestamp && !choiceActivated){
        AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
        AFRAME.scenes[0].emit('addFlag',{flagKey:el.getAttribute('id'),flagValue:newFlag})
        el.setAttribute('dialogue',choices)
        video.pause()
        this.choiceActivated = true
        el.removeAttribute('cutscene-player-choice')
      }
      else if(video.currentTime>=video.duration){
        const {newURL,destination}=this.data;
        if(newURL){
            AFRAME.scenes[0].emit('changeURL',{newURL:newURL})
            this.video.ontimeupdate = null
            return
        }
        const eventDetail = {
            origin:el,
            destinationURL:destination
        }
        el.emit('clickNavigation',eventDetail,true)
        AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
        this.video.ontimeupdate = null
      }
    }
  });