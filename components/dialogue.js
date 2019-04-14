AFRAME.registerComponent('dialogue', {
    schema: {
        dialogueTreeURL:{type:"string"},
        sfx:{type:"string"},
        spawn:{type:"string"},
        startEvents:{type:"array"},
        examinableObject:{type:"boolean",default:false},
        removeSelfOnEnd:{type:"boolean",default:false},
        autoplay:{type:"boolean",default:false},
        pauseBackgroundSong:{type:"boolean",default:false},
        lowerBackgroundSongVolume:{type:"boolean",default:false}
    },
    init() {  
        this.startDialogue = this.startDialogue.bind(this)
        this.advanceDialogue = this.advanceDialogue.bind(this)
        this.findLabel = this.findLabel.bind(this)
        this.spawnDialogueBox = this.spawnDialogueBox.bind(this)
        this.newMat = new THREE.Matrix4();
        const {sfx} = this.data
        if(sfx.advanceSfx){
            this.advanceSfx = document.querySelector(sfx.advanceSfx)
            this.advanceSfx.volume = sfx.advanceVolume
        }
        if(sfx.spawnSfx){
            this.advanceSfx = document.querySelector(sfx.advanceSfx)
            this.advanceSfx.volume = sfx.advanceVolume
        }
    },
    play() {
        const {el,startDialogue} = this
        const {startEvents} = this.data
        for(let i=0,n=startEvents.length; i<n; i++)
            el.addEventListener(startEvents[i], startDialogue)
    },
    pause() {
        const {el,startDialogue} = this
        const {startEvents} = this.data
        if(!this.currentLine)
            for(let i=0,n=startEvents.length; i<n; i++)
                el.removeEventListener(startEvents[i], startDialogue)
        else
            for(let i=0,n=startEvents.length; i<n; i++)
                el.sceneEl.removeEventListener(startEvents[i], startDialogue)
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
        spawnDialogueBox()
    },
    spawnDialogueBox () {
        AFRAME.scenes[0].emit('updateDialogueOn', {dialogueOn:true});
        this.dialogueBox = document.createElement("a-entity")
        const {dialogueBox,el,advanceDialogue} = this
        const {spawn,startEvents}=this.data
        let zDistance = spawn.zDistance ? spawn.zDistance : -4
        let opacity = spawn.opacity ? spawn.opacity : 0.3
        dialogueBox.setAttribute("id","inventoryinfo")
        dialogueBox.setAttribute("visible",false)
        dialogueBox.setAttribute("material",{color:"black",opacity:opacity})
        dialogueBox.setAttribute("geometry", { primitive:"plane", width: "auto", height: "auto"})
        dialogueBox.setAttribute("text",{width:4,value:"placeholder",wrapCount:40})
        let camera = document.querySelector("#camera")
 
        switch(spawn.location){
            default:
            case "look":
                dialogueBox.setAttribute('look-at', "[camera]")
                dialogueBox.setAttribute("guide-widget","")
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

        const {el,dialogueTree,findLabel,currentLine,dialogueBox,advanceSfx,advanceDialogue} = this
        const {removeSelfOnEnd,examinableObject,startEvents,spawn} = this.data

        if(advanceSfx)
            advanceSfx.play()
        let currentDialogue = dialogueTree[currentLine]
        if (currentDialogue.text) {
            if(currentDialogue.choices){
                dialogueBox.setAttribute('visible',false)
                dialogueBox.setAttribute("geometry", { primitive:"plane", width: "auto", height: "auto"})
                dialogueBox.setAttribute('text',{width:4,value:currentDialogue.text,wrapCount:40})
                dialogueBox.setAttribute('visible',true)
                // display the play choices
                // player chooses and current line changes accordingly
            }
            else{
                 dialogueBox.setAttribute('visible',false)
                dialogueBox.setAttribute("geometry", { primitive:"plane", width: "auto", height: "auto"})
                dialogueBox.setAttribute('text',{width:4,value:currentDialogue.text,wrapCount:40})
                dialogueBox.setAttribute('visible',true)
            }
            
            if(currentLine===dialogueTree.length-1){
                if(examinableObject)
                    el.setAttribute('hoverable',{hoverIcon:"#examinedIcon"})
                for(let i=0,n=startEvents.length; i<n; i++)
                    el.sceneEl.removeEventListener(startEvents[i], advanceDialogue)
                dialogueBox.parentNode.removeChild(dialogueBox)
                if(spawn.location!=="fixed"){
                    let dummy = document.querySelector("#dummydialogue")
                    dummy.parentNode.removeChild(dummy)
                }
                AFRAME.scenes[0].emit('updateDialogueOn', {dialogueOn:false});
                if(removeSelfOnEnd)
                    el.removeAttribute('dialogue')      
                return
            }

            currentDialogue.next ? this.currentLine = this.findLabel(currentDialogue.next) :
                this.currentLine = currentLine + 1
        }
        else console.error("Invalid dialogue: no text")
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