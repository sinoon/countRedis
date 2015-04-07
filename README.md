# countredis - a node.js counter power by redis.
[![Build Status](https://travis-ci.org/luin/node_ranaly.png?branch=master)](https://travis-ci.org/luin/node_ranaly)

countredis可以非常简单地统计项目中的各种数据。

## 安装
```
npm install countredis
```
## 使用方法
首先加载countredis库：
```js	
var countredis = require('countredis');
```
而后创建countredis连接：
```js
var client = countredis.createClient([port,[host,[auth,[prefix]]]]);
```
其中 `post` 和 `host` 是Redis数据库的端口号和主机地址, `auth` 是redis使用的密码， `prefix` 用来指定 `countredis` 向Re
is加入的键的前缀以防止命名冲突，默认值是 `count:` 。

如果程序中已经使用[node_redis](https://github.com/mranney/node_redis)库建立了到Redis的连接，也可以将该实例传入createClient函数：
```
var redis = require('redis').createClient();
var client = ranaly.createClient(redis, prefix);
```
**推荐** : 最好传入已经创建好的redis连接，这样可以选择redis的数据库，默认是第一个数据库。

`countredis` 支持3种数据类型，分别是 `Amount`、`Realtime`和`DataList`。

## Amount
创建一个Amount实例：
```js
var users = new client.Amount('Users');
```
### incr
`incr`方法用来增加实例的值，如每当有新用户注册时可以通过如下方法增加用户数量：
```js
users.incr(function (err, total) {
	console.log('用户总数为：' + total + '个');
});
```
`incr` 函数的定义是：
```
	incr([increment, [when, [callback]])
```
其中 `increment` 指增加的数量，默认为1。 `when` 指增长发生的时间， `Date` 类型，默认为 `new Date()` ，即当前时间。 `callback` 的第二个参数返回增长后的总数。

### get
`get` 方法用来获取实例在若干个时间的数量，如：
```js
users.get(['20130218', '20130219'], function (err, result) {
	console.log(result);
});
```
第一个参数是时间的数组，时间的表示方法为 `YYYYMMDD` 或 `YYYYMMDDHH` 。如想获取今天和当前小时的注册用户数量：
```js
var now = moment(); // 需要使用moment库
users.get([now.format('YYYYMMDD'), now.format('YYYYMMDDHH')], function (err, results) {
	console.log('今天新注册的用户数量：' + results[0]);
	console.log('当前小时新注册的用户数量：' + results[1]);
});
```
### sum
`sum` 方法用来获取实例在若干个时间内总共的数量，使用方法和 `get` 一样，不再赘述。特例是当第一个参数为空时， `sum` 会返回该Amount实例的总数。如：
```js
users.sum([], function (err, result) {
	console.log('用户总数为：' + total + '个');
});
```
## Realtime
创建一个Realtime实例：
```js
var memory = new client.Realtime('Memory');
```
### incr
`incr` 方法用来递增实例的值，如增加当前内存占用的空间：
```js
memory.incr(1, function (err, result) {
	console.log('当前内存占用为：' + result);
});
```
其中第一个参数表示增加的数量，如果省略则默认为1。

### set
`set` 方法用来设置实例的值，如：
```js
memory.set(20);
```
### get
`get` 方法用来获得实例的值，如：
```js
memory.get(function (err, result) {
	console.log('当前内存占用为：' + result);
});
```
### 实时通知
当修改了某个Realtime实例的值后，ranaly会使用Redis的`PUBLISH`命令派发通知，`channel`可以通过实例的`channel`属性获得，如：
```js
var sub = redis.createClient();
sub.subscribe(memory.channel);
sub.on('message', function (channel, message) {
	if (channel === memory.channel) {
		console.log('当前内存占用为：' + message);
	}
});
```
## DataList
创建一个DataList实例：
```js
var userAvatars = new client.DataList('Avatars');
```
### push
`push` 方法用来向实例加入一个元素，可以是字符串、数组、数组或对象类型，如：
```js
userAvatars.push({
    	url: 'http://demo.com/avatar.png',
	    userID: 17
    }, 50, function (err, length) {
        console.log(err);
        console.log(length);
    });
});
```
其中第二个参数表示保留的记录数量，默认为100。

### len
`len` 方法用来获得实例的大小，如：
```js
userAvatars.len(function (err, length) {
    console.log(err);
    console.log(length);
});
```
### range
`range` 方法用来获得队列中的某个片段，第一个参数表示起始元素索引，第二个元素表示末尾元素索引。索引从0开始，支持负索引，即-1表示队列中最后一个元素。如：
```js
userAvatars.range(0, -1, function (err, avatars) {
	avatars.forEach(function (avatar) {
		console.log(avatar.url);
	});
});
```