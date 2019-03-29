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
        inventoryZDistance: { type: "number", default: -5 }
    },
    init: function () {
        this.summonInventory = this.summonInventory.bind(this)
        this.camera = document.querySelector("#camera")
    },
    play: function () {
        this.el.addEventListener('trackpaddown', this.summonInventory)
        window.addEventListener('keydown', this.summonInventory)
    },
    pause: function () {
        this.el.removeEventListener('trackpaddown', this.summonInventory)
        window.removeEventListener('keydown', this.summonInventory)
    },
    summonInventory: function (evt) {
        /*
           <a-entity position="0 0 -4" slice9="width: 2.5; height: 1.5; left: 20; right: 43; top: 20; bottom: 43; src:icons/tooltip.png">
            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" class="inter" position="-0.6 0.3 1" src="icons/person.png" width="0.25" height="0.25" ></a-plane>
            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" class="inter" position="-0.2 0.3 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>
            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" class="inter" position="0.2 0.3 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>
            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" class="inter" position="0.6 0.3 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>

            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" position="-0.6 0 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>
            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" position="-0.2 0 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>
            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" position="0.2 0 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>
            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" position="0.6 0 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>

            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" position="-0.6 -0.3 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>
            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" position="-0.2 -0.3 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>
            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" position="0.2 -0.3 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>
            <a-plane hoverable="sfxSrc:#hover;scaleFactor:1.25" position="0.6 -0.3 1" src="icons/deer.png" width="0.25" height="0.25" ></a-plane>
        </a-entity>   
        */
        if (!this.el.sceneEl.is('vr-mode'))
            return;

        let appState = AFRAME.scenes[0].systems.state.state
        let nrInventoryObjects = appState.inventory.length

        if (nrInventoryObjects === 0 || appState.hoveringObject)
            return

        if (evt.type === "keydown") {
            evt.stopPropagation();
            if (evt.key !== "j" && evt.key !== "J")
                return
        }

        if (appState.inventoryOpen) {
            this.camera.removeChild(document.querySelector("#inventory"))
            AFRAME.scenes[0].emit('updateInventoryState', { inventoryOpen: false })
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
            objectNode.setAttribute("geometry", { primitive: "plane" })
            objectNode.setAttribute("position", { x: xPos, y: yPos, z: zPos })
            objectNode.setAttribute("hoverable", { sfxSrc: iconHoverSfx, scaleFactor: 1.25 })
            objectNode.setAttribute("src", appState.inventory[i].icon)
            objectNode.setAttribute("width", iconDimensions)
            objectNode.setAttribute("height", iconDimensions)
            inventoryNode.appendChild(objectNode)
        }
        AFRAME.scenes[0].emit('updateInventoryState', { inventoryOpen: true })
    }
});