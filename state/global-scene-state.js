AFRAME.registerState({
    nonBindedStateKeys: ['flags','inventory','pickedObjectIds','hoveringObject','musicRecords','musicBaseVolumes'],
    initialState: {
      flags:{},
      inventory:[],
      pickedObjectIds:[],
      musicRecords:{},
      musicBaseVolumes:{},
      hoveringObject: false,
      inventoryOpen:false,
      cutscenePlaying:false
    },
    handlers: {
      addFlag: (state,action) => {
        state.flags[action.flagKey]=action.flagValue
      },
      removeFlag: (state,action) => {
        delete state.flags[action.flagKey]
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
        //check for transitions if cutscenePlaying turns to false
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