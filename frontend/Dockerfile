FROM node:14-alpine
ENV NODE_ENV development
WORKDIR /usr/src/app
COPY . .
RUN npm install
CMD ["npm","start"]
EXPOSE 8060
