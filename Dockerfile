# Building app
FROM node:14-alpine as build

WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile
RUN yarn build

# Starting NGINX
FROM nginx

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html