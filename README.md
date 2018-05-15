## demo-Jsut todo
### render方法
一个组件中的数据发生变化都会重新渲染数据，更新HTML内容。
### 升级一个正式的项目结构
分离webpack.config.js文件：
新建一个webpack.config.base.js任何环境依赖的wbpack
```javascript
//public webpack 
const path = require('path');

const config = {
  target: 'web',
  entry: path.join(__dirname, '../src/index.js'),
  output: {
    filename: 'bundle.[hash:8].js',
    path: path.join(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader'
      },
        {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/ //node_modules忽略掉
        },
        {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              name: '/resource/[path][name].[hash:8].[ext]'//静态文件打包在资源文件下
            }
          }
        ]
      }
    ]
  }
}

module.exports = config

```
新建webpack.config.client.js他是依赖于webpack.config.base.js,利用webpack-merge工具扩展配置文件。合并各种webpack配置文件。根据webpack里面的各个项合理的合并webpack.config文件。
安装：npm install webpack-merge -D
.json:文件中的dependencies中只放vue的版本，其余版本放在devDependencies
```javascript
const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ExtractPlugin = require('extract-text-webpack-plugin');//单独打包css文件的插件
const merge = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
const isDev = process.env.NODE_ENV === 'development';

let config;
const defaultPlugins = [
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: isDev ? '"development"' : '"production"'
        }
    }),
    new HTMLPlugin()
];
const devServer = {
    port: 8099,
    host: '0.0.0.0',
    overlay: {
        errors: true,
    },
    hot: true
};

if (isDev) {
    config = merge(baseConfig,{//合并到baseConfig文件中
        devtool: '#cheap-module-eval-source-map',
        module: {
            rules: [
                {
                    test: /\.styl/,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                            }
                        },
                        'stylus-loader'
                    ]
                }
            ]
        },
        devServer,
        plugins: defaultPlugins.concat([
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        ])
    });
} else {
    config = merge(baseConfig,{
        entry: {
            app: path.join(__dirname, '../src/index.js'),
            vendor: ['vue']
        },
        output:{
            filename: '[name].[chunkhash:8].js'
        },
        module: {
            rules: [
                {
                    test: /\.styl/,
                    use: ExtractPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap: true,
                                }
                            },
                            'stylus-loader'
                        ]
                    })
                }        
            ]
        },
        plugins: defaultPlugins.concat([
            new ExtractPlugin('styles.[contentHash:8].css'),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor'
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'runtime'
            })
        ])
    });
}

module.exports = config

```
修改json文件： 
```
"build": "cross-env NODE_ENV=production webpack --config build/webpack.config.client.js",
"dev": "cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.client.js"
```
### vue-loader的配置
在build文件下新建vue-loader.config.js
传入环境的判断，暴露出去一个对象，vue-loader相关的配置
```javscript
preserveWhitepace: true,消除文本中的空格
extractCSS: true,//vue组件中的css打包到单独的文件中
cssModules: {},
hotReload: false,//默认情况下是在production的情况下关闭热重载，不必设置

//以下不怎常用：
定义全局的的loader
const docLoader = require.resolve("./doc-loader");
loaders: {
    "docs": docLoader,
    js: "coffe-loader"//指定了loader会根据相应的loader去解析它
},//自定义模块，
preLoader: {
    //...
},//先解析哪一种loader
psotLoader: {
    //...
}


//使用时添加在摸个组件中 
<docs>
    //...构建组件库的时候，给每一个组件写文档
</docs>
```

```javascript
module.exports = (isDev) => {
    return {
        preserveWhitepace: true,
        extractCSS: true
        //这个实在线上环境是使用的所以开发版本不适用
        extractCSS: isDev
    }
}
```
在base.js中引入使用,修改rules下.vue-loader
```javscript
const createVueLoaderOptions = require("./vue-loader.config");
const isDev = process.env.NODE_ENV === 'development';

     {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: createVueLoaderOptions(isDev)
      },
```


### css的热跟新
默认的css是没有热更新的，要安装vue-style-loader
```javascript
npm install vue-style-loader -D
```
安装了之后修改webpack.congif.js文件中的style-loader

### 打包之前删除上一次打包的文件
安装rimraf每次打包之前删除打包的上一个版本
```javascript
npm install rimraf -D
```
在json文件中添加clear
```javascript
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build:client": "cross-env NODE_ENV=production webpack --config build/webpack.config.client.js",
    "build": "npm run clean && npm run build:client",
    "clean": "rimraf dist",//删除文件
    "dev": "cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.client.js"
  }
```
### cssModule的配置：
```javscript
cssModules: {
    localIdentName: "[path]-[name]-[hash:base64:5]"
    //线上的可以省略路径，name
    localIdentName: "[hash:base64:5]"
    localIdentName: isDev ? "[path]-[name]-[hash:base64:5]" : "[hash:base64:5]"
    //把css对应的类名，根据路径，文件名，文件内容的hsah生成一个独一无二的类名，调用是别的文件无法使用。
    camelCase: teue//js命名方式，把css中带中划线的转换成驼峰命名。给使用的style标签添加module属性,原有css类修改:class="$style.mainHeader"

    //外部css的使用：
    在css-loader中配置，把css-loader变成一个对象
    {
        loader: "css-loader",
        options: {
            module: true,
            localIdentName: isDev ? "[path]-[name]-[hash:base64:5]" : "[hash:base64:5]"
        }
    }

    import className from "../../xx.styl";

    <div id="className.xxx"></div>
}
```

