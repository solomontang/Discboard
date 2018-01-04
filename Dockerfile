FROM node:9.3.0-alpine
WORKDIR /usr/src/app
COPY ["package*.json", "config.json", "./"]
RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm config set unsafe-perm=true \
    && npm install \
    && npm i -g ffmpeg-binaries pm2 \
    && apk del .gyp
COPY . .
EXPOSE 3000
CMD ["pm2-runtime", "start", "bot/bot.js"]