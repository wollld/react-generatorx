
# react-generatorx
fast build a react project see npm:https://www.npmjs.com/package/react-generatorx

### 安装
`npm install react-generatorx -g`

### 创建工程
* `react [--git] projectname`
*  `cd projectname `
*  `npm install`

### 目录结构
<pre>
	lib//别人的库,但是自己有修改,copy至此自己维护
	node_modules
	public---//发布时只需上传这个文件夹
		index.html
	src---
		build
		image
		component
		page
		commonKit
		redux---
			action
			reducer
	.gitignore
	package.json
	webpack.config.js
	.eslintrc.json
</pre>

### 主要库文件
<pre>
"history": "4.6.3",
"iscroll": "5.2.0",
"react": "^15.6.1",
"react-dom": "15.6.1",
"react-redux": "5.0.5",
"react-router": "4.1.1",
"react-router-redux": "5.0.0-alpha.6",
"redux": "3.6.0",
"redux-thunk": "2.2.0",
"spin": "0.0.1",
"webpack": "3.3.0",
"webpack-dev-server": "2.5.1",
"whatwg-fetch": "2.0.3"
</pre>        