### selint
防止代码低级出错，团队协作统一性。使用eslint-config-standard的规范，它有依赖了很多的包
安装：
```javascript
npm install eslint eslint-config-standard eslint-plugin-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node -D
```
在项目文件下创建.eslintrc文件：
```javascript
{
    "extends": "standard",//使用标准规则
    //使用之后用eslint校验代码，但没有办法识html中js的代码，安装eslint-plugin-html -D识别html中的js代码
    "plugins": [
        "html"
    ],
    //在json中配置script
    "parser": "babel-eslint"//babel处理
}

"script": {
    "lint": "eslint --ext .js .jsx .vue client/",
    "lint-fix": "eslint --fix --ext .js .jsx .vue client/",
    //fix自动修复
    //每次修改代码会自动检查。安装eslint-loader babel-eslint -D添加parser属性在base.js中配置loader在rules中添加对象：
    {
        test: /\.(vue|js|jsx)$/,
        loader: "eslint-loader",
        esclude: /node_modules/,
        enforce: "pre"//预处理，以上文件在使用vue-loader加载之前都会通过eslint-loader检测，post之后预处理。
    }
}
```
### editorConfig规范编辑器的配置
编译器插件，在编译器插件中自行安装
新建editorConfig,在不同的编辑器安装此插件，让不同的编辑器在使用这个项目编辑的时候使用相同的配置。
```javascript
root = true//都当这个文件就行，不用往上层读
[*]//所有的文件规定规范
charset = utf-8
end_of_line = lf
indent_size = 2
index_style = space
insert_final_newline = true//保存文件末尾自动添加空行，eslint规范每个页面最后一行为空行 
trim_trailing_whitespace = true//去掉多余的空格

```
### precommit检测代码
git提交时，使用precommit插件，如果代码检查不符合eslint不能提交。git commit时自动调用precommit,检测代码。不通过，无法提交。
安装：husky包
```
npm install husky -D
```
会自动在项目文件下生成.githock文件，读取config文件中的内容，在srcipt添加脚本。
```
"precommit": "npm run lint-fix"
```
### webpack的升级
卸载所有相关webpack及插件。
```
npm uninstall webpack webpack-dev-server webpack-merge -D
```
安装即可：
```
npm install webpack webpack-dev-server webpack-merge webpack-cli
```
webpack-cli 4以上在命令行启动的部分脚本在webpack-cli上。
其他的包也是卸载安装升级
@next没有发布的下一个包
修改配置：在base中添加mode
```javascript
const config = {
    mode: process.env.NODE_ENV || "production ",//development || "production",
    
}
```
client.js中修改，删掉CommonChunkPlugin
```javascript
optimization: {
    splitChunks: {
        chunks: "all"//删除vender
    },
    runtimeChunk: true
}
//开发时的配置：
devtool
new webpack.NoEmitOnErrorsPlugin()
删除 
```
### Vue实例
```javascript
new Vue({
    el: "#root",
    template: "<div>{{text}}</div>",
    data: {
        text: "seafwg"
    }
})
<=>
const app = new Vue({
    template: "<div>{{text}}</div>",
    data: {
        text: "seafwg"
    }
}).$mount("#root"); 
console.log(app.$data);//$data数据中的text
console.log(app.$props);//父元素传递的参数
console.log(app.$options);//$options整个参数对象
app.$options.render = (h) => {//重新修改render方法：
    return h('div',{},"new render function");
}
console.log(app.$root === app);//vue实例的根节点
console.log(app.$children);//子组件
console.log(app.$slots);//插槽
console.log(app.$scopedSlots);

console.log(app.$refs);//模板里的引用,在标签中定义属性ref,能够快速的找到对应的节点。 
console.log(app.$isServer);//判断服务端渲染
//方法：
app.$watch("text",(newText,oldText) => {
    console.log(`${newTest}:${oldText}`);
});//监听一些事情的变化，这种写法要自己销毁，在vue对象中设置会自动销毁。
app.$on('test',() => {
    console.log(`test emited${1}${2}`);
});//事件监听
app.$emit("test",1,2);//事件触发,前提是同一个vue的实力对象，没有时间冒泡等，可以传数据
app.$once();//只监听一次。

app.$forceUpdate();//强制组件渲染一次
app.$set(app.obj,"a","xxx");//修改app.obj下a的值。

app.$nextTick();//vue渲染的过程是异步的，每次修改元素的值，没有同步的刷新，会有一个一步的队列，而是一次渲染出来。

```

