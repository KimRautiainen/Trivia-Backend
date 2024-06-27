# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in package.json
RUN npm install

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variables
ENV DB_HOST=my-mariadb
ENV DB_USER=root
ENV DB_PASS=12345
ENV DB_NAME=triviaDb
ENV JWT_SECRET=wefegwgwegewfwef26
ENV NODE_ENV=production

# Run the app when the container launches
CMD ["node", "server.js"]
