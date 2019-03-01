
scene = {
            ID,
            SCENE_SOURCE_VIDEOS:[
                "MULTIPLE VIDEOS OF THE SAME SCENE HERE"
            ],
            STATIC_INTERACTABLES:[
                "OBJECTS IN RECORDED CONTENT TO BE MADE INTERACTIVE HERE"
            ],
            OBJECTS:[
                {
                    MODEL_FILE:"door.fbx",
                    STATES:["OPEN","CLOSED"],
                    ONCLICK:"A VARIETY OF POSSIBLE CLICK EFFECTS",
                    TRANSITIONS:"CLOSED->KEY->OPEN",
                    POSITION,ROTATION,SCALE
                },
                {
                    // KEY OBJECT DEFINITION
                }
            ],
            TRANSITION_STATE:"WHEN DOOR OPEN",
            NEXT_SCENE:"A NEW ENVIRONMENT"
        }

