FROM iron/node

# Create app directory
WORKDIR /usr/src/restdouble

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
RUN npm install

# Bundle app source
COPY . .

# Build restdouble
RUN npm run build

EXPOSE 3000
CMD [ "node", "./bin/cli.js", "-a", "/usr/src/input/api.yaml", "-j", "/usr/src/input/hooks.js", "-H", "0.0.0.0" ]
