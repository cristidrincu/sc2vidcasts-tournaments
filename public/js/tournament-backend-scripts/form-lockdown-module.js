/**
 @description
 This module is meant to be used inside <b>templates that contain form validation</b>, such as the <b>signup template</b>, <b>creating a tournament</b>, <b>updating the users profile</b> etc
 <br/><br/>
 INSIDE THE TEMPLATE, there are 3 objects that need to be defined on $(document).ready(), holding references to DOM elements through JQuery:
 <br><br>
 @example
 1. The input fields object -
 var pvInputFields = {
           $inputTextEmail: $("input[name = 'email']"),
           $inputTextNickname: $("input[name = 'nickname']"),
           $inputTextBNetId: $("input[name = 'battlenetid']")
     }
 @example
 2. The error texts object (these error texts are actually divs containing a paragraph of text. Currently, they are displayed under the input field that triggered the error)
 var pvErrorTexts = {
        emailErrorText: $('#error-invalid-email'),
        nicknameErrorText: $('#error-invalid-nickname'),
        bnetIdErrorText: $('#error-invalid-bnetid')
      }
 @example
 3. The regex object, containing the rules for each of the fields you want to validate - email rule, user name, bnet tag in our case
 var pvRegexCollection = {
            emailRegex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            nicknameRegex: /^[a-zA-Z0-9]{3,10}$/,
            bnetRegex: /^[0-9]{3,4}$/
     }
 @example
 4. There have to be references for the form, submit button and the error overlay div. Apart from that, the default and error messages that get displayed on the submit button
 when there is no error or if there is an error.
 var $signupFormReference = $("#signupForm");
 var $submitBtnReference = $("button[type='submit']");
 var $errorOverlay = $("#error-signup-overlay");
 @example
 5. After all of these are defined, call the module in the following manner:
 var signupLockdownModule = formLockDownModule($submitBtnReference, $errorOverlay,'Signup', 'There are errors in your form!');
 @example
 6. Finally, you can validate your fields like this:
 signupLockdownModule.checkInputForErrors(pvInputFields.$inputTextEmail, pvRegexCollection.emailRegex, pvErrorTexts.emailErrorText, $signupFormReference, function (isWithoutErrorsEmail) {
    isWithoutErrorsEmail ? signupLockdownModule.formUnlock() : signupLockdownModule.formLockDown();
 });

 @module formLockDownModule
 */

/**
 * @param {string} submitBtnReference - The reference(JQuery locator) for the form's submit button. Used for disabling or enabling the button
 * @param {string} errorOverlay - The reference(JQuery locator) for the template's overlay element. Used for disabling the user from moving forward if there is an error
 * @param {string} submitBtnDefaultMessage - The default text that will be displayed on the submit button if no errors are encountered
 * @param {string} submitBtnMessageError - The error message that will be displayed if errors are encountered
 * @returns {{disableSubmitButton: disableSubmitButton, enableSubmitButton: enableSubmitButton, checkInputForErrors: checkInputForErrors, formLockDown: formLockDown, formUnlock: formUnlock}}
*/
var formLockDownModule = function (submitBtnReference, errorOverlay, submitBtnDefaultMessage, submitBtnMessageError) {

    /**
     * Helps disable the form's submit button
     * @private
     * @method disableSubmitButton
     */
    function disableSubmitButton() {
        submitBtnReference.prop('disabled', true).text(submitBtnMessageError).attr('class', 'btn btn-danger btn-lg');
    }

    /**
     * Helps enable the form's submit button
     * @private
     * @method enableSubmitButton
     */
    function enableSubmitButton() {
        submitBtnReference.prop('disabled', false).text(submitBtnDefaultMessage).attr('class', 'btn btn-success btn-lg');
    }

    /**
     * Show error overlay, blocking user access to other fields. Basically it limits the user's access to just one field until he/she corrects the error
     * @private
     * @method enableErrorOverlay
     */
    function enableErrorOverlay() {
        errorOverlay.css({"display": "block"});
    }

    /**
     * Hides error overlay upon user's information getting validated by regex
     * @private
     * @method disableErrorOverlay
     */
    function disableErrorOverlay() {
        errorOverlay.css({"display": "none"});
    }

    /**
     * All input fields get disabled, except the current one in which the user has triggered an error
     * @private
     * @method disableInputFieldsOnError
     * @param formReference {String} The form element we need as a reference
     * @param inputField {String} The input field we do not want to be disabled
     */
    function disableInputFieldsOnError(formReference, inputField) {
        formReference.find('input').each(function () {
            if ($(this).prop('required')) {
                $(this).prop('disabled', true);
            }
            inputField.css({"position": "relative", "z-index": 103}).prop('disabled', false);
        });
    }

    /**
     * All input fields get enabled again - this means the user fixed the error that was causing the form lockdown
     * @private
     * @method enableInputFieldsOnErrorsClear
     * @param formReference {String} The form element we need as a reference
     * @param inputField {String} The input field we do not want to be disabled
     */

    function enableInputFieldsOnErrorsClear(formReference, inputField) {
        formReference.find('input').each(function () {
            if ($(this).prop('required')) {
                $(this).prop('disabled', false);
            }
            inputField.css({"position": "relative", "z-index": 102}).prop('disabled', false);
        });
    }

    /**
     * When user moves from current field (the field loses focus), this method gets triggered. The callback function takes the isWithoutErrors and uses it in order to lockdown
     * the submit button or enable it
     * @private
     * @method checkInputForErrors
     * @param inputField {String} The field we are validating
     * @param regex {regex} A regular expresion used for validating user input on the input field
     * @param errorTextParagraph {String} The error paragraph that is hidden by default and gets displayed when the user input does not validate
     * @param formReference {String} A reference to the form element that contains the input fields we want to validate
     * @param cb {function} Callback function used to make a decision based on the isWithoutErrors local variable
     */
    function checkInputForErrors(inputField, regex, errorTextParagraph, formReference, cb) {
        inputField.on('blur', function () {
            if (!regex.test(inputField.val()) && inputField.val().length > 0) {
                /**
                 * Keeps a boolean flag indicating if the form is error free or not
                 * @type {boolean}
                 * @var {boolean} isWithoutErrors
                 */
                var isWithoutErrors = false;
                errorTextParagraph.css({'display': 'block', 'position': 'relative', 'z-index': 102});
                disableInputFieldsOnError(formReference, inputField);
                enableErrorOverlay();
            } else {
                isWithoutErrors = true;
                errorTextParagraph.css({'display': 'none', 'position': 'relative', 'z-index': 102});
                enableInputFieldsOnErrorsClear(formReference, inputField);
                disableErrorOverlay();
            }
            cb(isWithoutErrors);
        });
    }

    /**
     * Calls the private method disableSubmitButton
     * @private
    */
    function formLockDown() {
        disableSubmitButton();
    }

    /**
     * @private
    */
    function formUnlock() {
        enableSubmitButton();
    }

    /**
     * Exposes a public API for this module
     * @returns {Object}
     */
    return {
        disableSubmitButton: disableSubmitButton,
        enableSubmitButton: enableSubmitButton,
        checkInputForErrors: checkInputForErrors,
        formLockDown: formLockDown,
        formUnlock: formUnlock
    }
};
