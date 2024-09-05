.PHONY: install run

install:
	@echo "Installing dependencies..."
	npm i express
	npm i axios
	npm i @faker-js/faker
	npm i sqlite3 
	npm i sqlite
	npm i bcryptjs 
	npm i express-session
	npm i selenium-side-runner
	npm i chromedriver 
	npm i uuid

	@echo "Dependencies installed."

run: install
	@echo "Starting the server..."
	node server.js
