AFRAME.registerComponent('guide-widget', {
    schema: {
        color:{type:"string",default:"#ffff00"}
    },
    init() {  
        this.checkElInFrustrum = this.checkElInFrustrum.bind(this)
        this.createArrow = this.createArrow.bind(this)
        this.updateVars = this.updateVars.bind(this)
        this.dummyVec = new THREE.Vector3(-1,0,0);
        this.camera = document.querySelector("#camera")
        this.behindAng = (Math.PI / 2);
        this.fov = this.camera.getAttribute('camera').fov
        this.width =  window.innerWidth
        this.height = window.innerHeight
        this.frustumHeight = -5 * Math.tan(this.fov * 0.5 * (Math.PI / 180));
        this.frustumWidth = this.frustumHeight * (this.width / this.height);
        this.windowHalfX = this.width/2
        this.windowHalfY = this.height/2;
        this.createArrow()
    },
    play(){
        const {el,updateVars} = this
        el.sceneEl.addEventListener('enter-vr', updateVars);
        el.sceneEl.addEventListener('exit-vr', updateVars)
    },
    pause(){
        const {el,updateVars} = this
        el.sceneEl.removeEventListener('enter-vr', updateVars);
        el.sceneEl.removeEventListener('exit-vr', updateVars)
    },
    createArrow(){
        this.guideEl = document.createElement("a-entity")
        const {guideEl,el,camera,dummyVec} = this
        guideEl.setAttribute('id',el.getAttribute('id')+"guide")
        this.arrow = new THREE.ArrowHelper(dummyVec.normalize(), dummyVec, 0.7, new THREE.Color(this.data.color),0.25,0.25)
        let color = this.arrow.cone.material.color
        this.arrow.cone.material.color.setRGB(color.r/2,color.g/2,color.b/2)
        guideEl.setObject3D("arrow",this.arrow);
        this.guideEl.object3D.visible = false
        guideEl.object3D.position.set(0,0,-5)
        setTimeout(()=>camera.appendChild(guideEl),200)
    },
    updateVars(){
        this.width =  window.innerWidth
        this.height = window.innerHeight
        this.frustumHeight = -5 * Math.tan(this.fov * 0.5 * (Math.PI / 180));
        this.frustumWidth = this.frustumHeight * (this.width / this.height);
        this.windowHalfX = this.width/2
        this.windowHalfY = this.height/2;
    },
    tick(){
        const {el,checkElInFrustrum,guideEl,dummyVec} = this
        if(checkElInFrustrum()){
            guideEl.object3D.visible = false
        }
        else {
            let targetPosition = dummyVec
            let sceneCamera = el.sceneEl.camera
            targetPosition = targetPosition.setFromMatrixPosition(el.object3D.matrixWorld);
            let lookAt = sceneCamera.getWorldDirection(new THREE.Vector3(0));
            let cameraPos = new THREE.Vector3().setFromMatrixPosition(sceneCamera.matrixWorld);
            let pos = targetPosition.sub(cameraPos);

            let behind = (pos.angleTo(lookAt)) > this.behindAng;
            targetPosition.project(sceneCamera);

            var target360XPosition = (behind ? -1 : 1) * targetPosition.x;
            var target360YPosition = (behind ? -1 : 1) * targetPosition.y;

            var screenX = target360XPosition;
            var screenY = target360YPosition;
            var rotation = Math.atan2(screenX, screenY);
            if (!behind && Math.abs(targetPosition.x)<8 && Math.abs(targetPosition.y)<10) {
                guideEl.object3D.visible = false
            }
            else{
                guideEl.object3D.visible = true
                var distHeight = Math.abs(Math.cos(rotation));
                var distWidth = Math.abs(Math.cos(this.behindAng + rotation));
                var dist = Math.min(distWidth, distHeight);

                var v = new THREE.Vector3(screenX, screenY, 0);
                v.setLength(dist);
                screenX = v.x;
                screenY = v.y;

                let newx = (screenX * this.frustumWidth) / this.windowHalfX;
                let newy = (screenY * this.frustumHeight) / this.windowHalfY;
                let newz = -5
                var newSourcePos = {x:newx,y:newy,z:newz};
                var newTargetPos = new THREE.Vector3(target360XPosition, target360YPosition, el.object3D.position.z);

                guideEl.object3D.position.copy(newSourcePos)
                var direction = newTargetPos.clone().sub(newSourcePos);
                this.arrow.setDirection(direction.normalize());
            }

        }
    },
    checkElInFrustrum(){
         //https://stackoverflow.com/questions/49902680/aframe-entity-is-seen
        let camera = this.el.sceneEl.camera
        let frustum = new THREE.Frustum();
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, 
        camera.matrixWorldInverse));  
        let pos = this.el.getAttribute('position');
        if (frustum.containsPoint(pos)) {
          return true
        }
        return false
    }   
});