export interface MenuItem {
  id: number
  name: string
  price: number
  description: string
  image: string
  category: 'breakfast' | 'lunch' | 'dinner'
  stock?: number
  ingredients?: string[]
}

export interface Service {
  id: number
  icon: string
  title: string
  description: string
}

export interface TeamMember {
  id: number
  name: string
  designation: string
  image: string
  facebook?: string
  twitter?: string
  instagram?: string
}

export interface Testimonial {
  id: number
  name: string
  profession: string
  image: string
  quote: string
}

export interface BookingForm {
  name: string
  email: string
  datetime: string
  people: number
  specialRequest: string
}

export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  role: 'admin' | 'chef' | 'waiter' | 'customer'
}

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'chef' | 'waiter' | 'customer'
  avatar?: string
  phone?: string
  address?: string
  createdAt?: string
  status?: 'active' | 'inactive'
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface Employee {
  id: number
  name: string
  email: string
  phone: string
  position: string
  salary: number
  hireDate: string
  status: 'active' | 'inactive' | 'on-leave'
  avatar?: string
  address?: string
  emergencyContact?: string
}

export interface Purchase {
  id: number
  supplier: string
  items: PurchaseItem[]
  totalAmount: number
  purchaseDate: string
  status: 'pending' | 'completed' | 'cancelled'
  notes?: string
}

export interface PurchaseItem {
  id: number
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Sale {
  id: number
  orderNumber: string
  customer: string
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'online'
  saleDate: string
  status: 'completed' | 'pending' | 'cancelled'
}

export interface SaleItem {
  id: number
  menuItemId: number
  name: string
  quantity: number
  price: number
  totalPrice: number
}

export interface Supplier {
  id: number
  name: string
  email: string
  phone: string
  address: string
  products: string[]
}
