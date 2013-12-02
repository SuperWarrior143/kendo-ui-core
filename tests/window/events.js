(function() {
    module("events", {
        setup: function() {
            kendo.effects.disable();
            var Window = kendo.ui.Window,
                dialog, dialogObject;
        },
        teardown: function() {
            QUnit.fixture.closest("body").find(".k-window-content").each(function(idx, element){
                $(element).data("kendoWindow").destroy();
            });
            QUnit.fixture.closest("body").find(".k-overlay").remove();
            $.mockjaxClear();
        }
    });

    function createWindow(options) {
        dialog = $("<div />").appendTo(QUnit.fixture).kendoWindow(options);
        dialogObject = dialog.data("kendoWindow");

        return dialogObject;
    }

    test("clicking on window brings it in front of other windows", function() {
        var firstWindow = createWindow(),
            secondWindow = createWindow();

        firstWindow.element.trigger("mousedown");

        equal(+firstWindow.wrapper.css("zIndex"), +secondWindow.wrapper.css("zIndex") + 2);
    });

    /*asyncT*/test("loading of iframe triggers load event", 1, function() {
        console.warn("test should be modified, so that the iframe document is loaded");
        ok(true);

        /*
        var triggered = false;
        var timeout = setTimeout(start, 2000);

        createWindow({
            content: "blank.html",
            iframe: true,
            refresh: function() {
                clearTimeout(timeout);
                start();
                ok(true);
            }
        });
        */
    });

    /*asyncT*/test("multiple loading of iframe triggers one refresh per load", function() {
        console.warn("test should be modified, so that the iframe document is loaded");
        ok(true);

        /*
        var triggers = 0;
        var first = true;
        var timeout = setTimeout(start, 4000);

        var dialog = createWindow({
            content: "blank.html",
            iframe: true,
            refresh: function() {
                triggers++;

                if (first) {
                    dialog.refresh("blank.html?v2");
                    first = false;
                } else {
                    start();
                    clearTimeout(timeout);
                    equal(triggers, 2);
                }
            }
        });
        */
    });

    test("clicking the refresh button on a static window triggers refresh event", function() {
        var triggers = 0,
            dialog = createWindow({
                actions: ["Refresh"],
                refresh: function() {
                    triggers++;
                }
            });

        dialog.wrapper.find(".k-i-refresh").trigger("click");

        equal(triggers, 1);
    });

    asyncTest("error event gets triggered with proper information", function() {
        var dialog = createWindow({
                error: function(e) {
                    ok(e);
                    equal(e.status, "error");
                    equal(e.xhr.status, 404);
                    start();
                }
            });

        $.mockjax({
            url: "/foo",
            status: 404,
            responseText: "Foo not found"
        });

        dialog.refresh("/foo");
    });

    test("moving minimized window does not show drag handles", function() {
        var dialog = createWindow();

        dialog.minimize();

        dialog.dragging.dragend({
            currentTarget: dialog.wrapper
        });

        equal(dialog.wrapper.find(".k-resize-handle").css("display"), "none");
    });

    test("moving minimized window does not show drag handles", function() {
        var dialog = createWindow();

        dialog.minimize();

        dialog.initialWindowPosition = { top: 0, left: 0 };

        dialog.dragging.dragcancel({
            currentTarget: dialog.wrapper
        });

        equal(dialog.wrapper.find(".k-resize-handle").css("display"), "none");
    });

    test("destroy can be called in close event", function() {
        var dialog = createWindow({
            close: function() {
                this.destroy();
            }
        });

        dialog.close();

        ok(true);
    });

    module("keyboard support", {
        teardown: function() {
            $(".k-window,.k-overlay").remove();
            $.mockjaxClear();
        }
    });

    var keys = kendo.keys;

    $.fn.press = function(key, options) {
        return this.trigger($.extend({ type: "keydown", keyCode: key }, options ));
    };

    test("escape key triggers close event", 2, function() {
        var triggers = 0;

        createWindow({
            close: function(e) {
                ok(true);
                ok(e.userTriggered);
            }
        });

        dialog.press(keys.ESC);
    });

    test("hitting escape in closing window does trigger new close", function() {
        var calls = 0;

        createWindow({
            close: function() {
                calls++;
            },
            animation: { close: { duration: 50 } }
        });

        dialog.press(keys.ESC).press(keys.ESC);

        equal(calls, 1);
    });

    test("up arrow moves window up", function() {
        createWindow({});

        var offset = dialogObject.wrapper.offset();

        dialog.press(keys.UP);

        QUnit.close(dialogObject.wrapper.offset().top, offset.top - 10, 1);
    });

    test("down arrow moves window down", function() {
        createWindow({});

        var offset = dialogObject.wrapper.offset();

        dialog.press(keys.DOWN);

        QUnit.close(dialogObject.wrapper.offset().top, offset.top + 10, 1);
    });

    test("left arrow moves window left", function() {
        createWindow({});

        var offset = dialogObject.wrapper.offset();

        dialog.press(keys.LEFT);

        equal(dialogObject.wrapper.offset().left, offset.left - 10);
    });

    test("right arrow moves window right", function() {
        createWindow({});

        var offset = dialogObject.wrapper.offset();

        dialog.press(keys.RIGHT);

        equal(dialogObject.wrapper.offset().left, offset.left + 10);
    });

    test("ctrl+down arrow expands window", function() {
        createWindow({ height: 200 });

        dialog.press(keys.DOWN, { ctrlKey: true });

        equal(dialogObject.wrapper.height(), 210);
    });

    test("ctrl+up arrow shrinks window", function() {
        createWindow({ height: 200 });

        dialog.press(keys.UP, { ctrlKey: true });

        equal(dialogObject.wrapper.height(), 190);
    });

    test("ctrl+left arrow shrinks window", function() {
        createWindow({ width: 200 });

        dialog.press(keys.LEFT, { ctrlKey: true });

        equal(dialogObject.wrapper.width(), 190);
    });

    test("ctrl+right arrow expands window", function() {
        createWindow({ width: 200 });

        dialog.press(keys.RIGHT, { ctrlKey: true });

        equal(dialogObject.wrapper.width(), 210);
    });

    test("ctrl+left takes minWidth into account", function() {
        createWindow({
            width: 100,
            minWidth: 95
        });

        dialog.press(keys.LEFT, { ctrlKey: true });

        equal(dialogObject.wrapper.width(), 95);
    });

    test("ctrl+right takes maxWidth into account", function() {
        createWindow({
            width: 100,
            maxWidth: 105
        });

        dialog.press(keys.RIGHT, { ctrlKey: true });

        equal(dialogObject.wrapper.width(), 105);
    });

    test("ctrl+up takes minHeight into account", function() {
        createWindow({
            height: 100,
            minHeight: 95
        });

        dialog.press(keys.UP, { ctrlKey: true });

        equal(dialogObject.wrapper.height(), 95);
    });

    test("ctrl+down takes maxHeight into account", function() {
        createWindow({
            height: 100,
            maxHeight: 105
        });

        dialog.press(keys.DOWN, { ctrlKey: true });

        equal(dialogObject.wrapper.height(), 105);
    });

    test("resizing window with the keyboard updates widget options", 2, function() {
        var initialSize = 200,
            dialog = createWindow({ width: initialSize, height: initialSize });

        dialog.element.press(keys.RIGHT, { ctrlKey: true });
        dialog.element.press(keys.DOWN, { ctrlKey: true });

        equal(dialog.options.width, initialSize + 10 + "px");
        equal(dialog.options.height, initialSize + 10 + "px");
    });

    test("hitting arrow keys in nested input does not trigger keyboard support", function() {
        createWindow({
            content: {
                template: "<input class='foo' />"
            }
        });

        var offset = dialogObject.wrapper.offset();

        dialog.find("input").press(keys.UP);

        equal(dialogObject.wrapper.offset().top, offset.top);
    });

    test("hitting escape in a non-closable window does not close it", function() {
        var triggered = false;

        createWindow({
            actions: ["custom"],
            close: function() {
                triggered = true;
            }
        });

        dialog.press(keys.ESC);

        ok(!triggered);
    });

    test("opening and closing modal Windows positions the modal overlay correctly over all other instances but one", function() {

        var win1 = createWindow({ modal: true, animate: false }),
            win2 = createWindow({ modal: true, animate: false }),
            win3 = createWindow({ modal: true, animate: false }),
            modalOverlay = QUnit.fixture.closest("body").children(".k-overlay");

        ok(modalOverlay.css("z-index") < win3.wrapper.css("z-index"));
        ok(modalOverlay.css("z-index") > win2.wrapper.css("z-index"));

        win3.close();

        ok(modalOverlay.css("z-index") < win2.wrapper.css("z-index"));
        ok(modalOverlay.css("z-index") > win1.wrapper.css("z-index"));
    });

    test("Resizing with keyboard raises resize event", 1, function() {
        var wnd = createWindow({
            resize: function() {
                ok(true);
            }
        });

        wnd.wrapper.children(".k-window-content").trigger({
            type: "keydown",
            keyCode: 40,
            ctrlKey: true
        });
    });
})();