### Vue的生命周期
```javascript

import Vue from "vue";

// const div = document.createElement("div");
// document.body.appendChild(div);

const app = new Vue({
    //el: "#root",
    template: "<div>{{text}}</div>",
    data: {
        text: 0
    },
    beforeCreate() {
        console.log(this,"beforeCrate!");
    },
    created() {
        //ajax
        console.log(this,"created!");
    },//new实例化之后执行,无法做一些DOM操作是无法拿到的。
    beforeMount() {
        console.log(this,"beforeMount!");
    },
    mounted() {
        console.log(this,"mounted!");
    },//挂在之后实行,DOM有关的操作,服务端渲染不会调用,只有created两个 
    //数据有关的操作,create,mounted都行

     
    beforeUpdate() {
        console.log(this, "beforeUpdate!");    
    },
    updated() {
        console.log(this, "update!");        
    },//组件的数据变化之后实行
    activated() {
        console.log(this, "activated!");       
    },
    deactivated() {
        console.log(this, "deactivated!");   
    },//组件
    beforeDestroy() {
        console.log(this, "beforeDestroy!");  
    },//调用$destroy()销毁方法执行。
    destroyed() {
        console.log(this, "destoryed!");      
    }
}).$mount("#root");

setInterval(() => {
    app.text += 1;
},1000);
```
### Vue的数据绑定
```javascript
new Vue({
    el: "#root",
    template: `
        <div>{{isActive ? "active" : "not active"}}</div>
        <div v-html="html"></div>
        //自动过滤掉标签，会嵌套在里面
    `,//有作用于的限制，只属于app实例中的。 
    data: {
        isActive: false,
        html: "<p>html</p>"
    }
});
```
动态绑定class
```javascript
//object:
template: `<div :class="{active: isActive}"></div>`
//Array:
template: `<div :class="[isActive ? 'active' : '']"></div>`
//object Array
template: `<div :class="[{active: isActive}]"></div>`
```
style的绑定：
```javascript
<div :style="[style1,style2]"></div>
//自动合并 
data: {
    style1: {
        //...
    },
    style2: {
        //...
    }
}
```
### computed和watch
```javascript
new Vue({
    el: "#root",
    template: `<div>{{name}}</div>`,
    data: {
        firstname: "intelwisd",
        lastname: "seafwg"
    },
    computed: {//性能开销比较小，依赖发生变化时，才发生变化。拿到的数据经过计算之后的操作。
        name() {
            return `${this.firstname}-${this.lastname}`
        }
    },
    methods: {
        //... 不依赖缓存
    },
    watch: {
        //...监听一个值或者对象变化，之后做的操作或者向后台发送请求。
        odj: {
            handler() {
                //..
            },
            deep: true//深入观察，把obj的属性遍历一边，开销比较大。直接监听某一个具体的属性时开销较小。
        }
    }
});
//computed定义方法的时候，通过defineOroperty,设置set,get的方法。基于缓存的。
//computed,watch中不能修改一些属性。监听处理的一种逻辑。
```
### Vue的原生指令
```javascript
v-text="text"标签内绑定的内容，只能绑定值。非常多的数据使用数据绑定。
v-html="template";//显示标签及内容
v-show="active"//根据布尔值判断显示隐藏
v-if="active"//false时不存在于文档中。建议使用v-show，这只是改变样式，v-if会引起DOM的重绘预渲染，非常耗时。
v-else=""//...
v-for="item in arr"//遍历数组
v-for="(item,index) in arr"//index索引
v-for="(val,key,index) in obj"//遍历对象val:值，key:键值，index:索引,
//注意要添加:key="item",每次都会变化，开销大，如果有重复的直接从缓存中读取。不能设置index
v-on:click=""//
v-bind=""//
v-model="text"//与data中的数据绑定，默认的实在input标签上使用
v-pre//修后不会渲染表达式，写什么渲染什么
v-cloak://在vue代码没有加载之前添加样式
v-once://数据绑定的内容只绑定一次，第二次不会渲染。

```
### 组件
props单向的数据流，props中定义的函数，子组件中触发，methods中调用$emit("父元素绑定的变量"),也就是@绑定的变量，在父组件中methods中触发@绑定的函数。
```javascript
const compoent = {
    props: {//配置组件的行为
        active: Boolean//传值参数的类型
        propOne: String，
        handleChange: Function//传进来的函数，绑定到组件触发
    },//props的传值是不能被修改的
    template: "<div @click="handleChange"></div>",
    mothods: {
        handleChange() {
            this.onChange();
        }
    }
}

//全局注册组件
Vue.compoent("CompOne",compoent);//把compoent组件注册到全局,推荐命名规则，注册时使用驼峰命名，使用时使用中划线链接。
new Vue({
    components: {//局部定义组件
        CompOne: component
    }
    el: "#root",
    template: "<comp-one :on-chage="handleChange"></comp-one>",
    methods: {
        handleChange() {
            //...父级触发的函数
        }
    }
})
```
props的数据验证
```javascript
props: ["",""]//直接传值，但是不严谨

props: {
    active: {
        type: Boolean,
        required: true,//此属性一定要传
        //default: true
        validator(value) {
            return type value === "Booleam"//自定义严格的验证
        }
    }
}
```
### Vue组件的继承
```javascript
const compoent = {
    props: {//配置组件的行为
        active: Boolean//传值参数的类型
        propOne: String,
    },//props的传值是不能被修改的
    template: "<div @click="handleChange"></div>",
    mothods: {
        handleChange() {
            this.onChange();
        }
    }
}

//继承方式一：
const CompVue = Vue.extend(compoent);
//Vue类的子类，上述属性已设置好
new CompVue({//继承了CompVue
    el: "#root",
    propsData: {//用propsData修改props的值
        propOne: "xxx"
    },
    data: {
        text: 123//会覆盖父组件的值
    }
});

//继承方式二：
const component2 = {
    extends: compoent,
    data() {//覆盖一些父元素的数据
        return {
            text: 1
        }
    },
    mounted() {
        console.log(this.$parent.$options.name);//root
        this.$parent.text = 456;//不建议子组件中用$parent修改父组件的数据
    }
}

new Vue({
    name: "root",
    el: "#root",
    components: {
        Comp: compoent2
    },
    data: {
        text: 123
    }
    template: `
        <div>
            <span>{{text}}</span>
            <comp></comp>
        </div>
    `
})
```
### Vue组件之间的自定义双向绑定
```javascript
const component = {
    model: {//防止与props中数据双向绑定冲突
        prop: "value",
        event: "change"
    },
    props: ["value"]
    template: `
        <div>
            <input type="text" @input="handleInput" :value="value">
        </div>
    `,
    methods: {
        handleInput(e) {
            this.$emit("input",e.target.value);
        }
    }
}

new Vue({
    components: {
        CompOne: component
    },
    el: "#root",
    data() {
        return {
            value: "123"
        }
    },
    template: `
        <div>
            <comp-one :value @input="value = arguments[0]"></comp-one>
            <comp-one v-model:value></comp-one>
        </div>
    `
})
```
### 组件高级属性
#### 插槽
```javascript
const component = {
    template: `
        <div :style="style">
            <slot></slot>
            //插槽定义
            <slot name="header"><slot>
            //具名插槽
        </div>
    `,
    data() {
        return {
            style: {
                width: "200",
                height: "200",
                border: "1px solid #aaa"
            }
        }
    }
}

new Vue({
    components: {
        CompOne: component
    },
    el: "#root",
    data() {
        return {
            value: "123"
        }
    },
    template: `
        <div>
            <comp-one>
                <span>this is content</span>
                //除了使用插槽无法显示内容
                <span slot="header"></span>
                //具名插槽的使用
            </comp-one>
        </div>
    `
})
```
#### 作用域插槽
```javascript
const component = {
    template: `
        <div :style="style">
            <slot value="456"></slot>
        </div>
    `,
    data() {
        return {
            style: {
                width: "200",
                height: "200",
                border: "1px solid #aaa"
            }
        }
    }
}

new Vue({
    components: {
        CompOne: component
    },
    el: "#root",
    data() {
        return {
            value: "123"
        }
    },
    template: `
        <div>
            <comp-one>
                <span slot-scope="props">{{props.value}}</span>
                //value，等绑定的值以对象的形式传递到props对象中
            </comp-one>
        </div>
    `
})
```
#### ref属性
```javascript
const component = {
    template: `
        <div :style="style">
            <slot value="456"></slot>
        </div>
    `,
    data() {
        return {
            style: {
                width: "200",
                height: "200",
                border: "1px solid #aaa"
            }
        }
    }
}

new Vue({
    components: {
        CompOne: component
    },
    el: "#root",
    data() {
        return {
            value: "123"
        }
    },
    template: `
        <div>
            <comp-one ref="com">
                <span ref="span" slot-scope="props">{{props.value}}</span>
                //value，等绑定的值以对象的形式传递到props对象中
            </comp-one>
        </div>
    `,
    mounted() {
        console.log(this.$refs.com+" "+this.$refs.span);
    }
})
//VueComponent
//<span>...</span>  
```
### 子孙之间的通信
```javascript
const ChildComponent = {
    template: "<div>Child component</div>",
    inject: ["yeye","value"],//接收yeye级的属性
    mounted() {
        console.log(this.yeye,this.value);
        //comp
    }
}
const component = {
    name: "comp"
    components: {
        ChildComponent
    }
}

new Vue({
    components: {
        CompOne: component
    },
    provide() {//爷爷级组件要通过方法执行才能传递
        return {
            yeye: this,//把自己整个对象提供给别人
            value: this.value
        }
    },
    el: "#root",
    data() {
        return {
            value: "123"
        }
    },
    mounted() {

    }
})

```
```javascript
const ChildComponent = {
    template: "<div>Child component</div>",
    inject: ["yeye","data"],//接收yeye级的属性
    mounted() {
        console.log(this.yeye,this.data.value);
        //comp
    }
}
const component = {
    name: "comp"
    components: {
        ChildComponent
    }
}

new Vue({
    components: {
        CompOne: component
    },
    provide() {//爷爷级组件要通过方法执行才能传递,孙子绑定的value并没有同步变化，要实现provide的话，提供一个get方法：
        const data: {},
        Object.defineProperty(data,"value",{
            get: () => this.value,//get的方法每次读到最新的value,
            enumerable: true
        })
        return {
            yeye: this,//把自己整个对象提供给别人
            data
        }
    },
    el: "#root",
    data() {
        return {
            value: "123"
        }
    },
    mounted() {

    },
    template: `
        <div>
            <comp-one></comp-one>
            <input type="text" v-model="value">
        </div>
    `
})

```
### Vue组件高级属性
#### 插槽slot内置属性
```javascript
const ChildComponent = {
template: `<div :style="style">
            <slot></slot>
            //通过插槽引用自建
            </div>`,
    data() {
        return {
            style: {
                width: "200px",
                height: "200px",
                border: "1px solid #ccc"
            }
        }
    }
}

new Vue({
    components: {
        CompOne: component
    },
    el: "#root",
    mounted() {

    },
    template: `
        <div>
            <comp-one>
                <span>seafwg</span>
            </comp-one>
        </div>
    `
})
```
#### 具名插槽
```javascript
const ChildComponent = {
template: `<div :style="style">
                <slot name="header"></slot>
                <slot name="footer"></slot> 
            </div>`,
    data() {
        return {
            style: {
                width: "200px",
                height: "200px",
                border: "1px solid #ccc"
            }
        }
    }
}

new Vue({
    components: {
        CompOne: component
    },
    el: "#root",
    mounted() {

    },
    template: `
        <div>
            <comp-one>
                <span slot="header">seafwg</span>
                <span slot="footer">seafwg</span>
            </comp-one>
        </div>
    `
})
```
之间的传值：
```javascript
const ChildComponent = {
    template: `<div :style="style">
                <slot value="seafwg"></slot>
            </div>`,
    data() {
        return {
            style: {
                width: "200px",
                height: "200px",
                border: "1px solid #ccc"
            }
        }
    }
}


template: `
    <div>
        <childen-compoent>
            <span slot-scope="props">{{props.value}}</span>
        </childen-compoent>
    </div>
