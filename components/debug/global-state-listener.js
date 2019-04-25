AFRAME.registerComponent('global-state-listener', {
    schema: {
        active: {type:"boolean",default:true},
        listenForChangeIn: {type:"string"}
    },
    init() {
        this.onStateUpdate = this.onStateUpdate.bind(this)
    },
    play() {
        const {active} = this.data
        const {el} = this   
        if(!active){
            el.removeAttribute('global-state-listener')
            return
        }
        el.addEventListener('stateupdate',this.onStateUpdate)
    },
    pause() {
        this.el.removeEventListener('stateupdate',this.onStateUpdate)
    },
    onStateUpdate(event) {
        let listenChangesIn =this.data.listenForChangeIn
        if(listenChangesIn){
            console.log("Old"+listenChangesIn+":",event.detail.lastState[listenChangesIn])
            console.log("New"+listenChangesIn+":",event.detail.state[listenChangesIn])
            console.log('\n')
            return
        }
        console.log("OldState:",event.detail.lastState)
        console.log("Changes:",event.detail.payload)
        console.log("NewState:",event.detail.state)
        console.log('\n')
      
    }
});