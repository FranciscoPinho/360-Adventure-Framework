AFRAME.registerComponent('global-state-listener', {
    schema: {
        active: {type:"boolean",default:true}
    },
    init: function () {
        this.onStateUpdate = this.onStateUpdate.bind(this)
    },
    play: function () {
        const {active,disableWarnings} = this.data
        const {el} = this   
        if(!active){
            el.removeAttribute('global-state-listener')
            return
        }
        el.addEventListener('stateupdate',this.onStateUpdate)
    },
    pause: function () {
        this.el.removeEventListener('stateupdate',this.onStateUpdate)
    },
    onStateUpdate: function (event) {
        console.log("OldState:",event.detail.lastState)
        console.log("Changes:",event.detail.payload)
        console.log("NewState:",event.detail.state)
        console.log('\n')
      
    }
});