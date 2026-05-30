export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
};

export type Role = 'OWNER' | 'TENANT' | 'ADMIN';
export type PropertyType = 'HOUSE' | 'APARTMENT' | 'VILLA' | 'COMMERCIAL';
export type PaymentType = 'RENT' | 'ADVANCE' | 'MAINTENANCE' | 'EB_BILL' | 'WATER_BILL' | 'REFUND';
export type PaymentStatus = 'CREATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  fullName: string;
  roles: Role[];
};

export type OwnerDashboardData = {
  totalProperties: number;
  occupied: number;
  vacant: number;
  totalTenants: number;
  pendingRents: number | string;
  monthlyRevenue: number | string;
  collectionRate: number;
  recentPayments: Payment[];
};

export type TenantDashboardData = {
  status: string;
  nextDueDate: string;
  nextDueInDays: number;
  pendingAmount: number | string;
  propertyTitle: string;
  rentAmount: number | string;
  advanceAmount: number | string;
};

export type Property = {
  id: string;
  title: string;
  type: PropertyType;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  rentAmount: number | string;
  advanceAmount: number | string;
  dueDay: number;
  occupied: boolean;
  images?: { id: string; url: string; altText?: string }[];
};

export type Tenant = {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  mobile?: string;
  propertyId: string;
  propertyTitle: string;
  rentAmount: number | string;
  advanceAmount: number | string;
  emergencyContact?: string;
  kycDocumentUrl?: string;
  moveInDate?: string;
};

export type Payment = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  payerName: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number | string;
  lateFee: number | string;
  dueDate: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  receiptUrl?: string;
  upiIntentUrl?: string;
};

export type Invoice = {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  propertyTitle: string;
  payerName: string;
  amount: number | string;
  issuedDate: string;
  dueDate: string;
  pdfUrl: string;
};

export type Agreement = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  agreementPdfUrl?: string;
  active: boolean;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  channel: string;
  readFlag: boolean;
  createdAt: string;
};

export type UserMe = {
  id: string;
  email: string;
  fullName: string;
  mobile?: string;
  roles: Role[];
};

export type OwnerProfile = {
  id?: string;
  businessName?: string;
  gstNumber?: string;
  payoutUpiId?: string;
  billingAddress?: string;
  logoUrl?: string;
};
