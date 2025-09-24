FROM node:24.6.0-alpine AS dev-deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN apk add --no-cache build-base python3 && npm ci

FROM node:24.6.0-alpine AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --configuration=production

FROM node:24.6.0-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production --frozen-lockfile

FROM nginx:alpine AS prod
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/www ./www

FROM nginx:alpine
COPY --from=prod /app/www /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]