`
```
#### $ref属性
通过$refs属性对组建下的属性访问，操作。
```javascript
new Vue({
    components: {
        CompOne: component
    },
    el: "#root",
    mounted() {
        console.log(this.$refs.comp.value, this.$refs.compHeader);
        //组件
        //span标签
    },
    template: `
        <div>
            <comp-one ref="comp">
                <span ref="compHeader" slot="header">seafwg</span>
            </comp-one>
        </div>
    `
})
```

#### $parent，provide方法及inject
```javascript
const ChildComponent = {
    template: `<div>Child component</div>`,
    inject: ["yeye","value"],
    mounted() {
        console.log(this.$parent.$options.name);
        console.log(this.yeye, this.value)
        //comp,只能访问到父组件，无法访问到爷爷级组件
    }
}

const component = {
    name: "comp",
    components: {
        ChildCompoent
    }
}

new Vue({
    components: {
        CompOne: component
    },
    provide() {
        return {
            yeye: this,//把自己的对象放出去    
            value: this.value
        }
    },
    el: "#root",
    mounted() {
    },
    template: `
        <div>
            <comp-one ref="comp">
            </comp-one>
        </div>
    `,
    data() {
        return {
            value: "123"
        }
    }
})

```
跨层级组件之间实现数据绑定
```javascript
const ChildComponent = {
    template: `<div>Child component</div>`,
    inject: ["yeye","value"],
    mounted() {
        console.log(this.$parent.$options.name);
        console.log(this.yeye, this.value)
        //comp,只能访问到父组件，无法访问到爷爷级组件
    }
}

const component = {
    name: "comp",
    components: {
        ChildCompoent
    }
}

new Vue({
    components: {
        CompOne: component
    },
    provide() {
        const data = {};

        Object.defineProperty(data, "value", {//重新定义defineProperty方法中的get方法和enumerable属性
            get: () => {
                this.value,
            },
            enumerable: true
        }),
        return {
            yeye: this,//把自己的对象放出去    
            value: this.value
        }
    },
    el: "#root",
    mounted() {
    },
    template: `
        <div>
            <comp-one ref="comp">
            </comp-one>
            <input type="text" v-model="value">
        </div>
    `,
    data() {
        return {
            value: "123"
        }
    }
})
```
#### render函数
```javascript
template: `
        <div>
            <comp-one ref="comp">
            </comp-one>
            <input type="text" v-model="value">
        </div>
    `
<=>

render(createElement) {//vue中用来生成节点元素
return createElement(
    "comp-one",//传入节点的名字
    {//节点上的属性
        ref: "comp",
        props: ["..."],//传参数
        on: {//绑定事件
            click: this.handleClick//在methods中声明执行，触发是使用$emit
        },
        nativeOn: {
            click: this.handleClick//自动的绑定到组建的根节点上，自动会触发，无需使用$emit
        }
    },
    [//子节点里面的内容
        createElement("span",{
            ref: "span"
        },this.value)
    ]
    )
}

```
### vue路由
建立路由对应的管理映射的js文件
routers.js：路由文件
```javascript
import component1 from './component1.vue'
import component2 from './component2.vue'

export default [
    {
        path: '/',
        redirect: '/component1'//默认路由
    },
    {
        path: '/component1',
        component: component1
    },
    {
        path: 'component2',
        component: component2
    }
]
```
router.js: 路由对应管理文件
```javascript
import VueRouter from 'vue-router'
import routers from './routers'

export default () => {
    return new Router({
        routes
    })
}
//利于服务器的渲染，减少内存溢出，export暴露出去的一个router,
//每次服务端渲染都会重新生成一个新app,
//router都有一个对象，就会每次缓存app,导致服务端结束后app对象没有释放掉，内存溢出
```
全文中的index.js
```javascript
import VueRouter from 'vue-router'
import createRouter from './router/router'

vue.use(VueRouter);
const router = createRouter()

new Vue({
    router,//注入路由
    render: (h) => h(app)
}).$mount("#root");

```
使用全文组件<router-view/>

