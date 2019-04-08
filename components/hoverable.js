AFRAME.registerComponent('hoverable', {
    schema: {
        hoverIcon: { type: "string", default: "" },
        scaleFactor: { type: "number", default: 1.05 },
        sfx: { type: "string", default: "" },
        feedback: { type: "string", default: "color" },
        itemOnly: {type:"boolean",default:false}
    },
    init() {
        this.onHoverObject = this.onHoverObject.bind(this)
        this.onLeaveObject = this.onLeaveObject.bind(this)
        this.onIntersect = this.onIntersect.bind(this)
        this.halveMaterialRGB = this.halveMaterialRGB.bind(this)
        this.revertToOriginalRGB = this.revertToOriginalRGB.bind(this)
        this.onLoseIntersection = this.onLoseIntersection.bind(this)
        this.onLeaveObject = this.onLeaveObject.bind(this)
        this.originalScaling = this.el.getAttribute('scale')
        const {sfx} = this.data
        if(sfx.sfxSrc){
            this.sfxSrc = document.querySelector(sfx.sfxSrc)
            this.sfxSrc.volume = sfx.volume
        }
    },
    play() {
        this.pointer = document.createElement('a-image')
        const {pointer,el,onIntersect,onLoseIntersection,onHoverObject,onLeaveObject} = this
        const {hoverIcon} = this.data
        pointer.setAttribute('src', hoverIcon)
        pointer.setAttribute('visible', false)
        pointer.setAttribute('look-at', "[camera]")
        el.sceneEl.appendChild(pointer)
        el.addEventListener('raycaster-intersected', onIntersect);
        el.addEventListener('raycaster-intersected-cleared', onLoseIntersection);
        el.addEventListener('mouseenter', onHoverObject)
        el.addEventListener('mouseleave', onLeaveObject)
    },
    pause() {
        const {pointer,el,onIntersect,onLoseIntersection,onHoverObject,onLeaveObject} = this
        if (pointer) {
            el.sceneEl.removeChild(pointer)
        }
        el.removeEventListener('raycaster-intersected', onIntersect);
        el.removeEventListener('raycaster-intersected-cleared', onLoseIntersection);
        el.removeEventListener('mouseenter', onHoverObject)
        el.removeEventListener('mouseleave', onLeaveObject)
    },
    tick() {
        const {pointer,el,raycaster} = this
        if (!el.sceneEl.is('vr-mode') || !pointer.getAttribute('visible'))
            return

        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen && !appState.grabbedObject)
            return
        if (!raycaster) {
            return;
        }
        let intersection = raycaster.components.raycaster.getIntersection(el);
        if (!intersection) {
            return;
        }
        pointer.object3D.position.set(
            intersection.point.x + 0.5,
            intersection.point.y,
            intersection.point.z
        )
        pointer.object3D.scale.set(0.4 + 0.02 * Math.abs(pointer.object3D.position.x), 0.4 + 0.02 * Math.abs(pointer.object3D.position.x), 0.4 + 0.02 * Math.abs(pointer.object3D.position.x))
    },
    onIntersect(evt) {
        this.raycaster = evt.detail.el;
    },
    onLoseIntersection(evt) {
        this.raycaster = null;
    },
    onHoverObject() {
        if (!this.el.sceneEl.is('vr-mode'))
            return
        const {pointer,el,sfxSrc,halveMaterialRGB,scaleFeedback,originalScaling} = this
        const {itemOnly,feedback,hoverIcon} = this.data
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen && !el.classList.contains('invObject') && !appState.grabbedObject)
            return
        if(itemOnly && !appState.grabbedObject)
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
            case 'color':
            default:
                halveMaterialRGB()
                break
        }
        
        if (hoverIcon && !appState.grabbedObject)
            pointer.setAttribute('visible', true)
        if (!el.classList.contains('invObject'))
            AFRAME.scenes[0].emit('updateHoveringObject', {
                hoveringObject: true
            })
    },
    onLeaveObject() {
        if (!this.el.sceneEl.is('vr-mode'))
            return;

        const {pointer,el,originColor,originalScaling,revertToOriginalRGB,scaleFeedback} = this
        const {feedback,hoverIcon} = this.data
        let appState = AFRAME.scenes[0].systems.state.state

        if (appState.inventoryOpen && !el.classList.contains('invObject') && !appState.grabbedObject)
            return

        switch (feedback) {
            case 'scale':
                scaleFeedback(this.data.scaleFactor,-1)
                break
            case 'rotate':
                el.removeAttribute('spin')
                break
            case 'color':
            default:
                revertToOriginalRGB()
                break
        }
        
        pointer.setAttribute('visible', false)

        if (!el.classList.contains('invObject'))
            AFRAME.scenes[0].emit('updateHoveringObject', {
                hoveringObject: false
            })
    },
    scaleFeedback(scaleFactor,scaleDirection){
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
    },
    });