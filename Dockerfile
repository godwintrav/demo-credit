# Use Node.js version 20.18.0
FROM node:20.18.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001
CMD [ "node", "dist/server.js" ]