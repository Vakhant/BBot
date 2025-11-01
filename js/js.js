$(document).ready(function() {
    // Инициализация масок и валидации для форм
    initFormValidation('#CommercialOfferForm');
    initFormValidation('#ConnectToFreeAnalyticsForm');
});

function initFormValidation(formSelector) {
    const $form = $(formSelector);
    const $submitBtn = $form.find('button[type="submit"], .btn');
    let formInteracted = false; // Флаг первого взаимодействия
    
    // Добавляем обработчики событий для всех полей ввода
    $form.find('input[type="text"]').each(function() {
        const $input = $(this);
        const placeholder = $input.attr('placeholder') || '';
        
        // Определяем тип поля по placeholder или другим признакам
        if (placeholder.includes('$') || $input.prev().text().includes('Advertising budget')) {
            initCurrencyMask($input);
        } else if (placeholder.includes('@') || $input.prev().text().includes('Email')) {
            initEmailValidation($input);
        } else if (placeholder.includes('http') || $input.prev().text().includes('Website link')) {
            initUrlValidation($input);
        } else if (placeholder.includes('-') || $input.prev().text().includes('Number of visitors')) {
            initRangeMask($input);
        } else if ($input.prev().text().includes('Business niche')) {
            initTextOnlyMask($input);
        }
        
        // Добавляем обработчики событий для валидации
        $input.on('input blur', function() {
            if (!formInteracted) {
                formInteracted = true;
                enableRealTimeValidation($form);
            }
            validateField($(this));
            updateSubmitButton($form, $submitBtn, formInteracted);
        });
    });
    
    // Обработчик отправки формы
    $form.on('submit', function(e) {
        e.preventDefault();
        
        // Помечаем форму как взаимодействовавшую
        if (!formInteracted) {
            formInteracted = true;
            enableRealTimeValidation($form);
        }
        
        // Проверяем все поля перед отправкой
        let isValid = true;
        $form.find('input[type="text"]').each(function() {
            if (!validateField($(this))) {
                isValid = false;
            }
        });
        
        if (isValid) {
            // Форма валидна, отправляем данные
            submitForm($form);
        } else {
            console.log('Form contains errors');
            // Показываем все ошибки
            showAllErrors($form);
        }
        
        updateSubmitButton($form, $submitBtn, formInteracted);
    });
    
    // Инициализация кнопки (изначально disabled если форма не взаимодействовала)
    updateSubmitButton($form, $submitBtn, formInteracted);
}

// Функция отправки формы на PHP
function submitForm($form) {
    const formData = new FormData();
    
    // Собираем данные из всех полей с атрибутом name
    $form.find('[name]').each(function() {
        const $field = $(this);
        const name = $field.attr('name');
        let value = '';
        
        if ($field.is('input[type="text"], input[type="hidden"]')) {
            value = $field.val().trim();
        }
        // Можно добавить обработку других типов полей если понадобится
        
        if (name && value !== '') {
            formData.append(name, value);
        }
    });
    
    // Добавляем тип формы
    if ($form.attr('id') === 'CommercialOfferForm') {
        formData.append('form_type', 'commercial_offer');
    } else if ($form.attr('id') === 'ConnectToFreeAnalyticsForm') {
        formData.append('form_type', 'free_analytics');
    }
    
    // Отправляем данные на PHP
    fetch('../send_form.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        if (result === 'success') {
            // Показываем попап успеха
            $('#thankYou').fadeIn();
            // Сбрасываем форму
            $form[0].reset();
            // Закрываем модальное окно, если оно открыто
            $('#ConnectToFreeAnalytics').fadeOut();
        } else {
            alert('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.');
    });
}

// Включает реальную валидацию для всех полей формы
function enableRealTimeValidation($form) {
    $form.addClass('form-interacted');
    
    // Добавляем обработчики для всех полей
    $form.find('input[type="text"]').each(function() {
        const $input = $(this);
        
        $input.off('input.validate blur.validate').on('input.validate blur.validate', function() {
            validateField($(this));
            updateSubmitButton($form, $form.find('button[type="submit"], .btn'), true);
        });
        
        // Валидируем поле сразу
        validateField($input);
    });
}

// Показывает все ошибки в форме
function showAllErrors($form) {
    $form.find('input[type="text"]').each(function() {
        validateField($(this));
    });
}

// Маска для валюты (только цифры, всегда с $)
function initCurrencyMask($input) {
    $input.on('input', function() {
        let value = $(this).val().replace(/[^\d]/g, '');
        
        if (value) {
            // Форматируем число с пробелами для тысяч
            value = parseInt(value).toLocaleString('ru-RU');
            $(this).val('$' + value);
        } else {
            $(this).val('$');
        }
    });
    
    // Инициализируем начальное значение
    if (!$input.val()) {
        $input.val('$');
    }
}

// Валидация email
function initEmailValidation($input) {
    // Базовая валидация уже в validateField
}

function validateEmailField($input) {
    const email = $input.val();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        showError($input, 'Please enter a valid email address');
        return false;
    } else {
        hideError($input);
        return true;
    }
}

// Валидация URL
function initUrlValidation($input) {
    // Базовая валидация уже в validateField
}

function validateUrlField($input) {
    const url = $input.val();
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (url && !urlRegex.test(url)) {
        showError($input, 'Please enter a valid URL');
        return false;
    } else {
        hideError($input);
        return true;
    }
}

