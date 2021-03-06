FROM node:16-alpine
ENV NODE_ENV production

WORKDIR usr/src/app
COPY server server/
COPY frontend frontend

WORKDIR server
RUN npm install

CMD ["npm", "start"]
EXPOSE 8080

