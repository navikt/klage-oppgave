FROM node:14-alpine
ENV NODE_ENV development

WORKDIR /usr/src/app
COPY . .

RUN npm install

CMD ["node_modules/.bin/ts-node", "src/server.ts"]
EXPOSE 3000
