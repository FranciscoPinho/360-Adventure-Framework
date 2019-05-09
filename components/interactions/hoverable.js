AFRAME.registerComponent('hoverable', {
    schema: {
        hoverIcon: { type: "string", default: "" },
        scaleFactor: { type: "number", default: 1.05 },
        sfx: { type: "string", default: "" },
        feedback: { type: "string", default: "color" },
        itemOnly: {type:"boolean",default:false},
        pointerClass: {type:"string", default:"pointer"}
    },
    init() {
        this.onHoverObject = this.onHoverObject.bind(this)
        this.onLeaveObject = this.onLeaveObject.bind(this)
        this.onIntersect = this.onIntersect.bind(this)
        this.scaleFeedback = this.scaleFeedback.bind(this)
        this.halveMaterialRGB = this.halveMaterialRGB.bind(this)
        this.revertToOriginalRGB = this.revertToOriginalRGB.bind(this)
        this.onLoseIntersection = this.onLoseIntersection.bind(this)
        this.onLeaveObject = this.onLeaveObject.bind(this)
        this.originalScaling = this.el.getAttribute('scale')
        this.appState = AFRAME.scenes[0].systems.state.state
        const {sfx} = this.data
        if(sfx.sfxSrc){
            this.sfxSrc = document.querySelector(sfx.sfxSrc)
            if(this.sfxSrc)
                this.sfxSrc.volume = sfx.volume
        }
    },
    play() {
        this.pointer = document.createElement('a-image')
        const {pointer,el,onIntersect,onLoseIntersection,onHoverObject,onLeaveObject} = this
        const {hoverIcon,pointerClass} = this.data
        pointer.classList.add(pointerClass)
        pointer.setAttribute('id',el.id+"pointer")
        pointer.setAttribute('visible', false)
        pointer.setAttribute('src', hoverIcon)
        pointer.setAttribute('look-at', "[camera]") 
        el.sceneEl.appendChild(pointer)
        el.addEventListener('raycaster-intersected', onIntersect);
        el.addEventListener('raycaster-intersected-cleared', onLoseIntersection);
        el.addEventListener('mouseenter', onHoverObject)
        el.addEventListener('mouseleave', onLeaveObject)
    },
    pause() {
        const {el,onIntersect,onLoseIntersection,onHoverObject,onLeaveObject} = this
        el.removeEventListener('raycaster-intersected', onIntersect);
        el.removeEventListener('raycaster-intersected-cleared', onLoseIntersection);
        el.removeEventListener('mouseenter', onHoverObject)
        el.removeEventListener('mouseleave', onLeaveObject)
    },
    tick() {
        const {pointer,el,raycaster,appState} = this
        const {dialogueOn,inventoryOpen,grabbedObject} = appState
        if(dialogueOn)
            return
        if(!pointer || !el)
            return
        if (!el.sceneEl.is('vr-mode') || !pointer.getAttribute('visible'))
            return
        if (inventoryOpen && !grabbedObject)
            return
        if (!raycaster) {
            return;
        }
        let intersection = raycaster.components.raycaster.getIntersection(el);
        if (!intersection) {
            return;
        }
        pointer.object3D.position.set(
            intersection.point.x + Math.abs(intersection.point.x)*0.035,
            intersection.point.y,
            intersection.point.z
        )
        pointer.object3D.scale.set(0.08 * Math.abs(pointer.object3D.position.z), 0.08 * Math.abs(pointer.object3D.position.z), 0.08 * Math.abs(pointer.object3D.position.z))
    },
    onIntersect(evt) {
        this.raycaster = evt.detail.el;
    },
    onLoseIntersection(evt) {
        this.raycaster = null;
        AFRAME.scenes[0].emit('updateHoveringObject', { hoveringObject: false })
    },
    update(oldData){
        if(this.pointer){
            if(this.data.hoverIcon!=oldData.hoverIcon)
                this.pointer.setAttribute('src',this.data.hoverIcon)
        }
    },
    onHoverObject(evt) {
        if (!this.el.sceneEl.is('vr-mode'))
            return
        const {pointer,el,sfxSrc,appState,halveMaterialRGB,scaleFeedback,originalScaling} = this
        const {itemOnly,feedback,hoverIcon} = this.data
        const {inventoryOpen,dialogueOn,codePuzzleActive,grabbedObject} = appState
        if (inventoryOpen && !el.classList.contains('invObject') && !el.classList.contains('playerchoice') && !grabbedObject && !el.classList.contains('puzzlebutton')){
            AFRAME.scenes[0].emit('updateHoveringObject', { hoveringObject: true , hoveringID:el.id})
            return
        }
        if(!this.raycaster)
            return
        if(dialogueOn && !el.classList.contains('playerchoice'))
            return
        if(codePuzzleActive && !el.classList.contains('puzzlebutton'))
            return
        if(el.classList.contains('playerchoice') || el.classList.contains('puzzlebutton')){
            if(this.pointer){
                el.sceneEl.removeChild(this.pointer)
                this.pointer=null
            }
        }
        if(itemOnly && !grabbedObject)
            return
        if (sfxSrc)
            sfxSrc.play()

        switch (feedback) {
            case 'scale':
                scaleFeedback(this.data.scaleFactor,1)
                break
            case 'rotate':
                el.setAttribute('spin', "")
                break
            case 'nofeedback':
                break
            case 'color':
            default:
                halveMaterialRGB()
                break
        }
        
        if (hoverIcon && !grabbedObject)
            pointer.setAttribute('visible', true)
        if (!el.classList.contains('invObject'))
            AFRAME.scenes[0].emit('updateHoveringObject', { hoveringObject: true , hoveringID:el.id})
    },
    onLeaveObject() {
        if (!this.el.sceneEl.is('vr-mode'))
            return;

        const {pointer,el,originColor,originalScaling,revertToOriginalRGB,scaleFeedback,appState} = this
        const {feedback,hoverIcon} = this.data
        const {inventoryOpen,dialogueOn,codePuzzleActive,grabbedObject} = appState
        if (inventoryOpen && !el.classList.contains('invObject') && !el.classList.contains('playerchoice') && !grabbedObject && !el.classList.contains('puzzlebutton'))
            return
        if (!el.classList.contains('invObject') && !el.classList.contains('puzzlebutton'))
            AFRAME.scenes[0].emit('updateHoveringObject', { hoveringObject: false })

        switch (feedback) {
            case 'scale':
                scaleFeedback(this.data.scaleFactor,-1)
                break
            case 'rotate':
                el.removeAttribute('spin')
                break
            case 'nofeedback':
                break
            case 'color':
            default:
                revertToOriginalRGB()
                break
        }
        
        if(hoverIcon && !grabbedObject)
            pointer.setAttribute('visible', false)

       
    },
    scaleFeedback(scaleFactor,scaleDirection){
        const {originalScaling,el} = this
        let scale = originalScaling
        let newScaling = {
            x: scaleDirection>0 ? scale.x * scaleFactor: scale.x / scaleFactor,
            y: scaleDirection>0 ? scale.y * scaleFactor: scale.y / scaleFactor,
            z: scaleDirection>0 ? scale.z * scaleFactor: scale.z / scaleFactor
        }
        el.setAttribute('scale', newScaling)
    },
    halveMaterialRGB(){
        const {el} = this
        const obj = el.getObject3D('mesh');
        obj.traverse(node => {
            if (node.material) {
                if (!this.originColor)
                    this.originColor = {
                        r: node.material.color.r,
                        g: node.material.color.g,
                        b: node.material.color.b
                    }
                const {originColor} = this
                node.material.color.setRGB(originColor.r / 2, originColor.g / 2, originColor.b / 2);
            } else {
                if (!this.originColor)
                    this.originColor = {r: 1,g: 1,b: 1}
                const {originColor} = this
                node.material = new THREE.MeshBasicMaterial()
                node.material.color.setRGB(originColor.r / 2, originColor.g / 2, originColor.b / 2);
            }
        });
    },
    revertToOriginalRGB() {
        const {originColor,el} = this
        const obj = el.getObject3D('mesh');
        obj.traverse(node => {
            if (node.material && originColor)
                node.material.color.setRGB(originColor.r, originColor.g, originColor.b);
        });
    }
    });