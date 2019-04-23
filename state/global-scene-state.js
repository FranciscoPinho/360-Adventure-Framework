AFRAME.registerState({
    nonBindedStateKeys: ['combinations','grabbedObject','transitions','inventory','removableAudiosPlayed','removableDialoguesRead',
    'hoveringID','flags','visibilityRecords','pickedObjectIDs','cutscenePlaying','dialogueOn','inventoryHeight','exploredTreeChoices',
    'inventoryOpen','transformedObjects','parsedSceneIDs','hoveringObject','musicRecords','musicBaseVolumes'],
    initialState: {
      flags:{},  //needs to be saved to local storage
      inventory:[], //needs to be saved to local storage
      combinations:[], //needs to be saved to local storage
      transitions:[], //needs to be saved to local storage
      parsedSceneIDs:[], //needs to be saved to local storage
      transformedObjects:{}, //needs to be saved to local storage
      pickedObjectIDs:[],  //needs to be saved to local storage
      exploredTreeChoices:[],  //needs to be saved to local storage
      examinedObjects:[], //needs to be saved to local storage
      visibilityRecords:{}, //needs to be saved to local storage
      removableAudiosPlayed:{}, //needs to be saved to local storage
      removableDialoguesRead:{}, //needs to be saved to local storage
      activeLevelURL:"", //needs to be saved to local storage
      activeBackgroundURL:"", //needs to be saved to local storage
      activeBackgroundSrc:"", //needs to be saved to local storage
      activeBackgroundID:"", 
      pickAnimationPlaying:false,
      musicRecords:{},
      grabbedObject:null,
      audiosPlaying:[], 
      musicBaseVolumes:{},
      hoveringObject: false,
      inventoryOpen:false,
      inventoryHeight:0,
      hoveringID:null,
      cutscenePlaying:false,
      exclusivePlaying:false,
      dialogueOn:false,
      saveToLocalStorageKeys:['flags','removableAudiosPlayed','activeBackgroundSrc','removableDialoguesRead','visibilityRecords','inventory','combinations','transitions','examinedObjects','activeLevelURL',
      'parsedSceneIDs','transformedObjects','pickedObjectIDs','exploredTreeChoices','activeBackgroundURL']
    },
    handlers: {
      addRemovableAudio: (state,action) => {
        state.removableAudiosPlayed[action.elementID]=true
        localStorage.setItem('removableAudiosPlayed',JSON.stringify(state.removableAudiosPlayed))
      },
      addRemovableDialogue: (state,action) => {
        state.removableDialoguesRead[action.elementID]=true
        localStorage.setItem('removableDialoguesPlayed',JSON.stringify(state.removableDialoguesRead))
      },
      addFlag: (state,action) => {
        state.flags[action.flagKey]=action.flagValue
        localStorage.setItem('flags',JSON.stringify(state.flags))
      },
      addExploredDialogueTreeChoice: (state, action) => {
        if(state.exploredTreeChoices.indexOf(action.choiceID)===-1){
          state.exploredTreeChoices.push(action.choiceID)
          localStorage.setItem('exploredTreeChoices',JSON.stringify(state.exploredTreeChoices))
        } 
      },
      removeFlag: (state,action) => {
        delete state.flags[action.flagKey]
        localStorage.setItem('flags',JSON.stringify(state.flags))
      },
      addToInventory: (state,action) => {
        state.inventory.push(action.object)
        state.flags[action.object.iconID] = "inInventory"
        if(action.alreadyPickedID){
          state.pickedObjectIDs.push(action.alreadyPickedID)
          localStorage.setItem('pickedObjectIDs',JSON.stringify(state.pickedObjectIDs))
        }
        localStorage.setItem('inventory',JSON.stringify(state.inventory))
        localStorage.setItem('flags',JSON.stringify(state.flags))
      },
      addExaminedObjects: (state,action) => {
        state.examinedObjects.push(action.examinedObject)
        localStorage.setItem('examinedObjects',JSON.stringify(state.examinedObjects))
        state.flags[action.examinedObject.elID]="examined"
        localStorage.setItem('flags',JSON.stringify(state.flags))
      },
      removeFromInventory: (state,action) => {
        for(let i=0, n=state.inventory.length;i<n;i++){
            if(state.inventory[i].iconID===action.object.iconID){
              state.inventory.splice(i,1)
              state.flags[action.object.iconID] = "used"
              localStorage.setItem('inventory',JSON.stringify(state.inventory))
              localStorage.setItem('flags',JSON.stringify(state.flags))
              return
            }
        }
      },
      clearInventory: (state,action) => {
        state.inventory = []
        localStorage.removeItem('inventory')
      },
      addAudioPlaying: (state,action) => {
        if(action.exclusive){
          state.exclusiveAudioPlaying = true
          for(let i=0,len=state.audiosPlaying.length;i<len;i++){
            let audio = state.audiosPlaying[i]
            let el = document.querySelector("#"+audio.elementID)
            if(el)
              el.emit('stop-audio')
          }
          state.audiosPlaying = []
        }
        state.audiosPlaying.push(action.audio)
      },
      removeAudioPlaying: (state,action) => {
        if(action.exclusive){
          state.exclusiveAudioPlaying = false
          state.audiosPlaying = []
          return
        }

        for(let i=0,len=state.audiosPlaying.length;i<len;i++){
          let audio = state.audiosPlaying[i]
          if(audio.audioID===action.audioID){
            state.audiosPlaying.splice(i,1)
            break
          }
        }
      },
      updateVisibilityRecords: (state,action) => {
        state.visibilityRecords[action.objectID]=action.visibility
        localStorage.setItem('visibilityRecords', JSON.stringify(state.visibilityRecords))
      },
      updateTransformedObjects: (state,action) => {
        state.transformedObjects[action.original]=action.transformation
        localStorage.setItem('transformedObjects',JSON.stringify(state.transformedObjects))
      },
      updateParsedSceneIDs: (state,action) => {
        state.parsedSceneIDs.push(action.parsedSceneID)
        localStorage.setItem('parsedSceneIDs',JSON.stringify(state.parsedSceneIDs))
      },
      updateGrabbedObject: (state,action) => {
        state.grabbedObject = action.grabbedObject
      },
      updateCombinations: (state,action) => {
        state.combinations = state.combinations.concat(action.newCombinations)
        localStorage.setItem('combinations',JSON.stringify(state.combinations))
      },
      updateTransitions: (state,action) => {
        state.transitions = state.transitions.concat(action.newTransitions)
        localStorage.setItem('transitions',JSON.stringify(state.transitions))
      },
      removeTransition:(state,action) => {
        for(let i=0,len=state.transitions.length;i<len;i++){
          let transition = state.transitions[i]
          if(transition.transitionID===action.transitionID){
            state.transitions.splice(i,1)
            break
          }
        }
        localStorage.setItem('transitions',JSON.stringify(state.transitions))
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
      },
      saveMusicRecords: (state, action) => {
        state.musicRecords[action.audioID]=action.resumeTime
      },
      saveMusicBaseVolume: (state, action) => {
        state.musicBaseVolumes[action.audioID]=action.baseVolume
      },
      changeURL: (state,action) => {
        state.saveToLocalStorageKeys.forEach((key)=>{
          localStorage.setItem(key,JSON.stringify(state[key]))
        })
        localStorage.removeItem('activeBackgroundURL')
        localStorage.setItem('activeLevelURL',JSON.stringify(action.newURL))
        window.location.replace(action.newURL)
      },
      updateActiveBackground: (state,action) => {
        if(action.activeBackgroundID)
          state.activeBackgroundID = action.activeBackgroundID
        if(action.activeBackgroundSrc){
          state.activeBackgroundSrc= action.activeBackgroundSrc
          localStorage.setItem('activeBackgroundSrc',JSON.stringify(state.activeBackgroundSrc))
        }
        if(action.activeBackgroundURL){
          state.activeBackgroundURL = action.activeBackgroundURL
          localStorage.setItem('activeBackgroundURL',JSON.stringify(state.activeBackgroundURL))
        }
      },
      updatePickAnimationPlaying: (state,action) => {
        state.pickAnimationPlaying = action.playing
      },
      saveToLocalStorage: (state) => {
        state.saveToLocalStorageKeys.forEach((key)=>{
            localStorage.setItem(key,JSON.stringify(state[key]))
        })
      },
      loadFromLocalStorage: (state,action) => {
        state.saveToLocalStorageKeys.forEach((key)=>{
            let loadedItem = localStorage.getItem(key)
            if(!loadedItem)
              return
            state[key] = JSON.parse(loadedItem)
        })
        if(!action.fromMenu)
          if(state.activeLevelURL){
            if(!window.location.pathname.includes(state.activeLevelURL))
              window.location.replace(state.activeLevelURL)
          }
      },
    }
});