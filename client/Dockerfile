FROM node:20-bullseye-slim as build
WORKDIR /app
COPY client/package.json ./package.json
RUN npm install
COPY client ./
ARG VITE_API_URL=http://localhost/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
