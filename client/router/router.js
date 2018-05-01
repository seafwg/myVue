import Router from 'vue-router'

import routes from './routes'

export default () => {
    return new Router({
        routes,
        mode: "history"
        //利于服务器的渲染，减少内存溢出，export暴露出去的一个router,
        //每次服务端渲染都会重新生成一个新app,
        //router都有一个对象，就会每次缓存app,导致服务端结束后app对象没有释放掉，内存溢出
    })
} 