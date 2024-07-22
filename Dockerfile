FROM node:20

RUN apt-get update && \
    apt-get install -y python3 php && \
    apt-get clean


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3333

CMD ["npm" , "start"]