# Webpack Boilerplate

This boilerplate covers:

* Loading html using the [HTMLWeabpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/)
* Transpiling ES6 code using [babel](http://babeljs.io/docs/setup/#installation)
* Converting sass into css using [sass-loader](https://webpack.js.org/loaders/sass-loader/) and [autoprefixer](https://github.com/postcss/autoprefixer)
* Loading and compressing images using the [image-webpack-loader](https://github.com/tcoopman/image-webpack-loader)
* Enabling hot reload using the [HotModuleReplacementPlugin](https://webpack.js.org/concepts/hot-module-replacement/)

### Install dependencies

```
npm install
```

### Start the development server

```
npm run dev 
```

### Build the project

```
npm run build
```

You should find the output inside the _dist_ folder.