FROM node:16-alpine
ENV NODE_ENV development
WORKDIR /usr/src/app
COPY . .
COPY public/favicon.ico dist/favicon.ico
COPY public/apple-touch-icon.png dist/apple-touch-icon.png
COPY public/favicon-32x32.png dist/favicon-32x32.png
COPY public/favicon-16x16.png dist/favicon-16x16.png
COPY public/android-chrome-512x512.png dist/android-chrome-512x512.png
COPY public/android-chrome-192x192.png dist/android-chrome-192x192.png
COPY public/pdf.worker.js dist/pdf.worker.js
RUN npm install
CMD ["npm","start"]
EXPOSE 8060
