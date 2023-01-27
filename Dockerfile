FROM node:16.12.0

WORKDIR /app/back
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "start"]
