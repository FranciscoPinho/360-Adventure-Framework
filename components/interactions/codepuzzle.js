AFRAME.registerComponent('codepuzzle', {
    schema : {
        startEvents:{type:"array",default:['click','triggerdown']},
        solution:{type:"string"},
        sfx:{type:"string"},
        newFlag:{type:'string',default:"solved"}
    },
    init() {

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
    }
  });