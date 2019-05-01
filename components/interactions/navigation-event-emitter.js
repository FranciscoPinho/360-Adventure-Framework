AFRAME.registerComponent('navigation-event-emitter', {
    schema:{
        firstdestination: {type:'string'},
        destination: {type:'string'}
    },
    init:  function () {  
        this.clickNavigation = this.clickNavigation.bind(this)
    },
    play() {
        this.el.addEventListener('click',this.clickNavigation,{once:true})
    },
    pause() {
        this.el.removeEventListener('click',this.clickNavigation)
    },
    clickNavigation () {
        const {el} = this
        if(!el.sceneEl.is('vr-mode'))
            return;
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen || appState.dialogueOn || appState.cutscenePlaying || appState.codePuzzleActive || appState.exclusivePlaying) 
            return
        const {destination,firstdestination}=this.data;
        const eventDetail = {
            origin:this.el.parentNode,
            destinationURL:destination
        }
        
        if(firstdestination){
            if(!appState.flags[el.id]){
                AFRAME.scenes[0].emit('addFlag', {flagKey: el.id, flagValue:"visited"});
                eventDetail.destinationURL = firstdestination
                AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
            }
        }
        el.sceneEl.emit('clickNavigation',eventDetail,true)
    }
  });