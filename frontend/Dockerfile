FROM node:16-alpine
ENV NODE_ENV development
WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
COPY public/pdf.worker.js dist/pdf.worker.js
CMD ["npm", "start"]
EXPOSE 8060
