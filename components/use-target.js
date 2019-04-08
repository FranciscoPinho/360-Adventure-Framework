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
        AFRAME.scenes[0].emit('inventoryRefresh')
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
        el.setAttribute('src',stimulus.newSrc)
    }
  });