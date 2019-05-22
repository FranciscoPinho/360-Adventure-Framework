AFRAME.registerComponent('present-item', {
    schema : {
        triggerDelay:{type:"number",default:0},
        solution:{type:"string"},
        sfx:{type:"string"},
        newFlag:{type:'string',default:"presented"}
    },
    init() {
      this.onItemPresented = this.onItemPresented.bind(this)
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
      setTimeout(()=>{
        el.sceneEl.emit('presentitem')
      },this.data.triggerDelay)

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
            el.sceneEl.emit('presentitem')
        }
        else if(correctSfx){
          AFRAME.scenes[0].emit('addFlag',{flagKey:this.data.solution,flagValue:newFlag})
          correctSfx.play()
          el.removeAttribute('present-item')
        }
    }
  });