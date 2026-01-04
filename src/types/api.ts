import request from '../utils/request'
// --- 0. 认证模块 (Auth) ---

// 登录参数结构 (根据 Go-Zero 的 LoginRequest 通常定义)
export interface LoginParams {
  user_account: string   // 账号
  user_password: string  // 密码
  captcha_id?: string    // 验证码ID (后端生成)
  captcha_code?: string   // 用户输入的验证码
  remember_me?: boolean
}

// 通用响应结构 (对应 CommonResponse)
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

// 登录响应数据
export interface LoginData {
  jwt_token: string
  user_info: {
    user_id: number
    user_account: string
    user_name: string
    organization: string
  }
}

// 验证码响应数据
export interface CaptchaData {
  captcha_id: string  // 验证码ID
  captcha_image: string    // 验证码图片(通常是Base64)
}

// 1. 获取验证码
export const getCaptcha = () => 
  request.get<any, ApiResponse<CaptchaData>>('/authority/generate')

// 2. 登录接口
export const login = (data: LoginParams) => 
  request.post<any, ApiResponse<LoginData>>('/authority/login', data)

// 3. 退出登录
export const logout = () => request.post('/authority/logout')
// --- 1. 名片管理 (BusinessCard) ---

export interface OrganizationRelation {
  department_id: string | number
  department_name: string
  position: string
}

export interface BusinessCard {
  card_id?: number | string
  card_name: string
  card_wechat: string       // 对应前端显示的“微信手机号”
  card_phone: string        // 对应前端显示的“名片显示号码”
  card_email: string
  card_postcode?: string
// 原有的单字段可以保留作为“主部门”显示，或者直接用 organizations 替代
  // 这里为了兼容列表显示，我们保留它们，但在保存时由前端逻辑计算得出
  department_id?: number | string
  department_name?: string  // 后端返回的部门名称
  card_position?: string
  card_address?: string
  organizations?: OrganizationRelation[]
}

export interface CardQueryParams {
  page: number
  size: number
  name?: string
  phone?: string
  email?: string
}

export const getCardList = (params: CardQueryParams) => 
  request.get('/businesscard/list', { params })

export const addCard = (data: BusinessCard) => 
  request.post('/businesscard/add', data)

export const updateCard = (data: BusinessCard) => 
  request.put('/businesscard/update', data)

export const deleteCard = (id: number | string) => 
  request.delete(`/businesscard/${id}`)


// --- 2. 公司简介 (CompanyInfo) ---
// 【本次重点修改】严格对应数据库 CompanyInFormation 表
// --- 8. 公司信息模块 (适配同事的 Form 接口) ---

// 基础信息结构 (对应后端 CompanyInformation)
export interface CompanyInfoBase {
  company_id?: number
  // company_name: string
  company_slogan: string
  company_background: string
  company_business: string // 后端拼写修正为 business? 看api是 business
  company_market: string
  company_advantage: string
  company_culture: string
  company_future: string
  company_phone: string
  company_email: string
  company_url: string
  company_address: string
  company_latitude: string // 后端改为 string 类型
  company_longtitude: string // 后端拼写 longtitude
  company_qr_code_intro: string
}

// 荣誉结构
export interface HonorItem {
  honor_id: number
  company_id?: number
  honor_name: string
}

// 资质结构
export interface QualificationItem {
  qualification_id: number
  company_id?: number
  qualification_name: string
}

// 图片结构 (对应后端 Image)
export interface ImageItem {
  img_id: number
  company_id?: number
  img_url: string
  img_type: string
  img_purpose: number // 1: image, 2: logo
}

// 完整的表单数据模型 (前端用)
export interface CompanyForm extends CompanyInfoBase {
  honors: HonorItem[]
  qualifications: QualificationItem[]
  images: ImageItem[]
}

// 后端返回的大对象结构
export interface CompanyResponse {
  company_information: CompanyInfoBase
  company_honor: HonorItem[]
  company_qualification: QualificationItem[]
  company_image: ImageItem[]
}

// 1. 获取详情
export const getCompanyInformation = (params: { company_id: number }) => 
  request.get('/companyinformation/getcompanyinformation', { params })

