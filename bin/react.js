#!/usr/bin/env node

var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var program = require('commander')
var readline = require('readline')
var sortedObject = require('sorted-object')
var util = require('util')

var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)

var _exit = process.exit
var pkg = require('../package.json')

var version = pkg.version
// Re-assign process.exit because of commander
// TODO: Switch to a different command framework
process.exit = exit

// CLI

around(program, 'optionMissingArgument', function (fn, args) {
    program.outputHelp()
    fn.apply(this, args)
    return {args: [], unknown: []}
})

before(program, 'outputHelp', function () {
    // track if help was shown for unknown option
    this._helpShown = true
})

before(program, 'unknownOption', function () {
    // allow unknown options if help was shown, to prevent trailing error
    this._allowUnknownOption = this._helpShown

    // show help if not yet shown
    if (!this._helpShown) {
        program.outputHelp()
    }
})

program
    .version(version, '    --version')
    .usage('[options] [dir]')
    .option('    --git', 'add .gitignore')
    .option('-f, --force', 'force on non-empty directory')
    .parse(process.argv)

if (!exit.exited) {
    main()
}

/**
 * Install an around function; AOP.
 */

function around(obj, method, fn) {
    var old = obj[method]

    obj[method] = function () {
        var args = new Array(arguments.length)
        for (var i = 0; i < args.length; i++) args[i] = arguments[i]
        return fn.call(this, old, args)
    }
}

/**
 * Install a before function; AOP.
 */

