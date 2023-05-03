
//https://github.com/zengfr/frida-codeshare-scripts
//67036603 @chepaika/ios-clicklog
function interceptActionWithTarget(actionSelector, target) {
    console.log("\tSet hook on: " + target.$className + "." + actionSelector.readUtf8String() + "()")
    var impl = target.methodForSelector_(actionSelector)
    Interceptor.attach(impl, {
        onEnter: function(a) {
            this.log = Array()
            this.log.push("(" + a[0] + ") " + target.$className + "." + actionSelector.readUtf8String() + "()")
        },
        onLeave: function(r) {
            console.log(this.log.join('\n') + '\n')
        }})
}

function interceptActionWithoutTarget(actionSelector, uiControl) {
    var uiApp = ObjC.classes.UIApplication.sharedApplication()
    // frida bug? anyway we can't call this 
    // var actionTarget = uiApp._targetInChainForAction_sender_(actionSelector, uiControl)
    // but we can 
    var targetInChainForActionPrototype = new NativeFunction(ObjC.api.objc_msgSend, "pointer", ["pointer","pointer","pointer", "pointer"])
    var actionTargetPtr = targetInChainForActionPrototype(uiApp, ObjC.selector("_targetInChainForAction:sender:"), actionSelector, uiControl)
    if (actionTargetPtr != "0x0") {
        var actionTarget = new ObjC.Object(actionTargetPtr) 
        interceptActionWithTarget(actionSelector, actionTarget)
    } else {
        console.warn("\tCan't get target for selector: " + actionSelector.readUtf8String())
    }
}

function interceptUIAction(uiAction) {
    // At least in swift 5.5 next scheme work
    // block invoke points to swift helper that calls blockAdr+0x20
    var blockAddr = uiAction.$ivars._handler.handle
    var closurePtr = blockAddr.add(0x20).readPointer()
    var closureName = DebugSymbol.fromAddress(closurePtr).name 
    console.log("\tSet hook on: " + closureName)
    Interceptor.attach(closurePtr, {
        onEnter: function(a) {
            this.log = Array()
            this.log.push("Called " + closureName)
        },
        onLeave: function(r) {
            console.log(this.log.join('\n') + '\n')
        }})
}

function setInteceptionOnRegistredCallbacks(uiControl) {
    console.log("Get callbacks of " + uiControl.$className + " " + uiControl.handle)
    var targetActions = uiControl.$ivars._targetActions
    if (targetActions == null) {
        console.log("\tNo callbacks found")
        return
    }

    var count = targetActions.count().valueOf()
    
    for (let i = 0; i !== count; i++) {
        var action = targetActions.objectAtIndex_(i)
        // First case when UIAction specified
        if (action.$ivars._actionHandler != null) {
            var uiAction = action.$ivars._actionHandler
            interceptUIAction(uiAction)
        } else if (action.$ivars._action != null && 
                    action.$ivars._action != "0x0" &&
                    action.$ivars._target != null) {
            var actionSelector = action.$ivars._action
            var actionTarget = action.$ivars._target
            interceptActionWithTarget(actionSelector, actionTarget)
        }
        else if (action.$ivars._action != null && 
            action.$ivars._action != "0x0"){
            var actionSelector = action.$ivars._action
            interceptActionWithoutTarget(actionSelector, uiControl)
        }
        else {
            console.error("Invalid UIControlTargetAction with actionHandler and action seted to null")
            continue
        }
    }
}

function hookAllUIControlsAction() {
    console.log("Getting all UIControl's")
    var uiControls = ObjC.chooseSync(ObjC.classes.UIControl)
    uiControls.forEach(control => {setInteceptionOnRegistredCallbacks(control)})
}
//https://github.com/zengfr/frida-codeshare-scripts
//67036603 @chepaika/ios-clicklog