// 2. 编辑 (Form Data 提交)
// 注意：这里不需要定义 request 接口类型，因为我们会手动构造 FormData
export const editCompanyInformation = (formData: FormData) => 
  request.post('/companyinformation/editcompanyinformation', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })


// --- 3. 部门管理 (Department) ---
// 严格对照《翼享名片2.docx》数据库设计
export interface Department {
  department_id: number        // 后端是 int
  department_name: string
  parent_department_id: number // 后端是 int
  
  // 后端定义是 string "true"|"false"，前端展示时可能需要转 boolean
  is_administrative_division: string 
  administrative_division_code: string
  
  is_enabled: string           // "true"|"false"
  
  // ⚠️ 注意：如果后端改了拼写就是 sort_order，没改就是 sord_order
  // 这里假设后端【没改】拼写，我们暂时兼容他 (如果他改了，请同步修改这里)
  sort_order: number           
  
  unified_social_credit_code: string
  contact_person: string
  contact_phone: string
  
  // 后端定义的子节点字段名
  children_department?: Department[] 
}

// 联想搜索参数 (GET)
export interface AssociativeSearchReq {
  fuzzy_department_name: string
}

// 获取搜索部门参数 (GET)
export interface GetSearchDepartmentsReq {
  department_full_name: string
}

// 2. 新增/修改请求参数 (对应 AddDepartmentRequest / EditDepartmentRequest)
// 使用 Omit 排除掉子节点，只传当前节点信息
export type DepartmentSaveReq = Omit<Department, 'children_department'>

// 3. API 定义 (URL 已更新)

// 获取列表 (对应 get /getdepartments)
export const getDepartmentTree = () => 
  request.get('/department/getdepartments')

// 新增 (对应 post /adddepartment)
export const addDepartment = (data: DepartmentSaveReq) => 
  request.post('/department/adddepartment', data)

// 修改 (对应 put /editdepartment)
export const updateDepartment = (data: DepartmentSaveReq) => 
  request.put('/department/editdepartment', data)

// 删除 (对应 delete /deletedepartment)
// 注意：Delete 请求传 JSON body 需要用 data 属性包裹
export const deleteDepartment = (id: number) => 
  request.delete('/department/deletedepartment', { 
    data: { department_id: id }   
  })
// ... 原有的增删改查 API ...

// 【新增】联想搜索接口
export const associativeSearch = (params: AssociativeSearchReq) => 
  request.get('/department/associativesearch', { params })

// 【新增】根据全名搜索部门接口
export const getSearchDepartments = (params: GetSearchDepartmentsReq) => 
  request.get('/department/getsearchdepartments', { params })
  



// --- 4. 数据看板 ---
export const getDashboardStats = () => request.get('/dashboard/stats')
export const getDashboardTrend = () => request.get('/dashboard/trend')
export const getRankPerson = () => request.get('/dashboard/rank/person')
export const getRankProduct = () => request.get('/dashboard/rank/product')






// 访问记录
export interface VisitListReq {
  page: number
  size: number
  // card_id?: number | string // 变为可选
  card_ids?: number[]
  start_time?: string       // 新增
  end_time?: string         // 新增
}


// 访客记录项 (对应后端 VisitLogItem)
export interface VisitLogItem {
  id: number
  card_name: string      // 🔥 新增字段
  visitor_name: string   // 访客昵称 (或 "微信用户")
  visitor_avatar: string // 头像 URL
  visit_type: string     // VIEW, CALL, SAVE...
  content: string        // 详情
  create_time: string    // 时间
  location: string       // 地区
}
// 响应结构
export interface VisitListResp {
  list: VisitLogItem[]
  total: number
}

// API: 获取访客列表
export const getVisitLogList = (params: VisitListReq) => 
  request.get('/visit/list', { params })



// 【新增】名片导入接口 URL (直接用于 el-upload 的 action)
// 注意：根据你的环境调整前缀，如果是开发环境可能是 /api/businesscard/import
export const importCardUrl = '/businesscard/import' 

// 或者如果你想手动用 axios 发：
export const importCard = (formData: FormData) => 
  request.post('/businesscard/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })


  // 上传接口
export const uploadFile = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/common/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}