// Маска для диапазона (цифры и дефис)
function initRangeMask($input) {
    $input.on('input', function() {
        let value = $(this).val();
        
        // Разрешаем только цифры, пробелы и дефис
        value = value.replace(/[^\d\s-]/g, '');
        
        // Ограничиваем количество дефисов до одного
        const dashCount = (value.match(/-/g) || []).length;
        if (dashCount > 1) {
            value = value.replace(/-+$/, '-');
        }
        
        $(this).val(value);
    });
}

// Маска только для текста (буквы)
function initTextOnlyMask($input) {
    $input.on('input', function() {
        let value = $(this).val();
        
        // Разрешаем только буквы и пробелы
        value = value.replace(/[^a-zA-Zа-яА-Я\s]/g, '');
        
        $(this).val(value);
    });
}

// Валидация отдельного поля
function validateField($input) {
    const value = $input.val().trim();
    const placeholder = $input.attr('placeholder') || '';
    const fieldLabel = $input.prev().text();
    const $form = $input.closest('form');
    const formInteracted = $form.hasClass('form-interacted');
    
    // Если форма еще не взаимодействовала, не показываем ошибки
    if (!formInteracted) {
        hideError($input);
        return true;
    }
    
    // Проверка на обязательное поле
    if ($input.attr('required') && !value) {
        showError($input, 'This field is required');
        return false;
    }
    
    // Специфические проверки в зависимости от типа поля
    if (value) {
        if (placeholder.includes('@') || fieldLabel.includes('Email')) {
            return validateEmailField($input);
        } else if (placeholder.includes('http') || fieldLabel.includes('Website link')) {
            return validateUrlField($input);
        } else if (placeholder.includes('$') || fieldLabel.includes('Advertising budget')) {
            // Для поля с валютой проверяем, что есть цифры после $
            const numericValue = value.replace('$', '').replace(/\s/g, '');
            if (!numericValue || !/^\d+$/.test(numericValue)) {
                showError($input, 'Please enter a numeric value');
                return false;
            }
            hideError($input);
            return true;
        } else if (placeholder.includes('-') || fieldLabel.includes('Number of visitors')) {
            // Для диапазона проверяем формат
            if (!/^[\d\s-]+$/.test(value)) {
                showError($input, 'Only numbers, spaces and hyphens are allowed');
                return false;
            }
            hideError($input);
            return true;
        } else if (fieldLabel.includes('Business niche')) {
            // Для бизнес-ниши проверяем, что только буквы
            if (!/^[a-zA-Zа-яА-Я\s]+$/.test(value)) {
                showError($input, 'Only letters and spaces are allowed');
                return false;
            }
            hideError($input);
            return true;
        }
    }
    
    // Если дошли сюда и ошибок нет, скрываем ошибку
    hideError($input);
    return true;
}

// Обновление состояния кнопки отправки
function updateSubmitButton($form, $submitBtn, formInteracted) {
    // Если форма еще не взаимодействовала, кнопка активна
    if (!formInteracted) {
        $submitBtn.prop('disabled', false).removeClass('disable');
        return;
    }
    
    let isValid = true;
    
    // Проверяем только текстовые поля (кастомный селект не проверяем)
    $form.find('input[type="text"][required]').each(function() {
        if (!validateField($(this))) {
            isValid = false;
        }
    });
    
    // Обновляем состояние кнопки
    if (isValid) {
        $submitBtn.prop('disabled', false).removeClass('disable');
    } else {
        $submitBtn.prop('disabled', true).addClass('disable');
    }
}

// Показать ошибку
function showError($input, message) {
    // Удаляем старую ошибку
    hideError($input);
    
    // Добавляем сообщение об ошибке
    $input.addClass('error');
    $input.after(`<div class="error-message" style="color: red; font-size: 12px; margin-top: 5px;">${message}</div>`);
}

// Скрыть ошибку
function hideError($input) {
    $input.removeClass('error');
    $input.next('.error-message').remove();
}

document.addEventListener('DOMContentLoaded', function() {
    // Функция расчета потерь
    function calculateLosses() {
        // Получаем значения полей
        const trafficInput = document.querySelector('input[placeholder="5 000"]');
        const cpcInput = document.querySelector('input[placeholder="42"]');
        const websiteTopicInput = document.getElementById('websiteTopicInput');
        
        // Парсим значения
        const monthlyTraffic = parseInt(trafficInput.value.replace(/\s/g, '')) || 0;
        const avgCPC = parseInt(cpcInput.value.replace(/\s/g, '')) || 0;
        
        // Получаем коэффициент тематики
        const selectedValue = websiteTopicInput.value;
        let themeCoef = 25;
        
        // Находим опцию с соответствующим data-value
        const selectedOption = document.querySelector(`.option[data-value="${selectedValue}"]`);
        if (selectedOption && selectedOption.dataset.coef) {
            themeCoef = parseFloat(selectedOption.dataset.coef);
        }
        
        // Расчет потерь
        const monthlyLoss = (monthlyTraffic * themeCoef / 100) * avgCPC;
        const yearlyLoss = monthlyLoss * 12;
        
        // Обновляем результаты
        if (!isNaN(monthlyLoss) && !isNaN(yearlyLoss)) {
            document.getElementById('LostPerYear').textContent = Math.ceil(yearlyLoss).toLocaleString();
            document.getElementById('LostPerMonth').textContent = Math.ceil(monthlyLoss).toLocaleString();
        }
    }
    
    // Обработчики изменений для текстовых полей
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('input', calculateLosses);
    });
    
    // Обработчик для выбора опции в селекте
    $(document).on('click', '.option', function() {
        // Даем время на обновление значения в скрытом инпуте
        setTimeout(calculateLosses, 0);
    });
    
    // Инициализация расчета
    calculateLosses();
});