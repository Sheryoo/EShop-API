[![npm version](https://badge.fury.io/js/angular2-expandable-list.svg)](https://badge.fury.io/js/angular2-expandable-list)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# EShop-API

> This is full API for an E-shop using node.js, typescript and MongoDB

## Table of contents

- [EShop-API](#EShop-API)
  - [Table of contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Serving the app](#serving-the-app)
  - [Built With](#built-with)
  - [Authors](#authors)
  - [License](#license)

## Prerequisites

This project requires NodeJS (version 18 or later) and NPM.
[Node](http://nodejs.org/) and [Yarn](https://yarnpkg.com/) are really easy to install.
To make sure you have them available on your machine,
try running the following command.

```sh
$ yarn -v && node -v
1.20.0
v18.15.0
```

### .env file requirements

you must provide the following environment variables to run the application.

```ts

API_URI = ...

ADMIN_URI = ...

MONGO_URI = ...

JWT_SECRET = ...

CLOUDINARY_CLOUD_NAME = ...

CLOUDINARY_API_KEY = ...

CLOUDINARY_API_SECRET = ...

```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

Start with cloning this repo on your local machine:

```sh
$ git clone https://github.com/Sheryoo/EShop-API.git
$ cd EShop-API
```

To install and set up the library, run:

```sh
$ npm install
```

Or if you prefer using Yarn:

```sh
$ yarn
```

## Usage

### Serving the app

```sh
$ npm start
```

Or if you prefer using Yarn:

```sh
$ yarn start
```

## Built With

- Node.js
- Typescript
- Express
- MongoDB
- Love ❤️

## Authors

- **Sheryoo0** - _Initial work_ - [Sheryoo](https://github.com/Sheryoo)

See also the list of [contributors](https://github.com/EShop-API/contributors) who participated in this project.

## License

[MIT License](./LICENSE) © Sheryoo0
