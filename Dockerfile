FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

ENV PORT 3000

EXPOSE 3000

CMD [ "npm", "run", "start"]