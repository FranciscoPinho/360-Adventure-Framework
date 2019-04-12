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
        this.el.sceneEl.emit('inventoryRefresh')
    },
    updateFromStimulus: function (stimulus,usedObjectID) {
        const {el} = this
        AFRAME.scenes[0].emit('removeFromInventory', {
            object: { iconID: usedObjectID}
        })
        AFRAME.scenes[0].emit('addFlag', {
            flagKey:el.getAttribute('id'),
            flagValue:stimulus.newFlag
        })
        const {inventoryData,src} = stimulus
        if(stimulus.inventoryData){
            el.parentNode.removeChild(el)
            AFRAME.scenes[0].emit('addToInventory', {
                object: {
                    iconID: inventoryData.iconID,
                    iconSrc: inventoryData.iconSrc,
                    iconDesc: inventoryData.iconDesc,
                    alreadyPickedID: el.getAttribute('id')
                }
            })
        }
        else if(src){
            AFRAME.scenes[0].emit('updateTransformedObjects', {
                original:el.getAttribute('id'),
                transformation:stimulus
            })
            for(let key in stimulus){
                if(key==="targeted_by" || key==="newFlag")
                    continue
                el.setAttribute(key,stimulus[key])
            } 
        }
        //else if (dialogue)
    }
  });