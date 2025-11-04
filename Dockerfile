FROM node:18 AS build
WORKDIR /src
COPY package*.json ./
RUN npm ci
COPY . .
ARG API_BASE_URL
ENV VUE_APP_SERVER_URL=${API_BASE_URL}
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /src/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
