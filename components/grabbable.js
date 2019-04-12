AFRAME.registerComponent('grabbable', {
    schema: {
        sfx:{type:"string"},
        startButtons:{type:"array"},
        endButtons:{type:"array"}
    },
    init() {
        const {el} = this
        this.onDetectButtonUp = this.onDetectButtonUp.bind(this)
        this.onIntersect = this.onIntersect.bind(this)
        this.onDetectButtonDown = this.onDetectButtonDown.bind(this)
        this.onDetectButtonUp = this.onDetectButtonUp.bind(this)
        this.grab = this.grab.bind(this)
        this.ungrab = this.ungrab.bind(this)
        this.originalParent = document.querySelector('#'+el.parentNode.getAttribute('id'))
        this.originalPosition = {
            x:el.object3D.position.x,
            y:el.object3D.position.y,
            z:el.object3D.position.z
        }
        this.originalRotation = {
            x:el.object3D.rotation.x,
            y:el.object3D.rotation.y,
            z:el.object3D.rotation.z
        }
        this.originalScaling = {
            x:el.object3D.scale.x,
            y:el.object3D.scale.y,
            z:el.object3D.rotation.z
        }
        const {sfx} = this.data
        if(sfx.sfxSrc){
            this.sfxSrc = document.querySelector(sfx.sfxSrc)
            this.sfxSrc.volume = sfx.volume
        }
        this.MixedReality=false
        let HMD = AFRAME.utils.device.getVRDisplay().displayName
        if(HMD)
            if(HMD.includes("Windows"))
                this.MixedReality=true
    },
    play() {
        const {el,onIntersect,onLoseIntersection,onDetectButtonDown,onDetectButtonUp} = this
        el.addEventListener('raycaster-intersected', onIntersect);
        el.addEventListener('raycaster-intersected-cleared', onLoseIntersection);
        const {startButtons,endButtons} = this.data
        for(let i=0,n=startButtons.length; i<n; i++)
            el.addEventListener(startButtons[i], onDetectButtonDown)
        for(let i=0,n=endButtons.length; i<n; i++)
            el.addEventListener(endButtons[i], onDetectButtonUp)
    },
    pause() {
        const {el,onIntersect,onLoseIntersection,onDetectButtonDown,onDetectButtonUp} = this
        el.removeEventListener('raycaster-intersected', onIntersect);
        el.removeEventListener('raycaster-intersected-cleared', onLoseIntersection);
        const {startButtons,endButtons} = this.data
        for(let i=0,n=startButtons.length; i<n; i++)
            el.removeEventListener(startButtons[i], onDetectButtonDown)
        for(let i=0,n=endButtons.length; i<n; i++)
            el.removeEventListener(endButtons[i], onDetectButtonUp)
    },
    tick() {
        const {el,grabbing,raycaster} = this
        if(grabbing){
            if (!raycaster) {
                return;
            }
            const {x,y,z} = raycaster.components.line.data.end
            let lineLength = Math.abs(z)
            if(!this.MixedReality){
                let intersections = raycaster.components.raycaster.intersectedEls
                if(intersections.length)
                    el.object3D.position.set(x,y,z+Math.abs(z/10))
                else el.object3D.position.set(x,y,z)
            }
            else el.object3D.position.set(x,y,z)
            el.object3D.scale.set(0.5+lineLength/10,0.5+lineLength/10,0.5+lineLength/10)
        }
    },
    onIntersect(evt) {
        this.raycaster = evt.detail.el;
    },
    onLoseIntersection(evt) {
        if(!this.grabbing)
            this.raycaster = null;
    },
    onDetectButtonDown(evt) {
        const {el,raycaster} = this
        if (!raycaster)
            return;
        let intersection = raycaster.components.raycaster.getIntersection(el);
        if (!intersection)
            return;
        this.grab(raycaster)
    },
    onDetectButtonUp(evt) {
        if(this.grabbing){
            const {el} = this
            let intersections = this.raycaster.components.raycaster.intersectedEls;
            if(intersections.length){
                intersections[0].emit('mouseleave')
                AFRAME.scenes[0].emit('updateGrabbedObject', {grabbedObject:null})
                if(tryCombine(el,intersections[0])){
                    el.parentNode.removeChild(el)
                    return
                }
                if(sendUseEvent(el,intersections[0])){
                    el.parentNode.removeChild(el)
                    return
                } 
            }
            this.ungrab()
        }
    },
    grab(newParent) {
        const {originalParent,el} = this
        this.grabbing=true
        originalParent.remove(el)
        el.emit('mouseleave')
        setTimeout(()=>{
            newParent.add(el)
            el.setAttribute('look-at', "[camera]")
            el.object3D.applyMatrix(newParent.object3D.matrixWorld);
            el.object3D.position.set(newParent.object3D.position.x,newParent.object3D.position.y,-1000)
            el.classList.remove("inter");
            el.classList.remove("invObject");
            AFRAME.scenes[0].emit('updateGrabbedObject', {grabbedObject:{iconID:el.getAttribute('id'),iconSrc:el.getAttribute('src')}})
        },10)
    },
    ungrab(){
        const {originalParent,el,originalPosition,originalScaling,originalRotation} = this
        el.object3D.parent.remove(el)
        originalParent.add(el)
        this.raycaster=null
        this.grabbing=false
        AFRAME.scenes[0].emit('updateGrabbedObject', {grabbedObject:null})
        el.classList.add("inter");
        el.removeAttribute('look-at')
        el.classList.add("invObject");
        el.object3D.applyMatrix(originalParent.object3D.matrixWorld);
        el.object3D.position.set(originalPosition.x,originalPosition.y,originalPosition.z)
        el.object3D.rotation.set(originalRotation.x,originalRotation.y,originalRotation.z)
        el.object3D.scale.set(originalScaling.x,originalScaling.y,0.0001)
        el.setAttribute('visible',true)
    }
    
});