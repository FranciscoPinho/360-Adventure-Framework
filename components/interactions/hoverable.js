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
        pointer.setAttribute('id',el.getAttribute('id')+"pointer")
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
        const {pointer,el,raycaster} = this
        let appState = AFRAME.scenes[0].systems.state.state
        if(appState.dialogueOn)
            return
        if(!pointer || !el)
            return
        if (!el.sceneEl.is('vr-mode') || !pointer.getAttribute('visible'))
            return
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
        const {pointer,el,sfxSrc,halveMaterialRGB,scaleFeedback,originalScaling,lookupInventoryDescription,displayInventoryInfo} = this
        const {itemOnly,feedback,hoverIcon} = this.data
        let appState = AFRAME.scenes[0].systems.state.state
        if (appState.inventoryOpen && !el.classList.contains('invObject') && !el.classList.contains('playerchoice') && !appState.grabbedObject){
            AFRAME.scenes[0].emit('updateHoveringObject', { hoveringObject: true , hoveringID:el.getAttribute('id')})
            return
        }
        if(!this.raycaster)
            return
        if(appState.dialogueOn && !el.classList.contains('playerchoice'))
            return
        if(el.classList.contains('playerchoice')){
            if(this.pointer){
                el.sceneEl.removeChild(this.pointer)
                this.pointer=null
            }
        }
        if(itemOnly && !appState.grabbedObject)
            return
        if(appState.inventoryOpen){
            let description = lookupInventoryDescription(appState,el.getAttribute('id'))
            displayInventoryInfo(appState,description)
        }
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
        
        if (hoverIcon && !appState.grabbedObject)
            pointer.setAttribute('visible', true)
        if (!el.classList.contains('invObject'))
            AFRAME.scenes[0].emit('updateHoveringObject', { hoveringObject: true , hoveringID:el.getAttribute('id')})
    },
    onLeaveObject() {
        if (!this.el.sceneEl.is('vr-mode'))
            return;

        const {pointer,el,originColor,originalScaling,revertToOriginalRGB,scaleFeedback} = this
        const {feedback,hoverIcon} = this.data
        let appState = AFRAME.scenes[0].systems.state.state

        if (appState.inventoryOpen && !el.classList.contains('invObject') && !el.classList.contains('playerchoice') && !appState.grabbedObject)
            return
        if(appState.inventoryOpen){
            let infoBox = document.querySelector("#inventoryinfo")
            if(infoBox)
                infoBox.parentNode.removeChild(infoBox)
        }
        if (!el.classList.contains('invObject'))
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
        
        if(hoverIcon && !appState.grabbedObject)
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
    },
    displayInventoryInfo(appState,desc) {
        if(!desc)
            return
        let infoBox = document.createElement("a-entity")
        infoBox.setAttribute("id","inventoryinfo")
        infoBox.setAttribute("geometry", { primitive:"plane", width: "auto", height: "auto"})
        infoBox.setAttribute("visible",false)
        infoBox.setAttribute("material",{color:"black",opacity:0.3})
        let wrapCount = 40
        infoBox.setAttribute("text",{width:4,value:desc,font:"font/Roboto-msdf.json",wrapCount:wrapCount})
        let inventory = document.querySelector("#inventory")
        if(!inventory)
            return
        inventory.appendChild(infoBox)
        infoBox.addEventListener('loaded',()=>
        {
            let checkForHeightData = setInterval(()=>{
                if(!infoBox.components.geometry || !appState.inventoryOpen){
                    clearTimeout(checkForHeightData)
                    return
                }
                if(!infoBox.components.geometry.data.height)
                    return
                infoBox.object3D.position.set(0,-appState.inventoryHeight,0)
                infoBox.setAttribute("visible",true)    
                clearTimeout(checkForHeightData)
            },50)   
        })
    },
    lookupInventoryDescription(appState,iconID){
        for(let i=0,len=appState.inventory.length;i<len;i++){
            let icon = appState.inventory[i]
            if(icon.iconID===iconID)
                return icon.iconDesc
        }
        return ""
    }
    });