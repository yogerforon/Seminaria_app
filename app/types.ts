
  export interface Session {
    id: number
    customerId: number
    ipAddress?: string | null
    userAgent?: string | null
    loginTime: Date
    logoutTime?: Date | null
    duration?: number | null
    isActive: boolean
    sessionType?: string | null
    expiresAt?: Date | null
    createdAt: Date
    updatedAt: Date
    token: string
  }

  export interface LoginForm {
    email: string
    password: string
  }

  export interface AdminLoginPageProps {
    error?: string
  }

  export interface TokenPayload {
    id: number
    role: string
    [key: string]: any // для любых дополнительных полей
  }

  export interface RegisterForm {
    email: string
    password: string
    ipAddress: string
    userAgent: string
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
    // Добавьте другие поля, если необходимо
  }

  export interface ClientInfo {
    ipAddress: string
    userAgent: string 
  }

  export interface Customer {
    id: number;
    email: string;
    emailVerified: boolean;
    password: string;
    firstName: string;
    lastName: string;
    sex: string;
    dateOfBirth: Date;
    profilePicture: string;
    phone: string;
    phoneVerified: boolean;
    addressId: number;
    address: string;
    cart: number;
    sessions: number;
    orders: number;
    defaultLanguage: string;
    resetPasswordTokens: string;
    role: string;
    shipments: number;
    isSubscribed: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    discount: number;
  }