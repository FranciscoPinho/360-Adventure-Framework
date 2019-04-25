AFRAME.registerComponent('cutscene-present-item', {
    schema : {
        triggerTimestamp:{type:"number"},
        solution:{type:"string"},
        sfx:{type:"string"},
        newFlag:{type:'string',default:"seen"}
    },
    init() {
      this.onItemPresented = this.onItemPresented.bind(this)
      this.tick = AFRAME.utils.throttleTick(this.tick, 500, this);
      this.video = document.querySelector(this.el.getAttribute('src'))
      this.choiceActivated = false
      const {sfx} = this.data
      if(sfx.correctSfx){
        this.correctSfx = document.querySelector(sfx.correctSfx)
        if(this.correctSfx)
            this.correctSfx.volume = sfx.correctVolume
      }
      if(sfx.wrongSfx){
          this.wrongSfx = document.querySelector(sfx.wrongSfx)
          if(this.wrongSfx)
              this.wrongSfx.volume = sfx.wrongVolume
      }
    },
    play(){
      const {el,onItemPresented} = this
      el.sceneEl.addEventListener('presentedItem',onItemPresented)
    },
    pause(){
      const {el,onItemPresented} = this
      el.sceneEl.removeEventListener('presentedItem',onItemPresented)
    },
    onItemPresented(evt){
        const {el,video,wrongSfx,correctSfx} = this
        if(evt.detail.itemID!==this.data.solution){
          if(wrongSfx)
            wrongSfx.play()
          video.currentTime=0
          video.play()
          this.choiceActivated=false
        }
        else if(correctSfx){
          el.removeAttribute('cutscene-present-item')
          correctSfx.play()
        }
    },
    tick(t, dt) {
      const {triggerTimestamp,newFlag,textSnippet} = this.data
      const {el,video,choiceActivated} = this
      if(video.currentTime>=triggerTimestamp && !choiceActivated){
        AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
        AFRAME.scenes[0].emit('addFlag',{flagKey:el.getAttribute('id'),flagValue:newFlag})
        el.sceneEl.emit('presentitem')
        video.pause()
        this.choiceActivated = true
      }
    }
  });