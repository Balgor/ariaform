/**
 * AJAX Form handler for useage with bootstrap (and Symfony)
 * 
 * 
 * 
 */
(function ($) {
    $.fn.ariaForm = function (opts, args) {

        if ($(this).length === 0) {
            return;
        }
        if ($(this).data('ariaform-initialized') === true) {
            if (typeof opts === "string") {
                executeFnc(opts, args, this);
            }
            return;
        }
        var options = new Object();
        if (opts) {
            options = $.extend(true, $.fn.ariaForm.defaults, opts);
        } else {
            options = $.extend(true, {}, $.fn.ariaForm.defaults);
        }

        $(this).data('ariaform-options', options);
        $(this).each(init);
        $(this).data('ariaform-initialized', true);
    };
    $.fn.ariaForm.defaults = {
        reset: false,
        blocking: false,
        submitTrigger: 'manual', // change
        checkOn: 'blur', // blur / change
        loader: false, // loader html to be added
        handlers: {
            fieldMessage: function (type, message, form) { //Errors/messages directed at specified input area
                var group = this.closest('.form-group');
                if (type === 'invalid') {
                    group.addClass('has-error has-feedback');
                    if (this.siblings('.form-control-feedback').length === 0) {
                        group.find('input').after('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
                    }
                    group.find('.help-block').html(message);
                } else {
                    group.removeClass('has-error has-feedback');
                    group.find('.form-control-feedback').remove();
                    group.find('.help-block').html('');
                }
            },
            submitStart: function (form) { //displays loader on form submit
                form.find('.form-group').each(function () {
                    $(this).removeClass('has-error has-feedback');
                    group.find('.form-control-feedback').remove();
                    $(this).find('.help-block').html('');
                });
                var loader = form.data('ariaform-options').loader.clone();
                loader.hide();
                result.append(loader);
                loader.fadeIn(250);
            },
            /**
             * 
             * @param form
             * @param String message
             * @param String type Can be success or error
             * @returns void
             */
            submitResult: function (form, payload, type) {

                var alert = $('<div class="alert ariaform-result alert-dismissible"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
                if (type === 'error') {
                    alert.addClass('alert-danger');
                }
                if (type === 'success') {
                    alert.addClass('alert-success');
                }
                var previousResults = $(document.body).children('.ariaform-result');
                alert.css({
                    position: 'fixed',
                    zIndex: '10000',
                    left: '25px',
                    bottom: '25px',
                    opacity: 0,
                    maxWidth: '320px'
                });
                alert.append(payload.message);
                alert.off('mouseenter').on('mouseenter', function () {
                    window.clearTimeout(alert.data('timeout'));
                });
                alert.off('mouseleave').on('mouseleave', function () {
                    alert.data('timeout', window.setTimeout(function () {
                        semiFadeResultAlert(alert);
                    }, 5000));
                });
                $(document.body).append(alert);
                previousResults.each(function () {
                    $(this).animate({
                        bottom: parseInt($(this).css('bottom').replace(/[^-\d\.]/g, '')) + alert.outerHeight(true) + 'px'
                    }, 300);
                });
                alert.data('timeout', window.setTimeout(function () {
                    semiFadeResultAlert(alert);
                }, 5000));
                alert.animate({opacity: 1}, 300);
//                    loader.animate({opacity: 0}, 300, function () {
//                        $(this).remove();
//                    });
            },
            submitSuccess: function (form) {
                form.find('label.is-invalid-label').removeClass('is-invalid-label');
                form.find('input.is-invalid-input').removeClass('is-invalid-input');
                form.find('.form-error').removeClass('is-visible');
            },
            submitComplete: function (payload) {

            },
            actionClose: function (data, payload) {
                $(this).closest('.modal').modal('hide');
            },
            actionRedirect: function (data, payload) {
                window.top.location = action.data;
            },
            actionReset: function (data, payload) {
                $(this)[0].reset();
            },
            actionResetPassword: function (data, payload) {
                $(this).find('input[type=password]').val('');
            }
        }
    }

    function semiFadeResultAlert(alert) {
        alert.animate({
            opacity: 0.5
        }, 200);
        alert.off('mouseleave').on('mouseleave', function () {
            $(this).stop().animate({
                opacity: 0.5
            }, 200);
            alert.data('timeout', window.setTimeout(function () {
                completelyFadeResultAlert(alert);
            }, 5000));
        });
        alert.off('mouseenter').on('mouseenter', function () {
            $(this).stop().animate({
                opacity: 1
            }, 200);
            window.clearTimeout(alert.data('timeout'));
        });
        alert.data('timeout', window.setTimeout(function () {
            completelyFadeResultAlert(alert);
        }, 5000));
    }

    function completelyFadeResultAlert(alert) {
        alert.animate({
            opacity: 0
        }, 200, function () {
            alert.alert('close');
        });
    }

    function executeFnc(fnc, args, form) {
        switch (fnc) {
            case 'display-loader':
                return submitStart(form);
                break;
            case 'display-result':
                submitResult(form, args[0], args[1]);
                break;
            case 'display-result-success':
                submitResult(form, args[0], 'success');
                break;
            case 'display-result-error':
                submitResult(form, args[0], 'error');
                break;
            default:
                return 'no such function defined';
                break;
        }
    }
    function init() {
        var self = $(this);
        if (!self.is('form')) {
            new Toast('Unknown error, please try again later', 5000);
            return false;
        }

        self.data('url', self.attr('action'));
        self.off('submit').on('submit', submit);
        if (self.data('ariaform-options').check_on === 'blur') {
            self.find('.check').on('blur', check);
        } else if (self.data('ariaform-options').check_on === 'change') {
            self.find('.check').on('input propertychange paste', checkChange);
        }
        if (self.data('ariaform-options').submitTrigger === 'change') {
            self.find('input[type="checkbox"],input[type="radio"], select').on('change', function () {
                self.trigger('submit');
            });
        }
        self.find('[type=submit]').click(function () {
            $(this).closest("form").find('[type=submit]').removeAttr("clicked");
            $(this).attr("clicked", "true");
        });
        if (self.data('ariaform-options').blocking === true) {
            self.find('[type=submit]').attr('disabled', '');
            self.data('blocks', self.find('.check.required').length);
        }

    }
    function submitStart(form, button) {
//        form.find('.submit').data('old', form.find('.submit').html()).html('Zpracovávám');
        form.data('ariaform-options').handlers.submitStart(form, button);
    }
    function submitSuccess(form) {
        form.data('ariaform-options').handlers.submitSuccess(form);
    }
    /**
     * Callbacks change presubmit -> submit, submit -> success, error -> error
     * @param Event e
     * @returns void
     */
    function submit(e) {
        e.preventDefault();
        var form = $(this);
        if (form.data('submitting') === true) {
            return;
        }
        form.data('submitting', true);
        var dataOutput = serialize(form);
        dataOutput.submit = form.find("[type=submit][clicked=true]").val();
//        dataOutput.fields['_files'] = form.data('files');
        submitStart(form, form.find("[type=submit][clicked=true]"));
        form.trigger('ariaform:submit', [dataOutput, form.find("[type=submit][clicked=true]")]);
        submitJquery(form, form.data('url'), dataOutput);
    }

    function submitJquery(form, url, data) {
        var params = {};
        params.url = url;
        params.data = data;
        params.type = 'POST';
        var request = $.ajax(params).done(function (payload, status, xhr) {
            submitSuccess(form, payload);

            if (payload.result === 'success') {
                submitResult(form, payload, 'success');
                if (payload.actions !== undefined) {
                    processActions.call(form, payload);
                }
                form.trigger('ariaform:success', [payload]);
                if (form.data('ariaform-options').reset === true) {
                    form[0].reset();
                }

            } else {
                form.trigger('ariaform:error', [payload]);
                processMessages.call(form, payload.errors);
                submitResult(form, payload, 'error');
            }
        }).fail(function (payload, status, xhr) {
            form.trigger('ariaform:ajax_error', payload);
            var message = payload.message;
            if (payload.error) {
                message += ' (' + payload.error + ')';
            }

            submitResult(form, message, 'error');

        }).always(function (payload, status, xhr) {
            form.data('submitting', false);
            form.trigger('ariaform:complete', [payload]);
            form.data('ariaform-options').handlers.submitComplete(form, payload);
        });
    }

    /**
     * After succesful form submit proccesss response from server whether and what action to perform post submit
     * 
     * 
     * @param Object action Specification of action to be performed
     * @param jquery form form current form
     * @param Object payload full payload recieved from server
     * @returns {undefined}
     */
    function processActions(payload) {
        for (var action in payload.actions) {
            this.trigger('ariaform:action:' + action, [payload.actions[action], payload]);
            if (this.data('ariaform-options').handlers['action' + action] !== undefined) {
                this.data('ariaform-options').handlers['action' + action].call(form, payload.actions[action], payload);
            }
        }
    }

    /**
     * 
     * @param jquery form current form
     * @param String message message to be displayed
     * @param String type type of the message success/error
     * @returns {undefined}
     */
    function submitResult(form, payload, type) {
        return form.data('ariaform-options').handlers.submitResult(form, payload, type);
    }
    /**
     * Provides timeout on check function to send data to server with a delay
     * @param jquery event e
     * @returns {undefined}
     */
    function checkChange(e) {
        window.clearTimeout($(e.delegateTarget).closest('form').data('check_timeout'));
        $(e.delegateTarget).closest('form').data('check_timeout', window.setTimeout(function () {
            check(e);
        }, 700));
    }
    /**
     * Sends input value to server for evaulation
     * 
     * Display fieldMessage as a result
     * 
     * @param jquery event e
     * @returns {undefined}
     */
    function check(e) {
// console.log('checking!');
//$(e.delegateTarget).parent().removeClass('invalid').removeClass('valid');
        var form = $(e.delegateTarget).closest('form');
        console.log(form.data('ariaform-options'));
        if (form.data('ariaform-options').scope) {
            var scope = form.data('ariaform-options').scope;
        }
        var fields = {};
        fields[$(e.delegateTarget).attr('id')] = $(e.delegateTarget).val();
        new Ajax($(e.delegateTarget).closest('form').data('url'), {type: 'check', fields: fields, scope: scope, method: 'ajax'})
                .success(function (payload) {
                    for (var i in payload.fields) {
                        fieldMessage(payload.fields[i].message, payload.fields[i].status, payload.fields[i].id, form);
                    }
                }).run();
    }


    /**
     * Finds specified input from field definition and calls fieldMessage calllback
     * @param String type type of the message valid/invalid/error
     * @param Array field specification on the field and its message
     * @param jQuery form current form element 
     * @returns {undefined}
     */
    function processMessages(list) {
        for (var i in list) {
            fieldMessage.call(this, list[i].id, list[i].type, list[i].message);
        }

    }


    /**
     * Finds specified input from field definition and calls fieldMessage calllback
     * @param String type type of the message valid/invalid/error
     * @param Array field specification on the field and its message
     * @param jQuery form current form element 
     * @returns {undefined}
     */
    function fieldMessage(id, type, message) {

        var el = this.find("[id='" + id + "']");
        this.data('ariaform-options').handlers.fieldMessage.call(el, type, message, this);
    }
    /**
     * 
     * @param jQuery form jquery object of the current form
     * @returns Array serialized array of values from form element
     */
    function serialize(form) {
        var serializedArray = {};
        var inputs = form.serializeArray();
        $.each(inputs, function (i, input) {
            var value = input.value;
            var matches = input.name.match(/^([a-z0-9_]+?)(\[.*\])?$/i);
            var mainKey = matches[1];
            if (matches[2] === undefined) {
                serializedArray[mainKey] = value;
            } else {
                matches = matches[2].match(/\[.*?\]/gi);
                if (matches) {
                    if (!(mainKey in serializedArray)) {
                        serializedArray[mainKey] = new Object();
                    }
                    var stack = serializedArray;
                    var cur = mainKey;
                    for (var i in matches) {
                        var c = matches[i].match(/^\[(.*)\]$/)[1];
                        if (c == "") {
                            if (Object.prototype.toString.call(stack[cur]) != '[object Array]') {
                                stack[cur] = new Array();
                            }
                            stack[cur].push(new Object());
                            stack = stack[cur];
                            cur = stack.length - 1;
                        } else {
                            if (!(c in stack[cur])) {
                                stack[cur][c] = new Object();
                            }
                            stack = stack[cur];
                            cur = c;
                        }
                    }
                    stack[cur] = value;
                }
            }
        });
        return serializedArray;
    }


    /**
     * Uploades file/s to server and attaches the resulting response from server to future form submit event
     * @param jquery event e
     * @returns {undefined}
     */
    function upload(e) {
        var form = $(e.delegateTarget).closest('form');
        hideResult(form);
        form.find('input[type=submit],button[type=submit]').attr("disabled", "disabled");
        var data = new FormData();
        data.append($(e.delegateTarget).attr('name'), e.target.files[0]);
        data.append('fields[type]', 'file');
        $(e.delegateTarget).wrap('<form>').closest('form').get(0).reset();
        $(e.delegateTarget).unwrap();
        var progress = form.find('.progress');
        // progress.find('.meter').html('0%');
        progress.find('.meter').css('width', '0%');
        progress.animate({opacity: 1}, 250);
        var params = {
            cache: false,
            contentType: false,
            processData: false,
            xhr: function () {
                var req = $.ajaxSettings.xhr();
                if (req) {
                    req.upload.addEventListener('progress', function (ev) {
                        //progress.find('.meter').html(Math.round(ev.loaded * 100 / ev.total)+"%");                        
                        progress.find('.meter').css({width: Math.round(ev.loaded * 100 / ev.total) + "%"});
                    }, false);
                }
                return req;
            }
        };
        new Ajax(form.data('url'), data, params).success(function (data) {
            form.find('.upload_append').remove();
            for (var i in data.data.files) {
                form.append($('<input type="hidden" name="' + i + '" class="upload_append" value="' + data.data.files[i] + '" />'));
            }
            if (data.data.thumbnail) {
                if ($(e.delegateTarget).parent().find('.thumbnail').length > 0) {
                    $(e.delegateTarget).parent().find('.thumbnail').attr('src', data.data.thumbnail);
                } else {
                    $(e.delegateTarget).after($('<img src="' + data.data.thumbnail + '" class="thumbnail form" />'));
                }

            }
            form.find('input[type=submit],button[type=submit]').removeAttr("disabled");
        }).error(function (data) {
            displayResult(form, data.message, 'error');
        }).complete(function () {
//progress.find('.meter').html('100%');                        
            progress.find('.meter').css({width: "100%"});
            window.setTimeout(function () {
                progress.animate({opacity: 0}, 250);
            }, 4000);
        }).run();
    }
}(jQuery));