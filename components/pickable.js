AFRAME.registerComponent('pickable', {
    schema: {
        sfx:{type:"string"},
        inventoryData:{type:"string"},
        newFlag:{type:"string",default:"picked"},
        afterPickCutscene:{type:"string",default:""}
    },
    init:  function () {  
        this.pickObject = this.pickObject.bind(this)
        const {sfx} = this.data
        if(sfx.sfxSrc){
            this.sfxSrc = document.querySelector(sfx.sfxSrc)
            this.sfxSrc.volume = sfx.volume
        }
    },
    play: function() {
        this.el.addEventListener('click',this.pickObject)
    },
    pause: function() {
        this.el.removeEventListener('click',this.pickObject)
    },
    pickObject: function () {
        if(!this.el.sceneEl.is('vr-mode'))
            return;
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen) 
            return
        const {inventoryData,newFlag} = this.data
        let object = {
            iconID:inventoryData.iconID,
            iconSrc:inventoryData.iconSrc
        }
        AFRAME.scenes[0].emit('addToInventory', {object: object, alreadyPickedID:this.el.getAttribute('id')});
        if(this.sfxSrc)
            this.sfxSrc.play()
        AFRAME.scenes[0].emit('updateHoveringObject', {hoveringObject: false})
        if(this.data.afterPickCutscene){
            const eventDetail = {
                origin:this.el.parentNode,
                destinationURL:this.data.afterPickCutscene
            }
            AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
            AFRAME.scenes[0].emit('addFlag', {flagKey:this.el.getAttribute('id'),flagValue:newFlag});
            this.el.emit('clickNavigation',eventDetail,true)
            return
        }
        else this.el.parentNode.removeChild(this.el);
    }
      
});