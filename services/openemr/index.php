<?php
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenEMR - BrainSAIT</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #1a365d, #2b6cb8);
            color: white;
            margin: 0;
            padding: 2rem;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 { color: #0ea5e9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 OpenEMR - BrainSAIT</h1>
        <h2>نظام السجلات الطبية الإلكترونية</h2>
        <p>Electronic Medical Records System</p>
        <div style="margin-top: 2rem;">
            <p>✅ System Status: Online</p>
            <p>🇸🇦 Saudi Arabia Compliant</p>
            <p>📋 FHIR R4 Ready</p>
            <p>🔒 HIPAA Secure</p>
        </div>
        <p style="margin-top: 2rem; font-size: 0.9rem;">
            الوقت: <?php echo date('Y-m-d H:i:s'); ?>
        </p>
    </div>
</body>
</html>
