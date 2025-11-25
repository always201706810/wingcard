
/**
 * 登录表单的数据结构
 */

export interface LoginForm {
    username: string;
    password: string;
    verifyCode: string;
    rememberMe: boolean;
}

/**
 * 名片信息的数据结构 (对应 Info.vue 的表格)
 */

export interface CardInfo {
  id: string;
  name: string;
  wechatPhone: string;
  displayPhone: string;
  email: string;
  zipCode: string;
  department: string;
  address: string;
}
//部门
export interface Department {
  id?: string; 
  name: string;
  enabled: boolean;
  contact: string;
  phone: string;
  
  parentId?: string; 
  children?: Department[];
}

