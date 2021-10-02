#!/bin/bash

vars=$(compgen -A variable)
subst=$(printf '${%s} ' $vars)
envsubst "$subst" < /etc/nginx/conf.d/vhost.conf.sample > /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
