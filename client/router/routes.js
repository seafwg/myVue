//import Todo from '../views/todo/todo.vue'
//import Login from '../views/login/login.vue'

export default [
    {
        path: '/',
        redirect: '/app'
    },
    {
        path: '/app',
        component: () => import('../views/todo/todo.vue')
    },
    {
        path: '/login',
        component: () => import("../views/login/login.vue")
    }
]
