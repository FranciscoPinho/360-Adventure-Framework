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
        const {el,sfxSrc} = this
        if(!el.sceneEl.is('vr-mode'))
            return;
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen || appState.dialogueOn) 
            return
        el.sceneEl.removeChild(document.querySelector('#'+el.getAttribute('id')+"pointer"))
        const {inventoryData,newFlag,afterPickCutscene} = this.data
        let object = {
            iconID:inventoryData.iconID,
            iconSrc:inventoryData.iconSrc,
            iconDesc:inventoryData.iconDesc
        }
        AFRAME.scenes[0].emit('addToInventory', {object: object, alreadyPickedID:el.getAttribute('id')});
        if(sfxSrc)
            sfxSrc.play()
        AFRAME.scenes[0].emit('updateHoveringObject', {hoveringObject: false})
        if(afterPickCutscene){
            const eventDetail = {
                origin:el.parentNode,
                destinationURL:afterPickCutscene
            }
            AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
            AFRAME.scenes[0].emit('addFlag', {flagKey:el.getAttribute('id'),flagValue:newFlag});
            el.emit('clickNavigation',eventDetail,true)
            return
        }
        else el.parentNode.removeChild(el);
    }
      
});