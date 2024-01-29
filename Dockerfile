# Use an official Node.js runtime as a parent image
FROM node:16 as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application code to the working directorys
COPY . .

# Expose a port to communicate with the React app
EXPOSE 3000

# Start your React app
run npm run build

FROM nginx
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

# CMD ["nginx", "-g", "daemon off;"]
