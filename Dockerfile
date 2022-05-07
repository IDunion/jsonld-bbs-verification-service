FROM node:17.9.0-alpine

WORKDIR /opt/verification-service

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm ci
RUN npm run build

FROM node:17.9.0-alpine

WORKDIR /opt/verification-service

COPY package.json ./
COPY package-lock.json ./
RUN npm ci --only=production
COPY --from=0 /opt/verification-service/dist .

RUN npm install pm2 -g

EXPOSE 4000

CMD [ "pm2-runtime", "index.js" ]
