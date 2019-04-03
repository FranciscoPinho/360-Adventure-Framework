AFRAME.registerComponent('custom-hoverable', {
    schema: {
        hoverIcon: { type: "string", default: "" },
        scaleFactor: { type: "number", default: 1.05 },
        sfx: { type: "string", default: "" },
        feedback: { type: "string", default: "color" }
    },
    init: function () {
        this.onHoverObject = this.onHoverObject.bind(this)
        this.onLeaveObject = this.onLeaveObject.bind(this)
        this.onIntersect = this.onIntersect.bind(this)
        this.onLeaveObject = this.onLeaveObject.bind(this)
        this.originScaling = this.el.getAttribute('scale')
        const {sfx} = this.data
        if(sfx.sfxSrc){
            this.sfxSrc = document.querySelector(sfx.sfxSrc)
            this.sfxSrc.volume = sfx.volume
        }
    },
    play: function () {
        if (this.data.hoverIcon) {
            this.pointer = document.createElement('a-image')
            this.pointer.setAttribute('src', this.data.hoverIcon)
            this.el.addEventListener('raycaster-intersected', this.onIntersect);
            this.el.addEventListener('raycaster-intersected-cleared', this.onLoseIntersection);
            this.el.sceneEl.appendChild(this.pointer)
        }
        this.el.addEventListener('mouseenter', this.onHoverObject)
        this.el.addEventListener('mouseleave', this.onLeaveObject)
    },
    pause: function () {
        if (this.data.hoverIcon) {
            this.el.removeEventListener('raycaster-intersected', this.onIntersect);
            this.el.removeEventListener('raycaster-intersected-cleared', this.onLoseIntersection);
            this.el.sceneEl.removeChild(this.pointer)
        }
        this.el.removeEventListener('mouseenter', this.onHoverObject)
        this.el.removeEventListener('mouseleave', this.onLeaveObject)
    },
    tick: function () {
        if (!this.raycaster) {
            return;
        }
        let intersection = this.raycaster.components.raycaster.getIntersection(this.el);
        if (!intersection) {
            return;
        }
        this.pointer.setAttribute('position', {
            x: intersection.point.x + 0.2,
            y: intersection.point.y,
            z: intersection.point.z
        })
    },
    onIntersect: function (evt) {
        this.raycaster = evt.detail.el;
    },
    onLoseIntersection: function (evt) {
        this.raycaster = null;
    },
    onHoverObject: function () {
        if (!this.el.sceneEl.is('vr-mode'))
            return
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen && !this.el.classList.contains('invObject'))
            return

        if (this.sfxSrc)
            this.sfxSrc.play()

        switch (this.data.feedback) {
            case 'scale':
                let scale = this.originScaling
                const { scaleFactor } = this.data
                let newScaling = {
                    x: scale.x * scaleFactor,
                    y: scale.y * scaleFactor,
                    z: scale.z * scaleFactor
                }
                this.el.setAttribute('scale', newScaling)
                break
            case 'rotate':
                this.el.setAttribute('spin', "")
                break
            case 'color':
            default:
                const obj = this.el.getObject3D('mesh');
                obj.traverse(node => {
                    if(node.material){
                        if(!this.originColor)
                            this.originColor = {
                                r:node.material.color.r,
                                g:node.material.color.g,
                                b:node.material.color.b
                            }
                        node.material.color.setRGB(this.originColor.r/2,this.originColor.g/2,this.originColor.b/2);
                    }
                    else{
                        if(!this.originColor)
                            this.originColor = {r:1,g:1,b:1}
                        node.material = new THREE.MeshBasicMaterial()
                        node.material.color.setRGB(this.originColor.r/2,this.originColor.g/2,this.originColor.b/2);
                    } 
                });
                break
        }
        if (this.data.hoverIcon)
            this.pointer.setAttribute('visible', true)
        if (!this.el.classList.contains('invObject'))
            AFRAME.scenes[0].emit('updateHoveringObject', {hoveringObject: true})
    },
    onLeaveObject: function () {
        if (!this.el.sceneEl.is('vr-mode'))
            return;
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen && !this.el.classList.contains('invObject'))
            return

        switch (this.data.feedback) {
            case 'scale':
                let scale = this.originScaling
                const { scaleFactor } = this.data
                let newScaling = {
                    x: scale.x / scaleFactor,
                    y: scale.y / scaleFactor,
                    z: scale.z / scaleFactor
                }
                this.el.setAttribute('scale', newScaling)
                break
            case 'rotate':
                this.el.removeAttribute('spin')
                break
            case 'color':
            default:
                const obj = this.el.getObject3D('mesh');
                obj.traverse(node => {
                    if(node.material){
                        node.material.color.setRGB(this.originColor.r,this.originColor.g,this.originColor.b);
                    }
                });
                break
        }
    
        if (this.data.hoverIcon)
            this.pointer.setAttribute('visible', false)
        if (!this.el.classList.contains('invObject'))
            AFRAME.scenes[0].emit('updateHoveringObject', { hoveringObject: false })
    },
});