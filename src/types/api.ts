import request from '../utils/request'

// --- 0. 认证模块 (Auth) ---

export interface LoginParams {
  user_account: string  // 对应后端的 user_account
  user_password: string // 对应后端的 user_password
  // 如果后端需要验证码，这里可以加 verifyCode
}

export interface LoginResponse {
  token: string
  // 根据数据库 user表，返回的用户信息大致如下
  user_info: {
    user_id: number
    user_account: string
    user_name: string
    organization: string
  }
}

// 登录接口
export const login = (data: LoginParams) => request.post('/login', data)
// 退出登录接口 (如果没有专门的后端接口，前端清除token即可，这里预留一个)
export const logout = () => request.post('/logout')


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
export interface CompanyInfo {
  company_id?: number | string
  company_name: string         // 公司名称
  
  // 基础文案
  company_slogan?: string      // 公司标语
  company_background?: string  // 成立背景
  company_bussiness?: string   // 业务范围 (注意：数据库文档拼写为 bussiness)
  company_market?: string      // 市场定位
  company_advantage?: string   // 能力优势
  company_culture?: string     // 企业文化
  company_future?: string      // 未来规划
  company_qr_code_intro?: string // 二维码介绍内容

  // 联系方式
  company_phone: string        // 公司电话
  company_email?: string       // 公司邮箱
  company_url?: string         // 官网链接
  
  // 地址坐标
  company_address: string      // 公司地址
  company_latitude?: number | string // 纬度
  company_longitude?: number | string // 经度

  // --- 关联表数据 (前端提交时通常作为一个大对象提交，或后端单独接口) ---
  // 图片列表 (对应 CompanyImg 表)
  // 假设后端接收一个图片对象数组
  images?: CompanyImg[] 
  
  // 荣誉列表 (对应 Honor 表)
  honors?: Honor[]
  
  // 资质列表 (对应 Qualification 表)
  qualifications?: Qualification[]
}

export interface CompanyImg {
  img_id?: number
  img_url: string
  img_type: 'image' | 'logo' | 'slogan' | 'background' | 'future' | 'qrcode' | 'media'
}

export interface Honor {
  honor_id?: number | string
  honor_name: string
}

export interface Qualification {
  qualification_id?: number | string
  qualification_name: string
}

export const getCompanyInfo = () => request.get('/company/info')
export const saveCompanyInfo = (data: CompanyInfo) => request.post('/company/save', data)

// --- 3. 部门管理 (Department) ---
// 严格对照《翼享名片2.docx》数据库设计
export interface Department {
  department_id?: number | string // 主键
  department_name: string         // 部门名称
  parent_department_id?: number | string | null // 父部门ID
  
  // --- 补全的字段 ---
  is_administrative_division: string | boolean // 是否行政区划 (DB是 ENUM('true','false'))
  administrative_division_code?: string        // 行政区划编码
  sort_order?: number                          // 排序
  unified_social_credit_code?: string          // 统一社会信用代码
  // ----------------
  
  is_enabled: string | boolean    // 是否启用 (DB是 ENUM('true','false'))
  contact_person?: string         // 联系人
  contact_phone?: string          // 联系电话
  
  children?: Department[]         // 树形子节点
}

export const getDepartmentTree = () => request.get('/department/tree')
export const addDepartment = (data: Department) => request.post('/department/add', data)
export const updateDepartment = (data: Department) => request.put('/department/update', data)
export const deleteDepartment = (id: number | string) => request.delete(`/department/${id}`)

// --- 4. 数据看板 ---
export const getDashboardStats = () => request.get('/dashboard/stats')
export const getDashboardTrend = () => request.get('/dashboard/trend')
export const getRankPerson = () => request.get('/dashboard/rank/person')
export const getRankProduct = () => request.get('/dashboard/rank/product')