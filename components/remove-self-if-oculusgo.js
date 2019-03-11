AFRAME.registerComponent('remove-self-if-oculusgo', {
    tick: function () {
      if(AFRAME.utils.device.isOculusGo() || AFRAME.utils.device.checkHasPositionalTracking())
        this.el.parentNode.removeChild(this.el);
    },
  });