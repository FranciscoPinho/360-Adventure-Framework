AFRAME.registerComponent('snapturn', {
    schema:{
        angle:{type:"number", default:20}
    },
    init:  function () {  
        this.onAxisMoved = this.onAxisMoved.bind(this)
        this.appState = AFRAME.scenes[0].systems.state.state
        this.turningRight = false
        this.turningLeft = false
       
    },
    play() {
        let hand = document.querySelector("#hand")
        if(hand)
            hand.addEventListener('trackpadmoved',this.onAxisMoved)
        console.log("here")
    },
    pause() {
        let hand = document.querySelector("#hand")
        if(hand)
            hand.removeEventListener('trackpadmoved',this.onAxisMoved)
    },
    onAxisMoved (evt) {
        const {el,appState} = this
        if(!el.sceneEl.is('vr-mode'))
            return;
        if (appState.inventoryOpen || appState.dialogueOn) 
            return
      
        if(evt.detail.x>0.75){
            if(!this.turningRight){
                this.turningLeft = false
                this.turningRight = true
                el.object3D.rotation.y-=this.data.angle
                console.log("turned right")
            }
        }
        else if (evt.detail.x<-0.75){
            if(!this.turningLeft){
                this.turningRight = false
                this.turningLeft = true
                el.object3D.rotation.y+=this.data.angle
                console.log("turned left")
            }
        }
        else {
          
            this.turningLeft = false
            this.turningRight = false
        }
    }
  });