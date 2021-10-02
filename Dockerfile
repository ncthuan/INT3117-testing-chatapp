FROM node:12-alpine
WORKDIR /app

RUN apk add --update \
    python \
    python-dev \
    py-pip \
    build-base \
    bash \
  && pip install virtualenv \
  && rm -rf /var/cache/apk/*

RUN npm install rimraf -g

COPY package*.json /app/
RUN npm install

COPY . /app/
RUN npm run build && chmod +x script.sh

CMD ["sh", "/app/script.sh"]
