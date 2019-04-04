AFRAME.registerComponent('grabbable', {
    schema: {
        sfx:{type:"string"},
        startButtons:{type:"array"},
        endButtons:{type:"array"}
    },
    init: function () {
        this.onDetectButtonUp = this.onDetectButtonUp.bind(this)
        this.onIntersect = this.onIntersect.bind(this)
        this.onDetectButtonDown = this.onDetectButtonDown.bind(this)
        this.onDetectButtonUp = this.onDetectButtonUp.bind(this)
        this.grab = this.grab.bind(this)
        this.ungrab = this.ungrab.bind(this)
        this.originalParent = document.querySelector('#'+this.el.parentNode.getAttribute('id'))
        this.originalPosition = {
            x:this.el.object3D.position.x,
            y:this.el.object3D.position.y,
            z:this.el.object3D.position.z
        }
        this.originalRotation = {
            x:this.el.object3D.rotation.x,
            y:this.el.object3D.rotation.y,
            z:this.el.object3D.rotation.z
        }
        this.originalScaling = {
            x:this.el.object3D.scale.x,
            y:this.el.object3D.scale.y,
            z:this.el.object3D.rotation.z
        }
        const {sfx} = this.data
        if(sfx.sfxSrc){
            this.sfxSrc = document.querySelector(sfx.sfxSrc)
            this.sfxSrc.volume = sfx.volume
        }
    },
    play: function () {
        this.el.addEventListener('raycaster-intersected', this.onIntersect);
        this.el.addEventListener('raycaster-intersected-cleared', this.onLoseIntersection);
        const {startButtons,endButtons} = this.data
        for(let i=0,n=startButtons.length; i<n; i++)
            this.el.addEventListener(startButtons[i],this.onDetectButtonDown)
        for(let i=0,n=endButtons.length; i<n; i++)
            this.el.addEventListener(endButtons[i],this.onDetectButtonUp)
    },
    pause: function () {
        this.el.removeEventListener('raycaster-intersected', this.onIntersect);
        this.el.removeEventListener('raycaster-intersected-cleared', this.onLoseIntersection);
        const {startButtons,endButtons} = this.data
        for(let i=0,n=startButtons.length; i<n; i++)
            this.el.removeEventListener(startButtons[i],this.onDetectButtonDown)
        for(let i=0,n=endButtons.length; i<n; i++)
            this.el.removeEventListener(endButtons[i],this.onDetectButtonUp)
    },
    // line point end calculation found at https://github.com/aframevr/aframe/blob/master/src/components/raycaster.js
    tick: function () {
        if(this.grabbing){
            if (!this.raycaster) {
                return;
            }
            let intersections = this.raycaster.components.raycaster.intersectedEls;
            if(intersections.length){
                 this.el.setAttribute('visible',false)
            }
            else this.el.setAttribute('visible',true)
            let lineLength = 1000
            this.el.object3D.position.set(
                this.raycaster.object3D.position.x,
                this.raycaster.object3D.position.y,
                -lineLength
            )

            this.el.object3D.scale.set(lineLength/10,lineLength/10,lineLength/10)
        }
    },
    onIntersect: function (evt) {
        this.raycaster = evt.detail.el;
    },
    onLoseIntersection: function (evt) {
        if(!this.grabbing)
            this.raycaster = null;
    },
    onDetectButtonDown: function (evt) {
        if (!this.raycaster) {
            return;
        }
        let intersection = this.raycaster.components.raycaster.getIntersection(this.el);
        if (!intersection) {
            return;
        }
        this.grab(this.raycaster)
    },
    onDetectButtonUp: function (evt) {
        if(this.grabbing){
            let intersections = this.raycaster.components.raycaster.intersectedEls;
            if(intersections.length){
                intersections[0].emit('mouseleave')
                AFRAME.scenes[0].emit('updateGrabbedObject', {grabbedObject:null})
                if(tryCombine(this.el,intersections[0])){
                    this.el.parentNode.removeChild(this.el)
                    return
                }
                if(sendUseEvent(this.el,intersections[0])){
                    this.el.parentNode.removeChild(this.el)
                    return
                } 
            }
            this.ungrab()
        }
    },
    grab: function(newParent) {
        this.grabbing=true
        this.originalParent.remove(this.el)
        newParent.add(this.el)
        this.el.object3D.applyMatrix(newParent.object3D.matrixWorld);
        this.el.object3D.position.set(newParent.object3D.position.x,newParent.object3D.position.y,-1000)
        this.el.emit('mouseleave')
        this.el.classList.remove("inter");
        this.el.classList.remove("invObject");
        AFRAME.scenes[0].emit('updateGrabbedObject', {grabbedObject:{iconID:this.el.getAttribute('id'),iconSrc:this.el.getAttribute('src')}})

    },
    ungrab: function(){
        this.el.object3D.parent.remove(this.el)
        this.originalParent.add(this.el)
        this.raycaster=null
        this.grabbing=false
        AFRAME.scenes[0].emit('updateGrabbedObject', {grabbedObject:null})
        this.el.classList.add("inter");
        this.el.classList.add("invObject");
        this.el.object3D.applyMatrix(this.originalParent.object3D.matrixWorld);
        this.el.object3D.position.set(this.originalPosition.x,this.originalPosition.y,this.originalPosition.z)
        this.el.object3D.rotation.set(this.originalRotation.x,this.originalRotation.y,this.originalRotation.z)
        this.el.object3D.scale.set(this.originalScaling.x,this.originalScaling.y,0.0001)
        this.el.setAttribute('visible',true)
    }
    
});