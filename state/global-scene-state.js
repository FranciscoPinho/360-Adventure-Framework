AFRAME.registerState({
    nonBindedStateKeys: ['flags','inventory','pickedObjectIds','hoveringObject','musicRecords','musicBaseVolumes'],
    initialState: {
      flags:[],
      inventory:[{id: "deer", icon: "#deerIcon"},{id: "deer", icon: "#deerIcon"},{id: "deer", icon: "#deerIcon"}],
      pickedObjectIds:[],
      musicRecords:{},
      musicBaseVolumes:{},
      triggerPressed:false,
      hoveringObject: false,
      inventoryOpen:false,
      cutscenePlaying:false
    },
    handlers: {
      addFlag: (state,action) => {
        state.flags.push(action.flag)
      },
      removeFlag: (state,action) => {
        state.flags.splice(state.flags.indexOf(action.flag),1)
      },
      addToInventory: (state,action) => {
        state.inventory.push(action.object)
        state.pickedObjectIds.push(action.object.id)
      },
      removeFromInventory: (state,action) => {
        state.inventory.splice(state.inventory.indexOf(action.object),1)
      },
      updateInventoryState: (state,action) => {
        state.inventoryOpen = action.inventoryOpen
      },
      updateHoveringObject: (state,action) => {
        state.hoveringObject = action.hoveringObject
      },
      updateCutscenePlaying: (state,action) => {
        state.cutscenePlaying = action.cutscenePlaying
      },
      updateTriggerState: (state,action) => {
        state.triggerPressed = action.pressed
      },
      saveMusicRecords: (state, action) => {
        state.musicRecords[action.audioID]=action.resumeTime
      },
      saveMusicBaseVolume: (state, action) => {
        state.musicBaseVolumes[action.audioID]=action.baseVolume
      },
      saveToLocalStorage: (state,action) => {
        
      },
      loadFromLocalStorage: (state,action) => {

      },
    }
});