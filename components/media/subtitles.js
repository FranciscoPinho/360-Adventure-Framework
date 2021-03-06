AFRAME.registerComponent('subtitles', {
    schema: {
        filepath:{type:"string"},
        mediaHook:{type:"selector"},
        positionType:{type:"string",default:"look"},
        position:{type:"string"}
    },
    async init() {
        this.createSubtitleBox = this.createSubtitleBox.bind(this)
        this.cleanupBox = this.cleanupBox.bind(this)
        this.camera = document.querySelector("#camera")
        this.tick = AFRAME.utils.throttleTick(this.tick, 500, this);
        const response = await  await fetch(this.data.filepath)
        const textsubs = await response.text()
        this.subtitles = parser.fromSrt(textsubs,true)
        this.newMat = new THREE.Matrix4();
        this.currentSubtitleIndex=-1
    },
    pause() {
        this.cleanupBox()
    },
    cleanupBox(){
        const {el,camera} = this
        if(this.subtitleBox){
            el.sceneEl.removeChild(this.subtitleBox)
            let dummyNode = document.querySelector("#dummysub")
            if(dummyNode)
                camera.removeChild(document.querySelector("#dummysub"))
            delete this.subtitleBox
        }
    },
    tick() {
        const {el,subtitles,createSubtitleBox,currentSubtitleIndex} = this
        const {mediaHook,position}=this.data
        if(mediaHook && subtitles){
            for(let i=subtitles.length-1;i>-1;i--){
                let candidateSub = subtitles[i]
                if(mediaHook.currentTime*1000>=candidateSub.startTime && mediaHook.currentTime*1000<candidateSub.endTime){
                    if(i===currentSubtitleIndex)
                        return
                    this.currentSubtitleIndex = i
                    createSubtitleBox(candidateSub.text)
                    return
                }
            }
            this.currentSubtitleIndex = -1
            this.cleanupBox()
        } 
    },
    createSubtitleBox(text) {
        this.cleanupBox()
        this.subtitleBox = document.createElement("a-entity")
        const {subtitleBox,el,camera} = this
        subtitleBox.setAttribute("id","inventoryinfo")
        subtitleBox.setAttribute("geometry", { primitive:"plane", width: "auto", height: "auto"})
        subtitleBox.setAttribute("visible",false)
        subtitleBox.setAttribute("material",{color:"black",opacity:0.2})
        subtitleBox.setAttribute("text",{width:4,value:text,font:"assets/font/Roboto-msdf.json",wrapCount:40})
        subtitleBox.setAttribute('look-at', "[camera]")
        if(this.data.position){
            subtitleBox.setAttribute('guide-widget', "")
            el.sceneEl.appendChild(subtitleBox)
            subtitleBox.setAttribute('position',this.data.position)
            subtitleBox.setAttribute("visible", true)
            return
        }
        if(this.data.positionType==="look"){
            let dummyNode
            dummyNode = document.createElement("a-entity")
            dummyNode.setAttribute("id", "dummysub")
            dummyNode.setAttribute("visible", false)
            dummyNode.object3D.position.set(0,-2,-5)
            camera.appendChild(dummyNode)
           
            el.sceneEl.appendChild(subtitleBox)
            setTimeout(()=>{
                this.newMat.copy(dummyNode.object3D.matrixWorld)  
                subtitleBox.object3D.position.setFromMatrixPosition(this.newMat)
                subtitleBox.setAttribute("visible", true)
            },50)
        }
    }
});