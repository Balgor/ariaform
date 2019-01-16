AriaForm jquery plugin
========

Plugin allows you to AJAXify your bootstrap forms and allow asynchronous submit. Errors are displayed under each form input element.


Requirements
--------
- jQuery 1.11 or greater
- Bootstrap 3



Features
--------

- Minimal configuration for standard forms
- Input validation performed (optionally) on server side, thus following same rules
- Allow for server to control action after successful submit (close dialog, reset form, or just password fields)


Use
------------
Include main library ariaform.bootstrap.js

Then initialize the plugin on each form element as desired:

```javascript
$("#myForm").singForm(options);
```

options are not required by default

To display error messages plugin requires standard bootstrap form markup where each input is surrounded with div.form-group and includes .help-block where error message is displayed.


Options
-------
- **reset:** *true / false* - whether to reset form after successful submit (default: false)
- **blocking:** *true / false* - If set to true, all submit buttons becomes disabled if there is one or more invalid input elements (default: false)
- **submitTrigger:** *'manual' / 'change'* - If set to 'change' form will submit each time one of the fields change. Manual will only submit via submit event (ie. Submit button) (default: false)
- **checkOn:** *'blur' / 'change'* - When to send input value to server. Notice: when using change consider using check-timeout class to delay to response not to send data on every keystroke (default: blur)
- **loader:** *html* - HTML markup of loader to display when processing submit (default: none)
- **handlers** *Object* - Handlers to provide styling effects and action for the form element possible values:
    - **fieldMessage** - used to display valid/invalid message around inputs
    - **submitStart** - called on start of a submit (to display loader, disable buttons etc.)
    - **submitResult** - called after EACH submit (hide loader, enable buttons)
    - **submitSuccess** - called after successful submit (clear invalid/valid messages from elements)
    - **actionClose** - closes Bootstrap modal window, invoked based on server response
    - **NAMEAction** - NAME can be substituted with any word to create custom handlers for server action response


Server responses
-------
Plugin expects certain format in server responses when submitting, checking fields:

- **result** *string*
    - Every response must include *result* property which is either 'success' or 'error'
- **message** *string*
    - Submit responses may include *message* property which will be displayed in alert box on bottom left
- **errors** *array*
    - array of objects - errors for each fields in a form {id: "id of a input", message: "message to display", type: "valid / invalid"}
- **actions** *array*
    - Custom actions to be perfomed based on server response. 
      Expected in form of actionname (without Action keyword) => data (can be string, array or object)

Example response
----------------
Errors on submit
```json
{
    "result": "error",
    "message": "Some fields returned with error"
    "errors": [
        {"id": "textInput1", "message": "This field does not have correct format", "type": "invalid"},
        {"id": "checkbox1", "message": "Must be checked", "type": "invalid"}
    ]
}
```

Custom actions on success
```json
{
    "result": "success",
    "message": "Form has been saved"
    "actions": {
        "close": ""    //closes modal
        "popup": {"id": "popupId", "color": "bg-red"} //calls custom popupAction handler with provided data
    }
}
```
