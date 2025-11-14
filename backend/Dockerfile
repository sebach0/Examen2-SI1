FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy composer files first (for better layer caching)
COPY composer.json composer.lock* ./

# Install PHP dependencies
# Intentar install primero (más rápido), si falla usar update
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts || \
    composer update --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copy application files (exclude vendor, node_modules via .dockerignore)
COPY . .

# Set permissions only for necessary directories (much faster - solo storage y cache)
# No cambiar permisos de vendor, app, etc. (innecesario y muy lento)
RUN mkdir -p /var/www/storage/logs /var/www/storage/framework/{sessions,views,cache} /var/www/bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Expose port
EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
