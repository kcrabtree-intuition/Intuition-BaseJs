﻿!function (name, definition) {

    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()

}('domready', function () {

    var fns = [], listener
        , doc = typeof document === 'object' && document
        , hack = doc && doc.documentElement.doScroll
        , domContentLoaded = 'DOMContentLoaded'
        , loaded = doc && (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


    if (!loaded && doc)
        doc.addEventListener(domContentLoaded, listener = function () {
            doc.removeEventListener(domContentLoaded, listener)
            loaded = 1
            while (listener = fns.shift()) listener()
        })

    return function (fn) {
        loaded ? setTimeout(fn, 0) : fns.push(fn)
    }

});

// This will contain all 'generic' methods.
// Keep all specific methods for specific functions out of this file
// Use basejs.custom.js for anything specific.
(function () {
    var uId = 0, busyBtnCss = 'spinner-border spinner-border-sm',
        // Creates an identifier that is unique for creating a DOM element ID
        uid = function () {
            var d = new Date(), s = 'iid_' + d.getTime() + '_' + uId++;
            return s;
        },

        // Checks to see if an object is not null and not undefined.
        exists = function (a) {
            if (a !== null && a !== undefined) {
                return true;
            }
            return false;
        },

        // makes the string specified camel-cased.  Used for data attributes that save data-basejs-example as dataBasejsExample
        toCamel = function (a) {
            if (isString(a)) {
                return a.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                    return index === 0 ? word.toLowerCase() : word.toUpperCase();
                }).replace(/\s+/g, '');
            }
            return a;
        },

        // converts a string to bool.  If already bool, will return the boolean.
        toBool = function (a) {
            if (exists(a)) {
                if (isBoolean(a)) {
                    return a;
                }
                if (isString(a)) {
                    return Boolean(a);
                }
            }
            return false;
        },

        // verify that an object is a function
        isFunction = function (a) {
            if (typeof a === 'function') {
                return true;
            }
            return false;
        },

        // Checks to see if something is a node list.
        // document.getElementsByName() returns a node list for example.
        isNodeList = function (nodes) {
            var stringRepr = Object.prototype.toString.call(nodes);

            return typeof nodes === 'object' &&
                /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr) &&
                (typeof nodes.length === 'number') &&
                (nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0));
        },

        // verify that an object is an array
        isArray = function (a) {
            if (exists(a)) {
                if (exists(a.pop) && exists(a.push) && exists(a.slice)) {
                    return true;
                }
            }
            return false;
        },

        // verify that an object is a string
        isString = function (a) {
            if (typeof a === 'string') {
                return true;
            }
            return false;
        },

        // verify that an object is a boolean
        isBoolean = function (a) {
            if (typeof a === 'boolean') {
                return true;
            }
            return false;
        },

        // verify that an element is an element (has a tag name and a node)
        isElement = function (a) {
            if (exists(a)) {
                if (exists(a.tagName) && exists(a.nodeName)) {
                    return true;
                }
            }
            return false;
        },

        // verify that a string is a URI
        isUri = function (a) {
            if (isString(a)) {
                if (a.indexOf('/') >= 0 || a.indexOf('\\') >= 0) {
                    return true;
                }
            }
            return false;
        },

        // uses a JSON.parse() to verify if a string is json or not.
        isJson = function (a) {
            try {
                var value = JSON.parse(a);
                return true
            } catch (e) {
                return false;
            }
        },

        // Determines if the element is an element and if it's an input or textarea control.
        isInput = function (a) {
            if (isElement(a)) {
                if (a.tagName.toLowerCase() == 'input' || a.tagName.toLowerCase() == 'textarea') {
                    return true;
                }
            }
            return false;
        },

        // Returns the DOM element that generated the event.  
        eventSource = function (a) {
            return (exists(a) ? a.currentTarget || a.srcElement || a.originalTarget || a : null);
        },

        // verifies that the id passed in is an element and then returns the DOM element.
        getElement = function (a) {
            if (exists(a)) {
                return document.getElementById(a);
            }
            return null;
        },

        // uses a selector to pull the first element that matches
        getElementBySelector = function (a, el) {
            var elements = null;
            elements = getElementsBySelector(a, el);
            return (exists(elements) && isArray(elements)) ? elements[0] : elements;
        },

        // uses a selector to pull all elements that match
        getElementsBySelector = function (a, el) {
            var elements = null;
            if (isString(a)) {
                if (exists(el)) {
                    elements = el.querySelector(a);
                }
                else {
                    elements = document.querySelector(a);
                }
            }
            return elements;
        },

        // verifies that the id passed in is an element and then returns the value of the DOM element.
        getElementValue = function (a) {
            var el = getElement(a);
            if (exists(el)) {
                return el.value;
            }
        },

        // gets the first attribute of an element that matches a url.
        getElementUrl = function (element) {
            var a = (exists(element) ? element.attributes : null), x = 0, l = (exists(a) ? a.length : 0);
            for (x = 0; x < l; x++) {
                if (isUrlAttribute(a[x])) {
                    return a[x].value;
                }
            }
            return null;
        },

        // gets the first form element on the page
        getFirstForm = function () {
            var vforms = document.getElementsByTagName('form');
            if (exists(vform) && vform.count > 0) {
                return vform[0];
            }
            return null;
        },

        // Gets a request verification token from within a form.
        // form: The form element to grab the request verification token from.
        getToken = function (form) {
            var vtokens = isElement(form) ? form.getElementsByName('__RequestVerificationToken') : document.getElementsByName('__RequestVerificationToken');
            if (isNodeList(vtokens)) {
                return vtokens[0];
            }
            return null;
        },

        // sets the element to display:block (or override with something else) and sets opacity to 1.
        // el: The element you would like to show.
        // display (Optional): sets the style display accordingly.  "block" is the default, override if you need something else.
        show = function (el, display) {
            if (isElement(el)) {
                el.style.opacity = 1;
                el.style.display = exists(display) ? display : "block";
            }
        },

        // sets the element to display:none.
        // el: The element you would like to hide.
        hide = function (el) {
            if (isElement(el)) {
                el.style.display = "none";
            }
        },

        // fades an element out and sets display:none on it.
        // el: The element to fade out.
        fadeOut = function (el) {
            if (isElement(el)) {
                el.style.opacity = 1;
                if ((el.style.opacity -= .1) < 0) {
                    el.style.display = "none";
                } else {
                    requestAnimationFrame(fade);
                }
            }
        },

        // fades an element in
        // el: The element to fade in
        // display: (optional) set display:block by default or override with your own.
        fadeIn = function (el, display) {
            el.style.opacity = 0;
            el.style.display = display || "block";
            (function fade() {
                var val = parseFloat(el.style.opacity);
                if (!((val += .1) > 1)) {
                    el.style.opacity = val;
                    requestAnimationFrame(fade);
                }
            })();
        },

        // Loads all field validations on a page that have an error and applies an 'is-invalid' class to the calling inputs
        setFieldValidations = function () {
            var velements = document.getElementsByClassName('field-validation-error');
            for (var i = 0; i < velements.length; i++) {
                if (velements[i].innerHTML !== "") {
                    var e = getElement(velements[i].dataset.valmsgFor.replace('.', '_'));
                    if (exists(e)) {
                        e.classList.add('is-invalid');
                    }
                }
            }

        },

        // Makes a button show a busy animation and disabled
        // Called like showBusy.apply(button, arguments);
        showBusy = function () {
            var a = null, b = uid(), c = this, d = c.innerHTML;
            //if (this.tagName === 'BUTTON') {
            c.innerHTML = '';
            c.setAttribute("disabled", "disabled");
            a = document.createElement('div');
            a.id = b;
            a.className = busyBtnCss;
            this.appendChild(a);
            //}
            return { 'id': b, 'html': d };
        },

        // Returns a button back to the original data.
        // Uses return data from showBusy() to put it back
        // button: the button element
        // busy: the result from showBusy() method
        showOriginal = function (button, busy) {
            if (exists(busy)) {
                var vtempDiv = getElement(busy.id);
                if (exists(vtempDiv)) {
                    button.removeChild(vtempDiv);
                    button.innerHTML = busy.html;
                    button.removeAttribute("disabled");
                }
            }
        },

        // Creates new instance of FormData();
        // form:    Optional, if form is specified, will use it to hydrate new data.  
        //          if none specified, will create a new instance and apply token from page.
        createFormData = function (form) {
            if (isElement(form)) {
                return new FormData(form);
            }
            var vformData = new FormData();
            var vtoken = getToken();
            if (exists(vtoken)) {
                vformData.append(vtoken.name, vtoken.value);
            }
            return vformData;
        },

        // Gets basejs attribute from form element.
        getDataFromTag = function (element, dataTag) {
            if (isElement(element) && isString(dataTag)) {
                return element.dataset[toCamel('basejs ' + dataTag)];
            }
            return null;
        },

        // Clear validation summary errors inside of a form element
        clearValidationSummary = function (formElement) {
            if (exists(formElement)) {
                var vsummaryElements = document.getElementsByClassName('validation-summary-errors');
                if (exists(vsummaryElements)) {
                    for (var i = 0; i < vsummaryElements.length; i++) {
                        vsummaryElements[i].remove();
                    }
                }
            }
        },
        // posts (or get if needed) a form to the uri specified with the formData.
        // uri: the location where the post or get will occur i.e. /Home/PostData
        // formData: default functionality is using FormData to collect elements inside of a form. Can be overridden.
        // successFunction: the function to perform if the post has succeeded.
        // errorFunction: the function to perform if the post has failed.
        // completeFunction: the function to perform once the post has completed (failed or success)
        // methodType: default functionality is 'POST' but can be overridden with 'GET' (or anything else)
        postForm = function (uri, formData, successFunction, errorFunction, completeFunction, methodType) {
            var vrequest = new XMLHttpRequest(), vresult = {};
            vrequest.open(exists(methodType) ? methodType : 'POST', uri, true);
            vrequest.onreadystatechange = function () {
                if (this.readyState == XMLHttpRequest.DONE) {
                    vresult['response'] = vrequest.responseText;
                    vresult['statusCode'] = vrequest.status;
                    if (this.status == 200) {
                        //console.log('succeed');
                        successFunction(vresult);
                    }
                    else {
                        //console.log('server error');
                        errorFunction(vresult);
                    }
                    //alert('1st complete done');
                    completeFunction();
                }
            };

            vrequest.send(formData);
        },

        // posts data to uri specified from form onsubmit event and replaces the data coming back with the replaceElementId
        // ev: the event in which triggered the post (default functionality is adding onsubmit event to the form element)
        // uri: the location where the post will occur  i.e. /Home/PostData
        // formId: the form id to gather elements from
        // replaceElementId: after the post, it will return a partial. replace this element's inner html with the partial
        // successFunction (optional) - will execute after successful post and the replacement is done.
        // errorFunction (optional) - will execute after a failed post and errors placed.
        // completeFunction (optional) - will execute after a post has succeeded or failed and after complete function
        postAndReplace = function (ev, uri, replaceElementId, successFunction, errorFunction, completeFunction, closeModalElementId) {
            var f = eventSource(ev),                        // grab form from the event passed in
                vform = exists(f) ? f : getFirstForm(),     // if no form matches, grab first form
                vbusy = null,                               // busy text of the button (vbusy.id for the ID name, vbusy.html to get it back)
                vcurrentButton = null,                      // submit button of the form
                vuri = exists(uri) ? uri :                  // Gets the uri from what is passed in or from the form tag
                    getDataFromTag(vform, 'posturl'),
                vreplaceId = exists(replaceElementId) ?     // Gets the replacement element id from what is passed in or from the form tag.
                    replaceElementId :
                    getDataFromTag(vform, 'updatetarget'),
                vcloseModalElementId = exists(closeModalElementId) ?  // Gets close modal element.   This is the element it will attempt to close a bs modal for.
                    closeModalElementId :
                    getDataFromTag(vform, 'closemodaltarget'),
                vformData = null;                           // FormData for posting

            // success method
            var vsuccess = function (data) {
                // clear validation summary on success
                clearValidationSummary(vform);
                var dr = data.response;

                // check to see if it's a redirect response
                if (isJson(dr)) {
                    const jr = JSON.parse(dr);
                    if (jr.type === "redirect") {
                        location.href = jr.url;
                    }
                }
                else {
                    var e = getElement(vreplaceId);

                    // if replacement id exists, respond with response.
                    if (exists(e)) {
                        e.innerHTML = data.response;
                    }

                    // check to see if modal exists and/or needs to close
                    if (exists(basejs.modals) && isString(vcloseModalElementId)) {
                        var vmodal = bootstrap.Modal.getInstance(basejs.getElement(vcloseModalElementId));
                        vmodal.hide();
                    }

                    // run external success function
                    if (exists(successFunction) && isFunction(successFunction)) {
                        successFunction();
                    }
                }
            };

            // error method
            var verror = function (data) {
                var verrorTarget = getDataFromTag(vform, 'updatetargeterror');
                var vclearOnError = getDataFromTag(vform, 'cleartargetonerror');

                // check to see if the element should be cleared out
                if (exists(vclearOnError) && toBool(vclearOnError) === true) {
                    var el = getElement(vreplaceId);
                    el.innerHTML = '';
                }

                // check to see if there's an error target and if not, use the success replacement
                var e = exists(verrorTarget) ? getElement(verrorTarget) : getElement(vreplaceId);

                // load errors to page
                if (exists(e)) {
                    if (data.statusCode >= 500) {
                        // rewrite the whole page if it's a 500. innerHTML doesn't work well with modals for 500 errors
                        document.write(data.response);
                    }
                    else {
                        // write the response to the element
                        e.innerHTML = data.response;
                    }
                }

                // run additional external error functions
                if (exists(errorFunction) && isFunction(errorFunction)) {
                    errorFunction();
                }
            };

            // after success or failures, we will run complete
            var vcomplete = function () {
                // put the button back like it was
                showOriginal(vcurrentButton, vbusy);

                // run additional external error functions
                if (exists(completeFunction) && isFunction(completeFunction)) {
                    completeFunction();
                }

                // initialize everything on the page again.
                init();

            };

            // checks to see if we have a form to post
            if (exists(vform)) {
                // if submission is a button and not a form, find the form.
                if (vform.tagName.toLowerCase() === "button") {
                    vcurrentButton = vform;
                    vformData = createFormData();
                }
                else {
                    // prevent regular button/form submit.
                    ev.preventDefault();
                    // grabs the submit button based inside of the current form
                    vcurrentButton = getElementBySelector('button[type="submit"]', vform);
                    // get FormData based on current form.
                    vformData = createFormData(vform);      
                }
                // set busy indicator on the submit button
                vbusy = showBusy.apply(vcurrentButton, arguments);

                // get all data-basejs-param-{x} items from the form tag
                var vdataset = [].filter.call(vform.attributes, function (at) { return /^data-basejs-param-/.test(at.name); });
                if (isArray(vdataset)) {
                    // add all data-basejs-param-{x} items to the FormData object
                    for (let i = 0; i < vdataset.length; i++) {
                        var vname = vdataset[i].name.replace('data-basejs-param-', '').toLowerCase(), vvalue = vdataset[i].value;
                        vformData.append(vname, vvalue);
                    }
                }

                // submits the form
                postForm(
                    vuri,           // url of the post
                    vformData,      // data of the form
                    vsuccess,       // success function
                    verror,         // error function
                    vcomplete       // complete function
                );
            }
            else {
                // throw error if no forms to submit?
                // alert('no form to submit');
            };
            return false;
        },

        // initialize all validations so that once you start typing it will clear out errors
        // form: The form element to initialize.
        initValidations = function () {

            var vinputs = document.getElementsByClassName('input-validation-error');
            if (exists(vinputs)) {
                for (var i = 0; i < vinputs.length; i++) {
                    vinputs[i].addEventListener('input', clearError);
                }
            }

        },

        // The clear part of initValidations() routine.  Once a user starts to type into a field, the errors are cleared
        // ev: The event to use to clear the validations.
        clearError = function (ev) {
            var vinput = eventSource(ev);
            if (isElement(vinput)) {
                vinput.classList.remove('is-invalid');
                vinput.classList.remove('input-validation-error');
                var verrorSpan = document.querySelectorAll("[data-valmsg-for='" + vinput.id.replace('_', '.') + "']");
                if (exists(verrorSpan)) {
                    for (var i = 0; i < verrorSpan.length; i++) {
                        verrorSpan[i].innerHTML = "";
                    }
                }
            }
        },

        // Copies input value from one input control to another. Can be set up using tags on the button or manually via a source and target id.
        copyInputField = function (ev, sourceId, targetId) {
            var vbutton = eventSource(ev), vdataCopySourceId = null, vdataCopyTargetId = null, vsourceEl = null, vtargetEl = null;
            if (isElement(vbutton)) {
                vdataCopySourceId = getDataFromTag(vbutton, 'copyfieldsourceid');
                vdataCopyTargetId = getDataFromTag(vbutton, 'copyfieldtargetid');
                if (exists(vdataCopySourceId) && exists(vdataCopyTargetId)) {
                    vsourceEl = getElement(vdataCopySourceId);
                    vtargetEl = getElement(vdataCopyTargetId);
                }
            }
            else {
                vsourceEl = getElement(sourceId);
                vtargetEl = getElement(targetId);
            }
            if (isInput(vsourceEl) && isInput(vtargetEl)) {
                vtargetEl.value = vsourceEl.value;
            }
        },

        // automatically load forms on the page without requiring the onsubmit routine on each one.
        // These will only load one way though, so if customization is needed, call it directly.
        // Will call postAndReplace
        // Required on form: 
        //      data-basejs-posturl: 
        //          The location of the post
        //      data-basejs-updatetarget:
        //          The element in which to replace the data coming back from the form.
        initForms = function () {
            var vforms = document.getElementsByTagName('form'), vdataUrl = null, vupdateTargetId = null, vlistener = null;
            if (exists(vforms)) {
                for (var vform = 0; vform < vforms.length; vform++) {
                    vdataUrl = getDataFromTag(vforms[vform], 'posturl');
                    vupdateTargetId = getDataFromTag(vforms[vform], 'updatetarget');
                    vlistener = getDataFromTag(vforms[vform], 'listener');
                    if (!exists(vlistener) && exists(vdataUrl) && isUri(vdataUrl)) {
                        if (exists(vupdateTargetId) && isString(vupdateTargetId)) {
                            vforms[vform].addEventListener('submit', postAndReplace);
                            vforms[vform].dataset.basejsListener = true;
                        }
                    }
                    vdataUrl = null;
                    vupdateTargetId = null;
                }
            }
        },

        // automatically loads buttons to copy data from one field to another field
        // 
        initButtons = function () {
            var vbuttons = document.getElementsByTagName('button'), vdataCopySourceId = null, vdataCopyTargetId = null, vlistener = null;
            if (exists(vbuttons)) {
                for (var vbutton = 0; vbutton < vbuttons.length; vbutton++) {
                    vdataCopySourceId = getDataFromTag(vbuttons[vbutton], 'copyfieldsourceid');
                    vdataCopyTargetId = getDataFromTag(vbuttons[vbutton], 'copyfieldtargetid');
                    vlistener = getDataFromTag(vbuttons[vbutton], 'listener');
                    if (!exists(vlistener) && exists(vdataCopySourceId) && exists(vdataCopyTargetId)) {
                        vbuttons[vbutton].addEventListener('click', copyInputField);
                        vbuttons[vbutton].dataset.basejsListener = true;
                    }
                    vdataCopySourceId = null;
                    vdataCopyTargetId = null;
                }
            }
        },
        // initialize anything on the page that is needed.
        init = function () {
            initForms();
            setFieldValidations();
            initValidations();
            initButtons();
        },

        app = {}
        ;
    // this is where you make any methods "public"
    // adding here will allow you to do basejs.methodName();
    app['uniqueId'] = uid;
    app['exists'] = exists;
    app['toCamel'] = toCamel;
    app['toBool'] - toBool;
    app['isFunction'] = isFunction;
    app['isNodeList'] = isNodeList;
    app['isArray'] = isArray;
    app['isString'] = isString;
    app['isBoolean'] = isBoolean;
    app['isElement'] = isElement;
    app['isUri'] = isUri;
    app['isJson'] = isJson;
    app['isInput'] = isInput;
    app['eventSource'] = eventSource;
    app['getElement'] = getElement;
    app['getElementBySelector'] = getElementBySelector;
    app['getElementsBySelector'] = getElementsBySelector;
    app['getElementValue'] = getElementValue;
    app['getElementUrl'] = getElementUrl;
    app['getFirstForm'] = getFirstForm;
    app['getToken'] = getToken;
    app['show'] = show;
    app['hide'] = hide;
    app['fadeOut'] = fadeOut;
    app['fadeIn'] = fadeIn;
    app['setFieldValidations'] = setFieldValidations;
    app['showBusy'] = showBusy;
    app['showOriginal'] = showOriginal;
    app['createFormData'] = createFormData;
    app['getDataFromTag'] = getDataFromTag;
    app['clearValidationSummary'] = clearValidationSummary;
    app['postForm'] = postForm;
    app['postAndReplace'] = postAndReplace;
    app['initValidations'] = initValidations;
    app['copyInputField'] = copyInputField;
    app['initForms'] = initForms;
    app['initButtons'] = initButtons;
    app['init'] = init;
    window['basejs'] = app;
    domready(init);
})();