
import Vue from "vue";

// const div = document.createElement("div");
// document.body.appendChild(div);

const app = new Vue({
    //el: "#root",
    template: "<div>{{text}}</div>",
    data: {
        text: 0
    }
}).$mount("#root");

setInterval(() => {
    app.text += 1;
},1000);

const oText = app.$watch("text",(newText,oldText) => {
    console.log(`${newText} : ${oldText}`);
});
setTimeout(() => {
    oText();
},2000);

app.$on("test",() => {
    console.log(`test emited${23}${34}`);
});

app.$emit("test",23,34);
