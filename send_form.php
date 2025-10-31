<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получаем данные из формы
    $form_type = $_POST['form_type'] ?? 'unknown';
    $email = $_POST['email'] ?? '';
    $website = $_POST['website'] ?? '';
    $budget = $_POST['budget'] ?? '';
    $visitors = $_POST['visitors'] ?? '';
    $business_niche = $_POST['business_niche'] ?? '';
    $choose_your_request = $_POST['choose_your_request'] ?? '';
    
    // Формируем тему письма
    $subject = "New request from BBot AI: " . ucfirst(str_replace('_', ' ', $form_type));
    
    // Формируем тело письма
    $message = "Form Type: " . ucfirst(str_replace('_', ' ', $form_type)) . "\n\n";
    
    if (!empty($email)) {
        $message .= "Email: " . $email . "\n";
    }
    
    if (!empty($website)) {
        $message .= "Website: " . $website . "\n";
    }
    
    if (!empty($budget)) {
        $message .= "Advertising Budget: " . $budget . "\n";
    }
    
    if (!empty($visitors)) {
        $message .= "Visitors per Month: " . $visitors . "\n";
    }
    
    if (!empty($business_niche)) {
        $message .= "Business Niche: " . $business_niche . "\n";
    }
    
    if (!empty($choose_your_request)) {
        $message .= "Request Type: " . $choose_your_request . "\n";
    }
    
    $message .= "\nSent from: " . ($_SERVER['HTTP_REFERER'] ?? 'Unknown source');
    
    // Email получателя
    $to = "bbotaimain@gmail.com";
    
    // Заголовки
    $headers = "From: bbotaimain@gmail.com\r\n";
    if (!empty($email)) {
        $headers .= "Reply-To: " . $email . "\r\n";
    }
    $headers .= "Content-Type: text/plain; charset=utf-8\r\n";
    
    // Отправляем письмо
    $mail_sent = mail($to, $subject, $message, $headers);
    
    if ($mail_sent) {
        echo "success";
    } else {
        echo "error";
    }
} else {
    echo "invalid_request";
}
?>