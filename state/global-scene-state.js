AFRAME.registerState({
    nonBindedStateKeys: ['flags'],
    initialState: {
      flags:['bla']
    },
    handlers: {
      addFlag: (state,action) => {
        state.flags.push(action.flag)
      },
      removeFlag: (state,action) => {
        state.flags.splice(state.flags.indexOf(action.flag),1)
      },
      saveToLocalStorage: (state,action) => {
        
      }
    }
});