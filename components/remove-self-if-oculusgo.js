AFRAME.registerComponent('remove-self-if-oculusgo', {
    tick: function () {
      if(AFRAME.utils.device.isOculusGo())
        this.el.parentNode.removeChild(this.el);
    },
  });