### 路由的配置
自带的路由#不利于seo，需要再次的配置，在router的映射管理文件中配置mode属性，history,表示跟随浏览器的状态管理，默认是hash。
路由映射管理文件router.js
```javascript
import Router from 'vue-router'
import routers from './routers'

export default () => {
    return new Router({
        routers,
        mode: "history",//去掉#实现seo优化
        base: "/base/",//在所有路由配置下的默认路径下添加/base/,基路径，即使在URL中访问时去掉/base/也可以访问
        linkActiveClass: "active-link",
        linkExactActiveClass: "exact-active-link",
        /*
        app.vue中使用
        <router-link to="/comp.vue"></router-link>
        <router-link to="/comp1.vue"></router-link>
        类似与a链接的跳转，配置显示的样式
        */
        scrollBehavior (to, from, savedPosition) {
            /*
            to: 跳转过程中要去的路由
            from: 从哪一个路由跳转到下一个路由
            savePosition: 自动记录滚动条滚动位置
            */
            if(savePosition) {
                return savePosition;
            }else{
                return {x: 0, y: 0}
            }
        },
        parseQuery (query) {
            //页面进入时的参数，字符串转换成json
        },
        stringifyQuery (obj) {
            //obj转换成字符串
        },
        fallback: true//改变单页应用和多页应用
    })
}
```
前端做路由需要配置，historyApiFallback属性。
```javascript
historyApiFallback: {
    index: "/index.html"//基路径，与base.js中的output中publicPath中的路径对应，如果publicPath中的路径有，就必须添加到historyApiFallback中
}
```
### Vue-router路由参数传递
路由的命名：
```javascript
{
    path: '/app',
    component: index,
    name: "app",//路由命名
    meta: {//处理一些搜索引擎
        title: "XXXXX",
        description: "XXXX"
    },
    childen: [//子路由,嵌套路由
        {
            path: "test",
            component: Login
        }
    ]
    //index下添加<router-view/>
}

//使用：
<router-link :to="{name: 'app'}"></router-link>
```
路由的过渡动画：transition
```html
<transition name="fade">
    <router-view/>
<transition>
```
在全局的style中定义过渡的动画：
```css
.fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}
```
transition也可以使用到每个组件中去，包裹组建即可。
#### 路由的传参数
```javascript
{
    path: '/app/:id',
    props: true,//也可以props: (route) => ({id: route.query.b})
    //在在comp子组件中props: ["id"]接收
    //可以直接传参数以?xxx&xxx,$route对象中自动会保存query对象
    component: comp
    /*mounted () {
        console.log(this.id);
        //123
    }*/
}

<router-link to="/app/123"></router-link>
monuted() {
    console.log(this.$route.params);
    //对象
}
```

