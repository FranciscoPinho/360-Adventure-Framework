AFRAME.registerState({
    nonBindedStateKeys: ['combinations','grabbedObject',
    'hoveringID','flags','pickedObjectIDs','cutscenePlaying','dialogueOn','inventoryHeight','exploredTreeChoices',
    'inventoryOpen','transformedObjects','parsedSceneIDs','hoveringObject','musicRecords','musicBaseVolumes'],
    initialState: {
      flags:{},
      inventory:[],
      combinations:[],
      transitions:[],
      parsedSceneIDs:[],
      transformedObjects:{},
      grabbedObject:null,
      pickedObjectIDs:[],
      musicRecords:{},
      audiosPlaying:[],
      activeBackgroundID:"",
      exploredTreeChoices:[],
      musicBaseVolumes:{},
      hoveringObject: false,
      inventoryOpen:false,
      inventoryHeight:0,
      hoveringID:null,
      cutscenePlaying:false,
      exclusivePlaying:false,
      dialogueOn:false
    },
    handlers: {
      addFlag: (state,action) => {
        state.flags[action.flagKey]=action.flagValue
        //if(!state.cutscenePlaying && state.exclusivePlaying)
        //check for transitions here, add possibility to ignore cchecking for transitions here
        //do transitions listener element in scene
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
        state.flags[action.object.iconID] = "inInventory"
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
      addAudioPlaying: (state,action) => {
        if(action.exclusive){
          state.exclusiveAudioPlaying = true
          for(let i=0,len=state.audiosPlaying.length;i<len;i++){
            let audio = state.audiosPlaying[i]
            let el = document.querySelector(audio.elementID)
            if(el)
              el.emit('stop-audio')
            state.audiosPlaying.splice(i,1)
          }
        }
        state.audiosPlaying.push(action.audio)
      },
      removeAudioPlaying: (state,action) => {
        for(let i=0,len=state.audiosPlaying.length;i<len;i++){
          let audio = state.audiosPlaying[i]
          if(audio.audioID===action.audioID){
            state.audiosPlaying.splice(i,1)
            break
          }
        }
        if(action.exclusive)
          state.exclusiveAudioPlaying = false
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
      updateTransitions: (state,action) => {
        state.transitions = state.transitions.concat(action.newTransitions)
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
        state.hoveringID = null
        state.hoveringObject=false
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
      updateActiveBackgroundID: (state,action) => {
        state.activeBackgroundID = action.activeBackgroundID
      },
      saveToLocalStorage: (state,action) => {
        
      },
      loadFromLocalStorage: (state,action) => {

      },
    }
});