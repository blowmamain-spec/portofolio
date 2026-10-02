# Production image: php-fpm + nginx in a single container, running the
# built application (no bind mounts). Simpler to operate on a homeserver
# than splitting into two containers — a reasonable trade-off at this
# project's scale. See docs/ARCHITECTURE.md for the full picture.
FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache \
        nginx \
        postgresql-dev \
        libzip-dev \
        $PHPIZE_DEPS \
    && docker-php-ext-install pdo_pgsql pgsql zip opcache \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies first so this layer is cached unless
# composer.json/composer.lock change.
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY backend/ .
RUN composer dump-autoload --optimize --no-dev \
    && php artisan storage:link \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/backend/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
