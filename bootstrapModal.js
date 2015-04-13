define(['durandal/system', 'plugins/dialog', 'durandal/app', 'durandal/viewEngine', 'knockout', 'jquery', 'Q', 'bootstrap'], function (system, dialog, app, viewEngine, ko, $, Q) {
    "use strict";
    
    dialog.addContext('bootstrapModal', {
        blockoutOpacity: .2,
        removeDelay: 300,
        addHost: function (theDialog) {
            var body = $('body');
            var host = $('<div class="modal fade" id="bootstrapModal" tabindex="-1" role="dialog" data-keyboard="false" aria-labelledby="bootstrapModal" aria-hidden="true"></div>')
                .appendTo(body);
            theDialog.host = host.get(0);
        },
        removeHost: function (theDialog) {
            $('#bootstrapModal').modal('hide');
            $('body').removeClass('modal-open');

            //Using Q but this could be a simple timeout
            //Remove the DOM element for the modal
            //Noticed some strange effects if delay was shorter that 300ms
            Q.delay(this.removeDelay).then(function () {
                ko.removeNode(theDialog.host);
            });
        },
        attached: null,
        compositionComplete: function (child, parent, context) {
            var theDialog = dialog.getDialog(context.model);
            var $bootstrapModal = $('#bootstrapModal');
            if (typeof context.model.settings.bootstrapOption === "undefined") {
                context.model.settings.bootstrapOption = null;
            }

            var options = context.model.settings.bootstrapOption || {};
            options = $.extend(options, { show: true });

            $bootstrapModal.modal(options);
            $bootstrapModal.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
                theDialog.close();
                ko.removeNode(theDialog.host);
                $('.modal-backdrop').remove();
            });
        }
    });
    var bootstrapMarkup = [
        '<div data-view="plugins/messageBox" data-bind="css: getClass(), style: getStyle()">',
        '<div class="modal-content">',
        '<div class="modal-header">',
        '<h3 data-bind="html: title"></h3>',
        '</div>',
        '<div class="modal-body">',
        '<p class="message" data-bind="html: message"></p>',
        '</div>',
        '<div class="modal-footer">',
        '<!-- ko foreach: options -->',
        '<button data-bind="click: function () { $parent.selectOption($parent.getButtonValue($data)); }, text: $parent.getButtonText($data), css: $parent.getButtonClass($index)"></button>',
        '<!-- /ko -->',
        '<div style="clear:both;"></div>',
        '</div>',
        '</div>',
        '</div>'
    ].join('\n');
    var bootstrapModal = function () { };
    bootstrapModal.install = function () {
        app.showBootstrapDialog = function (obj, activationData) {
            return dialog.show(obj, activationData, 'bootstrapModal');
        };
        app.showBootstrapMessage = function (message, title, options, autoclose, settings) {
            return dialog.showBootstrapMessage(message, title, options, autoclose, settings);
        };

        dialog.showBootstrapDialog = function (obj, activationData) {
            return dialog.show(obj, activationData, 'bootstrapModal');
        }
        dialog.showBootstrapMessage = function (message, title, options, autoclose, settings) {
            if (system.isString(this.MessageBox)) {
                return dialog.show(this.MessageBox, [
                    message,
                    title || this.MessageBox.defaultTitle,
                    options || this.MessageBox.defaultOptions,
                    autoclose || false,
                    settings || {}
                ], 'bootstrapModal');
            }
            var bootstrapDefaults = {
                buttonClass: "btn btn-default",
                primaryButtonClass: "btn-primary autofocus",
                secondaryButtonClass: "",
                "class": "modal-dialog",
                style: null
            };
            this.MessageBox.prototype.getView = function () {
                return viewEngine.processMarkup(bootstrapMarkup);
            };
            var bootstrapSettings = $.extend(bootstrapDefaults, settings);
            return dialog.show(new dialog.MessageBox(message, title, options, autoclose, bootstrapSettings), {}, 'bootstrapModal');
        };
        dialog.MessageBox.prototype.compositionComplete = function (child, parent, context) {
            var theDialog = dialog.getDialog(context.model);
            var $child = $(child);
            if ($child.hasClass('autoclose') || context.model.autoclose) {
                $(theDialog.blockout).click(function () {
                    theDialog.close();
                });
            }
        };
    };
    return bootstrapModal;
});
