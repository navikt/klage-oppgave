FROM node:14-alpine
ENV NODE_ENV development

WORKDIR /usr/src/app
COPY . .
COPY package.json package.json

RUN npm install

CMD ["npm","run","docker"]
EXPOSE 8090
