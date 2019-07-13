#!/bin/bash
echo the image tag is $1

if [[ $1 == 'dev-tag' ]]; then
    echo dev environment
fi

if [[ $1 == 'prod-tag' ]]; then
    echo prod environment
    kubectl rollout restart deployment/prod-app-name
fi


if [[ $1 == 'ping' ]]; then
    echo pong
fi
