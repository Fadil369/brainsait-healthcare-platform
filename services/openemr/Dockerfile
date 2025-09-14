FROM php:8.1-apache

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mysqli zip \
    && rm -rf /var/lib/apt/lists/*

COPY index.php /var/www/html/

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80
CMD ["apache2-foreground"]
