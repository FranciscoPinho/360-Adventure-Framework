AFRAME.registerComponent('snapturn', {
    schema:{
        angle:{type:"number", default:20}
    },
    init:  function () {  
        this.onAxisMoved = this.onAxisMoved.bind(this)
        this.snap = this.snap.bind(this)
        this.appState = AFRAME.scenes[0].systems.state.state
        this.turningRight = false
        this.turningLeft = false
        this.event = 'thumbstickmoved'
        if(AFRAME.utils.device.getVRDisplay().displayName==="OpenVR HMD" || AFRAME.utils.device.isOculusGo())
            this.event = 'trackpadmoved'
    },
    play() {
        let hand = document.querySelector("#hand")
        if(hand){
            hand.addEventListener(this.event,this.onAxisMoved)
            if(this.event==="trackpadmoved" && !AFRAME.utils.device.isOculusGo()){
                hand.addEventListener("trackpaddown",this.snap)
            }
        }
    },
    pause() {
        let hand = document.querySelector("#hand")
        if(hand){
            hand.removeEventListener(this.event,this.onAxisMoved)
            if(this.event==="trackpadmoved" && !AFRAME.utils.device.isOculusGo()){
                hand.removeEventListener("trackpaddown",this.snap)
            }
        }
    },
    snap() {
        const {el,appState} = this
        if(!el.sceneEl.is('vr-mode'))
            return;
        if (appState.inventoryOpen || appState.dialogueOn) 
            return
        setTimeout(()=>{
            if(this.turningRight)
                el.object3D.rotation.y-=this.data.angle 
            else if(this.turningLeft)
                el.object3D.rotation.y+=this.data.angle
        },0)
    },
    onAxisMoved (evt) {
        const {el,appState} = this
        if(!el.sceneEl.is('vr-mode'))
            return;
        if (appState.inventoryOpen || appState.dialogueOn) 
            return
        if(evt.detail.x>0.75){
            if(this.event==="trackpadmoved"){
                this.turningLeft = false
                this.turningRight = true
                return
            }
            if(!this.turningRight){
                this.turningLeft = false
                this.turningRight = true
                el.object3D.rotation.y-=this.data.angle
            }
        }
        else if (evt.detail.x<-0.75){
            if(this.event==="trackpadmoved"){
                this.turningRight = false
                this.turningLeft = true
                return
            }
            if(!this.turningLeft){
                this.turningRight = false
                this.turningLeft = true
                el.object3D.rotation.y+=this.data.angle
            }
        }
        else {
            this.turningLeft = false
            this.turningRight = false
        }
    }
  });