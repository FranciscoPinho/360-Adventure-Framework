jsonToEntity = (env_json)=>{
    let appState = AFRAME.scenes[0].systems.state.state
    if('combinations' in env_json){
        console.log("combinations exist")
    }
    if('transitions' in env_json){
        console.log("transitions exist")
    }
    if('addToInventory' in env_json){
        for(let i=0, n=env_json['addToInventory'].length; i<n; i++){
            AFRAME.scenes[0].emit('addToInventory', {object: env_json['addToInventory'][i]});
        }
    }
    if('a-videosphere' in env_json){
        let components = env_json['a-videosphere']
        let newEntity = document.createElement('a-videosphere')
        let jsonChildren
        for (const componentName in components){
            if(componentName==="children"){
                jsonChildren = components[componentName]
                continue
            }
            newEntity.setAttribute(componentName,components[componentName])
        }
        return {
            "parentNode":newEntity,
            "jsonChildren":jsonChildren
        };
    }
    
};

childrenJsonToEntities = (child_json)=>{
    let finalNodes = [];
    for(let i=0,len=child_json.length;i<len;i++)
        for(const entityName in child_json[i]){
            let components = child_json[i][entityName]
            let newEntity = document.createElement(entityName)
            let jsonChildren
            for (const componentName in components){
                if(componentName==="children"){
                    jsonChildren = components[componentName]
                    continue
                }
                newEntity.setAttribute(componentName,components[componentName])
            }
            finalNodes.push({
                "parentNode":newEntity,
                "jsonChildren":jsonChildren
            });
        }   
    return finalNodes;
};
