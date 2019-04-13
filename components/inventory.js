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
        positionType: {type:"string",default:"laser"} //look laser fixed
    },
    init() {
        this.handleInventory = this.handleInventory.bind(this)
        this.unsummonInventory = this.unsummonInventory.bind(this)
        this.summonInventory = this.summonInventory.bind(this)
        this.camera = document.querySelector("#camera")
        if(this.data.summonSfx){
            this.summonSfx = document.querySelector(this.data.summonSfx)
            this.summonSfx.volume = this.data.volume
        }
        if(this.data.unsummonSfx){
            this.unsummonSfx = document.querySelector(this.data.unsummonSfx)
            this.unsummonSfx.volume = this.data.volume
        }
        if(!AFRAME.utils.device.checkHeadsetConnected() )
            this.raycaster = document.querySelector('#mouseCursor')
        else this.raycaster = document.querySelector('#hand')
        this.newMat = new THREE.Matrix4();
    },
    play() {
        const {el,handleInventory} = this
        el.addEventListener('trackpaddown', handleInventory)
        el.addEventListener('inventoryRefresh', handleInventory)
        window.addEventListener('keydown', handleInventory)
    },
    pause() {
        const {el,handleInventory} = this
        el.removeEventListener('trackpaddown', handleInventory)
        el.removeEventListener('inventoryRefresh', handleInventory)
        window.removeEventListener('keydown', handleInventory)
    },
    handleInventory(evt) {
        const {el,summonInventory,unsummonInventory} = this
        if (!el.is('vr-mode'))
           return;
        if (evt.type === "keydown") {
            evt.stopPropagation();
            if (evt.key !== "j" && evt.key !== "J")
                return
        }
        let isRefresh = evt.type==="inventoryRefresh"

        let appState = AFRAME.scenes[0].systems.state.state

        if (appState.inventoryOpen) {
            unsummonInventory(isRefresh,appState)
            if(!isRefresh)
                return
        }
        summonInventory(isRefresh,appState)
    },
    unsummonInventory(isRefresh,appState) {
        const {unsummonSfx,el,camera,raycaster} = this
        const {positionType} = this.data
        
        if(unsummonSfx)
            unsummonSfx.play()
        AFRAME.scenes[0].emit('updateInventoryState', { inventoryOpen: false })
        switch (positionType) {
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
        document.querySelectorAll("a-scene > .pointerinventory").forEach((node) => node.parentNode.removeChild(node))  
        if(appState.hoveringObject){
            document.querySelector("#"+appState.hoveringID).emit("mouseenter")
        }
    },
    summonInventory(isRefresh,appState){
        let nrInventoryObjects = appState.inventory.length
        if (nrInventoryObjects === 0  || appState.hoveringObject || appState.cutscenePlaying || appState.dialogueOn)
            return

        const { iconHoverSfx, positionType, iconDimensions, horizontalSpacing, verticalSpacing, inventoryMaxWidth, maxInventoryObjectsPerRow,
            rowHeight, columnWidth, inventoryZDistance } = this.data
        const {camera,raycaster,el,summonSfx} = this
        
        let inventoryWidth, inventoryHeight, horizontalOffset, verticalOffset

        inventoryHeight = Math.ceil(nrInventoryObjects / maxInventoryObjectsPerRow) * rowHeight
        inventoryWidth = nrInventoryObjects >= maxInventoryObjectsPerRow ? inventoryMaxWidth : nrInventoryObjects * columnWidth

        horizontalOffset = nrInventoryObjects >= maxInventoryObjectsPerRow ? -0.6 : (nrInventoryObjects - 1) * -0.2
        verticalOffset = 0.15 * (inventoryHeight / rowHeight - 1)

        //generating main inventory

        let inventoryNode = document.createElement("a-entity")
        inventoryNode.setAttribute("id", "inventory")
        inventoryNode.setAttribute("visible", false)
        inventoryNode.setAttribute("slice9", { width: inventoryWidth, height: inventoryHeight, left: 20, right: 43, top: 20, bottom: 43, src: "textures/inventory.png" })

        switch(positionType){
            case "laser":
            case "look":
                let dummyNode
                if(!isRefresh){
                    dummyNode = document.createElement("a-entity")
                    dummyNode.setAttribute("id", "dummyinventory")
                    dummyNode.setAttribute("visible", false)
                
                    if(positionType==="look"){
                        dummyNode.object3D.position.set(0,0,inventoryZDistance)
                        camera.appendChild(dummyNode)
                    }
                    else if(positionType==="laser"){
                        const {x,y} = raycaster.components.line.data.end
                        dummyNode.object3D.position.set(x,y,inventoryZDistance)  
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
        //inserting each object in inventory
        
        for (let i = 0; i < nrInventoryObjects; i++) {
            let objectNode = document.createElement("a-plane")
            let xPos, yPos, zPos
            xPos = horizontalOffset + horizontalSpacing * (i % maxInventoryObjectsPerRow)
            yPos = verticalOffset - verticalSpacing * Math.floor(i / maxInventoryObjectsPerRow)
            zPos = 1
            objectNode.classList.add("inter");
            objectNode.classList.add("invObject");
            objectNode.setAttribute("id", appState.inventory[i].iconID)
            objectNode.setAttribute("geometry", { primitive: "plane" })
            objectNode.setAttribute("position", { x: xPos, y: yPos, z: zPos })
            objectNode.setAttribute("hoverable", { sfx:{sfxSrc: iconHoverSfx,volume: 1} , scaleFactor: 1.25, pointerClass:'pointerinventory'})
            objectNode.setAttribute("src", appState.inventory[i].iconSrc)
            objectNode.setAttribute("grabbable",{startButtons:['triggerdown','mousedown'],endButtons:['triggerup','mouseup']})
            objectNode.setAttribute("width", iconDimensions)
            objectNode.setAttribute("height", iconDimensions)
            inventoryNode.appendChild(objectNode)
        }
      
        if(summonSfx)
            summonSfx.play()
    }
});