FROM node:14-alpine
ENV NODE_ENV development
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
COPY public/pdf.worker.js dist/pdf.worker.js
CMD ["npm", "start"]
EXPOSE 8060
