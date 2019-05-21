AFRAME.registerComponent('inventory', {
    schema: {
        horizontalSpacing: { type: "number", default: 0.4 },
        verticalSpacing: { type: "number", default: 0.3 },
        inventoryMaxWidth: { type: "number", default: 2.5 },
        rowHeight: { type: "number", default: 0.5 },
        columnWidth: { type: "number", default: 0.625 },
        maxInventoryObjectsPerRow: { type: "number", default: 4 },
        iconDimensions: { type: "number", default: 0.25 },
        iconHoverSfx: { type: "string", default: "" },
        inventoryZDistance: { type: "number", default: -6 },
        summonSfx: {type:"string", default:""},
        volume: {type:"number",default:1},
        unsummonSfx: {type:"string", default:""},
        positionType: {type:"string",default:"look"} //look laser fixed
    },
    init() {
        this.handleInventory = this.handleInventory.bind(this)
        this.unsummonInventory = this.unsummonInventory.bind(this)
        this.summonInventory = this.summonInventory.bind(this)
        this.forceClose = this.forceClose.bind(this)
        this.displayInventoryInfo = this.displayInventoryInfo.bind(this)
        this.createInventoryContainer = this.createInventoryContainer.bind(this)
        this.createInventoryIcons = this.createInventoryIcons.bind(this)
        this.appState = AFRAME.scenes[0].systems.state.state
        this.camera = document.querySelector("#camera")
        this.presentItem = ()=>this.summonInventory(false,true)
        this.postPresentItem = ()=>this.unsummonInventory(false,true)
        if(this.data.summonSfx){
            this.summonSfx = document.querySelector(this.data.summonSfx)
            if(this.summonSfx)
                this.summonSfx.volume = this.data.volume
        }
        if(this.data.unsummonSfx){
            this.unsummonSfx = document.querySelector(this.data.unsummonSfx)
            if(this.unsummonSfx)
                this.unsummonSfx.volume = this.data.volume
        }
        if(!AFRAME.utils.device.checkHeadsetConnected() )
            this.raycaster = document.querySelector('#mouseCursor')
        else this.raycaster = document.querySelector('#hand')
        this.newMat = new THREE.Matrix4();
        this.MixedReality=false
        let HMD = AFRAME.utils.device.getVRDisplay().displayName
        if(HMD)
            if(HMD.includes("Windows"))
                this.MixedReality=true
    },
    play() {
        const {el,handleInventory, presentItem, postPresentItem, forceClose} = this
        if(!this.MixedReality && !AFRAME.utils.device.isOculusGo())
            el.addEventListener('menudown',handleInventory)
        else el.addEventListener('trackpaddown', handleInventory)
        el.addEventListener('presentitem', presentItem)
        el.addEventListener('closeInventory',forceClose)
        el.addEventListener('presentedItem',postPresentItem)
        el.addEventListener('inventoryRefresh', handleInventory)
        window.addEventListener('keydown', handleInventory)
    },
    pause() {
        const {el,handleInventory,presentItem,postPresentItem, forceClose} = this
        if(!this.MixedReality && !AFRAME.utils.device.isOculusGo())
            el.addEventListener('menudown',handleInventory)
        else el.removeEventListener('trackpaddown', handleInventory)
        el.addEventListener('closeInventory',forceClose)
        el.removeEventListener('presentitem', presentItem)
        el.removeEventListener('presentedItem',postPresentItem)
        el.removeEventListener('inventoryRefresh', handleInventory)
        window.removeEventListener('keydown', handleInventory)
    },
    forceClose(evt){
        const {unsummonInventory,appState} = this
        if (appState.inventoryOpen) {
            unsummonInventory(false)
        }
    },
    handleInventory(evt) {
        const {el,summonInventory,unsummonInventory,appState,presentingItem} = this
        if (!el.is('vr-mode') || presentingItem)
           return;
        if (evt.type === "keydown") {
            evt.stopPropagation();
            if (evt.key !== "j" && evt.key !== "J")
                return
        }
       
        let isRefresh = evt.type==="inventoryRefresh"

        if (appState.inventoryOpen) {
            unsummonInventory(isRefresh)
            if(!isRefresh)
                return
        }
        summonInventory(isRefresh)
    },
    unsummonInventory(isRefresh,presentItem) {
        const {unsummonSfx,el,camera,raycaster,appState} = this
        const {positionType} = this.data
        let posType = positionType
        if(presentItem)
            posType = "look"
        if(unsummonSfx)
            unsummonSfx.play()
        AFRAME.scenes[0].emit('updateInventoryState', { inventoryOpen: false })
        delete this.infoBox
        switch (posType) {
            case "look":
                el.removeChild(document.querySelector("#inventory"))
                if(!isRefresh)
                    camera.removeChild(document.querySelector("#dummyinventory"))
                break
            case "laser":
                el.removeChild(document.querySelector("#inventory"))
                if(!isRefresh)
                    raycaster.removeChild(document.querySelector("#dummyinventory"))
                break
            case "fixed":
                camera.removeChild(document.querySelector("#inventory"))
                break
            default:
                console.error("Invalid inventory position type")
                break
        }
        let activeBackground = document.querySelector("#"+appState.activeBackgroundID)
        if(activeBackground)
            activeBackground.setAttribute('material',{opacity:1})
        document.querySelectorAll("a-scene > .pointerinventory").forEach((node) => node.parentNode.removeChild(node))  
        if(appState.hoveringObject){
            let hovering = document.querySelector("#"+appState.hoveringID)
            if(hovering)
                hovering.emit("mouseenter")
            else AFRAME.scenes[0].emit('updateHoveringObject', { hoveringObject: false})
        }
    },
    summonInventory(isRefresh,presentItem){
        const {summonSfx, appState, createInventoryContainer, createInventoryIcons} = this
        const {hoveringObject, cutscenePlaying, dialogueOn, inventory, codePuzzleActive} = appState
        let nrInventoryObjects = inventory.length
        if (nrInventoryObjects === 0  || hoveringObject || cutscenePlaying || dialogueOn || codePuzzleActive)
            return
        const {inventoryMaxWidth, maxInventoryObjectsPerRow, rowHeight, columnWidth} = this.data
  
        let inventoryWidth, inventoryHeight, horizontalOffset, verticalOffset

        inventoryHeight = Math.ceil(nrInventoryObjects / maxInventoryObjectsPerRow) * rowHeight
        inventoryWidth = nrInventoryObjects >= maxInventoryObjectsPerRow ? inventoryMaxWidth : nrInventoryObjects * columnWidth

        horizontalOffset = nrInventoryObjects >= maxInventoryObjectsPerRow ? -0.6 : (nrInventoryObjects - 1) * -0.2
        verticalOffset = 0.15 * (inventoryHeight / rowHeight - 1)

        let inventoryNode = createInventoryContainer(inventoryWidth, inventoryHeight,isRefresh,presentItem)
        createInventoryIcons(inventoryNode, horizontalOffset, verticalOffset,presentItem)
        
        if(summonSfx)
            summonSfx.play()
    },
    createInventoryContainer(inventoryWidth,inventoryHeight,isRefresh,presentItem){
        const {camera, raycaster, el, appState} = this
        const {activeBackgroundID} = appState
        const {positionType, inventoryZDistance } = this.data
        let inventoryNode = document.createElement("a-entity")
        inventoryNode.setAttribute("id", "inventory")
        inventoryNode.setAttribute("visible", false)
        inventoryNode.setAttribute("slice9", { width: inventoryWidth, height: inventoryHeight, left: 20, right: 43, top: 20, bottom: 43, src: "assets/textures/inventory.png" })
        let activeBackground = document.querySelector("#"+activeBackgroundID)
        if(activeBackground)
            activeBackground.setAttribute('material',{opacity:0.5})
        switch(positionType){
            case "laser":
            case "look":
                let dummyNode
                if(!isRefresh){
                    dummyNode = document.createElement("a-entity")
                    dummyNode.setAttribute("id", "dummyinventory")
                    dummyNode.setAttribute("visible", false)
                
                    if(positionType==="look" || presentItem){
                        dummyNode.object3D.position.set(0,0,inventoryZDistance)
                        camera.appendChild(dummyNode)
                    }
                    else if(positionType==="laser"){
                        const {x,y} = raycaster.components.line.data.end
                        if(!this.MixedReality)
                            dummyNode.object3D.position.set(x,y,inventoryZDistance)
                        else dummyNode.object3D.position.set(0,-3,inventoryZDistance)
                        raycaster.appendChild(dummyNode)
                    }
                }
                
                inventoryNode.setAttribute('look-at', "[camera]")
                el.appendChild(inventoryNode)
                setTimeout(()=>{
                    if(!isRefresh)
                        this.newMat.copy(dummyNode.object3D.matrixWorld)  
                    inventoryNode.object3D.position.setFromMatrixPosition(this.newMat)
                    inventoryNode.setAttribute("visible", true)
                },100)
                
                break
            case "fixed":
                inventoryNode.setAttribute("position", { x: 0, y: 0, z: inventoryZDistance });
                camera.appendChild(inventoryNode)  
                break
            default:
                console.error("Invalid inventory position type")
                return
        }
        AFRAME.scenes[0].emit('updateInventoryState', { inventoryOpen: true, inventoryHeight:inventoryHeight })
        return inventoryNode
    },
    createInventoryIcons(inventoryNode,horizontalOffset,verticalOffset,presentItem){
        const {el, appState, displayInventoryInfo} = this
        const {inventory,inventoryOpen} = appState
        const {iconHoverSfx, iconDimensions, horizontalSpacing, verticalSpacing, maxInventoryObjectsPerRow} = this.data
        let nrInventoryObjects = inventory.length
        for (let i = 0; i < nrInventoryObjects; i++) {
            let xPos, yPos, zPos
            xPos = horizontalOffset + horizontalSpacing * (i % maxInventoryObjectsPerRow)
            yPos = verticalOffset - verticalSpacing * Math.floor(i / maxInventoryObjectsPerRow)
            zPos = 1
            let objectNode = createBasicPlane(iconDimensions,iconDimensions,inventory[i].iconID)
            objectNode.classList.add("inter");
            objectNode.classList.add("invObject");
            objectNode.setAttribute("position", { x: xPos, y: yPos, z: zPos })
            objectNode.setAttribute("hoverable", { sfx:{sfxSrc: iconHoverSfx,volume: 1} , scaleFactor: 1.25, pointerClass:'pointerinventory'})
            objectNode.addEventListener('mouseenter',()=>displayInventoryInfo(inventory[i].iconDesc,inventoryNode))
            objectNode.setAttribute("src", inventory[i].iconSrc)
            if(presentItem){
                this.presentingItem = true
                objectNode.addEventListener('click',()=>{
                    AFRAME.scenes[0].emit('addFlag',{flagKey:inventory[i].iconID,flagValue:"presented"})
                    el.sceneEl.emit('presentedItem',{itemID:inventory[i].iconID})
                    this.presentingItem = false
                },)
            }
            else objectNode.setAttribute("grabbable",{startButtons:['triggerdown','mousedown'],endButtons:['triggerup','mouseup']})
      
            inventoryNode.appendChild(objectNode)
        }
        
    },
    displayInventoryInfo(desc,inventoryNode) {
        if(!desc || !inventoryNode)
            return 
        if(!this.infoBox){
            this.infoBox = document.createElement("a-entity")
            const {appState,infoBox} = this
            infoBox.setAttribute("id","inventoryinfo")
            infoBox.setAttribute("geometry", { primitive:"plane", width: "auto", height: "auto"})
            infoBox.setAttribute("visible",false)
            infoBox.setAttribute("material",{color:"black",opacity:0.6})
            infoBox.setAttribute("text",{width:4,value:desc,font:"assets/font/Roboto-msdf.json",wrapCount:40})
            inventoryNode.appendChild(infoBox)
            infoBox.addEventListener('loaded',()=>
            {
                let checkForHeightData = setInterval(()=>{
                    if(!infoBox.components.geometry){
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
        }
        else this.infoBox.setAttribute("text",{value:desc})
    }
});