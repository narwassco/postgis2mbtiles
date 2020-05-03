# Start from ubuntu
FROM ubuntu:16.04

# Update repos and install dependencies
RUN apt-get update \
  && apt-get -y upgrade \
  && apt-get -y install build-essential libsqlite3-dev zlib1g-dev curl wget git nodejs npm

# Create a directory and copy in all files
# RUN mkdir -p /tmp/tippecanoe-src
# WORKDIR /tmp/tippecanoe-src
# COPY . /tmp/tippecanoe-src

# Build tippecanoe
RUN mkdir -p /tmp/src
WORKDIR /tmp/src
RUN git clone https://github.com/mapbox/tippecanoe.git
WORKDIR /tmp/src/tippecanoe
RUN make \
    && make install

# Install Nodejs
RUN npm cache clean && npm install n -g && n stable \
    && n 12.14.1 && ln -sf /usr/local/bin/node /usr/bin/node

# Install postgis2geojson
RUN cd .. \
    && git clone https://github.com/narwassco/postgis2geojson.git \
    && cd postgis2geojson \
    && npm install

# Copy Config file to container
COPY config.js /tmp/src/postgis2geojson/example/config.js

ADD entrypoint.sh /tmp/entrypoint.sh
RUN chmod +x /tmp/entrypoint.sh
CMD ["/tmp/entrypoint.sh"]
