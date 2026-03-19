FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm install

COPY src ./src

EXPOSE 3001

CMD ["npm", "run", "start"]
