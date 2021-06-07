FROM node:16-alpine
ENV NODE_ENV development
WORKDIR /usr/src/app
COPY . .
COPY public/favicon.ico dist/static/favicon.ico
COPY public/apple-touch-icon.png dist/static/apple-touch-icon.png
COPY public/favicon-32x32.png dist/static/favicon-32x32.png
COPY public/favicon-16x16.png dist/static/favicon-16x16.png
COPY public/android-chrome-512x512.png dist/static/android-chrome-512x512.png
COPY public/android-chrome-192x192.png dist/static/android-chrome-192x192.png
COPY public/pdf.worker.js dist/pdf.worker.js
RUN npm install
CMD ["npm","start"]
EXPOSE 8060
