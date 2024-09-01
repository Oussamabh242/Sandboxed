# FROM node:20

# RUN apt-get update && \
#     apt-get install -y python3 php && \
#     apt-get clean


# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 3333

# CMD ["npm" , "start"]

#FROM node:20-slim

# Install system dependencies and Composer
# RUN apt-get update && \
#     apt-get install -y python3 python3-pip python3-venv python3-dev build-essential php php-cli php-mbstring git unzip && \
#     apt-get clean && \
#     php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
#     php composer-setup.php --install-dir=/usr/local/bin --filename=composer && \
#     php -r "unlink('composer-setup.php');"

# # Create a non-root user
# # RUN useradd -m -s /bin/bash appuser

# # Set the working directory
# WORKDIR /usr/app

# # Copy package files with correct ownership
# COPY package*.json ./
# COPY composer*.json ./

# # Install Node.js and Composer dependencies
# # USER appuser
# RUN npm install && composer install

# # Copy the rest of the application code
# COPY  . .

# # Switch back to root user to set permissions
# # USER root

# # Set permissions for all directories
# # RUN find . -type d -exec chmod 555 {} \;

# # # Set permissions for user_code directory
# # RUN mkdir -p user_code && chmod 777 user_code

# # Create and activate a Python virtual environment
# RUN python3 -m venv .venv
# RUN .venv/bin/pip install pyseccomp 

# # Expose the application port
# EXPOSE 3333

# # Switch back to the non-root user
# # USER appuser

# # Set environment variables to use the virtual environment


# RUN npm run build
# # Start the application
# CMD ["npm", "start"]


FROM node:20-slim

# Install system dependencies and Composer
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv python3-dev build-essential php php-cli php-mbstring git unzip && \
    apt-get clean && \
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php --install-dir=/usr/local/bin --filename=composer && \
    php -r "unlink('composer-setup.php');"
#
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends \
#     python3-minimal \
#     python3-pip \
#     python3-venv \
#     python3-dev \
#     php-cli \
#     git \
#     unzip \
#     && apt-get clean && \
#     rm -rf /var/lib/apt/lists/* && \
#     curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
#

WORKDIR /usr/app

COPY  package*.json ./
COPY composer*.json ./





COPY . .



RUN npm install && composer install
RUN npm run build
RUN python3 -m venv .venv
RUN .venv/bin/pip install pyseccomp


RUN find . -type d -exec chmod 777 {} \;

RUN mkdir -p user_code && chmod 777 user_code





EXPOSE 3333





# Start the application
CMD ["npm", "start"]




# FROM node:20-alpine
#
# # Install system dependencies and Composer
# RUN apk add --no-cache python3 py3-pip python3-dev build-base php7 php7-cli php7-mbstring git unzip && \
#     pip install --upgrade pip && \
#     curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
#     rm -rf /var/cache/apk/*
#
# WORKDIR /usr/app
#
# COPY package*.json composer*.json ./
#
# # Set permissions for user_code directory
# COPY . .
#
# RUN npm install && composer install
# RUN npm run build
# RUN python3 -m venv .venv && .venv/bin/pip install pyseccomp
#
# RUN mkdir -p user_code && chmod 777 user_code
#
# # Change permissions for all directories
# RUN find . -type d -exec chmod 777 {} \;
#
#
#
# CMD ["npm", "start"] 
