AFRAME.registerState({
    nonBindedStateKeys: ['flags'],
    initialState: {
      flags:['bla'],
      inventory:[],
      pickedObjectIds:[]
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
      saveToLocalStorage: (state,action) => {
        
      },
      loadFromLocalStorage: (state,action) => {

      }
    }
});