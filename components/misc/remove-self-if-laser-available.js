AFRAME.registerComponent('remove-self-if-laser-available', {
    tick() {
      if(AFRAME.utils.device.isOculusGo() || AFRAME.utils.device.checkHasPositionalTracking())
        this.el.parentNode.removeChild(this.el);
    },
  });