### Vue-router导航守卫
#### 多路由的命名
app.vue:
```html
<router-link to="/app"></router-link>
<router-link to="/login"></router-link>
<router-view/>
<router-view name="a"/>
```
routers.js: 路由配置文件
```javascript
{
    path: '/app',
    components: {
        default: Todo,//无名的默认路由跳转组件
        a: login//命名路由组件跳转
    }
},
{
    path: '/login',
    components: {
        default: login,
        a: Todo
    }
}
//同一个组件内有不同的路由组件。
```
#### 路由导航守卫
index.js守卫的注册,每次路由的跳转都会被触发，
```javascript
router.beforeEach((to, from, next) => {
    console.log("before each invoked");
    //数据的校验,一些页面判断用户是否登录
    if(to.fullPath === '/app') {
        next('/login');
        //next({path: '/login'})//传值与路由定义的props的内容是对应的
    }else{
        next();//路由的跳转
    }
});

router.beforeResolve((to, from, next) => {
    console.log("before resolve invoked");
    next();
});

router.afterEach((to, from) => {
    console.log("after each");
});

```
#### 路由配置的生命钩子函数
```javascript
{
    path: '/app',
    component: Todo
}
beforeEnter (to, from, next) {//进入路由之前被调用
    console.log("app before enter");//位置是在beforeEach和beforeResolve的中间
    next();
}
```
#### 组件内部增加钩子函数
Todo.vue
```javascript
export default {
    beforeRouteEnter (to, from, next) {
        console.log("todo before enter");
        next();
        //路由进入之前页面使用的数据，没有this，这个上下文。
        next((vm) => {
            console.log('after enter vm.id', vm.id);
        })//数据的获取，扔到对象当中
    },
    beforeRouteUpdate (to, from, next) {
        console.log("todo before update");
        next();//同一个组件在不同的路由下面都是有这个组件显示时候才会触发，典型的传参数的组件，数据根据参数获取对应的数据的时候利用此函数，可减少路由每次跟新是的处理。如果数据获取出错，可以提示等操作
    },
    beforeRouteLeave (to, from, next) {
        console.log("todo before leave");
        next();//组件离开时触发
        //离开时提醒
    }
}
要跳转就必须执行next()方法
一般使用mounted的获取数据初始化，相同的路径下显示同一个组建的情况下，第二次的mounted路由第二次不会触发，则里面的数据你不会跟新，使用beforeRouteUpdate钩子函数，或者使用watch监听(但开销很大，并且不控制路由跳转的行为) 
```
#### 异步路由组件
路由很多的情况下，如果使用webpack所有的代码打包会导致代码量很大。初次加载很慢，如果实现对应的路由加载对应的代码与核心的代码。
在路由的配置中不全局的导入组件，在component声明的时候利用component函数加载对应的组件,要使用babel-plugin-syntax-dynamic-import -D,之后在。babelrc的plugins配置syntax-dynamic-import,在核心代码中去掉组件的导入(app.vue中去掉对应Todo组件)
```javascript
//import Todo from '../views/todo/tofo.vue'

{
    path: '/app',
    component: () => {import("./..")}
}
```
### Vuex集成
安装：npm install vuex -S
全文新建store文件，下新建store.js,引入vue,vuex，使用vuex,创建store,暴露出去store

