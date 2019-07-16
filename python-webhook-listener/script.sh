#!/bin/bash
echo $1

if [[ $1 == 'jp-website-frontend-dev' ]]; then
    echo dev environment
fi

if [[ $1 == 'jp-website-frontend-prod' ]]; then
    echo prod environment
    kubectl rollout restart deployment/jp-website-frontend
fi


if [[ $1 == 'ping' ]]; then
    echo pong
fi


