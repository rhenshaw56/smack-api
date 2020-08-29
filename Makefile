#!make


include .env
export $(shell sed 's/=.*//' .env)

default: start-dev

start:
	node index.js

start-dev:
	@NODE_ENV=development \
		make start
