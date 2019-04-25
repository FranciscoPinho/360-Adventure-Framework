AFRAME.registerComponent('remove-self-if-desktop', {
    tick() {
      if(!AFRAME.utils.device.checkHeadsetConnected() && !AFRAME.utils.device.isMobile())
        this.el.parentNode.removeChild(this.el);
    },
  });