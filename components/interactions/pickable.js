AFRAME.registerComponent('pickable', {
    schema: {
        sfx:{type:"string"},
        inventoryData:{type:"string"},
        newFlag:{type:"string",default:"picked"},
        animate:{type:"boolean",default:true},
        animationDuration:{type:"number",default:1000}
    },
    init() {  
        this.pickObject = this.pickObject.bind(this)
        const {sfx} = this.data
        if(sfx.sfxSrc){
            this.sfxSrc = document.querySelector(sfx.sfxSrc)
            if(this.sfxSrc)
                this.sfxSrc.volume = sfx.volume
        }
    },
    play() {
        this.el.addEventListener('click',this.pickObject)
    },
    pause() {
        this.el.removeEventListener('click',this.pickObject)
    },
    pickObject() {
        const {el,sfxSrc} = this
        if(!el.sceneEl.is('vr-mode'))
            return;
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen || appState.dialogueOn || appState.cutscenePlaying) 
            return
        let objectID = el.id
        el.sceneEl.removeChild(document.querySelector('#'+objectID+"pointer"))
        el.removeAttribute('hoverable')
        AFRAME.scenes[0].emit('updateHoveringObject', {hoveringObject: false})
        const {inventoryData,newFlag,afterPickCutscene,afterPickDialogue,animate,animationDuration} = this.data
        let object = {
            iconID:inventoryData.iconID,
            iconSrc:inventoryData.iconSrc,
            iconDesc:inventoryData.iconDesc
        }
        let timeOut = 0
        
        if(animate){
           const {x,y,z} = el.getAttribute('scale')
            
            el.setAttribute('animation__pickup__scaling', {
                property: 'scale',
                startEvents: 'pickupObject'+objectID,
                dur: animationDuration/2,
                from: {x:x,y:y,z:z},
                to: {x:x/20,y:y/20,z:z/20},
            })
            el.setAttribute('animation__pickup__position', {
                property: 'position',
                startEvents: 'pickupObject'+objectID,
                dur: animationDuration/2,
                delay:animationDuration/2,
                from: el.getAttribute('position'),
                to: "0 0 0",
                easing: "linear"
            })
        
            timeOut = animationDuration
            
            el.emit('pickupObject'+objectID)
            AFRAME.scenes[0].emit('updatePickAnimationPlaying', {playing:true});
        }

        AFRAME.scenes[0].emit('addToInventory', {object: object, alreadyPickedID:objectID});
        AFRAME.scenes[0].emit('addFlag', {flagKey:objectID,flagValue:newFlag});

        if(afterPickCutscene)
            AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
        setTimeout(()=>{
            if(sfxSrc)
                sfxSrc.play()
            AFRAME.scenes[0].emit('updatePickAnimationPlaying', {playing:false});
            el.parentNode.removeChild(el);
        },timeOut)
    }
      
});