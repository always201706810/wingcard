const jsonServer = require('json-server')
const path = require('path')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

// ==========================================
// 1. 自定义中间件：解决 Update 接口问题
// ==========================================
// 前端发：PUT /api/businesscard/update (ID在body里)
// 我们改：PUT /businesscards/:id (让 json-server 能看懂)
server.put('/api/businesscard/update', (req, res, next) => {
  const item = req.body
  // 兼容查找 id 或 card_id
  const id = item.id || item.card_id
  
  if (id) {
    // 偷偷修改请求 URL，让 json-server 以为我们发的是标准 RESTful 请求
    req.url = `/businesscards/${id}`
    next() // 传递给后面的 router 处理
  } else {
    res.status(400).jsonp({
      code: 400,
      msg: '请求体中缺少 id 或 card_id'
    })
  }
})

// ==========================================
// 2. 模拟登录接口
// ==========================================
server.post('/api/login', (req, res) => {
  const { user_account, user_password } = req.body
  if (user_account === 'admin' && user_password === '123456') {
    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        token: 'mock-token-123456',
        user_info: {
          user_id: 1,
          user_account: 'admin',
          user_name: '超级管理员',
          organization: '系统支撑部'
        }
      }
    })
  } else {
    res.json({ code: 500, msg: '账号或密码错误 (试用 admin/123456)' })
  }
})

// ==========================================
// 3. 路由重写 (解决 Delete 和 List 路径问题)
// ==========================================
server.use(jsonServer.rewriter({
  // 列表
  '/api/businesscard/list*': '/businesscards$1',
  // 新增
  '/api/businesscard/add': '/businesscards',
  // 删除 (前端: /api/businesscard/1 -> Mock: /businesscards/1)
  '/api/businesscard/:id': '/businesscards/:id',
  
  // 其他模块
  '/api/company/info': '/company',
  '/api/company/save': '/company',
  '/api/department/tree': '/departments',
  '/api/department/add': '/departments',
  '/api/dashboard/stats': '/dashboardStats',
  '/api/dashboard/trend': '/dashboardTrend'
}))

// ==========================================
// 4. 响应拦截与数据包装 (解决 Delete 点击没反应问题)
// ==========================================
router.render = (req, res) => {
  // 如果出错或已经处理过(如login)，直接返回
  if (res.statusCode >= 400 || (res.locals.data && res.locals.data.token)) {
    res.jsonp(res.locals.data)
    return
  }

  let data = res.locals.data

  // 【核心修复】: 自动把 id 映射为 card_id
  // 这样前端 row.card_id 就有值了，Delete 按钮就能工作了
  const fixId = (item) => {
    if (item && typeof item === 'object') {
      if (item.id && !item.card_id) {
        item.card_id = item.id
      }
    }
    return item
  }

  if (Array.isArray(data)) {
    data = data.map(fixId)
  } else {
    data = fixId(data)
  }

  // 针对列表接口，包装成 { list, total }
  if (req.originalUrl.includes('/list') && Array.isArray(data)) {
     res.jsonp({
      code: 200,
      msg: 'success',
      data: {
        list: data,
        total: data.length
      }
    })
  } else {
    // 其他接口 (新增、修改、删除成功)
    res.jsonp({
      code: 200,
      msg: 'success',
      data: data || {} // 删除成功时 data 可能是 undefined，给个空对象
    })
  }
}

server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running at http://localhost:3000')
})