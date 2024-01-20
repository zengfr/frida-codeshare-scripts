
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1849606965 @dki/dump-ios-text-views
'use strict';

/* small script to dump UITextField and UITextView attributes for a view
 * (keyWindow by default if invoked with no arg)
 *
 * primarily to see the autocorrectType setting without dumping the whole UI
 */

var UITextAutocorrectionType = ["default", "no", "yes"]

function dumpUIText(view) {
    if (!view) {
        view = ObjC.classes.UIWindow.keyWindow();
    }

    var subviews = view.subviews();
    var count = subviews.count();
    for (var i = 0; i < count; i++) {
        var x = subviews.objectAtIndex_(i);
        if (x.isKindOfClass_(ObjC.classes.UITextField) || x.isKindOfClass_(ObjC.classes.UITextView)) {
            console.log("<" + x.$className + ": " + x.handle + ">");
            console.log("    autocorrectionType: " + UITextAutocorrectionType[x.autocorrectionType()]);
            if (x.text() != "") {
                console.log("    content: " + x.text());
            }
            // this may not always work, i'm making some assumptions about subviews
        } else if (x.isKindOfClass_(ObjC.classes.UITextFieldLabel)) {
            console.log("    Label: " + x.text());
        }
        dumpUIText(x);
    }
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1849606965 @dki/dump-ios-text-views
