AFRAME.registerState({
    nonBindedStateKeys: ['combinations','grabbedObject',
    'hoveringID','flags','pickedObjectIDs','cutscenePlaying','dialogueOn','inventoryHeight','exploredTreeChoices',
    'inventoryOpen','transformedObjects','parsedSceneIDs','hoveringObject','musicRecords','musicBaseVolumes'],
    initialState: {
      flags:{},
      inventory:[],
      combinations:[],
      parsedSceneIDs:[],
      transformedObjects:{},
      grabbedObject:null,
      pickedObjectIDs:[],
      musicRecords:{},
      exploredTreeChoices:[],
      musicBaseVolumes:{},
      hoveringObject: false,
      inventoryOpen:false,
      inventoryHeight:0,
      hoveringID:null,
      cutscenePlaying:false,
      dialogueOn:false
    },
    handlers: {
      addFlag: (state,action) => {
        state.flags[action.flagKey]=action.flagValue
        //check for transitions here, add possibility to ignore cchecking for transitions here
      },
      addExploredDialogueTreeChoice: (state, action) => {
        if(state.exploredTreeChoices.indexOf(action.choiceID)===-1)
          state.exploredTreeChoices.push(action.choiceID)
      },
      removeFlag: (state,action) => {
        delete state.flags[action.flagKey]
      },
      addToInventory: (state,action) => {
        state.inventory.push(action.object)
        if(action.alreadyPickedID)
          state.pickedObjectIDs.push(action.alreadyPickedID)
      },
      removeFromInventory: (state,action) => {
        for(let i=0, n=state.inventory.length;i<n;i++){
            if(state.inventory[i].iconID===action.object.iconID){
              state.inventory.splice(i,1)
              return
            }
        }
      },
      updateTransformedObjects: (state,action) => {
        state.transformedObjects[action.original]=action.transformation
      },
      updateParsedSceneIDs: (state,action) => {
        state.parsedSceneIDs.push(action.parsedSceneID)
      },
      updateGrabbedObject: (state,action) => {
        state.grabbedObject = action.grabbedObject
      },
      updateCombinations: (state,action) => {
        state.combinations = state.combinations.concat(action.newCombinations)
      },
      updateInventoryState: (state,action) => {
        state.inventoryOpen = action.inventoryOpen
        if(action.inventoryHeight)
          state.inventoryHeight = action.inventoryHeight
        else state.inventoryHeight = 0
      },
      updateHoveringObject: (state,action) => {
        state.hoveringObject = action.hoveringObject
        if(action.hoveringObject)
          state.hoveringID = action.hoveringID
        else state.hoveringID = null
      },
      updateDialogueOn: (state,action) => {
        state.dialogueOn = action.dialogueOn
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
      changeURL: (state,action) => {
        //saveToLocalStorage
        //changeURL
      },
      saveToLocalStorage: (state,action) => {
        
      },
      loadFromLocalStorage: (state,action) => {

      },
    }
});