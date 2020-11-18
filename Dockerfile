FROM node:14-alpine
ENV NODE_ENV production

WORKDIR usr/src/app
COPY server server/
COPY frontend frontend

WORKDIR server
RUN yarn install

CMD ["node", "main.js"]
EXPOSE 8080
