jsonToEntity = (env_json)=>{
    for(const entityName in env_json){
        let components = env_json[entityName]
        let newEntity = document.createElement(entityName)
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
