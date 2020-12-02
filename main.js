// Đối tượng Validator
function Validator(options) { //options === obj  => options.form == '#form1'

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // Ham thuc hien validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        // Lay ra cac rule cua selector
        var rules = selectorRules[rule.selector];
        // Lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }

            if (errorMessage) break;
        }

        if (errorMessage) {
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
            errorElement.innerHTML = errorMessage;
        } else {
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
            errorElement.innerHTML = '';
        }
        return !errorMessage; // true
    }

    // function onInput(inputElement) {
    //     var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
    //     errorElement.innerText = '';
    //     getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
    // }

    // console.log(options.form);
    // Lay element cua Form cần validate
    var formElement = document.querySelector(options.form);

    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua tất cả các rule và thực hiện validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule); // trur orr false
                if (!isValid) { // neu la false
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Trường hợp submit với js
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    // values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                // Submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
            // else {
            //     console.log('Có lỗi');
            // }
        }

        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện: blur, input)
        options.rules.forEach(rule => {
            // Lưu lại các rules
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }


            var inputElements = document.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(inputElement => {
                if (inputElement) {
                    // Xu ly truong hop blur
                    inputElement.onblur = function() {
                        // value: inputElement.value
                        // test func: rule.test
                        validate(inputElement, rule);
                    }

                    //Xu ly truong hop khi người dùng nhập
                    inputElement.oninput = function() {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                        // onInput(inputElement);
                    }

                    // onchange
                }
            })


        });
    }
}

// Định nghĩa các rules
// Nguyên tắc của các rules:
// 1: Khi có lỗi => Trả ra lỗi
// 2: Khi hợp lệ => Không trả ra cái gì (undefined)
Validator.isRequied = function(selector, message) { //selector === '#fullname'
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return re.test(value) ? undefined : message || 'Trường này phải là email';
        }
    };
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiếu ${min} ký tự`;
        }
    };
}

Validator.isConfirmed = function(selector, getConfirmValue, message) { //getConfirmValue === func
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || `Giá trị nhập vào không chính xác`;
        }
    };
}