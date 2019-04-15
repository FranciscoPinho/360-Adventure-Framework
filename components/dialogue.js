AFRAME.registerComponent('dialogue', {
    schema: {
        dialogueID:{type:"string"},
        dialogueTreeURL:{type:"string"},
        sfx:{type:"string"},
        spawn:{type:"string"},
        startEvents:{type:"array"},
        examinableObject:{type:"boolean",default:false},
        removeSelfOnEnd:{type:"boolean",default:false},
        autoplay:{type:"boolean",default:false},
        pauseBackgroundSong:{type:"boolean",default:false},
        lowerBackgroundSongVolume:{type:"boolean",default:false},
        choiceIcon:{type:"string",default:"#choiceIcon"},
        previouslyChosenIcon:{type:"string",default:"#previouslyChosenIcon"},
        examinedIcon:{type:"string",default:"#examinedIcon"}
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
    },
    play() {
        const {el,startDialogue,advanceDialogue} = this
        const {startEvents} = this.data
        if(!this.currentLine)
            for(let i=0,n=startEvents.length; i<n; i++)
                el.addEventListener(startEvents[i], startDialogue)
        else
            for(let i=0,n=startEvents.length; i<n; i++)
                el.sceneEl.addEventListener(startEvents[i], advanceDialogue)
    },
    pause() {
        const {el,startDialogue,advanceDialogue} = this
        const {startEvents} = this.data
        if(!this.currentLine)
            for(let i=0,n=startEvents.length; i<n; i++)
                el.removeEventListener(startEvents[i], startDialogue)
        else
            for(let i=0,n=startEvents.length; i<n; i++)
                el.sceneEl.removeEventListener(startEvents[i], advanceDialogue)
    },
    async startDialogue() {
        const {el,startDialogue,spawnSfx,spawnDialogueBox} = this
        const {startEvents,dialogueTreeURL} = this.data
        for(let i=0,n=startEvents.length; i<n; i++)
            el.removeEventListener(startEvents[i], startDialogue)
        this.currentLine = 0;
        const response = await fetch(dialogueTreeURL)
        const dialogue = await response.json()
        this.dialogueTree = dialogue.dialogueTree
        if(spawnSfx)
            spawnSfx.play()
        try{
        spawnDialogueBox()
        }
        catch(e)
        {
            console.log(e)
        }
    },
    spawnDialogueBox () {
        AFRAME.scenes[0].emit('updateDialogueOn', {dialogueOn:true});
        this.dialogueBox = document.createElement("a-entity")
        const {dialogueBox,el,advanceDialogue} = this
        const {spawn,startEvents}=this.data
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
                    advanceDialogue()  
                    dialogueBox.setAttribute("visible",true)  
                    for(let i=0,n=startEvents.length; i<n; i++)
                        el.sceneEl.addEventListener(startEvents[i], advanceDialogue)
                    camera.removeChild(dummyNode)
                },100)
            break
            case "fixed":
                dialogueBox.object3D.position.set(0,0,zDistance)
                camera.appendChild(dialogueBox)
                advanceDialogue()  
                dialogueBox.setAttribute("visible",true)  
                for(let i=0,n=startEvents.length; i<n; i++)
                    el.sceneEl.addEventListener(startEvents[i], advanceDialogue)
            break
        }
    },
    advanceDialogue() {
        if(!this.checkDialogueInFrustrum())
            return
        const {el,dialogueTree,advanceDialogue,startDialogue,findLabel,currentLine,dialogueBox,advanceSfx,spawnPlayerChoice,updateDialogueBoxText} = this
        const {removeSelfOnEnd,examinableObject,startEvents,spawn,examinedIcon} = this.data
        let currentDialogue = dialogueTree[currentLine]

        if(currentLine===dialogueTree.length || !currentDialogue){
            if(examinableObject)
                el.setAttribute('hoverable',{hoverIcon:examinedIcon})
            for(let i=0,n=startEvents.length; i<n; i++)
                el.sceneEl.removeEventListener(startEvents[i], advanceDialogue)
            if(spawn.location!=="fixed")
                el.sceneEl.removeChild(dialogueBox)
            else document.querySelector("#camera").removeChild(dialogueBox)
            if(removeSelfOnEnd)
                el.removeAttribute('dialogue')
            else 
                for(let i=0,n=startEvents.length; i<n; i++)
                    el.addEventListener(startEvents[i], startDialogue)
            AFRAME.scenes[0].emit('updateDialogueOn', {dialogueOn:false});
            return
        }

        if (!currentDialogue.text) {
            console.error("Invalid dialogue: no text")
            return
        }
        
        if(advanceSfx)
            advanceSfx.play()
            
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
        const {el,dialogueBox,advanceDialogue,hoverChoiceSfx,hoverChoiceVolume} = this
        const {startEvents,spawn, choiceIcon, previouslyChosenIcon, dialogueID} = this.data
        let len = choices.length
        let originalY = dialogueBox.object3D.position.y
        dialogueBox.object3D.position.y=dialogueBox.object3D.position.y+len*0.5
        dialogueBox.setAttribute("material",{color:"black",opacity:spawn.opacity+0.2})
 
        for(let i=0,n=startEvents.length; i<n; i++)
            el.sceneEl.removeEventListener(startEvents[i], advanceDialogue)

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
                if(choiceData.newFlag)
                    AFRAME.scenes[0].emit('addFlag', {
                        flagKey:dialogueID,
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
                    for(let i=0,n=startEvents.length; i<n; i++)
                        el.sceneEl.addEventListener(startEvents[i], advanceDialogue)
                },100)
            }
            for(let i=0,n=startEvents.length; i<n; i++)
                circle.addEventListener(startEvents[i],choiceHandler,{once:true})
        }
    },
    updateDialogueBoxText (dialogueBox,text)
    {
        dialogueBox.setAttribute('visible',false)
        dialogueBox.setAttribute("geometry", { primitive:"plane", width: "auto", height: "auto"})
        dialogueBox.setAttribute('text',{width:4,value:text,wrapCount:40})
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