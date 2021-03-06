AFRAME.registerComponent('transitions-manager', {
    init() {
        this.appState = AFRAME.scenes[0].systems.state.state
        this.makeTransition = this.makeTransition.bind(this)
        this.injectFlatVideo = this.injectFlatVideo.bind(this)
        this.changeDestination = this.changeDestination.bind(this)
        this.addToInventory = this.addToInventory.bind(this)
        this.changeBackgroundSrc = this.changeBackgroundSrc.bind(this)
        this.changeObjectVisibility = this.changeObjectVisibility.bind(this)
        this.alreadyMadeTransitions = []
        this.tick = AFRAME.utils.throttleTick(this.tick, 350, this);
    }, 
    tick(t, dt) {
        const {appState,alreadyMadeTransitions,makeTransition}=this
        if(appState.pickAnimationPlaying || appState.inventoryOpen || 
            appState.cutscenePlaying || appState.exclusivePlaying || 
            appState.dialogueOn || !appState.transitions.length || appState.codePuzzleActive
            || !this.el.sceneEl.is('vr-mode'))
            return
        
        for(let i=0,len=appState.transitions.length;i<len;i++){
            let transition = appState.transitions[i]
            if(alreadyMadeTransitions.indexOf(transition.transitionID)!==-1)
                continue
            if(!transition.on || !transition.on.length){
                alreadyMadeTransitions.push(transition.transitionID)
                makeTransition(transition)
                return
            }
            for(let n=0,onlen=transition.on.length;n<onlen;n++){
                let allConditions = true
                let onConditions = transition.on[n]
                for(conditionKey in onConditions){
                    let possibleState = onConditions[conditionKey]
                    if(conditionKey==="activeBackgroundID"){
                        if(appState.activeBackgroundID!==possibleState)
                            break
                        else continue
                    }
                    let requiredStateValue = appState.flags[conditionKey]
                    if(Array.isArray(possibleState)){
                        let anyCondition = false
                        possibleState.forEach((state)=>{
                            if(!requiredStateValue){
                                if(!state)
                                    anyCondition=true
                            }
                            else if(requiredStateValue===state)
                                anyCondition=true
                        })
                        if(!anyCondition)
                            allConditions = false
                    }
                    else {
                        if(!requiredStateValue){
                            if(possibleState)
                                allConditions = false
                        }
                        else if(requiredStateValue!==possibleState)
                            allConditions = false
                    }
            
                }
                if(allConditions){
                    alreadyMadeTransitions.push(transition.transitionID)
                    makeTransition(transition)
                    return
                }
            }
        }
    },
    makeTransition(transition){
        let delay = transition.delaySeconds ? transition.delaySeconds*1000 : 0
        const {el,injectFlatVideo,changeObjectVisibility,changeBackgroundSrc,changeDestination,addToInventory, appState}=this
        AFRAME.scenes[0].emit('removeTransition',{transitionID:transition.transitionID})
        setTimeout(()=>{
            if(transition.ifnot){
                let allConditions = true
                for(let key in transition.ifnot){
                    if(appState.flags[key]!==transition.ifnot[key])
                        allConditions = false
                }
                if(allConditions)
                    return
            }
            if(transition.clearInventory)
                AFRAME.scenes[0].emit('clearInventory')
            if(transition.addToInventory)
                addToInventory(transition.addToInventory)
            if(transition.playAudio)
                el.sceneEl.setAttribute("scripted-audio-player",transition.playAudio)
            if(transition.injectFlatVideo)
                injectFlatVideo(transition.injectFlatVideo)
            if(transition.makeVisible)
                changeObjectVisibility(true,transition.makeVisible)
            if(transition.makeInvisible)
                changeObjectVisibility(false,transition.makeInvisible)
            if(transition.resetTransitions)
                AFRAME.scenes[0].emit('clearTransitions')
            if(transition.promptPresentItem)
                el.sceneEl.setAttribute("present-item",transition.promptPresentItem)
            if(transition.goToDestination)
                changeDestination(transition.goToDestination)
            else if(transition.newURL)
                AFRAME.scenes[0].emit('changeURL',{newURL:transition.newURL})
            else if(transition.goToDialogue)
                el.sceneEl.setAttribute("dialogue",transition.goToDialogue)
            else if(transition.changeBackgroundSrc) 
                changeBackgroundSrc(transition.changeBackgroundSrc)
            else if(transition.currentVid==="unpause"){
                el.sceneEl.emit('resume-video')
                AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
            }
            else if(transition.currentVid==="pause"){
                el.sceneEl.emit('pause-video')
                AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: false});
            }
        },delay)
    },
    addToInventory(newItems){
        if(!Array.isArray(newItems)){
            AFRAME.scenes[0].emit('addToInventory', {
                object: {
                    iconID: newItems.iconID,
                    iconSrc: newItems.iconSrc,
                    iconDesc: newItems.iconDesc
                }
            })
            return
        }
        for(newItem of newItems)
            AFRAME.scenes[0].emit('addToInventory', {
                object: {
                    iconID: newItem.iconID,
                    iconSrc: newItem.iconSrc,
                    iconDesc: newItem.iconDesc
                }
            })
    },
    changeDestination(destination){
        const {appState,el}=this
        const eventDetail = {
            origin:document.querySelector("#"+appState.activeBackgroundID),
            destinationURL:destination
        }
        el.emit('clickNavigation',eventDetail,true)
    },
    changeBackgroundSrc(newBackground){
        const {appState}=this
        let activeBackground = document.querySelector("#"+appState.activeBackgroundID)
        if(activeBackground){
            let isVideo = activeBackground.getAttribute('video-player')
            if(isVideo)
                activeBackground.removeAttribute('video-player')
            activeBackground.setAttribute('src',newBackground.newSrc)
            if(isVideo)
                activeBackground.setAttribute('video-player',{cutscene:newBackground.cutscene,pauseBackgroundSong:newBackground.pauseBackgroundSong,playOnce:newBackground.playOnce,endTime:newBackground.endTime})
            let looping = newBackground["video-looper"]
            if("video-looper" in newBackground)
                activeBackground.setAttribute('video-looper',looping)
            AFRAME.scenes[0].emit('updateActiveBackground', {activeBackgroundSrc:newBackground.newSrc});
        }
    },
    changeObjectVisibility(visibilityState,targetID){
        let obj
        targetID.includes("#") ? 
        obj = document.querySelector(targetID) :
        obj = document.querySelector("#"+targetID)
        if(obj){
            if(visibilityState)
                obj.emit('force-visibility')
            else obj.emit('force-invisibility')
        } 
    },
    injectFlatVideo(videoInfo){
        const {el,appState}=this
        let activeBackground = document.querySelector("#"+appState.activeBackgroundID)
        if(activeBackground){
            let flatvideo = document.createElement("a-video")
 
            for(const key in videoInfo){
                if(key==="zDistance")
                    continue
                if(key==="position"){
                    let newMat = new THREE.Matrix4();
                    let position = videoInfo[key]
                    if(!videoInfo.nolook)
                        flatvideo.setAttribute('look-at', "[camera]")
                    if(position==="look"){
                        let zDistance
                        zDistance = videoInfo["zDistance"] ? videoInfo["zDistance"] : -8
                        flatvideo.setAttribute("guide-widget",{zDistance:zDistance})
                        
                        flatvideo.setAttribute('visible',false)
                        let dummyNode = document.createElement("a-entity")
                        dummyNode.setAttribute("visible", false)
                        dummyNode.object3D.position.set(0,0,zDistance)
                        camera.appendChild(dummyNode)
                        el.sceneEl.appendChild(flatvideo)
                        setTimeout(()=>{
                            newMat.copy(dummyNode.object3D.matrixWorld)
                            flatvideo.object3D.position.setFromMatrixPosition(newMat)
                            flatvideo.setAttribute('visible',true)
                            camera.removeChild(dummyNode)
                        },100)
                    }
                    else {
                        flatvideo.setAttribute(key,videoInfo[key])
                        zDistance = position.split(' ')[2]
                        
                        let numericZ = parseInt(zDistance)
                        if(numericZ)
                            flatvideo.setAttribute("guide-widget",{zDistance:numericZ})
                        el.sceneEl.appendChild(flatvideo)
                    }
                    continue
                }
                flatvideo.setAttribute(key,videoInfo[key])
            }
           
        }
    }
  })