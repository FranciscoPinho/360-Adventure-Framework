//only parses the top level elements of the json, the videosphere, combinations, transitions and add to inventory
jsonToEntity = (env_json)=>{
    if(!('a-videosphere' in env_json) && !('a-sky' in env_json)){
        console.error("Invalid scene, needs to have a-videosphere with 360 video src or a-sky with 360 image src")
        return
    }
    let elementType
    'a-videosphere' in env_json ? elementType='a-videosphere':elementType='a-sky'
    let appState = AFRAME.scenes[0].systems.state.state
    let sceneID = env_json[elementType].id
    
    if(!sceneID){
        console.error("Invalid scene, needs attribute id")
        return
    }

    if(appState.parsedSceneIDs.indexOf(sceneID)===-1){
        if('combinations' in env_json){
            AFRAME.scenes[0].emit('updateCombinations', {newCombinations:env_json['combinations']});
        }
        if('transitions' in env_json){
            AFRAME.scenes[0].emit('updateTransitions', {newTransitions:env_json['transitions']});
        }
        if('addToInventory' in env_json){
            for(let i=0, n=env_json['addToInventory'].length; i<n; i++){
                AFRAME.scenes[0].emit('addToInventory', {object: env_json['addToInventory'][i]});
            }
        }
        AFRAME.scenes[0].emit('updateParsedSceneIDs', {parsedSceneID: sceneID});
    }
    
    let components = env_json[elementType]
    let newEntity = document.createElement(elementType)
   
    let jsonChildren
    for (const componentName in components){
        if(componentName==="children"){
            jsonChildren = components[componentName]
            continue
        }
        if(componentName==="scripted-audio-player"){
            if(appState.removableAudiosPlayed[sceneID])
                continue
        }
        if(componentName==="dialogue"){
            if(appState.removableDialoguesRead[sceneID])
                continue
        }
        newEntity.setAttribute(componentName,components[componentName])
    }
    newEntity.setAttribute('material',{shader:"flat",side:"back",color:"#fff"})
    return {
        "parentNode":newEntity,
        "jsonChildren":jsonChildren
    };
    
};

//parses a layer of children descendant of some node, called multiple times down the parent-child hierarchy to parse all nodes
childrenJsonToEntities = (child_json)=>{
    let finalNodes = [];
    let appState = AFRAME.scenes[0].systems.state.state
    for(let i=0,len=child_json.length;i<len;i++)
        for(const entityName in child_json[i]){
            let components = child_json[i][entityName]
            let newEntity = document.createElement(entityName)
            let jsonChildren, transformationAttributes
            let objectID = components['id']
            for (const componentName in components){
                if(componentName==="children"){
                    jsonChildren = components[componentName]
                    continue
                }
                if(componentName==="scripted-audio-player"){
                    if(appState.removableAudiosPlayed[objectID])
                        continue
                }
                if(componentName==="dialogue"){
                    if(appState.removableDialoguesRead[objectID])
                        continue
                }
                if(componentName==="id"){
                   
                    transformationAttributes = checkForPreviouslyTransformed(appState,objectID)
                    if(Object.keys(transformationAttributes).length && entityName==="a-image")
                        newEntity.setAttribute('material',{transparent:true,shader:"flat",side:"double"})
                }
                if(transformationAttributes)
                    if(Object.keys(transformationAttributes).length){
                        if(componentName in transformationAttributes)
                            newEntity.setAttribute(componentName,transformationAttributes[componentName])
                        else {
                            if("dialogue" in components && componentName==="hoverable")
                                continue
                            if(componentName!=="dialogue")
                                newEntity.setAttribute(componentName,components[componentName])
                        }
                    }
                else newEntity.setAttribute(componentName,components[componentName])
            }
            finalNodes.push({
                "parentNode":newEntity,
                "jsonChildren":jsonChildren
            });
        }   
    return finalNodes;
};

checkForPreviouslyTransformed = (appState,objectID) => {
    transformationAttributes = {}
    transformation = appState.transformedObjects[objectID]
    while(transformation){
        let moreTransformation = appState.transformedObjects[transformation.id]
        if(moreTransformation){
            transformation=moreTransformation
            continue
        }
        for(let key in transformation){
            if(key==="targeted_by" || key==="newFlag" )
                continue
            transformationAttributes[key]=transformation[key]
        } 
        return transformationAttributes
    }
    return transformationAttributes
};