```javascript
import Vue form 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        updateCount (state, num) {//state：主要做的就是修改state, num:调用时传递的参数
            state.count = num;
        }
    }
})

export default store;
```
创建好之后在入口index.js中配置。
```javascript
import store from './store/store.js'

new Vue({
    router,
    store,//注入
    render: (h) => h(app)
}).$mount("#root");
```
使用store: app.vue中
```javascript
mounted () {
    console.log(this.$store);
    let i = 1;
    setInterval(() => {//修改：
        this.$store.commit("updateCount", i++)//commit调用一个mutations的方法，updateCount就是传入的mutations里的方法。
    }, 1000);
},
computed: {
    count() {//调用store中的count的方法,可以在文中使用count变量，代替store中的count
        return this.$store.state.count
    }
}

//在此组件中就可以使用count这个值
```
改进，利于服务器的渲染，类似与路由的方法：
```javascript
import Vuex from 'vuex'

export default () => {//用方法每次新成，利于服务器的渲染
    return new Vuex.Store({//返回新创建的对象
        state: {
            count: 0
        },
        mutations: {
            updateCount (state, num) {
                state.count = num;
            }
        }
    });
}
```
index.js文件中
```javascript
import Vuex from 'vuex'
import createStore from './store.store'

Vue.use(Vuex); 

const store = createStore();//更好地维护代码，和 router用法相同

```
#### vuex中的state和getters
分模块的组建store:
在store文件下新建对应的模块文件，state,mutations分别暴露出去即可，getters.js(类似与computers计算state中的属性)在一处写之后每处都可以使用。
专门新建state.js用来维护state的存储。
```javascript
export default {
    count: 0
    //...
}
```
在store.js中导入使用
```javascript
import Vuex from 'vuex'
import defaultState from './state'
export default () => {
    return new Vuex.Store({
        state: defaultState,
        mutations: {
            //...
        }
    });
}
```
同样的muations对象也可以这样分模块...

