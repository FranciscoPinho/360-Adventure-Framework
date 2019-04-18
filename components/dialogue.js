AFRAME.registerComponent('dialogue', {
    schema: {
        dialogueTreeURL:{type:"string"},
        dialogueTreeName:{type:"string"},
        sfx:{type:"string"},
        spawn:{type:"string"},
        startEvents:{type:"array", default:["click","triggerdown"]},
        advanceEvents:{type:"array", default:["click","triggerdown"]},
        examinableObject:{type:"boolean",default:false},
        removeSelfOnEnd:{type:"boolean",default:false},
        autoplay:{type:"boolean",default:false},
        pauseBackgroundSong:{type:"boolean",default:false},
        choiceIcon:{type:"string",default:"#choiceIcon"},
        previouslyChosenIcon:{type:"string",default:"#previouslyChosenIcon"},
        examinedIcon:{type:"string",default:"#examinedIcon"},
        newURL:{stype:"string",default:"false"}
    },
    init() {  
        this.startDialogue = this.startDialogue.bind(this)
        this.advanceDialogue = this.advanceDialogue.bind(this)
        this.findLabel = this.findLabel.bind(this)
        this.spawnDialogueBox = this.spawnDialogueBox.bind(this)
        this.spawnPlayerChoice = this.spawnPlayerChoice.bind(this)
        this.newMat = new THREE.Matrix4();
        const {sfx} = this.data
        if(sfx.advanceSfx){
            this.advanceSfx = document.querySelector(sfx.advanceSfx)
            this.advanceSfx.volume = sfx.advanceVolume
        }
        if(sfx.spawnSfx){
            this.spawnSfx = document.querySelector(sfx.spawnSfx)
            this.spawnSfx.volume = sfx.spawnVolume
        }
        if(sfx.choiceSfx){
            this.choiceSfx = document.querySelector(sfx.choiceSfx)
            this.choiceSfx.volume = sfx.choiceVolume
        }
        if(sfx.hoverChoiceSfx){
            this.hoverChoiceSfx = sfx.hoverChoiceSfx
            this.hoverChoiceVolume = sfx.hoverChoiceVolume
        }
        this.voiceOnceLines=[]
      
    },
    play() {
        const {el,startDialogue,advanceDialogue} = this
        const {startEvents,advanceEvents,autoplay} = this.data
        if(!this.currentLine && !autoplay)
            for(let i=0,n=startEvents.length; i<n; i++)
                el.addEventListener(startEvents[i], startDialogue)
        if(this.currentLine && !autoplay)
            for(let i=0,n=advanceEvents.length; i<n; i++)
                el.sceneEl.addEventListener(advanceEvents[i], advanceDialogue)
        if(autoplay && this.el.sceneEl.is('vr-mode'))
            startDialogue()
        else this.el.addEventListener('enter-vr',startDialogue,{once:true})
    },
    pause() {
        const {el,startDialogue,advanceDialogue} = this
        const {startEvents,advanceEvents} = this.data
        for(let i=0,n=startEvents.length; i<n; i++)
            el.removeEventListener(startEvents[i], startDialogue)
        for(let i=0,n=advanceEvents.length; i<n; i++)
            el.sceneEl.removeEventListener(advanceEvents[i], advanceDialogue)
    },
    async startDialogue() {
        let appState = AFRAME.scenes[0].systems.state.state
        const {el,startDialogue,spawnSfx,spawnDialogueBox} = this
        const {startEvents,dialogueTreeURL,pauseBackgroundSong,autoplay,examinableObject,dialogueTreeName} = this.data
        if(examinableObject && appState.inventoryOpen)
            return
        if(!autoplay)
            for(let i=0,n=startEvents.length; i<n; i++)
                el.removeEventListener(startEvents[i], startDialogue)
        this.currentLine = 0;
        const response = await fetch(dialogueTreeURL)
        const dialogue = await response.json()
        if(dialogueTreeName)
            this.dialogueTree = dialogue[dialogueTreeName]
        else this.dialogueTree = dialogue.dialogueTree
        if(spawnSfx)
            spawnSfx.play()
        if(pauseBackgroundSong)
            el.sceneEl.emit('music-pause')
        spawnDialogueBox()
    },
    spawnDialogueBox () {
        AFRAME.scenes[0].emit('updateDialogueOn', {dialogueOn:true});
        this.dialogueBox = document.createElement("a-entity")
        const {dialogueBox,el,advanceDialogue,dialogueTree,currentLine} = this
        const {spawn,advanceEvents}=this.data
        let zDistance = spawn.zDistance ? spawn.zDistance : -5
        let opacity = spawn.opacity ? spawn.opacity : 0.3
        dialogueBox.setAttribute("visible",false)
        dialogueBox.setAttribute("material",{color:"black",opacity:opacity})
        dialogueBox.setAttribute("geometry", { primitive:"plane", width: "auto", height: "auto"})
        dialogueBox.setAttribute("text",{width:4,value:"placeholder",font:"font/Roboto-msdf.json",wrapCount:40})
        let camera = document.querySelector("#camera")
        switch(spawn.location){
            default:
            case "look":
                dialogueBox.setAttribute('look-at', "[camera]")
                dialogueBox.setAttribute("guide-widget",{zDistance:zDistance})
                let dummyNode
                dummyNode = document.createElement("a-entity")
                dummyNode.setAttribute("id", "dummydialogue")
                dummyNode.setAttribute("visible", false)
                dummyNode.object3D.position.set(0,0,zDistance)
                camera.appendChild(dummyNode)
                el.sceneEl.appendChild(dialogueBox)
                setTimeout(()=>{
                    this.newMat.copy(dummyNode.object3D.matrixWorld)
                    dialogueBox.object3D.position.setFromMatrixPosition(this.newMat)
                    dialogueBox.setAttribute('visible',true)
                    advanceDialogue()
                    if(!dialogueTree[currentLine].choices) 
                        for(let i=0,n=advanceEvents.length; i<n; i++)
                            el.sceneEl.addEventListener(advanceEvents[i], advanceDialogue)
                    camera.removeChild(dummyNode)
                },100)
            break
            case "fixed":
                dialogueBox.object3D.position.set(0,0,zDistance)
                camera.appendChild(dialogueBox)
                dialogueBox.setAttribute('visible',true)
                advanceDialogue()
                if(!dialogueTree[currentLine].choices)     
                    for(let i=0,n=advanceEvents.length; i<n; i++)
                        el.sceneEl.addEventListener(advanceEvents[i], advanceDialogue)
            break
        }
    },
    advanceDialogue() {
        if(!this.checkDialogueInFrustrum())
            return
        const {el,dialogueTree,advanceDialogue,startDialogue,findLabel,currentLine,dialogueBox,advanceSfx,spawnPlayerChoice,updateDialogueBoxText} = this
        const {removeSelfOnEnd,examinableObject,startEvents,advanceEvents,spawn,examinedIcon,pauseBackgroundSong,newURL,autoplay} = this.data
        let currentDialogue = dialogueTree[currentLine]

        if(currentLine===dialogueTree.length || !currentDialogue){
            AFRAME.scenes[0].emit('updateDialogueOn', {dialogueOn:false});
            if(this.voiceOver){
                document.querySelector('a-assets').removeChild(this.voiceOver)
                this.voiceOver = undefined
                this.voiceOnceLines = []
            }
            if(pauseBackgroundSong)
                el.sceneEl.emit('music-resume')
            if(examinableObject)
                el.setAttribute('hoverable',{hoverIcon:examinedIcon})
            for(let i=0,n=advanceEvents.length; i<n; i++)
                el.sceneEl.removeEventListener(advanceEvents[i], advanceDialogue)
            if(dialogueBox)
                if(dialogueBox.parentNode)
                    dialogueBox.parentNode.removeChild(dialogueBox)
            if(removeSelfOnEnd)
                el.removeAttribute('dialogue')
            else if(!autoplay)
                for(let i=0,n=startEvents.length; i<n; i++)
                    el.addEventListener(startEvents[i], startDialogue)
            if(newURL)
                AFRAME.scenes[0].emit('changeURL',{url:newURL})
            return
        }

        if (!currentDialogue.text && !currentDialogue.choices) {
            console.error("Invalid dialogue: no text or choices")
            return
        }
        
        if(advanceSfx)
            advanceSfx.play()

        if(this.voiceOver)
            if (this.voiceOver.duration > 0 && !this.voiceOver.paused) {
                this.voiceOver.pause()
                this.voiceOver.duration = 0
            }

        if (currentDialogue.voiceTrack) {
            if(!this.voiceOver){
                if(currentDialogue.voiceTrack.includes('#'))
                    this.voiceOver = document.querySelector(currentDialogue.voiceTrack)
                else {
                    this.voiceOver = document.createElement("audio")
                    document.querySelector('a-assets').appendChild(this.voiceOver)
                }
            }
            if(this.voiceOnceLines.indexOf(currentDialogue.voiceTrack)===-1){
                this.voiceOver.src = currentDialogue.voiceTrack
                if (currentDialogue.voiceVolume)
                    this.voiceOver.volume = currentDialogue.voiceVolume
                else this.voiceOver.volume = 1
                this.voiceOver.play()
                if(currentDialogue.voiceOnce)
                    this.voiceOnceLines.push(currentDialogue.voiceTrack)
            }
        }

        if(currentDialogue.choices){
            updateDialogueBoxText(dialogueBox,currentDialogue.text)
            spawnPlayerChoice(currentDialogue.choices)
            return
        }
        else updateDialogueBoxText(dialogueBox,currentDialogue.text)

        currentDialogue.next ? this.currentLine = this.findLabel(currentDialogue.next) :
            this.currentLine = currentLine + 1
    },
    spawnPlayerChoice(choices){
        let appState = AFRAME.scenes[0].systems.state.state
        const {el,dialogueBox,advanceDialogue,hoverChoiceSfx,hoverChoiceVolume,currentLine,choiceSfx} = this
        const {advanceEvents,spawn, choiceIcon, previouslyChosenIcon} = this.data
        let len = choices.length
        let originalY = dialogueBox.object3D.position.y
        dialogueBox.object3D.position.y=dialogueBox.object3D.position.y+len*0.5
        let opacity = spawn.opacity ? spawn.opacity : 0.3
        dialogueBox.setAttribute("material",{color:"black",opacity:opacity+0.2})
 
        for(let i=0,n=advanceEvents.length; i<n; i++)
            el.sceneEl.removeEventListener(advanceEvents[i], advanceDialogue)

        for(let i=0;i<len;i++){
            let choiceData=choices[i]
            let circle = document.createElement("a-entity")
            circle.setAttribute("geometry", {primitive:"circle",radius:0.25})
            let alreadyChosen=appState.exploredTreeChoices.indexOf(choiceData.choiceID)!==-1
            if(alreadyChosen)
                circle.setAttribute('material',{src:previouslyChosenIcon,opacity:0.8})
            else circle.setAttribute('material',{src:choiceIcon,opacity:0.8})
            circle.setAttribute("hoverable",{sfx:{sfxSrc:hoverChoiceSfx,volume:hoverChoiceVolume}})
            circle.setAttribute("id",choiceData.choiceID)
            circle.classList.add('playerchoice')
            circle.classList.add('inter')
            circle.setAttribute("position",{x:-1.8,y:-0.7-0.8*i,z:0})
            dialogueBox.appendChild(circle)
            let newChoice = document.createElement("a-entity")
            newChoice.setAttribute("material",{color:"grey",opacity:0.8})
            newChoice.setAttribute("geometry", { primitive:"plane", width: "auto", height: "auto"})
            newChoice.setAttribute("text",{width:4,value:choiceData.text,font:"font/Roboto-msdf.json",wrapCount:40})
            newChoice.setAttribute("position",{x:0.6,y:-0.7-0.8*i,z:0})
            dialogueBox.appendChild(newChoice)
            let choiceHandler = (evt)=>{
                evt.stopPropagation()
                if(choiceSfx)
                    choiceSfx.play()
                if(choiceData.newFlag)
                    AFRAME.scenes[0].emit('addFlag', {
                        flagKey:choiceData.choiceID,
                        flagValue:choiceData.newFlag
                    })
                if(!alreadyChosen)
                    AFRAME.scenes[0].emit('addExploredDialogueTreeChoice', { choiceID:choiceData.choiceID})
                choiceData.next ? this.currentLine = this.findLabel(choiceData.next) :
                    this.currentLine = currentLine + 1
                while (dialogueBox.firstChild) {
                    dialogueBox.removeChild(dialogueBox.firstChild);
                }
                dialogueBox.object3D.position.y=originalY
               
                advanceDialogue()
                
                setTimeout(()=>{
                    if(dialogueBox)
                        for(let i=0,n=advanceEvents.length; i<n; i++)
                            el.sceneEl.addEventListener(advanceEvents[i], advanceDialogue)
                },100)
            }
            for(let i=0,n=advanceEvents.length; i<n; i++)
                circle.addEventListener(advanceEvents[i],choiceHandler,{once:true})
        }
    },
    updateDialogueBoxText (dialogueBox,text)
    {

        dialogueBox.setAttribute('visible',false)
        dialogueBox.setAttribute("geometry", { primitive:"plane", width: "auto", height: "auto"})
        dialogueBox.setAttribute('text',{width:4,value:text ? text:"Choose wisely",wrapCount:40})
        dialogueBox.setAttribute('visible',true)
    },
    findLabel (next) {
        const {dialogueTree} = this
        const len = dialogueTree.length
        for(let i=0;i<len;i++){
            if(dialogueTree[i].label===next)
                return i
        }
        console.error("Invalid label "+next+" in dialogue!")
        return len-1
    },
    checkDialogueInFrustrum(){
        //https://stackoverflow.com/questions/49902680/aframe-entity-is-seen
        var cam = this.el.sceneEl.camera
        var frustum = new THREE.Frustum();
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, 
        cam.matrixWorldInverse));  
        var pos = this.dialogueBox.getAttribute('position');
        if (frustum.containsPoint(pos)) {
          return true
        }
        return false
    }   
});