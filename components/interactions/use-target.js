AFRAME.registerComponent('use-target', {
    schema:{
        stimulus:{type:"array"}
    },
    init:  function () {  
        this.stimulusDetector = this.stimulusDetector.bind(this)
        this.updateFromStimulus = this.updateFromStimulus.bind(this)
    },
    play() {
        this.el.addEventListener('stimulus',this.stimulusDetector)
    },
    pause() {
        this.el.removeEventListener('stimulus',this.stimulusDetector)
    },
    stimulusDetector(evt) {
        if (!this.el.sceneEl.is('vr-mode'))
            return
        const {stimulus} = this.data
        let usedObjectID=evt.detail.usedObject
        for(let i=0,n=stimulus.length;i<n;i++){
            if(Array.isArray(stimulus[i].targeted_by)){
                if(stimulus[i].targeted_by.indexOf(usedObjectID)!==-1){
                    this.updateFromStimulus(stimulus[i],usedObjectID)
                    break
                }
            }
            else if(stimulus[i].targeted_by === usedObjectID){
                this.updateFromStimulus(stimulus[i],usedObjectID)
                break
            }
        }
    },
    updateFromStimulus(stimulus,usedObjectID) {
        const {el} = this
      
        if(stimulus.newFlag)
            AFRAME.scenes[0].emit('addFlag', {
                flagKey:el.id,
                flagValue:stimulus.newFlag
            })
        const {inventoryData,src,dialogue} = stimulus
        if(stimulus.sfxSrc){
            let audio = document.querySelector(stimulus.sfxSrc)
            if(stimulus.volume)
                audio.volume = stimulus.volume
            audio.play()
        }
        if(stimulus.inventoryData){
            AFRAME.scenes[0].emit('removeFromInventory', {
                object: { iconID: usedObjectID}
            })
            el.parentNode.removeChild(el)
            AFRAME.scenes[0].emit('addToInventory', {
                object: {
                    iconID: inventoryData.iconID,
                    iconSrc: inventoryData.iconSrc,
                    iconDesc: inventoryData.iconDesc
                },
                alreadyPickedID: inventoryData.originalID
            })
            el.sceneEl.emit('inventoryRefresh')
            return
        }
        else if(src){
            el.sceneEl.emit('closeInventory')
            AFRAME.scenes[0].emit('removeFromInventory', {
                object: { iconID: usedObjectID}
            })
            AFRAME.scenes[0].emit('updateTransformedObjects', {
                original:el.id,
                transformation:stimulus
            })
            if(el.getAttribute('dialogue')){
                el.removeAttribute('dialogue')
                el.emit('mouseleave')
                el.removeAttribute('hoverable')
            }
            for(let key in stimulus){
                if(key==="targeted_by" || key==="newFlag")
                    continue
                el.setAttribute(key,stimulus[key])
            } 
            return
        }
        else if (dialogue){
            el.sceneEl.setAttribute('dialogue',dialogue)
        }
    }
  });