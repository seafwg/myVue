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
        console.log(this,"created!");
    },
    beforeMount() {
        console.log(this,"beforeMount!");
    },
    mounted() {
        console.log(this,"mounted!");
    },
    beforeUpdate() {
        console.log(this, "beforeUpdate!");        
    },
    updated() {
        console.log(this, "update!");        
    },
    activated() {
        console.log(this, "activated!");        
    },
    deactivated() {
        console.log(this, "deactivated!");        
    },
    beforeDestroy() {
        console.log(this, "beforeDestroy!");        
    },
    destroyed() {
        console.log(this, "destoryed!");        
    }
}).$mount("#root");

setInterval(() => {
    app.text += 1;
},1000);