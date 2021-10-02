#!/bin/bash

echo $1 $2
docker-compose -f docker-compose.yml -f docker-compose.development.yml $1 $2