####getters:
同样的新建getter.js
```javascript
export default {
    fullName (state) {//接受state参数，return state中的数据
        return `${state.firstName},${state.lastName}`;
        
    }
}
```
在app.vue的computed方法中：定义fullName,可用于数据的渲染。
```javascript
computed: {
    count() {
        return this.$store.state.count;
    },
    fullName () {//同样调用fullName,
        return this.$store.getters.fullName
    }
}
```
使用简单的方法：
```javascript
import {
    mapState,
    mapGetters
} from 'vuex'

computed: {
    ...mapState(['count']);//stste的名字
    <=>
    count() {
        return this.$store.state.count;
    }
}

...mapState({//传递对象
    counter: 'count'
})

...mapState({//传递方法
    counter: (state) => {
        state.count;//可以实现计算
    }
})
//getters使用方法相同
...mapGetters(["fullName"]);
```
在env的环境下是无法识别这种语法，需要安装babel-preset-stage-1 -D,在bablerc中配置presets数组，"stage-1"

#### mutations同步操作
在mutations中只能传递两个参数，第二个参数可以传递对象
```javascript
this.$store.commit('updateCount', {//传递两个数据组成的对象
    num1: i++,
    num2: 3
});
```
mutations.js中：
```javascript
export default {
    updateCount(state, {num1, num2});//解构
    //所有修改state的方法
}
```

有一个问题是在全局下会修改store中的属性。当然最好实在mutations中修改最好，这样代码很规范，可以在store.js中配置strict: true配置此属性，但是不能在正式环境中使用。

vue不建议这么修改，则在store中配置strict，只是在开发中使用这个属性规范，生产环境不能这样。
```javascript
const isDev = process.env.NODE_ENV === 'development'

export default () => {
    return new Vuex.Store({
        strict: isDev,//虽然会修改成功，但是有警告提示，
        state: defaultState,
        mutations,
        getters
    })
}
```
要规范的使用store,在mutations中修改数据，如果在外面任意的修改则使用vuex的意义不是很好。

#### actions异步操作
```javascript
export default {
    updateCountAsync (store, data) {//data触发传入的参数
        setTimeout(() => {
            store.commit("updateCount", data.num);
        }, data.time);
    }
}
```
store.js中导入注册使用
在app.vue中使用：
```javascript
import {
  mapState,
  mapGetters,
  mapMutations,
  mapActions
} from "vuex"
import Header from './layout/header.vue';
import Footer from './layout/footer.jsx';
//import Todo from './views/todo/todo.vue';

export default {
  components: {
    Header,
    Footer
//    Todo
  },
  mounted() {
    console.log(this.$store);
    //store对象
    let i = 1;
    setInterval(() => {
       this.updateCount({i++});
    }, 1000);
    this.$store.dispatch('updateCountAsync', {//专门触发actions
      num: 5,
      time: 3000
    })
    <=>
    this.updateCountAsync({
        num: 5,
        time: 2000
    });
  },
  methods: {//mapAction,mapMutations两个在methods
    ...mapActions(["updateCountAsync"]),
    ...mapMutations(["updateCount"])
    //传入之后在mounted中
    //this.updateCountAsync代替this.store.dispatch
  },
  computed: {
    ...mapState(['count']),
    // count() {
    //   return this.$store.state.count;
    // },
    ...mapGetters(['fullName'])
    // fullName () {
    //   return this.$store.getters.fullName
    // }
  }
}
```
### Vuex模块功能
在store.js中新增modules对象，进行配置模块
```javascript
const isDev = process.env.NODE_ENV === 'development'

export default () => {
    return new Vuex.Store({
        strict: isDev,//虽然会修改成功，但是有警告提示，
        state: defaultState,
        mutations,
        getters,
        actions,
        modules: {
            namespace: true,
            a: {
                state: {
                    text: 1
                },
                mutations: {
                    updateText(state, text) {
                        state.text = text;
                    }
                },
                getters: {
                    textPlus(state) {
                        return state.text + 1;
                    }
                }
            },
            b: {
                state: {
                    text: 2
                }
            }
        }
    })
}
```
使用在app.vue中：
```javascript
computed: {
    textA () {//通过模块的命名空间
        return this.$store.state.a.text
    }
    <=>
    ...mapState({
        textA: state => state.a.text
        //...
    })
    //模块mutations的使用  
    ...mapMutations(['updateText','...']);
    //接着在mounted中调用

    
}
mounted() {
    this.updateText("xxx");//注意没有命名空间的引用，vue默认把所有的mutations放到全局的mutations中，声明namespace: true，可防止命名冲突，这样在每个模块中可以写相同的方法.这样写要添加命名空间，
    ...mapMutations(['a/updateText','...']);
    //mounted 中的使用
    this['a/updateText']('xxx');

    ...mapGetters(['a/textPlus'])
    this['a/textPlus']

    //可以用对象的形式进行简写
    ...mapGetters({
        'fullNem': 'fullName',
        'textPlus': 'a/textPlus'
    })
}
```
如果模块中的getters或者其他方法依赖上一层的state
```javascript
a: {
    ...
    getters: {
        textPlus(state, getters, rootState) {
        //state:模块中的state,getters: 所有的getters方法，rootState全局的state
            return state.text + rootState.coount;
            //当然也可以拿到其他模块的state
            rootState.b.text;
        }
    },
    actions: {//4-8: 10:00
        add(ctx,) {}
    }
}
```





