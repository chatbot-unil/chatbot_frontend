FROM node:20 as build
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --no-audit

COPY public/ public/
COPY src/ src/
COPY . .

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
