FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

EXPOSE 3030
EXPOSE 3031

CMD ["yarn", "start"]