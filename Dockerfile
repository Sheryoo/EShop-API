FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

# Copy the .env file
COPY .env .

# Use a shell script to substitute variables and set them
RUN sh -c 'source .env && \
    for var in $(env | grep -v "^PATH="); do \
        export "$var"; \
    done'


EXPOSE 3030

CMD ["yarn", "start"]