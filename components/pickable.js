AFRAME.registerComponent('pickable', {
    schema: {
        icon:{type:"string"},
        sfxSrc:{type:"string",default:""},
        volume:{type:"number",default:1},
        afterPickCutscene:{type:"string",default:""}
    },
    init:  function () {  
        this.pickObject = this.pickObject.bind(this)
        if(this.data.sfxSrc){
            this.sfxSrc = document.querySelector(this.data.sfxSrc)
            this.sfxSrc.volume = this.data.volume
        }
    },
    play: function() {
        this.el.addEventListener('click',this.pickObject)
    },
    pause: function() {
        this.el.removeEventListener('click',this.pickObject)
    },
    //@TODO maybe allow to play some kind of voice track after picking up the object
    pickObject: function () {
        if(!this.el.sceneEl.is('vr-mode'))
            return;
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen) 
            return
        let object = {
            id:this.el.getAttribute('id'),
            icon:this.data.icon
        }
        AFRAME.scenes[0].emit('addToInventory', {object: object});
        if(this.sfxSrc)
            this.sfxSrc.play()
        AFRAME.scenes[0].emit('updateHoveringObject', {hoveringObject: false})
        if(this.data.afterPickCutscene){
            const eventDetail = {
                origin:this.el.parentNode,
                destinationURL:this.data.afterPickCutscene
            }
            AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
            this.el.emit('clickNavigation',eventDetail,true)
            return
        }
        else this.el.parentNode.removeChild(this.el);
    }
      
});