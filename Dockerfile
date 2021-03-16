FROM node:14-alpine
ENV NODE_ENV production
ENV PORT 8090

WORKDIR usr/src/app
COPY server server/
COPY frontend frontend

WORKDIR server
RUN npm install

CMD ["npm", "start"]
EXPOSE 8080
