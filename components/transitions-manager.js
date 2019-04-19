AFRAME.registerComponent('transitions-manager', {
    init() {
        this.appState = AFRAME.scenes[0].systems.state.state
        this.makeTransition = this.makeTransition.bind(this)
        this.alreadyMadeTransitions = []
    }, 
    tick(){
        const {appState,alreadyMadeTransitions,makeTransition}=this
        if(appState.inventoryOpen || appState.cutscenePlaying || appState.exclusivePlaying || appState.dialogueOn || !appState.transitions.length)
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
        const {el,appState}=this
        AFRAME.scenes[0].emit('removeTransition',{transitionID:transition.transitionID})
        if(transition.clearInventory){
            AFRAME.scenes[0].emit('clearInventory')
        }
        if(transition.goToCutscene){
            const eventDetail = {
                origin:document.querySelector("#"+appState.activeBackgroundID),
                destinationURL:transition.goToCutscene
            }
            el.emit('clickNavigation',eventDetail,true)
            el.removeEventListener('click',this.clickNavigation)
        }
        else if(transition.newURL)
            AFRAME.scenes[0].emit('changeURL',{newURL:transition.newURL})
        else if(transition.makeVisible){
            let obj
            transition.makeVisible.includes("#") ? 
            obj = document.querySelector(transition.makeVisible) :
            obj = document.querySelector("#"+transition.makeVisible)
            if(obj)
                obj.emit('force-visibility')
           
        }
        else if(transition.makeInvisible){
            let obj
            transition.makeInvisible.includes("#") ? 
            obj = document.querySelector(transition.makeInvisible) :
            obj = document.querySelector("#"+transition.makeInvisible)
            if(obj)
                obj.emit('force-invisibility')
        }
        else if(transition.goToDialogue)
            el.sceneEl.setAttribute("dialogue",transition.goToDialogue)
        else if(transition.playAudio)
            el.sceneEl.setAttribute("scripted-audio-player",transition.playAudio)
    }
  })