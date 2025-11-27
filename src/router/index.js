import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/index.vue"),
    meta: { layout: "default" },
  },
  {
    path: "/productdetail/:id",
    name: "ProductDetail",
    component: () => import("../pages/productdetail.vue"),
    meta: { layout: "default" },
  },
  {
    path: "/addproduct",
    name: "Addproduct",
    component: () => import("../pages/addproduct.vue"),
    meta: { layout: "default" },
  }
    // {
  //   path: "/editproduct/:id",
  //   name: "editproduct",
  //   component: () => import("../pages/editproduct.vue"),
  //   meta: { layout: "default" },
  // }
  // {
  //   path : "/deleteproduct/:id",
  //   name : "Deleteproduct",
  //   component : () => import("../pages/deleteproduct.vue"),
  //   meta: { layout: "default" },
  // }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
