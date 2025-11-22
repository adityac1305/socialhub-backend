

# Sets the base image
FROM node:18-alpine

# Sets the working directory
WORKDIR /usr/src/app

# Copies package.json and package.lock.json
# This allows docker to cache layers and avoid reinstalling node_modules dependencies on every build
COPY package*.json ./


# This installs production-only dependencies
RUN npm ci --only=production

# Copies the entire api-gateway service code files into the container 
COPY . .


# non-root user and group [security best practices]
# Creates a system group named nodegroup and a system user named nodeuser and assigns nodeuser to nodegroup
# -S system group (no login shell, minimal privileges) | -S system user (no login shell, minimal privileges)
#RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup 

# This tells Docker to switch to the nodeuser non-root user
#USER nodeuser


# Tells docker than container will listen on port 3000
EXPOSE 3002


# This is the command that Docker will run when the container starts
CMD [ "node", "src/server.js" ]