AFRAME.registerComponent('codepuzzle', {
    schema : {
        startEvents:{type:"array",default:['click','triggerdown']},
        solution:{type:"string"},
        buttons:{type:"array",default:["1","2","3","4","5","6","7","8","9"]},
        sfx:{type:"string"},
        newFlag:{type:'string',default:"solved"}
    },
    init() {
      this.onActivatePuzzle = this.onActivatePuzzle.bind(this)
      this.onClickEnter = this.onClickEnter.bind(this)
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
      if(sfx.buttonSfx){
        this.buttonSfx = document.querySelector(sfx.wrongSfx)
        if(this.buttonSfx)
            this.buttonSfx.volume = sfx.wrongVolume
      }
    },
    play(){
      const {el,onActivatePuzzle} = this
      for(let i=0,n=startEvents.length; i<n; i++)
        el.addEventListener(startEvents[i], onActivatePuzzle)
    },
    pause(){
      const {el,onActivatePuzzle} = this
      for(let i=0,n=startEvents.length; i<n; i++)
        el.removeEventListener(startEvents[i], onActivatePuzzle)
    },
    onActivatePuzzle(evt){

    },
    onClickCharacter(evt){

    },
    onClickEnter(evt){
        const {el,wrongSfx,correctSfx} = this
    }
  });