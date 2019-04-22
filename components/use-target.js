AFRAME.registerComponent('use-target', {
    schema:{
        stimulus:{type:"array"}
    },
    init:  function () {  
        this.stimulusDetector = this.stimulusDetector.bind(this)
        this.updateFromStimulus = this.updateFromStimulus.bind(this)
    },
    play: function() {
        this.el.addEventListener('stimulus',this.stimulusDetector)
    },
    pause: function() {
        this.el.removeEventListener('stimulus',this.stimulusDetector)
    },
    stimulusDetector: function (evt) {
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
    updateFromStimulus: function (stimulus,usedObjectID) {
        let appState = AFRAME.scenes[0].systems.state.state
        const {el} = this
      
        if(stimulus.newFlag)
            AFRAME.scenes[0].emit('addFlag', {
                flagKey:el.getAttribute('id'),
                flagValue:stimulus.newFlag
            })
        const {inventoryData,src,dialogue,afterStimulusDialogue,afterStimulusChangeVidSrc} = stimulus
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
           
            if(afterStimulusDialogue){
                el.sceneEl.setAttribute('dialogue',afterStimulusDialogue)
                el.sceneEl.emit('inventoryRefresh')
            }
            else if(afterStimulusChangeVidSrc){
                el.sceneEl.emit('triggerdown')
                let activeBackground = document.querySelector("#"+appState.activeBackgroundID)
                if(activeBackground){
                    activeBackground.removeAttribute('video-player')
                    activeBackground.setAttribute('src',afterStimulusChangeVidSrc.newSrc)
                    activeBackground.setAttribute('video-player',{cutscene:afterStimulusChangeVidSrc.cutscene,pauseBackgroundSong:afterStimulusChangeVidSrc.pauseBackgroundSong})
                }
            }
           
            return
        }
        else if(src){
            AFRAME.scenes[0].emit('removeFromInventory', {
                object: { iconID: usedObjectID}
            })
            AFRAME.scenes[0].emit('updateTransformedObjects', {
                original:el.getAttribute('id'),
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
            el.sceneEl.emit('trackpaddown')
            if(afterStimulusDialogue)
                el.sceneEl.setAttribute('dialogue',afterStimulusDialogue)
            else if(afterStimulusChangeVidSrc){
                let activeBackground = document.querySelector("#"+appState.activeBackgroundID)
                if(activeBackground){
                    activeBackground.removeAttribute('video-player')
                    activeBackground.setAttribute('src',afterStimulusChangeVidSrc.newSrc)
                    activeBackground.setAttribute('video-player',{cutscene:afterStimulusChangeVidSrc.cutscene,pauseBackgroundSong:afterStimulusChangeVidSrc.pauseBackgroundSong})
                }
            }
            return
        }
        else if (dialogue){
            el.sceneEl.setAttribute('dialogue',dialogue)
        }
    }
  });