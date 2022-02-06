(function () {
    var targetEID = 'sharedmodals', loadingModalHtml = null, failureModalHtml = null, failureResponseHtml = null,

        // happens when a modal is shown.  used to post to server and pull back a partial view
        onShowModal = function (event) {
            var veventSource = basejs.eventSource(event), vbutton = event.relatedTarget, vdataUrl = basejs.getDataFromTag(vbutton, 'posturl'), vformData = basejs.createFormData();
            setLoadingModal(veventSource);
            // get data-basejs- objects from element
            var vdataset = [].filter.call(vbutton.attributes, function (at) { return /^data-basejs-param-/.test(at.name); });
            if (basejs.isArray(vdataset)) {
                for (let i = 0; i < vdataset.length; i++) {
                    var vname = vdataset[i].name.replace('data-basejs-param-', '').toLowerCase(), vvalue = vdataset[i].value;
                    vformData.append(vname, vvalue);
                }
            }
            // if we can post, let's do it
            if (basejs.isUri(vdataUrl)) {
                var vsuccess = function (data) {
                    veventSource.innerHTML = data.response;
                    basejs.initForms();
                };
                var vfailed = function (data) {
                    if (basejs.exists(data)) {
                        //if (data.statusCode >= 500) {
                        //    document.write(data.response);
                        //}
                        //else {
                        setFailureModal(veventSource, data);
                        //}
                    }
                    else {
                        setFailureModal(veventSource);
                    }
                };
                var vcomplete = function () {

                };
                basejs.postForm(vdataUrl, vformData, vsuccess, vfailed, vcomplete);
            } else {
                setFailureModal(veventSource);
            };
        },

        // Save data to server, close the modal (when success) and replace an element with a partial
        onSaveAndReplace = function (event, modalId) {
            var vbutton = basejs.eventSource(event),
                vdataUrl = basejs.getDataFromTag(vbutton, 'posturl'),
                vformData = basejs.createFormData(),
                vupdateTarget = basejs.getDataFromTag(vbutton, 'updatetarget'),
                vupdateTargetError = basejs.getDataFromTag('updatetargeterror'),
                vbusy = null,
                vsuccess = null,
                vfailed = null,
                vcomplete = null;

            // turn button to busy button
            vbusy = showBusy.apply(vbutton, arguments);

            // grab params from the button (if any) and set them to the FormData
            var vdataset = [].filter.call(vbutton.attributes, function (at) { return /^data-basejs-param-/.test(at.name); });
            if (basejs.isArray(vdataset)) {
                for (let i = 0; i < vdataset.length; i++) {
                    var vname = vdataset[i].name.replace('data-basejs-param-', '').toLowerCase(), vvalue = vdataset[i].value;
                    vformData.append(vname, vvalue);
                }
            }

            if (basejs.isUri(vdataUrl)) {
                vsuccess = function (data) {
                    var vmodal = bootstrap.Modal.getInstance(basejs.getElement(modalId));
                    if (exists(vupdateTarget)) {
                        if (basejs.isElement(basejs.getElement(vupdateTarget))) {
                            basejs.getElement(vupdateTarget).innerHTML = data.response;
                        }
                    }
                    vmodal.hide();
                };
                vfailed = function (data) {
                    if (exists(vupdateTargetError)) {
                        if (basejs.isElement(basejs.getElement(vupdateTargetError))) {
                            basejs.getElement(vupdateTargetError).innerHTML = data.response;
                        }
                    }
                };
                vcomplete = function () {
                    showOriginal(vbutton, vbusy);
                }
                basejs.postForm(vdataUrl, vformData, vsuccess, vfailed, vcomplete);
            }


        },

        // happens when a modal is hidden
        onHideModal = function (event) {
            var veventSource = basejs.eventSource(event);
            setLoadingModal(veventSource);
        },

        // modal to use when loading a modal
        loadingModal = function () {
            var a = arguments, l = a.length;
            switch (l) {
                case 0:
                    return loadingModalHtml;
                default:
                    if (basejs.isString(a[0])) {
                        loadingModalHtml = a[0];
                    }
            }
        },

        // modal to use when a failure occurs.
        failureModal = function () {
            var a = arguments, l = a.length;
            switch (l) {
                case 0:
                    return failureModalHtml;
                default:
                    if (basejs.isString(a[0])) {
                        failureModalHtml = a[0];
                    }
            }
        },

        // property to get/set the failure response html. By default, this text will go before the failure data
        failureModalResponse = function () {
            var a = arguments, l = a.length;
            switch (l) {
                case 0:
                    return failureResponseHtml;
                default:
                    if (basejs.isString(a[0])) {
                        failureResponseHtml = a[0];
                    }
            }
        },

        // Sets the current failure modal to the element provided with response from server.
        // Input:
        //      {responseData}:
        //          [Required] Replaces the string literal with the response from the server in the modal
        //      {responseText}:
        //          [Optional] Replaces the string literal with the text assigned to failureResponse
        setFailureModal = function (element, data) {
            if (basejs.isElement(element)) {
                var vhtml = failureModal.replace('{responseText}', (basejs.exists(data) ? failureResponse : ''));
                vhtml.replace('{responseData}', (basejs.exists(data) ? data.response : ''));
                element.innerHTML = vhtml;
            }
        },

        // Sets the current loading modal to the element provided.
        // Input:
        //      {responseData}:
        //          [Required] Replaces the string literal with the response from the server in the modal
        //      {responseText}:
        //          [Optional] Replaces the string literal with the text assigned to failureResponse
        setLoadingModal = function (element) {
            if (basejs.isElement(element)) {
                element.innerHTML = loadingModal;
            }
        },

        // Initialize default modals.  Can be done 3 different ways.
        //  1. If nothing supplied, uses the hard-coded modals supplied in the javascript
        //  2. Specify hidden element(s) on the page with the following information for each type of response. None are required.
        //      a. LoadingModal - Html for the loading modal.
        //      b. FailureModal - Html for the failure modal.
        //          i.  Replacement value {responseData} is required.
        //          ii. Replacement value {responseText} is optional.
        //      c. FailureModalResponse - Html for the text used in the FailureModal for {responseText} variable.
        //  3. Specify, per page, the 3 properties for a specific modal type. Same as #2 above.
        //      a. loadingModal
        //          i.  In javascript: basejs.modals.loadingModal = 'your html'
        //      b. failureModal
        //          i. In javascript: basejs.modals.failureModal = 'your html'
        //      c. failureResponse
        //          i. In javascript: basejs.modals.failureResponse = 'your html'
        initDefaultModals = function () {
            var vloading = basejs.getElement('LoadingModal'), vfailure = basejs.getElement('FailureModal'), vfailureModalResponse = basejs.getElement('FailureModalResponse');
            if (basejs.isElement(vloading)) {
                loadingModal = vloading.value;
            }
            if (basejs.isElement(vfailure)) {
                failureModalResponse = vfailure.value;
            }
            if (basejs.isElement(vfailureModalResponse)) {
                failureModalResponse = vfailureModalResponse.value;
            }
            // default response text before the data (optional)
            if (!basejs.exists(failureModalResponse)) {
                failureModalResponse = 'Response:<br />';
            }
            // default failure modal if none exist yet
            if (!basejs.isString(failureModal)) {
                failureModal =
                    '   <div class="modal-dialog">'
                    + '     <div class="modal-content">'
                    + '         <div class="modal-header modal-header-color">'
                    + '             <h5 class="modal-title" id="sharedmodalslabel">Error</h4>'
                    + '             <button type="button" class="btn-close" data-bs-dismiss="modal"aria-label="Close"></button>'
                    + '         </div>'
                    + '         <div class="modal-body text-center">'
                    + '             There was a problem loading the content for this dialog<br />'
                    + '             {responseText}{responseData}'
                    + '         </div>'
                    + '         <div class="modal-footer modal-footer-color">'
                    + '             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>'
                    + '         </div>'
                    + '     </div>'
                    + ' </div>';
            }

            // default loading modal if none exist yet
            if (!basejs.isString(loadingModal)) {
                loadingModal =
                    '   <div class="modal-dialog">'
                    + '     <div class="modal-content">'
                    + '         <div class="modal-header modal-header-color">'
                    + '             <h5 class="modal-title" id="sharedmodalslabel">Loading...</h4>'
                    + '             <button type="button" class="btn-close" data-bs-dismiss="modal"aria-label="Close"></button>'
                    + '         </div>'
                    + '         <div class="modal-body text-center">'
                    + '             <div class="spinner-grow" style="width: 3rem; height: 3rem;" role="status">'
                    + ''
                    + '             </div>'
                    + '         </div>'
                    + '         <div class="modal-footer modal-footer-color">'
                    + '             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>'
                    + '         </div>'
                    + '     </div>'
                    + ' </div>';
            }
        },
        initModals = function () {
            var vsharedModals = document.getElementsByClassName('modal'); //document.getElementById(targetEID);
            for (let i = 0; i < vsharedModals.length; i++) {
                vsharedModals[i].addEventListener('shown.bs.modal', onShowModal);
                vsharedModals[i].addEventListener('hidden.bs.modal', onHideModal);
            };
        },
        initButtons = function () {
            var vbuttons = basejs.getElementsBySelector('button[data-basejs-posturl]');
            if (basejs.exists(vbuttons)) {
                for (let i = 0; i < vbuttons.length; i++) {
                    vbuttons[i].addEventListener('click', onSaveAndReplace);
                }
            }
        },
        // initialize anything on the page that is needed.
        init = function () {
            initModals();
            initButtons();
            initDefaultModals();
        },
        app = {}
        ;
    app['init'] = init;
    app['failureModal'] = failureModal;
    app['failureModalResponse'] = failureModalResponse;
    app['loadingModal'] = loadingModal;
    basejs['modals'] = app;
    domready(init);
})();