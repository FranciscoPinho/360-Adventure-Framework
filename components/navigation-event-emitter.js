AFRAME.registerComponent('navigation-event-emitter', {
    schema:{
        firstdestination: {type:'string'},
        destination: {type:'string'}
    },
    init:  function () {  
        this.clickNavigation = this.clickNavigation.bind(this)
    },
    play: function() {
        this.el.addEventListener('click',this.clickNavigation)
    },
    pause: function() {
        this.el.removeEventListener('click',this.clickNavigation)
    },
    clickNavigation: function () {
        const {el} = this
        if(!el.sceneEl.is('vr-mode'))
            return;
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen || appState.dialogueOn) 
            return
        const {destination,firstdestination}=this.data;
        const eventDetail = {
            origin:this.el.parentNode,
            destinationURL:destination
        }
        
        if(firstdestination){
            if(!appState.flags[el.getAttribute('id')]){
                AFRAME.scenes[0].emit('addFlag', {flagKey: el.getAttribute('id'), flagValue:true});
                eventDetail.destinationURL = firstdestination
                AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
            }
        }
        el.emit('clickNavigation',eventDetail,true)
        el.removeEventListener('click',this.clickNavigation)
    }
  });