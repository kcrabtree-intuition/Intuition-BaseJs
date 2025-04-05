(function () {
    var vna = 'a-zA-Z\-\'\ ', van = 'a-zA-Z0-9', va = 'a-zA-Z', ve = 'a-zA-Z0-9\-\.\@\!\'\*\+\#\$\%\&\/\=\?\^\_\`\{\|\}\~', vad = 'a-zA-Z0-9\-\'\.\#\, ', vc = 'a-zA-Z\-\'\.\, ', vnu = '0-9', vd = '0-9\.\,',
        // filters input based on the information provided.
        inputFilter = function (ev) {
            var el = basejs.eventSource(ev), r = null;
            switch (el.dataset.filtertype) {
                case 'name':
                    r = vna;
                    break;
                case 'alphanumeric':
                    r = van;
                    break;
                case 'alpha':
                    r = va;
                    break;
                case 'mi':
                    r = va;
                    break;
                case 'address':
                    r = vad;
                    break;
                case 'city':
                    r = vc;
                    break;
                case 'email':
                    r = ve;
                    break;
                case 'numeric':
                    r = vnu;
                    break;
                case 'decimal':
                    r = vd;
                    break;
                default:
                    break;
            }
            if (basejs.isString(r)) {
                el.value = removeChars(r, el.value);
            }
        },
        // initialize all filters on the page based on the class name provided
        initFilter = function (c, f) {
            var a = document.getElementsByClassName(c), l = a.length, x = 0;
            for (x; x < l; x++) {
                a[x].addEventListener('input', f);
                a[x].dataset.filtertype = c.split('-')[1];
            }
        },
        // initialize all initFilters
        initInputFilters = function () {
            initFilter('filter-name', inputFilter);
            initFilter('filter-alphanumeric', inputFilter);
            initFilter('filter-mi', inputFilter);
            initFilter('filter-alpha', inputFilter);
            initFilter('filter-address', inputFilter);
            initFilter('filter-city', inputFilter);
            initFilter('filter-email', inputFilter);
            initFilter('filter-numeric', inputFilter);
            initFilter('filter-decimal', inputFilter);
        },

        // remove characters based on the regex provided
        removeChars = function (validChars, inputString) {
            var regex = new RegExp('[^' + validChars + ']', 'g');
            return inputString.replace(regex, '');
        },
        // initialize anything on the page that is needed.
        init = function () {
            initInputFilters();
        },
        app = {};
        app['init'] = init;
        window['basejsinputfilter'] = app;
    domready(init);
})();