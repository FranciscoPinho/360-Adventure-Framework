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
        if(!this.el.sceneEl.is('vr-mode'))
            return;
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen) 
            return
        const {destination,firstdestination}=this.data;
        const eventDetail = {
            origin:this.el.parentNode,
            destinationURL:destination
        }
        
        if(this.data.firstdestination){
            if(appState.flags.indexOf(this.el.getAttribute('id')+"firstdestinationchecked")===-1){
                AFRAME.scenes[0].emit('addFlag', {flag: this.el.getAttribute('id')+"firstdestinationchecked"});
                eventDetail.destinationURL = firstdestination
                AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
            }
        }
        this.el.emit('clickNavigation',eventDetail,true)
        this.el.removeEventListener('click',this.clickNavigation)
    }
  });