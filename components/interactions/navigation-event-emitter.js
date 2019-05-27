AFRAME.registerComponent('navigation-event-emitter', {
    schema:{
        firstdestination: {type:'string'},
        destination: {type:'string'},
        newURL: {type:'string'}
    },
    init:  function () {  
        this.clickNavigation = this.clickNavigation.bind(this)
    },
    play() {
        this.el.addEventListener('click',this.clickNavigation)
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
        
        el.removeEventListener('click',this.clickNavigation)
        const {destination,firstdestination,newURL}=this.data;
        if(newURL){
            el.removeEventListener('click',this.clickNavigation)
            AFRAME.scenes[0].emit('changeURL',{newURL:newURL}) 
            return
        }

        const eventDetail = {
            origin:this.el.parentNode,
            destinationURL:destination
        }
        
        if(firstdestination)
            if(!appState.flags[el.id]){
                AFRAME.scenes[0].emit('addFlag', {flagKey: el.id, flagValue:"visited"});
                eventDetail.destinationURL = firstdestination
                AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
            }

        el.sceneEl.emit('clickNavigation',eventDetail,true)
       
    }
  });