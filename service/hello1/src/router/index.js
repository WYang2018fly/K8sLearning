const Router = require("koa-router");
const { Test } = require("../model");
const router = new Router({
  prefix: "/api",
});
const axios = require("axios");
const config = require("config");
const os = require("os");

router.get("/", async (ctx) => {
  ctx.body = "get request";
  ctx.status = 200;
});

router.get("/hello1", async (ctx) => {
  function getIPAdress() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
      var iface = interfaces[devName];
      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (
          alias.family === "IPv4" &&
          alias.address !== "127.0.0.1" &&
          !alias.internal
        ) {
          return alias.address;
        }
      }
    }
  }
  const myHost = getIPAdress();

  console.log(
    `[${process.env.NODE_ENV}] request => ${
      process.env.NODE_ENV === "production"
        ? config.hello2ServiceName
        : config.hello2Url
    }${config.hello2Uri.hello2}?host=${myHost}`
  );

  let result = await axios({
    method: "get",
    url: `${
      process.env.NODE_ENV === "production"
        ? config.hello2ServiceName
        : config.hello2Url
    }${config.hello2Uri.hello2}?host=${myHost}`,
    headers: {},
  });
  ctx.body = { data: result.data, environment: process.env.NODE_ENV };
  ctx.status = 200;
});

router.post("/", async (ctx) => {
  console.log(ctx.request.body);
  ctx.body = "post request";
  ctx.status = 200;
});

router.post("/test", async (ctx) => {
  let { key, value } = ctx.request.body;
  let result = await Test.create({ key, value });
  ctx.body = result;
  ctx.status = 201;
});

router.delete("/test/:id", async (ctx) => {
  await Test.deleteOne({ _id: ctx.params.id });
  ctx.body = "delete success";
  ctx.status = 200;
});

router.patch("/test/:id", async (ctx) => {
  let newData = ctx.request.body;
  let result = await Test.findByIdAndUpdate(ctx.params.id, newData, {
    new: true,
  });
  ctx.body = result;
  ctx.status = 201;
});

router.get("/test", async (ctx) => {
  let page = parseInt(ctx.query.page);
  let size = parseInt(ctx.query.size);
  let key = ctx.query.q;

  let condition = {};
  if (key) {
    const reg = new RegExp(key, "i");
    condition.key = { $regex: reg };
  }

  let result = await Test.find(condition)
    .sort({ value: 1 })
    .skip((page - 1) * size)
    .limit(size);
  ctx.body = result;
  ctx.status = 200;
});

router.get("/test/:id", async (ctx) => {
  let result = await Test.findById(ctx.params.id);
  ctx.body = result;
  ctx.status = 200;
});

module.exports = router;
