FROM node:18-alpine

# Install packages needed to build node modules
RUN apk update && apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    openssl \
    pkgconfig

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start"]