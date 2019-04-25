AFRAME.registerComponent('transitions-manager', {
    init() {
        this.appState = AFRAME.scenes[0].systems.state.state
        this.makeTransition = this.makeTransition.bind(this)
        this.injectFlatVideo = this.injectFlatVideo.bind(this)
        this.changeDestination = this.changeDestination.bind(this)
        this.changeBackgroundSrc = this.changeBackgroundSrc.bind(this)
        this.changeObjectVisibility = this.changeObjectVisibility.bind(this)
        this.alreadyMadeTransitions = []
        this.tick = AFRAME.utils.throttleTick(this.tick, 350, this);
    }, 
    tick(t, dt) {
        const {appState,alreadyMadeTransitions,makeTransition}=this
        if(appState.pickAnimationPlaying || appState.inventoryOpen || 
            appState.cutscenePlaying || appState.exclusivePlaying || 
            appState.dialogueOn || !appState.transitions.length)
            return
        
        for(let i=0,len=appState.transitions.length;i<len;i++){
            let transition = appState.transitions[i]
            if(alreadyMadeTransitions.indexOf(transition.transitionID)!==-1)
                continue
            if(!transition.on)
                continue
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
        const {el,injectFlatVideo,changeObjectVisibility,changeBackgroundSrc,changeDestination}=this
        AFRAME.scenes[0].emit('removeTransition',{transitionID:transition.transitionID})
        setTimeout(()=>{
            if(transition.clearInventory)
                AFRAME.scenes[0].emit('clearInventory')
            if(transition.goToDestination)
                changeDestination(transition.goToDestination)
            else if(transition.newURL)
                AFRAME.scenes[0].emit('changeURL',{newURL:transition.newURL})
            else if(transition.makeVisible)
                changeObjectVisibility(true,transition.makeVisible)
            else if(transition.makeInvisible)
                changeObjectVisibility(false,transition.makeInvisible)
            else if(transition.goToDialogue)
                el.sceneEl.setAttribute("dialogue",transition.goToDialogue)
            else if(transition.playAudio)
                el.sceneEl.setAttribute("scripted-audio-player",transition.playAudio)
            else if(transition.changeBackgroundSrc) 
                changeBackgroundSrc(transition.changeBackgroundSrc)
            else if(transition.injectFlatVideo)
                injectFlatVideo(transition.injectFlatVideo)
            else if(transition.currentVid==="unpause"){
                el.sceneEl.emit('resume-video')
                AFRAME.scenes[0].emit('updateCutscenePlaying', {cutscenePlaying: true});
            }
        },delay)
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
            let isVideo =activeBackground.getAttribute('video-player')
            if(isVideo)
                activeBackground.removeAttribute('video-player')
            activeBackground.setAttribute('src',newBackground.newSrc)
            if(isVideo)
                activeBackground.setAttribute('video-player',{cutscene:newBackground.cutscene,pauseBackgroundSong:newBackground.pauseBackgroundSong,playOnce:newBackground.playOnce})
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
                    let zDistance
                    let newMat = new THREE.Matrix4();
                    let position = videoInfo[key]
                    if(position==="look"){
                        flatvideo.setAttribute('look-at', "[camera]")
                        flatvideo.setAttribute('visible',false)
                        zDistance = videoInfo["zDistance"] ? videoInfo["zDistance"] : -8
                        flatvideo.setAttribute("guide-widget",{zDistance:zDistance})
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
                        activeBackground.appendChild(flatvideo)
                    }
                    continue
                }
                flatvideo.setAttribute(key,videoInfo[key])
            }
           
        }
    }
  })