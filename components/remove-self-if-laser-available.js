AFRAME.registerComponent('remove-self-if-laser-available', {
    tick: function () {
      if(AFRAME.utils.device.isOculusGo() || AFRAME.utils.device.checkHasPositionalTracking() || !AFRAME.utils.device.isMobile())
        this.el.parentNode.removeChild(this.el);
    },
  });