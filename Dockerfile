FROM node:lts

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose the port your app runs on
EXPOSE 1055

CMD ["node", "app.js"]
