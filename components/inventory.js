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
        inventoryZDistance: { type: "number", default: -5 },
        summonSfx: {type:"string", default:""},
        volume: {type:"number",default:1},
        unsummonSfx: {type:"string", default:""}
    },
    init: function () {
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
    },
    play: function () {
        this.el.addEventListener('trackpaddown', this.summonInventory)
        this.el.addEventListener('inventoryRefresh', this.summonInventory)
        window.addEventListener('keydown', this.summonInventory)
    },
    pause: function () {
        this.el.removeEventListener('trackpaddown', this.summonInventory)
        this.el.removeEventListener('inventoryRefresh', this.summonInventory)
        window.removeEventListener('keydown', this.summonInventory)
    },
    summonInventory: function (evt) {
        if (!this.el.sceneEl.is('vr-mode'))
            return;

        let appState = AFRAME.scenes[0].systems.state.state
        let nrInventoryObjects = appState.inventory.length

        if (nrInventoryObjects === 0 || appState.hoveringObject || appState.cutscenePlaying)
            return

        if (evt.type === "keydown") {
            evt.stopPropagation();
            if (evt.key !== "i" && evt.key !== "I")
                return
        }

        if (appState.inventoryOpen) {
            this.camera.removeChild(document.querySelector("#inventory"))
            if(this.unsummonSfx)
                this.unsummonSfx.play()
            AFRAME.scenes[0].emit('updateInventoryState', { inventoryOpen: false })
            if(evt.type!=="inventoryRefresh")
                return
        }

        const { iconHoverSfx, iconDimensions, horizontalSpacing, verticalSpacing, inventoryMaxWidth, maxInventoryObjectsPerRow,
            rowHeight, columnWidth, inventoryZDistance } = this.data
        let inventoryWidth, inventoryHeight, horizontalOffset, verticalOffset

        inventoryHeight = Math.ceil(nrInventoryObjects / maxInventoryObjectsPerRow) * rowHeight
        inventoryWidth = nrInventoryObjects >= maxInventoryObjectsPerRow ? inventoryMaxWidth : nrInventoryObjects * columnWidth

        horizontalOffset = nrInventoryObjects >= maxInventoryObjectsPerRow ? -0.6 : (nrInventoryObjects - 1) * -0.2
        verticalOffset = 0.15 * (inventoryHeight / rowHeight - 1)

        //generating main inventory
        let inventoryNode = document.createElement("a-entity")
        inventoryNode.setAttribute("id", "inventory")
        inventoryNode.setAttribute("position", { x: 0, y: 0, z: inventoryZDistance });
        inventoryNode.setAttribute("slice9", { width: inventoryWidth, height: inventoryHeight, left: 20, right: 43, top: 20, bottom: 43, src: "textures/inventory.png" })
        this.camera.appendChild(inventoryNode)

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
            objectNode.setAttribute("hoverable", { sfx:{sfxSrc: iconHoverSfx,volume: 1} , scaleFactor: 1.25 })
            objectNode.setAttribute("src", appState.inventory[i].iconSrc)
            objectNode.setAttribute("grabbable",{startButtons:['triggerdown','mousedown'],endButtons:['triggerup','mouseup']})
            objectNode.setAttribute("width", iconDimensions)
            objectNode.setAttribute("height", iconDimensions)
            inventoryNode.appendChild(objectNode)
        }
        if(this.summonSfx)
                this.summonSfx.play()
        AFRAME.scenes[0].emit('updateInventoryState', { inventoryOpen: true })
    }
});