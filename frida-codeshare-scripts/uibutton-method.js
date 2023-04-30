/* Sample output

[Local::PID::53862 ]-> findButtonMethod()
[*] UIButton "Sample button" @0x7f7d2190cc40:
         -[ViewController pressed:]

*/

function findButtonMethod(view) {
        ObjC.schedule(ObjC.mainQueue, function() {
                if (view == null) {
                        view = ObjC.classes.UIWindow.keyWindow()
                }

                var subviews = view.subviews();
                for (var i = 0; i < subviews.count(); i++) {
                        var vView = subviews.objectAtIndex_(i);
                        if (vView.isKindOfClass_(ObjC.classes.UIButton)) {
                                var label = vView.titleLabel().text();
                                var targets = vView.allTargets().allObjects();
                                var controlEvents = vView.allControlEvents();

                                var msg = "[*] UIButton \"" + label + "\" @" + vView.handle + ":";
                                console.log(msg);

                                for (var j = 0; j < targets.count(); j++) {
                                        var tgt = targets.objectAtIndex_(j);
                                        var actions = vView.actionsForTarget_forControlEvent_(tgt.handle, controlEvents);
                                        for (var k = 0; k < actions.count(); k++) {
                                                var method = "-[" + tgt.$className + " " + actions.objectAtIndex_(k) + "]";
                                                console.log("\t", method);
                                        }
                                }
                        }
                        findButtonMethod(vView);
                }
        })
}
//https://github.com/zengfr/frida-codeshare-scripts
//29874377 @lateralusd/uibutton-method