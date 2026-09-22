# Dockerfile for the forked aws-elastic-beanstalk-express-js-sample app.
# Built and pushed by the Jenkins pipeline (Jenkinsfile, "Build Docker Image" stage).
FROM node:16-alpine

WORKDIR /usr/src/app

# Install dependencies first so this layer is cached unless package.json changes
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application source
COPY . .

# NOTE: confirm the actual port with: grep -n "listen" app.js
# and adjust this if the app listens on a different port.
EXPOSE 8080

CMD ["npm", "start"]
