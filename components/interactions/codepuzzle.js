AFRAME.registerComponent('codepuzzle', {
    schema : {
        startEvents:{type:"array",default:['click','triggerdown']},
        solution:{type:"string"},
        nrSolutionSpaces:{type:"number",default:0},
        buttons:{type:"array",default:["1","2","3",
                                       "4","5","6",
                                       "7","8","9"]},
        sfx:{type:"string"},
        newFlag:{type:'string',default:"solved"},
        solvedIcon:{type:'string'},
        positionType: {type:"string",default:"look"}, //look fixed
        horizontalSpacing:{type:"number", default: 0.4 },
        verticalSpacing: { type: "number", default: 0.3 },
        padMaxWidth: { type: "number", default: 1.875 },
        rowHeight: { type: "number", default: 0.5 },
        columnWidth: { type: "number", default: 0.625 },
        maxPadObjectsPerRow: { type: "number", default: 3 },
        buttonDimensions: { type: "number", default: 0.25 },
        padZDistance: { type: "number", default: -6 }
    },
    init() {
      this.onActivatePuzzle = this.onActivatePuzzle.bind(this)
      this.onClickEnter = this.onClickEnter.bind(this)
      this.createPad = this.createPad.bind(this)
      this.closePad = this.closePad.bind(this)
      this.updateSolutionSpaces = this.updateSolutionSpaces.bind(this)
      this.addPadButtonProperties = this.addPadButtonProperties.bind(this)
      this.createPadButtons = this.createPadButtons.bind(this)
      this.createSolutionSpaces = this.createSolutionSpaces.bind(this)
      this.onClickPadButton = this.onClickPadButton.bind(this)
      this.createSpecialButton = this.createSpecialButton.bind(this)
      this.appState = AFRAME.scenes[0].systems.state.state
      this.camera = document.querySelector("#camera")
      this.newMat = new THREE.Matrix4()
      if(!this.data.nrSolutionSpaces)
        this.data.nrSolutionSpaces = this.data.solution.length
      this.userSolution = ""
      this.solutionSpaces = []
      const {sfx} = this.data
      if(sfx.correctSfx){
        this.correctSfx = document.querySelector(sfx.correctSfx)
        if(this.correctSfx)
            this.correctSfx.volume = sfx.correctVolume
      }
      if(sfx.wrongSfx){
          this.wrongSfx = document.querySelector(sfx.wrongSfx)
          if(this.wrongSfx)
              this.wrongSfx.volume = sfx.wrongVolume
      }
      if(sfx.buttonSfx){
        this.buttonSfx = document.querySelector(sfx.buttonSfx)
        if(this.buttonSfx)
            this.buttonSfx. volume = sfx.buttonVolume
      }
      if(sfx.hoverButtonSfx){
        this.hoverButtonSfx = document.querySelector(sfx.hoverButtonSfx)
        if(this.hoverButtonSfx)
          this.hoverButtonSfx.volume = sfx.hoverButtonVolume
      }
    },
    play(){
     const {el, onActivatePuzzle, appState} = this
     const {startEvents,newFlag} = this.data
     for(let i=0,n=startEvents.length; i<n; i++)
        el.addEventListener(startEvents[i], onActivatePuzzle)
     if(appState.flags[el.id]===newFlag)
        el.setAttribute('hoverable',{feedback:"nofeedback"})
    },
    onActivatePuzzle(evt){
      
      const {el,appState, createPad, createPadButtons, createSolutionSpaces} = this
      const {inventoryOpen, cutscenePlaying, dialogueOn, examinedObjects, flags, codePuzzleActive} = appState
      const {buttons, padMaxWidth, maxPadObjectsPerRow,rowHeight, columnWidth, newFlag} = this.data
  
      let nrPadButtons = buttons.length
      if (nrPadButtons === 0  || codePuzzleActive || inventoryOpen || cutscenePlaying || dialogueOn || flags[el.id]===newFlag || !el.sceneEl.is('vr-mode'))
          return
      el.emit('mouseleave')
      let padWidth, padHeight, horizontalOffset, verticalOffset

      padHeight = Math.ceil(nrPadButtons / maxPadObjectsPerRow) * rowHeight
      padWidth = nrPadButtons >= maxPadObjectsPerRow ? padMaxWidth : nrPadButtons * columnWidth

      horizontalOffset = nrPadButtons >= maxPadObjectsPerRow ? -0.4 : (nrPadButtons - 1) * -0.2
      verticalOffset = 0.15 * (padHeight / rowHeight - 1)
      AFRAME.scenes[0].emit('updateCodePuzzleActive', { codePuzzleActive:true })
      let padNode = createPad(padWidth,padHeight)
      createPadButtons(padNode,horizontalOffset,verticalOffset)
      createSolutionSpaces(padNode,horizontalOffset)
    },
    createPad(padWidth,padHeight){
      const {camera, el, appState} = this
      const {activeBackgroundID} = appState
      const {positionType, padZDistance } = this.data
      let padNode = document.createElement("a-entity")
      padNode.setAttribute("id", "puzzlepad")
      padNode.setAttribute("visible", false)
      padNode.setAttribute("slice9", { width: padWidth, height: padHeight, left: 20, right: 43, top: 20, bottom: 43, src: "assets/textures/inventory.png" })
      let activeBackground = document.querySelector("#"+activeBackgroundID)
      if(activeBackground)
          activeBackground.setAttribute('material',{opacity:0.5})
      switch(positionType){
          case "look":
              let dummyNode
              dummyNode = document.createElement("a-entity")
              dummyNode.setAttribute("id", "dummypad")
              dummyNode.setAttribute("visible", false)
              dummyNode.object3D.position.set(0,0,padZDistance)
              camera.appendChild(dummyNode)        
              padNode.setAttribute('look-at', "[camera]")
              el.sceneEl.appendChild(padNode)
              setTimeout(()=>{
                  this.newMat.copy(dummyNode.object3D.matrixWorld)  
                  padNode.object3D.position.setFromMatrixPosition(this.newMat)
                  padNode.setAttribute("visible", true)
              },100)
              break
          case "fixed":
              padNode.setAttribute("position", { x: 0, y: 0, z: padZDistance });
              camera.appendChild(padNode)
              break
          default:
              console.error("Invalid pad position type")
              return
      }
     
      return padNode
    },
    createPadButtons(padNode,horizontalOffset,verticalOffset){
      const {el, createSpecialButton, closePad, onClickEnter, onClickPadButton, addPadButtonProperties} = this
      const {buttons, buttonDimensions, horizontalSpacing, verticalSpacing, maxPadObjectsPerRow} = this.data
      let nrPadButtons = buttons.length
      let zPos = 1
      for (let i = 0; i < nrPadButtons; i++) {
        let xPos, yPos
        xPos = horizontalOffset + horizontalSpacing * (i % maxPadObjectsPerRow)
        yPos = verticalOffset - verticalSpacing * Math.floor(i / maxPadObjectsPerRow)
        let buttonNode = createBasicPlane(buttonDimensions,buttonDimensions,buttons[i])
        addPadButtonProperties(buttonNode,xPos,yPos,zPos,buttons[i],1.93,onClickPadButton)
        padNode.appendChild(buttonNode)

      }
      let specialYpos = verticalOffset - verticalSpacing * 1.2 * Math.floor(nrPadButtons / maxPadObjectsPerRow)
      let enterXPosition = -0.4, closeXPosition = 0.4, textOffset = 1.7
      createSpecialButton(padNode,"enterbutton",enterXPosition,specialYpos,zPos,"ENTER", textOffset, "green", onClickEnter)
      createSpecialButton(padNode,"closebutton",closeXPosition,specialYpos,zPos,"CLOSE", textOffset, "red", closePad)
    },
    createSolutionSpaces(padNode,horizontalOffset){
      const {solution,nrSolutionSpaces,buttonDimensions,horizontalSpacing, verticalSpacing, padMaxWidth} = this.data
      let zPos = 1
      for (let i=0, n=nrSolutionSpaces; i<n;i++){
        let xPos, yPos
        let factor = n===1?0:n
        xPos = horizontalOffset * 0.32 * factor + horizontalSpacing * 0.8 * (i % n)
        yPos = 1
        let buttonNode = createBasicPlane(buttonDimensions,buttonDimensions,`sol${i}`)
        buttonNode.setAttribute("position", { x: xPos, y: yPos, z: zPos })
        buttonNode.setAttribute('material',{color:"#BBB"})
        this.solutionSpaces.push(buttonNode)
        padNode.appendChild(buttonNode)
      }
    },
    createSpecialButton(padNode,btnid,xPos,yPos,zPos,text,textOffset,backgroundColor,clickHandler){
      const {addPadButtonProperties} = this
      const {buttonDimensions} = this.data
      let buttonNode = createBasicPlane(buttonDimensions*3,buttonDimensions,btnid)
      addPadButtonProperties(buttonNode,xPos,yPos,zPos,text,textOffset,clickHandler)
      buttonNode.setAttribute('material',{color:backgroundColor})
      padNode.appendChild(buttonNode)
    },
    addPadButtonProperties(buttonNode,xPos,yPos,zPos,text,textOffset,clickHandler){
      let hoverData = {
        scaleFactor: 1.25, 
        pointerClass:'pointerpad'
      }
      if(this.data.sfx.hoverButtonSfx){
        hoverData['sfx']={}
        hoverData['sfx']['sfxSrc'] = this.data.sfx.hoverButtonSfx
        hoverData['sfx']['volume'] = this.hoverButtonSfx.volume
      }
      buttonNode.classList.add("inter");
      buttonNode.classList.add("puzzlebutton");
      buttonNode.setAttribute("position", { x: xPos, y: yPos, z: zPos })
      buttonNode.setAttribute("hoverable", hoverData)
      buttonNode.setAttribute("text",{value:text,color:"#000",width:4, xOffset:textOffset})
      buttonNode.addEventListener('click',clickHandler)
    },
    onClickPadButton(evt){
      const {userSolution,updateSolutionSpaces, buttonSfx} = this
      const {nrSolutionSpaces} = this.data
      if(userSolution.length===nrSolutionSpaces)
        return
      if(buttonSfx)
        buttonSfx.play()
      this.userSolution+=evt.srcElement.id
      updateSolutionSpaces()
    },
    onClickEnter(evt){
        const {el,wrongSfx,correctSfx,userSolution, updateSolutionSpaces, closePad} = this
        const {solution, newFlag, solvedIcon} = this.data
        if(userSolution!==solution){
          this.userSolution=""
          if(wrongSfx)
            wrongSfx.play()
          updateSolutionSpaces()
          return
        }
        if(correctSfx)
          correctSfx.play()
        AFRAME.scenes[0].emit('addFlag',{flagKey:el.id,flagValue:newFlag})
        AFRAME.scenes[0].emit('addExaminedObjects',{examinedObject:{hoverIcon:solvedIcon,elID:el.id}})
        el.setAttribute('hoverable',{hoverIcon:solvedIcon,feedback:"nofeedback"})
        closePad(null,true)
    },
    updateSolutionSpaces(){
      const {userSolution, solutionSpaces} = this
      let solutionLen = solutionSpaces.length
      if(!userSolution)
        for(let i=0;i<solutionLen;i++)
          solutionSpaces[i].setAttribute('text',{value:""})
      else
        for(let i=0,n=userSolution.length;i<n;i++)
          solutionSpaces[solutionLen-1-i].setAttribute('text',{value:userSolution.charAt(userSolution.length-1-i),color:"#fff",width:4, xOffset:1.93})
    },
    closePad(evt,solved=false) {
      const {el,camera,appState,closePad,onActivatePuzzle} = this
      const {activeBackgroundID,hoveringID,hoveringObject} = appState
      const {positionType, startEvents} = this.data

      switch (positionType) {
          case "look":
              el.sceneEl.removeChild(document.querySelector("#puzzlepad"))
              camera.removeChild(document.querySelector("#dummypad"))
              break
          case "fixed":
              camera.removeChild(document.querySelector("#puzzlepad"))
              break
          default:
              console.error("Invalid inventory position type")
              break
      }
      let activeBackground = document.querySelector("#"+activeBackgroundID)
      if(activeBackground)
          activeBackground.setAttribute('material',{opacity:1})
      document.querySelectorAll("a-scene > .pointerpad").forEach((node) => node.parentNode.removeChild(node))  
      if(hoveringObject){
          let hovering = document.querySelector("#"+hoveringID)
          if(hovering)
            hovering.emit("mouseenter")
          else AFRAME.scenes[0].emit('updateHoveringObject', { hoveringObject: false})
      }
      this.userSolution = ""
      this.solutionSpaces.length = 0
      AFRAME.scenes[0].emit('updateCodePuzzleActive', { codePuzzleActive:false })
      if(solved)
        for(let i=0,n=startEvents.length; i<n; i++)
          el.removeEventListener(startEvents[i], onActivatePuzzle)
  },
  });