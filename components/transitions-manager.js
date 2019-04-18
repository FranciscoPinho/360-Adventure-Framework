AFRAME.registerComponent('transitions-manager', {
    init() {
        this.appState = AFRAME.scenes[0].systems.state.state
    }, 
    tick(){
        //if(!state.cutscenePlaying && state.exclusivePlaying)
        //check for transitions here, add possibility to ignore cchecking for transitions here
        //do transitions listener element in scene
    },
  })