function before(obj, method, fn) {
    var old = obj[method]

    obj[method] = function () {
        fn.call(this)
        old.apply(this, arguments)
    }
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm(msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question(msg, function (input) {
        rl.close()
        callback(/^y|yes|ok|true$/i.test(input))
    })
}

/**
 * Copy file from template directory.
 */

function copyTemplate(from, to) {
    from = path.join(__dirname, '..', 'template', from)
    write(to, fs.readFileSync(from, 'utf-8'))
}

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

function createApplication(name, path) {
    var wait = 5

    console.log()
    function complete() {
        if (--wait) return
        var prompt = launchedFromCmd() ? '>' : '$'

        console.log()
        console.log('   install dependencies:')
        console.log('     %s cd %s && npm install', prompt, path)
        console.log()
        console.log('   run the app:')

        if (launchedFromCmd()) {
            console.log('     %s SET DEBUG=%s:* & npm start', prompt, name)
        } else {
            console.log('     %s DEBUG=%s:* npm start', prompt, name)
        }

        console.log()
    }

    mkdir(path, function () {
        mkdir(path + '/src', function () {
    
            mkdir(path + '/src/image')
            mkdir(path + '/src/component')
            mkdir(path + '/src/page',function(){
                copyTemplate('index', path + '/src/page/index.js')
                copyTemplate('route', path + '/src/page/index_example.js')
                copyTemplate('sum', path + '/src/page/sum.js')
            })
            mkdir(path + '/src/redux', function () {
                mkdir(path + '/src/redux/action',function(){
                    copyTemplate('action', path + '/src/redux/action/example.js')
                })
                mkdir(path + '/src/redux/reducer',function(){
                    copyTemplate('reducer', path + '/src/redux/reducer/example.js')
                })
                complete()
            })
            mkdir(path + '/src/commonKit')
            //mkdir(path + '/src/style')
            mkdir(path+'/src/__tests__',function(){
            copyTemplate('sum.test', path + '/src/__tests__/sum.test.js')
            complete()
        })
        })
        mkdir(path+'/public',function(){
            mkdir(path+'/public/build')
            copyTemplate('index.html', path + '/public/index.html')
            complete()
        })
        

        mkdir(path + '/lib', function () {
            //存放别人的库，但是自己有修改
            /*copyTemplate('js/routes/index.js', path + '/routes/index.js')
             copyTemplate('js/routes/users.js', path + '/routes/users.js')*/
            complete()
        })


        // CSS Engine support
       

        // package.json
        var pkg = {
            "name": name,
            "version": "1.0.0",
            "description": "react project build helper",
            "main": "bin/react",
            "bin": {
                "react": "./bin/react"
            },
            "scripts": {
                "test": "jest",
                "build-dev": "webpack  --env.platform=development --config webpack.config.js",
                "build-pro": "webpack --env.platform=production --config webpack.config.js",
                "server": "webpack-dev-server"
            },
            "keywords": [
                "react",
                "generator"
            ],
            "author": "land chen",
            "license": "ISC",
            "dependencies": {
                "history": "4.6.3",
                "iscroll": "5.2.0",
                "prop-types": "15.5.10",
                "react": "^15.6.1",
                "react-dom": "15.6.1",
                "react-redux": "5.0.5",
                "react-router": "4.1.1",
                "react-router-redux": "5.0.0-alpha.6",
                "redux": "3.6.0",
                "redux-thunk": "2.2.0",
                "spin": "0.0.1"
            },
            "devDependencies": {
                "autoprefixer-loader": "3.2.0",
                "babel-eslint": "7.2.3",
                "babel-loader": "7.1.1",
                "babel-preset-es2015": "6.9.0",
                "babel-preset-react": "6.5.0",
                "babel-preset-stage-1": "6.5.0",
                "babel-core": "^6.26.0",
                "babel-polyfill": "^6.26.0",
                "babel-jest": "^21.0.2",
                "jest": "^21.1.0",
                "regenerator-runtime": "^0.11.0",
                "css-loader": "0.23.1",
                "eslint": "3.19.0",
                "eslint-plugin-flowtype": "^2.35.0",
                "eslint-plugin-react": "7.0.1",
                "image-webpack-loader": "1.8.0",
                "node-sass": "4.5.3",
                "redux-devtools-extension": "2.13.2",
                "sass-loader": "6.0.6",
                "style-loader": "0.13.2",
                "url-loader": "0.5.7",
                "webpack": "3.3.0",
                "webpack-dev-server": "2.5.1",
                "whatwg-fetch": "2.0.3",
                "webpack-bundle-analyzer": "^2.9.0"
            }
        }

        // sort dependencies like npm(1)
        pkg.dependencies = sortedObject(pkg.dependencies)

        // write files
        write(path + '/package.json', JSON.stringify(pkg, null, 2) + '\n')
        copyTemplate('webpack.config', path + '/webpack.config.js')
        copyTemplate('.babelrc', path + '/.babelrc')
        copyTemplate('eslintrc', path + '/.eslintrc.json')
        if (program.git) {
            copyTemplate('gitignore', path + '/.gitignore')
        }

        complete()
    })
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName(pathName) {
    return path.basename(pathName)
        .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
        .replace(/^[-_.]+|-+$/g, '')
        .toLowerCase()
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory(path, fn) {
    fs.readdir(path, function (err, files) {
        if (err && err.code !== 'ENOENT') throw err
        fn(!files || !files.length)
    })
}

/**
 * Graceful exit for async STDIO
 */

function exit(code) {
    // flush output for Node.js Windows pipe bug
    // https://github.com/joyent/node/issues/6247 is just one bug example
    // https://github.com/visionmedia/mocha/issues/333 has a good discussion
    function done() {
        if (!(draining--)) _exit(code)
    }

    var draining = 0
    var streams = [process.stdout, process.stderr]

    exit.exited = true

    streams.forEach(function (stream) {
        // submit empty write request and wait for completion
        draining += 1
        stream.write('', done)
    })

    done()
}

/**
 * Determine if launched from cmd.exe
 */

function launchedFromCmd() {
    return process.platform === 'win32' &&
        process.env._ === undefined
}

/**
 * Load template file.
 */

/**
 * Main program.
 */

function main() {
    // Path
    var destinationPath = program.args.shift() || '.'

    // App name
    var appName = createAppName(path.resolve(destinationPath)) || 'hello-world'

    // Generate application
    emptyDirectory(destinationPath, function (empty) {
        if (empty || program.force) {
            createApplication(appName, destinationPath)
        } else {
            confirm('destination is not empty, continue? [y/N] ', function (ok) {
                if (ok) {
                    process.stdin.destroy()
                    createApplication(appName, destinationPath)
                } else {
                    console.error('aborting')
                    exit(1)
                }
            })
        }
    })
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(path, fn) {
    mkdirp(path, MODE_0755, function (err) {
        if (err) throw err
        console.log('   \x1b[36mcreate\x1b[0m : ' + path)
        fn && fn()
    })
}

/**
 * Generate a callback function for commander to warn about renamed option.
 *
 * @param {String} originalName
 * @param {String} newName
 */

function renamedOption(originalName, newName) {
    return function (val) {
        warning(util.format("option `%s' has been renamed to `%s'", originalName, newName))
        return val
    }
}

/**
 * Display a warning similar to how errors are displayed by commander.
 *
 * @param {String} message
 */

function warning(message) {
    console.error()
    message.split('\n').forEach(function (line) {
        console.error('  warning: %s', line)
    })
    console.error()
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write(path, str, mode) {
    fs.writeFileSync(path, str, {mode: mode || MODE_0666})
    console.log('   \x1b[36mcreate\x1b[0m : ' + path)
}