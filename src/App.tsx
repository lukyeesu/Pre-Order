import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, ClipboardList, Settings, Plus, Edit, Trash2, X, Check, 
  AlertCircle, PackageX, Sparkles, Store, ShoppingCart, 
  Image as ImageIcon, Box, CreditCard, Minus, MapPin, Calendar, 
  Phone, User, Truck, AlignLeft, Tags, GripHorizontal, ArrowLeft, 
  Receipt, Banknote, PenTool, Save, Tag, Landmark, Search, 
  Download, PieChart, TrendingUp, AlertTriangle, CheckCircle, Folder, Activity, Award, Filter,
  Lock, ArrowRight, LogOut, Users, Mail, Loader2, Share2, MessageCircle, Megaphone
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export type UserRole = 'admin' | 'staff' | 'user';

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  facebook?: string;
  bankName?: string;
  bankAccount?: string;
  role: UserRole;
  avatar?: string;
}

export type StatusColor = 'slate' | 'blue' | 'emerald' | 'amber' | 'orange' | 'rose' | 'pink' | 'purple' | 'indigo';

export interface OrderStatus {
  id: string;
  label: string;
  color: StatusColor;
}

export interface Bank {
  id: string;
  name: string;
}

export interface Variation {
  name: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  carryingFee: number;
  shippingFee: number;
  status: 'available' | 'sold_out';
  imageUrl: string;
  variations: Variation[];
  description: string;
  images?: string[];
}

export interface ActualExpense {
  name: string;
  amount: number | '';
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  carryingFee: number;
  qty: number;
  variation: string;
}

export interface Order {
  id: string;
  userId: string;
  orderDate: string;
  customer: string;
  email: string;
  facebook: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  address: string;
  googleMapLink: string;
  deliveryMethod: string;
  deliveryDate: string;
  note: string;
  items: OrderItem[];
  shippingFee: number | '';
  discount: number | '';
  total: number;
  status: string;
  actualExpenses: ActualExpense[];
  createdBy?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  qty: number;
  variation: string;
}

export interface ToastMsg {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export interface ModalState {
  isOpen: boolean;
  type: string;
  data: any; // Product | Order | null
}

export interface SystemSettings {
  id: string;
  storeName: string;
  storeSubtitle: string;
  driveProductFolderId: string;
  driveSystemFolderId: string;
  orderStatuses?: string; // Add this
  bankOptions?: string;   // Add this
  storeBankName?: string;    // Add this (ธนาคารของร้าน)
  storeBankAccount?: string; // Add this (เลขบัญชีของร้าน)
  storeAccountName?: string; // Add this (ชื่อบัญชีของร้าน)
  telegramBotToken?: string; // Add this
  telegramChatId?: string;   // Add this
  announcementText?: string;               // Add this
  isAnnouncementActive?: boolean | string; // Add this
  isCapsuleActive?: boolean | string;      // Add this
  capsuleText?: string;                    // Add this
  shippingNote?: string;                   // Add this
  pickupNote?: string;                     // Add this
  baseShippingFee?: number | string;       // Add this (ค่าจัดส่งชิ้นแรก)
  addShippingFee?: number | string;        // Add this (ค่าจัดส่งชิ้นต่อไป)
  pickupFee?: number | string;             // Add this (ค่าธรรมเนียมการนัดรับ)
}

// --- CONFIGURATION ---
// นำ Web App URL ที่ได้จากการ Deploy Apps Script มาวางที่นี่
// [UPDATED] อัปเดต URL ให้ตรงกับที่คุณให้มาล่าสุด
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzvDxBTMbczdeC5ZQDXkVsEWA-GiSPOef1ZuvKXqNhTnGktE2pDcnKu3mSMfDoIE2o/exec"; 
// ---------------------

// --- REUSABLE COMPONENTS ---
const TableScrollWrapper: React.FC<{ children: React.ReactNode, className?: string, onScroll?: (e: React.UIEvent<HTMLDivElement>) => void }> = ({ children, className, onScroll }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      // ดัก Event ก่อนที่ Lenis จะรับไป ถ้าเป็นการเลื่อนซ้ายขวา หรือกด Shift ให้ข้าม Lenis ทันที
      const isHorizontal = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (isHorizontal) {
        e.stopPropagation();
        return;
      }
      
      // ถ้าเป็นการเลื่อนแนวตั้ง ตรวจสอบว่า Scroll ในกล่องย่อยยังเลื่อนได้หรือไม่ (ยังไม่สุดขอบ)
      const canScrollUp = el.scrollTop > 0;
      const canScrollDown = Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight;
      
      if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
        e.stopPropagation(); // ให้เบราว์เซอร์เลื่อนกล่องย่อยตามปกติ
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: true });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);
  return (
    <div ref={ref} className={className} onScroll={onScroll}>
      {children}
    </div>
  );
};

// คอมโพเนนต์ใหม่สำหรับ Textarea ที่ต้องการให้ Scroll ได้เมื่อใช้ร่วมกับ Lenis
const TextAreaScrollable: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      const isHorizontal = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (isHorizontal) {
        e.stopPropagation();
        return;
      }
      const canScrollUp = el.scrollTop > 0;
      const canScrollDown = Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight;
      
      if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
        e.stopPropagation();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: true });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);
  return <textarea ref={ref} {...props} />;
};

// --- IMAGE ZOOM COMPONENT ---
const ImageZoomOverlay: React.FC<{ imageUrl: string, onClose: () => void }> = ({ imageUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    let newScale = scale + delta;
    newScale = Math.max(0.5, Math.min(newScale, 6)); // ซูมได้สูงสุด 6 เท่า
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (scale > 1) {
      isDragging.current = true;
      startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current && scale > 1) {
      setPosition({
        x: e.clientX - startPos.current.x,
        y: e.clientY - startPos.current.y
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      lastTouchDistance.current = dist;
    } else if (e.touches.length === 1 && scale > 1) {
      isDragging.current = true;
      startPos.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

      if (lastTouchDistance.current !== null) {
        const delta = dist - lastTouchDistance.current;
        let newScale = scale + delta * 0.015;
        newScale = Math.max(0.5, Math.min(newScale, 6));
        setScale(newScale);
      }
      lastTouchDistance.current = dist;
    } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - startPos.current.x,
        y: e.touches[0].clientY - startPos.current.y
      });
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    lastTouchDistance.current = null;
  };

  const handleDoubleClick = (e: React.MouseEvent | React.TouchEvent) => {
     e.stopPropagation();
     if (scale > 1) {
        setScale(1);
        setPosition({x:0, y:0});
     } else {
        setScale(2);
     }
  };

  // ลบ useEffect ตัวนี้ออกไป เพื่อไม่ให้ไปกวน overflow ของ body
  // useEffect(() => {
  //   const originalOverflow = document.body.style.overflow;
  //   document.body.style.overflow = 'hidden';
  //   return () => { document.body.style.overflow = originalOverflow; };
  // }, []);

  return (
    <div
      className="fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 touch-none"
      onClick={onClose}
      onWheel={handleWheel}
    >
      <button
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors z-50 shadow-lg"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        title="ปิด (Close)"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: scale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'zoom-in' }}
      >
        <img
          src={imageUrl}
          alt="Zoomed Fullscreen"
          className="max-w-full max-h-full object-contain select-none pointer-events-none drop-shadow-2xl"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging.current ? 'none' : 'transform 0.1s ease-out',
            willChange: 'transform'
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};

// --- INITIAL DATA ---
const defaultOrderStatuses: OrderStatus[] = [
  { id: 'waiting_payment', label: 'รอชำระเงิน', color: 'amber' },
  { id: 'paid', label: 'ชำระเงินแล้ว', color: 'blue' },
  { id: 'sourcing', label: 'กำลังจัดซื้อ', color: 'purple' },
  { id: 'purchased', label: 'ซื้อสำเร็จ', color: 'indigo' },
  { id: 'waiting_delivery', label: 'รอจัดส่ง', color: 'orange' },
  { id: 'delivered', label: 'จัดส่งเรียบร้อย', color: 'emerald' },
  { id: 'failed', label: 'ซื้อไม่สำเร็จ', color: 'rose' },
  { id: 'canceled', label: 'ยกเลิกแล้ว', color: 'rose' },
  { id: 'waiting_refund', label: 'รอโอนเงินคืน', color: 'pink' },
  { id: 'refunded', label: 'โอนเงินคืนสำเร็จ', color: 'slate' }
];

const defaultBanks: Bank[] = [
  { id: 'b1', name: 'กสิกรไทย (KBANK)' },
  { id: 'b2', name: 'ไทยพาณิชย์ (SCB)' },
  { id: 'b3', name: 'กรุงเทพ (BBL)' },
  { id: 'b4', name: 'กรุงไทย (KTB)' },
  { id: 'b5', name: 'พร้อมเพย์ (PromptPay)' }
];

const formatPhone = (phone?: string) => {
  if (!phone) return '';
  const p = String(phone).trim();
  if (p.startsWith('0') || p.startsWith('+')) return p;
  return '0' + p;
};

// --- MAIN COMPONENT ---
function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // โหลดและใช้งานฟอนต์ Kanit ทั่วทั้งแอปพลิเคชัน
  useEffect(() => {
    if (!document.getElementById('kanit-font')) {
      const link = document.createElement('link');
      link.id = 'kanit-font';
      link.href = 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      const style = document.createElement('style');
      style.innerHTML = `
        body, input, button, select, textarea, .font-sans { 
          font-family: 'Kanit', sans-serif !important; 
        }
        /* ยกเว้นให้ font-mono ยังคงแสดงผลได้ถูกต้องสำหรับพวก รหัส ID */
        .font-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
        }
        
        /* * 💎 PREMIUM TYPOGRAPHY OVERRIDE 💎
         * ปรับลดน้ำหนักฟอนต์ Kanit แบบ Global เพื่อให้ดูเรียบหรู คลีน มินิมอล ไม่หนาเทอะทะ
         */
        .font-black { font-weight: 700 !important; }      /* ลดจาก 900 -> 700 (Bold) สำหรับหัวข้อใหญ่/ตัวเลขเน้นๆ */
        .font-extrabold { font-weight: 600 !important; }  /* ลดจาก 800 -> 600 (SemiBold) */
        .font-bold { font-weight: 500 !important; }       /* ลดจาก 700 -> 500 (Medium) เหมาะมากสำหรับหัวตารางและปุ่ม */
        .font-semibold { font-weight: 500 !important; }   /* ลดจาก 600 -> 500 (Medium) */
        .font-medium { font-weight: 400 !important; }     /* ลดจาก 500 -> 400 (Regular) ทำให้ข้อความรองอ่านง่ายขึ้น */
      `;
      document.head.appendChild(style);
    }
  }, []);

  // UX & Processing States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAppReady, setIsAppReady] = useState<boolean>(false); // เพิ่ม State สำหรับเช็คว่าโหลดข้อมูลเริ่มต้นเสร็จหรือยัง
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // Modal Animation State

  // Scroll Preservations & Lenis
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any>(null);
  const scrollPositions = useRef<Record<string, number>>({});

  // New Auth States
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const [activeTab, setActiveTab] = useState<string>('store');
  const [sysSettings, setSysSettings] = useState<SystemSettings>({
    id: 'system',
    storeName: 'STELLAR DROP',
    storeSubtitle: 'Mission Control',
    driveProductFolderId: '',
    driveSystemFolderId: '',
    storeBankName: '',
    storeBankAccount: '',
    storeAccountName: '',
    telegramBotToken: '',
    telegramChatId: '',
    announcementText: '',
    isAnnouncementActive: false,
    isCapsuleActive: false,
    capsuleText: '',
    shippingNote: '',
    pickupNote: '',
    baseShippingFee: 50,
    addShippingFee: 10,
    pickupFee: 0
  });

  // Announcement States
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState<boolean>(false); // เพิ่ม State สำหรับควบคุมแอนิเมชันให้สมูท
  const [hasSeenAnnouncement, setHasSeenAnnouncement] = useState<boolean>(false);
  const [dontShowToday, setDontShowToday] = useState<boolean>(false);

  // Core States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // User specific cart states (Persisted in Google Sheets)
  const [userCarts, setUserCarts] = useState<Record<string, CartItem[]>>({});
  const syncCartTimeout = useRef<any>(null);

  const cart = currentUser ? (userCarts[currentUser.id] || []) : [];

  const setCart = (action: React.SetStateAction<CartItem[]>) => {
    if (!currentUser) return;
    setUserCarts(prev => {
      const currentCart = prev[currentUser.id] || [];
      const newCart = typeof action === 'function' ? (action as (prevState: CartItem[]) => CartItem[])(currentCart) : action;
      
      // หน่วงเวลาเซฟตะกร้าไปที่ Google Sheet (เพื่อไม่ให้ยิง API ถี่เกินไปเวลากดรัวๆ)
      if (syncCartTimeout.current) clearTimeout(syncCartTimeout.current);
      syncCartTimeout.current = setTimeout(() => {
        callServerAPI('saveCart', { userId: currentUser.id, cartData: JSON.stringify(newCart) })
          .catch(err => console.error("Cart save error", err));
      }, 1000);

      return { ...prev, [currentUser.id]: newCart };
    });
  };

  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>(defaultOrderStatuses);
  const [bankOptions, setBankOptions] = useState<Bank[]>(defaultBanks);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  
  // UI & Form States
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: '', data: null });
  const [selectedVariation, setSelectedVariation] = useState<string>(''); 
  const [formVariations, setFormVariations] = useState<Variation[]>([]);
  const [draftOrder, setDraftOrder] = useState<Order | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [checkoutForm, setCheckoutForm] = useState({
    userId: '', customerName: '', email: '', facebook: '', phone: '', address: '', deliveryMethod: 'shipping'
  });

  // Drag & Drop Image Upload States
  const [isProductImgDragging, setIsProductImgDragging] = useState<boolean>(false);
  const [isProfileImgDragging, setIsProfileImgDragging] = useState<boolean>(false);
  
  // Image Zoom State
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [usersList, setUsersList] = useState<AppUser[]>([]);

  // Dashboard Specific States
  const [dashSearchQuery, setDashSearchQuery] = useState<string>('');
  const [dashDateMode, setDashDateMode] = useState<'all' | 'day' | 'week' | 'month' | 'year' | 'range'>('all');
  const [dashSelectedDate, setDashSelectedDate] = useState<Date>(new Date());
  const [dashDateRange, setDashDateRange] = useState({ start: '', end: '' });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [calViewDate, setCalViewDate] = useState<Date>(new Date());
  const [calInnerMode, setCalInnerMode] = useState<'day'|'month'|'year'>('day');
  
  const [dashStatusFilter, setDashStatusFilter] = useState<string>('all');
  const [dashVisibleOrdersCount, setDashVisibleOrdersCount] = useState<number>(20);
  const [isDashScrolled, setIsDashScrolled] = useState<boolean>(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Sidebar Interaction State
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved !== null ? JSON.parse(saved) : true; // ค่าเริ่มต้นคือ true (ขยาย)
  });
  const [sidebarDragStartX, setSidebarDragStartX] = useState<number | null>(null);
  const [sidebarDragOffset, setSidebarDragOffset] = useState<number>(0);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isSidebarHovered));
  }, [isSidebarHovered]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sidebarDragStartX === null) return;
      setIsDraggingSidebar(true);
      const deltaX = e.clientX - sidebarDragStartX;
      setSidebarDragOffset(deltaX);
    };

    const handleMouseUp = () => {
      if (sidebarDragStartX === null) return;

      // กำหนดจุดที่ให้ Snap กลับหรือสลับสถานะเมื่อปล่อยเมาส์
      if (!isSidebarHovered && sidebarDragOffset > 50) {
        setIsSidebarHovered(true);
      } else if (isSidebarHovered && sidebarDragOffset < -50) {
        setIsSidebarHovered(false);
        setIsUserMenuOpen(false);
      }

      setSidebarDragStartX(null);
      setSidebarDragOffset(0);
      setIsDraggingSidebar(false);
    };

    if (sidebarDragStartX !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [sidebarDragStartX, isSidebarHovered, sidebarDragOffset]);

  // Drag & Drop State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string>('');

  const isAdminOrStaff = currentUser?.role === 'admin' || currentUser?.role === 'staff';

  // --- API CALL HELPER ---
  const callServerAPI = async (action: string, payload?: any) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, payload })
      });
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message);
      return data;
    } catch (error) {
      console.error(`API Error (${action}):`, error);
      throw error;
    }
  };

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAllData`);
        const json = await res.json();
        if (json.status === 'success') {
          if (json.data.products && json.data.products.length > 0) {
            // ดักให้สินค้าที่สต็อกเหลือ 0 เป็น sold out ทันทีตั้งแต่โหลดข้อมูล
            const sanitizedProducts = json.data.products.map((p: any) => ({
              ...p,
              stock: Number(p.stock) || 0,
              status: Number(p.stock) <= 0 ? 'sold_out' : p.status
            }));
            setProducts(sanitizedProducts);
          }
          if (json.data.orders && json.data.orders.length > 0) setOrders(json.data.orders);
          if (json.data.users && json.data.users.length > 0) {
            setUsersList(json.data.users);
            
            // โหลดข้อมูลผู้ใช้ที่บันทึกไว้ใน localStorage (ฟีเจอร์ "ให้อยู่ในระบบต่อ")
            const savedUserId = localStorage.getItem('savedUserId');
            if (savedUserId) {
              const savedUser = json.data.users.find((u: any) => u.id === savedUserId);
              if (savedUser) {
                setCurrentUser(savedUser);
                setActiveTab(savedUser.role === 'user' ? 'store' : 'dashboard');
              }
            }
          }
          if (json.data.settings && json.data.settings.length > 0) {
            const fetchedSettings = json.data.settings[0];
            
            // แปลงค่าจากข้อความให้เป็น Boolean สำหรับฟีเจอร์ประกาศ
            if (fetchedSettings.isAnnouncementActive !== undefined) {
               fetchedSettings.isAnnouncementActive = String(fetchedSettings.isAnnouncementActive).toLowerCase() === 'true';
            }
            if (fetchedSettings.announcementText !== undefined && fetchedSettings.announcementText !== null) {
               fetchedSettings.announcementText = typeof fetchedSettings.announcementText === 'object' ? JSON.stringify(fetchedSettings.announcementText) : String(fetchedSettings.announcementText);
            }
            
            setSysSettings(prev => ({ ...prev, ...fetchedSettings }));
            if (fetchedSettings.orderStatuses) {
               try { setOrderStatuses(typeof fetchedSettings.orderStatuses === 'string' ? JSON.parse(fetchedSettings.orderStatuses) : fetchedSettings.orderStatuses); } catch(e){}
            }
            if (fetchedSettings.bankOptions) {
               try { setBankOptions(typeof fetchedSettings.bankOptions === 'string' ? JSON.parse(fetchedSettings.bankOptions) : fetchedSettings.bankOptions); } catch(e){}
            }
          }
          if (json.data.carts && json.data.carts.length > 0) {
             const loadedCarts: Record<string, CartItem[]> = {};
             json.data.carts.forEach((c: any) => {
                try { 
                  loadedCarts[c.userId] = typeof c.cartData === 'string' ? JSON.parse(c.cartData) : (c.cartData || []); 
                } catch(e){}
             });
             setUserCarts(loadedCarts);
          }
        }
      } catch (err) {
        console.error("Failed to connect to backend", err);
        showToast("ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบ URL หรือเครือข่าย", "error");
      } finally {
        setIsLoading(false);
        setIsAppReady(true); // แจ้งเตือนว่าระบบโหลดการตั้งค่าทั้งหมดเสร็จแล้ว
      }
    };
    fetchInitialData();
  }, []);

  // --- ANNOUNCEMENT LOGIC ---
  useEffect(() => {
    let hideDate = null;
    try {
      hideDate = localStorage.getItem('hideAnnouncementDate');
    } catch (e) {
      console.warn('LocalStorage is disabled by browser');
    }
    const today = new Date().toDateString();

    if (activeTab === 'store' && sysSettings.isAnnouncementActive && sysSettings.announcementText && !hasSeenAnnouncement && hideDate !== today) {
      const timer = setTimeout(() => {
        setShowAnnouncement(true);
        // หน่วงเวลาเล็กน้อยให้ DOM วาดเสร็จก่อน ค่อยเรียกแอนิเมชัน
        setTimeout(() => setIsAnnouncementVisible(true), 10);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [activeTab, sysSettings.isAnnouncementActive, sysSettings.announcementText, hasSeenAnnouncement]);

  const closeAnnouncement = () => {
    setIsAnnouncementVisible(false); // สั่งปิดแอนิเมชันก่อน
    setTimeout(() => { // รอแอนิเมชันเล่นจบ 300ms ค่อยลบ DOM ทิ้ง
      setShowAnnouncement(false);
      setHasSeenAnnouncement(true);
      if (dontShowToday) {
        try {
          localStorage.setItem('hideAnnouncementDate', new Date().toDateString());
        } catch (e) {
          console.warn('Cannot save to LocalStorage');
        }
      }
    }, 300);
  };

  // --- HELPER FUNCTIONS ---
  const handleTabSwitch = (newTab: string) => {
    // บันทึกตำแหน่ง Scroll ปัจจุบันก่อนเปลี่ยนหน้า
    if (mainScrollRef.current) {
      // ดึงค่า Scroll จาก Lenis ถ้ามี (จะได้ค่าที่แม่นยำกว่าระหว่างกำลัง Animation)
      const currentScroll = lenisRef.current ? lenisRef.current.scroll : mainScrollRef.current.scrollTop;
      scrollPositions.current[activeTab] = currentScroll;
    }
    setActiveTab(newTab);
  };

  useEffect(() => {
    // คืนค่าตำแหน่ง Scroll เมื่อเปลี่ยนหน้า
    const targetScroll = scrollPositions.current[activeTab] || 0;
    
    const restoreScrollPosition = () => {
      if (mainScrollRef.current) {
        // หากความสูงรวมของคอนเทนต์ยังน้อยกว่าจุดที่ต้องเลื่อน ให้พยายามเลื่อนเท่าที่ทำได้
        mainScrollRef.current.scrollTop = targetScroll;
        if (lenisRef.current) {
          // สั่ง Lenis ให้คำนวณความสูงใหม่ของหน้าจอ และย้ายจุด Scroll ทันที
          lenisRef.current.resize();
          lenisRef.current.scrollTo(targetScroll, { immediate: true });
        }
      }
    };

    // รอให้ React เรนเดอร์ DOM ชุดใหม่เสร็จก่อน ค่อยเรียกคืนค่า Scroll
    requestAnimationFrame(() => {
      restoreScrollPosition();
      // ย้ำคำสั่งอีกครั้งเผื่อกรณีที่คอนเทนต์/รูปภาพเพิ่งโหลดเสร็จทำให้ความสูงเปลี่ยน
      setTimeout(restoreScrollPosition, 50);
      setTimeout(restoreScrollPosition, 150); 
    });
  }, [activeTab]);

  // Lenis Smooth Scroll Initialization
  useEffect(() => {
    if (!currentUser) return; // Initialize เฉพาะตอนเข้าสู่ระบบแล้ว

    const initLenis = () => {
      if ((window as any).Lenis && mainScrollRef.current && !lenisRef.current) {
        const lenis = new (window as any).Lenis({
          wrapper: mainScrollRef.current,
          content: mainScrollRef.current.firstElementChild,
          lerp: 0.1,
          smoothWheel: true,
        });
        lenisRef.current = lenis;

        lenis.on('scroll', (e: any) => {
          setIsDashScrolled(e.animatedScroll > 20);
          // ทำ Infinity Scroll ใช้งานร่วมกับ Lenis
          if (mainScrollRef.current) {
             const { scrollHeight, clientHeight } = mainScrollRef.current;
             if (scrollHeight - e.animatedScroll <= clientHeight + 300) {
                setDashVisibleOrdersCount(prev => prev + 5);
             }
          }
        });

        const raf = (time: number) => {
          if (lenisRef.current) {
            lenisRef.current.raf(time);
            requestAnimationFrame(raf);
          }
        };
        requestAnimationFrame(raf);
      }
    };

    if (!(window as any).Lenis) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@studio-freight/lenis@1.0.39/dist/lenis.min.js';
      script.onload = initLenis;
      document.head.appendChild(script);
    } else {
      initLenis();
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [currentUser]);

  const generateNextUserId = () => {
    const existingIds = usersList.map(u => u.id).filter(id => id.startsWith('U'));
    if (existingIds.length === 0) return 'U001';
    const numbers = existingIds.map(id => parseInt(id.replace('U', ''), 10)).filter(n => !isNaN(n));
    const maxNumber = Math.max(...numbers, 0);
    return `U${String(maxNumber + 1).padStart(3, '0')}`;
  };

  const generateNextOrderId = () => {
    if (orders.length === 0) return 'ORD-0001';
    const numbers = orders.map(o => {
      // ดึงเฉพาะส่วนที่เป็นตัวเลขออกมาจาก ID
      const match = o.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }).filter(n => !isNaN(n));
    const maxNumber = numbers.length > 0 ? Math.max(...numbers, 0) : 0;
    return `ORD-${String(maxNumber + 1).padStart(4, '0')}`;
  };

  useEffect(() => {
    if (modal.isOpen && modal.type === 'checkout' && currentUser) {
      setCheckoutForm({
        userId: isAdminOrStaff ? '' : currentUser.id,
        customerName: currentUser.name || '',
        email: currentUser.email || '',
        facebook: currentUser.facebook || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        deliveryMethod: 'shipping'
      });
    }
  }, [modal.isOpen, modal.type, currentUser, isAdminOrStaff]);

  const findCustomerData = (val: string, type: 'id' | 'name') => {
    if (!val) return null;
    let user = usersList.find(u => type === 'id' ? u.id === val : u.name === val);
    if (user) return { userId: user.id, customer: user.name, email: user.email || '', phone: user.phone || '', facebook: user.facebook || '', address: user.address || '' };
    
    let order = orders.find(o => type === 'id' ? o.userId === val : o.customer === val);
    if (order) return { userId: order.userId || '', customer: order.customer, email: order.email || '', phone: order.phone || '', facebook: order.facebook || '', address: order.address || '' };
    return null;
  };

  const handleCheckoutFormChange = (field: string, value: string) => {
    setCheckoutForm(prev => {
      const next = { ...prev, [field]: value };
      if ((field === 'userId' || field === 'customerName') && value) {
         const found = findCustomerData(value, field === 'userId' ? 'id' : 'name');
         if (found) {
           next.userId = found.userId;
           next.customerName = found.customer;
           next.email = found.email || next.email;
           next.phone = found.phone || next.phone;
           next.facebook = found.facebook || next.facebook;
           next.address = found.address || next.address;
         }
      }
      return next;
    });
  };

  const handleDraftOrderCustomerChange = (field: 'userId' | 'customer', value: string) => {
    setDraftOrder(prev => {
      if (!prev) return prev;
      const next = { ...prev, [field]: value };
      if (value) {
        const found = findCustomerData(value, field === 'userId' ? 'id' : 'name');
        if (found) {
          next.userId = found.userId;
          next.customer = found.customer;
          next.email = found.email || next.email;
          next.phone = found.phone || next.phone;
          next.facebook = found.facebook || next.facebook;
          if(found.address && !next.address) next.address = found.address;
        }
      }
      return next;
    });
  };

  // --- AUTH HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);
    
    // Simulate API Network Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const cleanUsername = loginUsername.trim().toLowerCase();
    const user = usersList.find(u => u.username === cleanUsername);
    
    // แจ้งเตือนแบบรวม (Username ไม่มี หรือ Password ไม่ตรง) และแปลงเป็น String ก่อนเทียบเสมอ
    if (!user || (user.password && String(user.password) !== String(loginPassword))) {
      showToast('ข้อมูลผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
      setIsProcessing(false); setIsLoading(false);
      return;
    }

    setCurrentUser(user);
    
    // บันทึกหรือลบข้อมูลการเข้าระบบตามที่ผู้ใช้เลือก "ให้อยู่ในระบบต่อ"
    if (rememberMe) {
      localStorage.setItem('savedUserId', user.id);
    } else {
      localStorage.removeItem('savedUserId');
    }

    handleTabSwitch(user.role === 'user' ? 'store' : 'dashboard');
    showToast(`ยินดีต้อนรับ ${user.name} (${user.role})`);
    setIsProcessing(false); setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);
    
    const cleanUsername = regUsername.trim().toLowerCase();

    if (regPassword !== regConfirmPassword) {
      showToast('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน', 'error');
      setIsProcessing(false); setIsLoading(false);
      return;
    }
    if (usersList.some(u => u.username === cleanUsername)) {
      showToast('Username นี้มีผู้ใช้งานแล้ว', 'error');
      setIsProcessing(false); setIsLoading(false);
      return;
    }
    const newUser: AppUser = {
      id: generateNextUserId(),
      username: cleanUsername,
      password: regPassword,
      name: regName,
      email: regEmail,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${regName}&background=random&bold=true`
    };

    try {
      await callServerAPI('saveUser', newUser);
      setUsersList([...usersList, newUser]);
      showToast('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ', 'success');
      setAuthMode('login');
      setRegUsername(''); setRegPassword(''); setRegConfirmPassword(''); setRegName(''); setRegEmail('');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    }
    setIsProcessing(false); setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    showToast(`ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${forgotEmail} แล้ว (จำลอง)`, 'success');
    setAuthMode('login');
    setForgotEmail('');
    setIsProcessing(false); setIsLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
    localStorage.removeItem('savedUserId'); // เคลียร์ข้อมูลการจำเข้าระบบ
    sessionStorage.removeItem('hasSeenAnnouncement'); // เคลียร์ความจำป๊อปอัพ เพื่อให้เข้าสู่ระบบครั้งหน้ามันเด้งเตือนได้ใหม่
    handleTabSwitch('store');
    setIsUserMenuOpen(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser || isProcessing) return;
    setIsProcessing(true); setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const updatedUser = {
      ...currentUser,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      facebook: formData.get('facebook') as string,
      bankName: formData.get('bankName') as string,
      bankAccount: formData.get('bankAccount') as string,
      avatar: profileAvatarUrl || currentUser.avatar,
    };

    try {
      await callServerAPI('saveUser', updatedUser);
      setCurrentUser(updatedUser);
      if (localStorage.getItem('savedUser')) localStorage.setItem('savedUser', JSON.stringify(updatedUser));
      setUsersList(usersList.map(u => u.id === currentUser.id ? updatedUser : u));
      showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    } catch (err) {
      showToast('อัปเดตโปรไฟล์ไม่สำเร็จ', 'error');
    }
    setIsProcessing(false); setIsLoading(false);
  };

  const saveSysSettingsToDB = async (newStatuses?: OrderStatus[], newBanks?: Bank[]) => {
    const payload = {
      ...sysSettings,
      orderStatuses: JSON.stringify(newStatuses || orderStatuses),
      bankOptions: JSON.stringify(newBanks || bankOptions)
    };
    try {
      await callServerAPI('saveSettings', payload);
    } catch (err) {
      console.error('Auto-save settings failed', err);
    }
  };

  const handleSaveSettings = async () => {
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);
    try {
      await saveSysSettingsToDB();
      showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
    } catch (err) {
      showToast('บันทึกการตั้งค่าไม่สำเร็จ', 'error');
    }
    setIsProcessing(false); setIsLoading(false);
  };

  // --- TOAST NOTIFICATIONS ---
  const showToast = (message: string, type: ToastMsg['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    setDashVisibleOrdersCount(20);
  }, [dashSearchQuery, dashDateMode, dashSelectedDate, dashDateRange, dashStatusFilter]);

  // ============================================================================
  // REACT COMPILER OPTIMIZED (No useMemo, relies on auto-memoization)
  // ============================================================================
  
  const lowerProductQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = lowerProductQuery 
    ? products.filter(p => p.name.toLowerCase().includes(lowerProductQuery) || p.id.toLowerCase().includes(lowerProductQuery))
    : products;

  const lowerOrderQuery = orderSearchQuery.trim().toLowerCase();
  const filteredOrders = lowerOrderQuery
    ? orders.filter(o => o.id.toLowerCase().includes(lowerOrderQuery) || o.customer.toLowerCase().includes(lowerOrderQuery) || o.phone.includes(lowerOrderQuery))
    : orders;

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.id.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const cartStats = cart.reduce((acc, item) => {
    acc.cartSubtotal += item.product.price * item.qty;
    acc.cartCarryingFee += (item.product.carryingFee || 0) * item.qty;
    // นำการบวก product.shippingFee รายชิ้นออก เพื่อใช้ Global Settings แทน
    acc.cartItemCount += item.qty;
    return acc;
  }, { cartSubtotal: 0, cartCarryingFee: 0, cartItemCount: 0 });

  // --- คำนวณค่าจัดส่งแบบใหม่ (Global Settings) ---
  const globalBaseShipping = Number(sysSettings.baseShippingFee) || 0;
  const globalAddShipping = Number(sysSettings.addShippingFee) || 0;
  const globalPickupFee = Number(sysSettings.pickupFee) || 0;

  // ค่าจัดส่งเริ่มต้น (สำหรับแสดงในตะกร้า)
  const defaultShippingFee = cartStats.cartItemCount > 0 ? globalBaseShipping + ((cartStats.cartItemCount - 1) * globalAddShipping) : 0;
  // ค่าจัดส่งจริง (ในหน้า Checkout) อิงตามวิธีที่ลูกค้าเลือก
  const checkoutShippingFee = checkoutForm.deliveryMethod === 'pickup' ? globalPickupFee : defaultShippingFee;

  const cartTotal = cartStats.cartSubtotal + cartStats.cartCarryingFee + defaultShippingFee;
  const cartTotalCheckout = cartStats.cartSubtotal + cartStats.cartCarryingFee + checkoutShippingFee;

  let baseDashOrders = orders;
  if (dashSearchQuery.trim()) {
    const dashQueryLower = dashSearchQuery.toLowerCase();
    baseDashOrders = baseDashOrders.filter(o => 
      o.id.toLowerCase().includes(dashQueryLower) || 
      o.customer.toLowerCase().includes(dashQueryLower) ||
      o.phone.includes(dashQueryLower)
    );
  }
  
  let filterStart: Date | null = null;
  let filterEnd: Date | null = null;

  if (dashDateMode === 'day') {
    filterStart = new Date(dashSelectedDate.getFullYear(), dashSelectedDate.getMonth(), dashSelectedDate.getDate());
    filterEnd = new Date(dashSelectedDate.getFullYear(), dashSelectedDate.getMonth(), dashSelectedDate.getDate(), 23, 59, 59, 999);
  } else if (dashDateMode === 'week') {
    const currentDay = dashSelectedDate.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    filterStart = new Date(dashSelectedDate);
    filterStart.setDate(dashSelectedDate.getDate() - distanceToMonday);
    filterStart.setHours(0, 0, 0, 0);
    filterEnd = new Date(filterStart);
    filterEnd.setDate(filterStart.getDate() + 6);
    filterEnd.setHours(23, 59, 59, 999);
  } else if (dashDateMode === 'month') {
    filterStart = new Date(dashSelectedDate.getFullYear(), dashSelectedDate.getMonth(), 1);
    filterEnd = new Date(dashSelectedDate.getFullYear(), dashSelectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (dashDateMode === 'year') {
    filterStart = new Date(dashSelectedDate.getFullYear(), 0, 1);
    filterEnd = new Date(dashSelectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else if (dashDateMode === 'range') {
    if (dashDateRange.start) {
      filterStart = new Date(dashDateRange.start);
      filterStart.setHours(0, 0, 0, 0);
    }
    if (dashDateRange.end) {
      filterEnd = new Date(dashDateRange.end);
      filterEnd.setHours(23, 59, 59, 999);
    }
  }

  if (filterStart || filterEnd) {
    baseDashOrders = baseDashOrders.filter(o => {
      if (!o.orderDate) return false;
      const orderDate = new Date(o.orderDate);
      orderDate.setHours(0, 0, 0, 0); 
      let isValid = true;
      if (filterStart && orderDate < filterStart) isValid = false;
      if (filterEnd && orderDate > filterEnd) isValid = false;
      return isValid;
    });
  }

  const filteredDashOrders = dashStatusFilter !== 'all' 
    ? baseDashOrders.filter(o => o.status === dashStatusFilter)
    : baseDashOrders;

  // Analytics Computation
  const validOrders = filteredDashOrders.filter(o => !['failed', 'refunded'].includes(o.status));
  const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  
  let totalProductRevenue = 0;
  let totalCarryingFee = 0;
  let totalShippingFee = 0;
  let totalActualExpenses = 0;
  
  type ProductSales = { [key: string]: { name: string; qty: number; revenue: number } };
  const productSales: ProductSales = {};
  const statusCounts: Record<string, number> = {};

  orderStatuses.forEach(s => { statusCounts[s.id] = 0; });

  validOrders.forEach(o => {
    totalShippingFee += Number(o.shippingFee || 0);
    o.items.forEach(item => {
      totalProductRevenue += (Number(item.price) * Number(item.qty));
      totalCarryingFee += ((Number(item.carryingFee) || 0) * Number(item.qty));
      if (!productSales[item.id]) productSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
      productSales[item.id].qty += Number(item.qty);
      productSales[item.id].revenue += (Number(item.price) * Number(item.qty));
    });
  });

  filteredDashOrders.forEach(o => {
    totalActualExpenses += (o.actualExpenses || []).reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  });

  const totalBaseOrders = baseDashOrders.length;
  baseDashOrders.forEach(o => {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
    else statusCounts[o.status] = 1;
  });

  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty);
  
  const dashboardStats = { 
    totalRevenue, totalBaseOrders, totalProductRevenue, totalCarryingFee, 
    totalShippingFee, totalActualExpenses, topProducts, statusCounts
  };

  const handleDeleteUser = async (id: string) => {
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);
    
    try {
      await callServerAPI('deleteUser', { id });
      setUsersList(usersList.filter(u => u.id !== id));
      showToast('ลบผู้ใช้ออกจากระบบแล้ว', 'success');
      closeModal();
    } catch (err) {
      showToast('เกิดข้อผิดพลาด ไม่สามารถลบผู้ใช้ได้', 'error');
    }
    setIsProcessing(false); setIsLoading(false);
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const cleanUsername = (formData.get('username') as string).trim().toLowerCase();
    
    const userData: AppUser = {
      id: modal.data?.id || generateNextUserId(),
      username: cleanUsername,
      password: modal.data?.password || '123456', // Default password for new users created by admin
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      facebook: formData.get('facebook') as string,
      address: formData.get('address') as string,
      role: formData.get('role') as UserRole,
      avatar: modal.data?.avatar || `https://ui-avatars.com/api/?name=${formData.get('name')}&background=random&bold=true`
    };

    try {
      if (!modal.data?.id && usersList.some(u => u.username === userData.username)) {
        showToast('Username นี้มีในระบบแล้ว', 'error');
        setIsProcessing(false); setIsLoading(false);
        return;
      }
      
      await callServerAPI('saveUser', userData);

      if (modal.data?.id) {
        setUsersList(usersList.map(u => u.id === userData.id ? userData : u));
        showToast('อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว');
        // Update current user context if editing self
        if (currentUser?.id === userData.id) {
           setCurrentUser({ ...currentUser, ...userData });
           if (localStorage.getItem('savedUser')) localStorage.setItem('savedUser', JSON.stringify({ ...currentUser, ...userData }));
        }
      } else {
        setUsersList([...usersList, userData]);
        showToast('เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว (รหัสผ่านเริ่มต้น 123456)');
      }
      closeModal();
    } catch (err) {
      showToast('บันทึกข้อมูลไม่สำเร็จ', 'error');
    }
    setIsProcessing(false); setIsLoading(false);
  };

  const saveProduct = async (product: Product) => {
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);

    try {
      await callServerAPI('saveProduct', product);
      if (product.id && products.some(p => p.id === product.id)) {
        setProducts(products.map(p => p.id === product.id ? product : p));
        showToast("อัปเดตข้อมูลสินค้าแล้ว");
      } else {
        setProducts([...products, product]);
        showToast("เพิ่มสินค้าใหม่สำเร็จ");
      }
      closeModal();
    } catch (err) {
      showToast("บันทึกข้อมูลสินค้าไม่สำเร็จ", "error");
    }
    setIsProcessing(false); setIsLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);

    try {
      await callServerAPI('deleteProduct', { id });
      setProducts(products.filter(p => p.id !== id));
      showToast("ลบสินค้าออกจากระบบแล้ว", "success");
      closeModal();
    } catch (err) {
      showToast("ลบสินค้าไม่สำเร็จ", "error");
    }
    setIsProcessing(false); setIsLoading(false);
  };

  // --- ORDER ACTION HELPERS ---
  const handleShareOrder = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    const itemsText = order.items.map(i => `- ${i.name} ${i.variation ? `(${i.variation})` : ''} x${i.qty}`).join('\n');
    const statusLabel = orderStatuses.find(s => s.id === order.status)?.label || order.status;
    const deliveryMethodLabel = order.deliveryMethod === 'pickup' ? 'นัดรับ' : 'จัดส่ง';
    const deliveryDateStr = order.deliveryDate ? `\n📅 วันที่: ${order.deliveryDate}` : '';
    const phoneStr = order.phone ? `\n📞 เบอร์โทร: ${order.phone}` : '';
    
    let textToShare = `📦 ออเดอร์: ${order.id}\n👤 ลูกค้า: ${order.customer}${phoneStr}\n🚚 การรับสินค้า: ${deliveryMethodLabel}${deliveryDateStr}\n📍 ที่อยู่จัดส่ง: ${order.address || '-'}\n💰 ยอดรวม: ฿${order.total.toLocaleString()}\n📌 สถานะ: ${statusLabel}\n\n📝 รายการสินค้า:\n${itemsText}`;
    
    // แนบข้อมูลการชำระเงินของร้าน ถ้ามีการตั้งค่าไว้
    if (sysSettings.storeBankName || sysSettings.storeBankAccount || sysSettings.storeAccountName) {
       textToShare += `\n\n💳 ช่องทางการชำระเงิน:\nธนาคาร: ${sysSettings.storeBankName || '-'}\nชื่อบัญชี: ${sysSettings.storeAccountName || '-'}\nเลขบัญชี: ${sysSettings.storeBankAccount || '-'}`;
    }
    
    const textArea = document.createElement("textarea");
    textArea.value = textToShare;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('คัดลอกข้อมูลออเดอร์แล้ว');
    } catch (err) {
      showToast('ไม่สามารถคัดลอกข้อมูลได้', 'error');
    }
    document.body.removeChild(textArea);
  };

  const toggleProductStatus = async (id: string, currentStatus: string) => {
    if (isProcessing) return;
    
    const targetProduct = products.find(p => p.id === id);
    if (!targetProduct) return;

    const newStatus = currentStatus === 'available' ? 'sold_out' : 'available';

    // ถ้ากดกลับมาขาย แต่สต็อกยังเป็น 0 ให้แจ้งเตือนแอดมินทันที
    if (newStatus === 'available' && targetProduct.stock <= 0) {
      showToast('กรุณาแก้ไขสต็อกให้มากกว่า 0 ก่อนกลับมาเปิดขาย', 'warning');
      return;
    }

    setIsProcessing(true); setIsLoading(true);
    
    const updatedProduct = { ...targetProduct, status: newStatus as 'available'|'sold_out', stock: newStatus === 'sold_out' ? 0 : targetProduct.stock };
    try {
      await callServerAPI('saveProduct', updatedProduct);
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
      showToast(`อัปเดตสถานะเป็น ${newStatus === 'available' ? 'พร้อมขาย' : 'สินค้าหมด'}`);
    } catch (err) {
      showToast('อัปเดตสถานะไม่สำเร็จ', 'error');
    }
    setIsProcessing(false); setIsLoading(false);
  };

  const handleExportCSV = () => {
    if(orders.length === 0) {
      showToast("ไม่มีข้อมูลคำสั่งซื้อให้ส่งออก", "error");
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Items', 'Total (THB)', 'Status'];
    const rows = orders.map(o => {
      const itemsStr = o.items.map(i => `${i.name} x${i.qty}`).join(' | ');
      const statusLabel = orderStatuses.find(s => s.id === o.status)?.label || o.status;
      return [o.id, o.orderDate, `"${o.customer}"`, `="${o.phone}"`, `"${itemsStr}"`, o.total, statusLabel];
    });
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const fileNameSafe = (sysSettings.storeName || 'Store').replace(/\s+/g, '_');
    link.setAttribute("download", `${fileNameSafe}_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("ส่งออกไฟล์ CSV สำเร็จ", "success");
  };

  const handleAddStatus = () => {
    const newId = `status_${Math.floor(Math.random() * 10000)}`;
    const newArr = [...orderStatuses, { id: newId, label: 'สถานะใหม่', color: 'slate' as StatusColor }];
    setOrderStatuses(newArr);
    saveSysSettingsToDB(newArr, undefined);
  };

  const handleUpdateStatus = (id: string, field: keyof OrderStatus, value: string) => {
    const newArr = orderStatuses.map(s => s.id === id ? { ...s, [field]: value } : s);
    setOrderStatuses(newArr);
    saveSysSettingsToDB(newArr, undefined);
  };

  const handleRemoveStatus = (id: string) => {
    const newArr = orderStatuses.filter(s => s.id !== id);
    setOrderStatuses(newArr);
    saveSysSettingsToDB(newArr, undefined);
  };

  const handleAddBank = () => {
    const newId = `bank_${Math.floor(Math.random() * 10000)}`;
    const newArr = [...bankOptions, { id: newId, name: 'ธนาคารใหม่' }];
    setBankOptions(newArr);
    saveSysSettingsToDB(undefined, newArr);
  };

  const handleUpdateBank = (id: string, newName: string) => {
    const newArr = bankOptions.map(b => b.id === id ? { ...b, name: newName } : b);
    setBankOptions(newArr);
    saveSysSettingsToDB(undefined, newArr);
  };

  const handleRemoveBank = (id: string) => {
    const newArr = bankOptions.filter(b => b.id !== id);
    setBankOptions(newArr);
    saveSysSettingsToDB(undefined, newArr);
  };

  const getColorClasses = (color: StatusColor | string) => {
    const map: Record<string, string> = {
      slate: 'bg-slate-100 text-slate-700 border-slate-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      rose: 'bg-rose-100 text-rose-700 border-rose-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return map[color] || map.slate;
  };

  const getStatusBadge = (statusId: string) => {
    const statusObj = orderStatuses.find(s => s.id === statusId);
    if (!statusObj) return <span className={getColorClasses('slate') + " px-2.5 py-1 rounded-md text-xs font-bold border"}>{statusId}</span>;
    return <span className={getColorClasses(statusObj.color) + " px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm"}>{statusObj.label}</span>;
  };

  const openEditOrderModal = (order: Order) => {
    setDraftOrder(JSON.parse(JSON.stringify(order)));
    openModal('edit_order');
  };

  const updateDraftOrderField = (field: keyof Order, value: any) => {
    setDraftOrder(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateDraftItemQty = (index: number, delta: number) => {
    setDraftOrder(prev => {
      if (!prev) return prev;
      const newItems = [...prev.items];
      const newQty = newItems[index].qty + delta;
      if (newQty <= 0) return prev; 
      newItems[index] = { ...newItems[index], qty: newQty };
      return { ...prev, items: newItems };
    });
  };

  const removeDraftItem = (index: number) => {
    setDraftOrder(prev => {
      if (!prev) return prev;
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems };
    });
  };

  const addProductToDraftOrder = (product: Product, variationName: string) => {
    setDraftOrder(prev => {
      if (!prev) return prev;
      const newItems = [...prev.items];
      const existingIdx = newItems.findIndex(item => item.id === product.id && item.variation === variationName);
      
      if (existingIdx >= 0) {
        newItems[existingIdx] = { ...newItems[existingIdx], qty: newItems[existingIdx].qty + 1 };
      } else {
        newItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          carryingFee: product.carryingFee || 0,
          qty: 1,
          variation: variationName
        });
        // ไม่ทำการบวกค่าส่ง Auto จากข้อมูลตัวสินค้าแล้ว เพราะเปลี่ยนไปใช้ Global Settings
        // ให้ Admin กรอกช่องค่าส่งในหน้า Draft เอง
      }
      return { ...prev, items: newItems };
    });
    openModal('edit_order');
  };

  const addDraftExpense = () => {
    setDraftOrder(prev => {
      if (!prev) return prev;
      return { ...prev, actualExpenses: [...(prev.actualExpenses || []), { name: '', amount: '' }] };
    });
  };

  const updateDraftExpense = (index: number, field: keyof ActualExpense, value: string) => {
    setDraftOrder(prev => {
      if (!prev) return prev;
      const newExpenses = [...(prev.actualExpenses || [])];
      newExpenses[index] = { ...newExpenses[index], [field]: field === 'amount' ? (value === '' ? '' : Number(value)) : value };
      return { ...prev, actualExpenses: newExpenses };
    });
  };

  const removeDraftExpense = (index: number) => {
    setDraftOrder(prev => {
      if (!prev) return prev;
      const newExpenses = (prev.actualExpenses || []).filter((_, i) => i !== index);
      return { ...prev, actualExpenses: newExpenses };
    });
  };

  const saveEditedOrder = async () => {
    if (!draftOrder || draftOrder.items.length === 0) {
      showToast("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ", "error");
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);

    const finalSubtotal = draftOrder.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const finalCarryingFee = draftOrder.items.reduce((sum, item) => sum + ((item.carryingFee || 0) * item.qty), 0);
    const finalTotal = finalSubtotal + finalCarryingFee + Number(draftOrder.shippingFee || 0) - Number(draftOrder.discount || 0);
    
    // Auto Generate ID if Admin filled Customer Name without ID
    let finalUserId = draftOrder.userId;
    if (!finalUserId && draftOrder.customer) {
        finalUserId = generateNextUserId();
    }

    const updatedOrder = { ...draftOrder, total: finalTotal, userId: finalUserId };
    
    try {
      await callServerAPI('saveOrder', updatedOrder);
      setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setDraftOrder(null);
      showToast("บันทึกการเปลี่ยนแปลงคำสั่งซื้อแล้ว");
      closeModal();
    } catch (err) {
      showToast("บันทึกข้อมูลคำสั่งซื้อไม่สำเร็จ", "error");
    }
    setIsProcessing(false); setIsLoading(false);
  };

  const addToCart = (product: Product, variationName = '') => {
    setCart(prev => {
      const totalInCart = prev.filter(item => item.product.id === product.id).reduce((sum, item) => sum + item.qty, 0);
      if (totalInCart >= product.stock) {
        showToast(`โควต้าเต็ม! สั่งซื้อ "${product.name}" ได้สูงสุด ${product.stock} ชิ้น`, "error");
        return prev;
      }
      if (variationName) {
        const variationData = product.variations.find(v => v.name === variationName);
        const variationInCart = prev.find(item => item.id === `${product.id}-${variationName}`)?.qty || 0;
        if (variationData && variationInCart >= variationData.stock) {
           showToast(`ขออภัย ตัวเลือก "${variationName}" หมดสต๊อกย่อยแล้ว`, "error");
           return prev;
        }
      } else {
        const currentQty = prev.find(item => item.id === `${product.id}-`)?.qty || 0;
        if (currentQty >= product.stock) return prev;
      }
      
      showToast(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
      const existing = prev.find(item => item.id === `${product.id}-${variationName}`);
      if (existing) {
        return prev.map(item => item.id === `${product.id}-${variationName}` ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: `${product.id}-${variationName}`, product, qty: 1, variation: variationName }];
    });
  };

  const updateCartQty = (cartItemId: string, delta: number) => {
    setCart(prev => {
      const targetItem = prev.find(item => item.id === cartItemId);
      if (!targetItem) return prev;
      const newQty = targetItem.qty + delta;
      if (newQty <= 0) return prev; 
      if (delta > 0) {
        const totalInCart = prev.filter(item => item.product.id === targetItem.product.id).reduce((sum, item) => sum + item.qty, 0);
        if (totalInCart >= targetItem.product.stock) {
           showToast(`โควต้าเต็ม! สั่งซื้อได้สูงสุด ${targetItem.product.stock} ชิ้น`, "error");
           return prev;
        }
        if (targetItem.variation) {
           const variationData = targetItem.product.variations.find(v => v.name === targetItem.variation);
           if (variationData && newQty > variationData.stock) {
             showToast(`ขออภัย ตัวเลือก "${targetItem.variation}" เหลือสต๊อกเพียง ${variationData.stock} ชิ้น`, "error");
             return prev;
           }
        }
      }
      return prev.map(item => item.id === cartItemId ? { ...item, qty: newQty } : item);
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const handleCancelOrder = async (orderId: string) => {
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);

    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel) {
      setIsProcessing(false); setIsLoading(false);
      return;
    }

    const updatedOrder = { ...orderToCancel, status: 'canceled' };

    try {
      // อัปเดตสถานะออเดอร์ในระบบหลังบ้าน
      await callServerAPI('saveOrder', updatedOrder);

      // คืนสต๊อกสินค้า
      let updatedProducts = [...products];
      for (const orderItem of orderToCancel.items) {
        updatedProducts = updatedProducts.map(p => {
          if (p.id === orderItem.id) {
            const newGlobalStock = p.stock + orderItem.qty;
            const newVariations = p.variations.map(v => 
              v.name === orderItem.variation ? { ...v, stock: v.stock + orderItem.qty } : v
            );
            return { 
              ...p, stock: newGlobalStock, variations: newVariations,
              status: newGlobalStock > 0 ? 'available' : p.status 
            };
          }
          return p;
        });
      }

      // Sync สินค้าที่คืนสต๊อกกลับไปยังหลังบ้าน
      for (const p of updatedProducts) {
        if (orderToCancel.items.some(item => item.id === p.id)) {
           await callServerAPI('saveProduct', p);
        }
      }

      setProducts(updatedProducts);
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      showToast('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว', 'warning');
    } catch (err) {
      showToast('ไม่สามารถยกเลิกคำสั่งซื้อได้', 'error');
    }
    
    setIsProcessing(false); setIsLoading(false);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);

    const orderToDelete = orders.find(o => o.id === orderId);
    if (!orderToDelete) {
      setIsProcessing(false); setIsLoading(false);
      return;
    }

    try {
      // คืนสต๊อกสินค้าถ้าออเดอร์ยังไม่ได้ถูกยกเลิกไปก่อนหน้า
      if (!['canceled', 'failed', 'refunded'].includes(orderToDelete.status)) {
        let updatedProducts = [...products];
        for (const orderItem of orderToDelete.items) {
          updatedProducts = updatedProducts.map(p => {
            if (p.id === orderItem.id) {
              const newGlobalStock = p.stock + orderItem.qty;
              const newVariations = p.variations.map(v => 
                v.name === orderItem.variation ? { ...v, stock: v.stock + orderItem.qty } : v
              );
              return { 
                ...p, stock: newGlobalStock, variations: newVariations,
                status: newGlobalStock > 0 ? 'available' : p.status 
              };
            }
            return p;
          });
        }
        // Sync สต๊อกสินค้าที่คืนแล้วไปยังหลังบ้าน
        for (const p of updatedProducts) {
          if (orderToDelete.items.some(item => item.id === p.id)) {
             await callServerAPI('saveProduct', p);
          }
        }
        setProducts(updatedProducts);
      }

      // ลบคำสั่งซื้อออกจากฐานข้อมูล
      await callServerAPI('deleteOrder', { id: orderId });
      
      setOrders(orders.filter(o => o.id !== orderId));
      showToast('ลบคำสั่งซื้อออกจากระบบแล้ว', 'success');
      closeModal();
    } catch (err) {
      showToast('ไม่สามารถลบคำสั่งซื้อได้', 'error');
    }
    
    setIsProcessing(false); setIsLoading(false);
  };

  const placeOrder = async (formDataObj: Record<string, any>) => {
    if (cart.length === 0) return;
    if (isProcessing) return;
    setIsProcessing(true); setIsLoading(true);

    const currentDate = new Date().toISOString().split('T')[0];
    
    // Auto Generate ID if Admin filled Customer Name without ID
    let finalUserId = formDataObj.userId || currentUser?.id || '';
    if (!finalUserId && formDataObj.customerName) {
        finalUserId = generateNextUserId();
    }

    const newOrder: Order = {
      id: generateNextOrderId(),
      userId: finalUserId,
      orderDate: currentDate,
      customer: formDataObj.customerName || currentUser?.name || 'ลูกค้า', 
      email: formDataObj.email || currentUser?.email || '',
      facebook: formDataObj.facebook || '', 
      phone: formDataObj.phone || '',
      bankName: '', bankAccount: '', address: formDataObj.address, googleMapLink: formDataObj.googleMapLink || '',
      deliveryMethod: formDataObj.deliveryMethod, deliveryDate: formDataObj.deliveryDate || '', note: '',
      items: cart.map(item => ({
        id: item.product.id, name: item.product.name, variation: item.variation,
        price: item.product.price, carryingFee: item.product.carryingFee || 0, qty: item.qty
      })),
      shippingFee: checkoutShippingFee, discount: 0, total: cartTotalCheckout, status: 'waiting_payment', actualExpenses: [],
      createdBy: isAdminOrStaff ? currentUser?.name : undefined
    };

    try {
      // เรียกใช้ระบบเข้าคิว/หักสต๊อกพร้อมกันแบบ Atomic ที่หลังบ้าน (เซิร์ฟเวอร์จะล็อคข้อมูลไว้เช็คสต๊อก)
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'processCheckout', payload: newOrder })
      });
      const data = await res.json();
      
      // ถ้าสถานะเป็น Error (ของหมดพอดีจากคิวที่ชนกัน)
      if (data.status !== 'success') {
         showToast(data.message, "error");
         
         // อัปเดตสินค้าในหน้าร้านเป็นข้อมูลจริง ณ วินาทีนั้นทันที
         if (data.updatedProducts && data.updatedProducts.length > 0) {
            const sanitizedProducts = data.updatedProducts.map((p: any) => ({
              ...p,
              stock: Number(p.stock) || 0,
              status: Number(p.stock) <= 0 ? 'sold_out' : p.status
            }));
            setProducts(sanitizedProducts);
         }
         setIsProcessing(false); setIsLoading(false);
         return;
      }

      // นำสินค้าที่หักสต๊อกลงตัวแล้วจากหลังบ้านมาอัปเดต state ตัวเอง (ประหยัดกว่าโหลดใหม่ทั้งหมด)
      const syncedProducts = data.updatedProducts || [];
      let nextProducts = [...products];
      for (const sp of syncedProducts) {
         const idx = nextProducts.findIndex(p => p.id === sp.id);
         if (idx !== -1) {
            sp.stock = Number(sp.stock) || 0;
            sp.status = sp.stock <= 0 ? 'sold_out' : sp.status;
            nextProducts[idx] = sp;
         }
      }
      
      // 🟢 นำเลขออเดอร์ของจริงที่เซิร์ฟเวอร์เจาะจงให้ มาแทนที่ตัวชั่วคราว
      if (data.newOrderId) {
        newOrder.id = data.newOrderId;
      }

      setProducts(nextProducts);
      setOrders([newOrder, ...orders]);
      setCart([]);
      showToast("สร้างคำสั่งซื้อสำเร็จ! โปรดชำระเงิน", "success");
      closeModal();
      setActiveTab('orders');
    } catch (err) {
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง", "error");
    }
    
    setIsProcessing(false); setIsLoading(false);
  };

  let draftSubtotal = 0;
  let draftCarryingFee = 0;
  let draftTotal = 0;
  if (draftOrder) {
    draftSubtotal = draftOrder.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    draftCarryingFee = draftOrder.items.reduce((sum, item) => sum + ((item.carryingFee || 0) * item.qty), 0);
    draftTotal = draftSubtotal + draftCarryingFee + Number(draftOrder.shippingFee || 0) - Number(draftOrder.discount || 0);
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const newProducts = [...products];
    const draggedItem = newProducts[draggedIdx];
    newProducts.splice(draggedIdx, 1);
    newProducts.splice(targetIndex, 0, draggedItem);
    setProducts(newProducts);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const openModal = (type: string, data: any = null) => {
    setModal({ isOpen: true, type, data });
    if (type === 'product_details' || type === 'product_details_for_order') {
      setSelectedVariation('');
      setSelectedImage(data?.imageUrl || '');
    }
    if (type === 'product_form') {
      setFormVariations(data?.variations ? data.variations.map((v: Variation) => ({...v})) : []);
      setPreviewUrl(data?.imageUrl || '');
      setPreviewUrls(data?.images || (data?.imageUrl ? [data.imageUrl] : []));
    }
    // หน่วงเวลาเล็กน้อยเพื่อให้ Element ถูก Render ก่อน แล้วค่อยใส่ Class โชว์ Animation
    setTimeout(() => setIsModalVisible(true), 10);
  };

  const closeModal = () => {
    // ให้แสดง Animation ปิดก่อนค่อยเคลียร์ข้อมูล
    setIsModalVisible(false);
    setTimeout(() => {
      setModal({ isOpen: false, type: '', data: null });
      setFormVariations([]);
      setPreviewUrl('');
      setPreviewUrls([]);
      setSelectedImage('');
      if (modal.type === 'edit_order') setDraftOrder(null);
    }, 300); // 300ms ตรงกับระยะเวลา Transition
  };

  const handleAddFormVariation = () => setFormVariations([...formVariations, { name: '', stock: 0 }]);
  const handleRemoveFormVariation = (index: number) => setFormVariations(formVariations.filter((_, i) => i !== index));
  const handleChangeFormVariation = (index: number, field: keyof Variation, value: string) => {
    const newVars = [...formVariations];
    newVars[index] = { ...newVars[index], [field]: field === 'stock' ? Number(value) : value };
    setFormVariations(newVars);
  };

  const uploadImageToDrive = async (file: File, folderId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = (e.target?.result as string).split(',')[1];
          const res = await callServerAPI('uploadImage', {
            filename: file.name,
            mimeType: file.type,
            base64: base64,
            folderId: folderId
          });
          // แปลง URL ให้เป็นรูปแบบ lh3.googleusercontent.com เพื่อให้โหลดรูปติด 100% พร้อมทำ Optimization ให้ไวขึ้น
          if (res.url && res.url.includes('id=')) {
            const fileId = res.url.split('id=')[1].split('&')[0];
            resolve(`https://lh3.googleusercontent.com/d/${fileId}=w1000`);
          } else {
            resolve(res.url);
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const processProductImageFiles = async (files: FileList | File[]) => {
    if (!sysSettings.driveProductFolderId) {
       showToast('กรุณาตั้งค่า Product Folder ID ในหน้าตั้งค่าระบบก่อน', 'warning');
       return;
    }
    setUploadProgress(10);
    try {
      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map(file => uploadImageToDrive(file, sysSettings.driveProductFolderId));
      const urls = await Promise.all(uploadPromises);
      
      setPreviewUrls(prev => {
          const next = [...prev, ...urls];
          if (!previewUrl && next.length > 0) setPreviewUrl(next[0]);
          return next;
      });
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
    } catch(e) {
      setUploadProgress(0);
      showToast('อัปโหลดรูปล้มเหลว โปรดตรวจสอบ Folder ID', 'error');
    }
  };

  const handleProfileImageFile = async (file: File) => {
    if (!sysSettings.driveSystemFolderId) {
       showToast('กรุณาตั้งค่า System Folder ID ในหน้าตั้งค่าระบบก่อน', 'warning');
       return;
    }
    setIsProcessing(true); setIsLoading(true);
    try {
      const url = await uploadImageToDrive(file, sysSettings.driveSystemFolderId);
      setProfileAvatarUrl(url);
      showToast('อัปโหลดรูปภาพสำเร็จ', 'success');
    } catch(e) {
      showToast('อัปโหลดรูปล้มเหลว โปรดตรวจสอบ Folder ID', 'error');
    }
    setIsProcessing(false); setIsLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processProductImageFiles(e.target.files);
    }
  };

  const handleProductImageDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsProductImgDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (validFiles.length > 0) {
        processProductImageFiles(validFiles);
      } else {
        showToast('กรุณาอัปโหลดเฉพาะไฟล์รูปภาพเท่านั้น', 'error');
      }
    }
  };

  const removePreviewImage = (indexToRemove: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleProfileImageDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsProfileImgDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleProfileImageFile(file);
    } else if (file) {
      showToast('กรุณาอัปโหลดเฉพาะไฟล์รูปภาพเท่านั้น', 'error');
    }
  };

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cleanVariations = formVariations.filter(v => v.name.trim() !== '');
    
    const newProduct: Product = {
      id: modal.data?.id || `P${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      carryingFee: Number(formData.get('carryingFee')),
      shippingFee: Number(formData.get('shippingFee')), 
      imageUrl: previewUrls.length > 0 ? previewUrls[0] : '', // ใช้รูปแรกเป็นรูปหน้าปก
      images: previewUrls,
      status: Number(formData.get('stock')) > 0 ? 'available' : 'sold_out',
      variations: cleanVariations,
      description: (formData.get('description') as string) || ''
    };
    saveProduct(newProduct);
  };

  const handleCheckoutSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    placeOrder(checkoutForm);
  };

  const mNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const dNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const formatDisplayDate = () => {
    if (dashDateMode === 'all') return 'ทุกเวลา';
    if (dashDateMode === 'day') return `${dashSelectedDate.getDate()} ${mNames[dashSelectedDate.getMonth()]} ${dashSelectedDate.getFullYear()}`;
    if (dashDateMode === 'week') {
      const currentDay = dashSelectedDate.getDay();
      const distMon = currentDay === 0 ? 6 : currentDay - 1;
      const s = new Date(dashSelectedDate); s.setDate(dashSelectedDate.getDate() - distMon);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      if (s.getMonth() === e.getMonth()) return `${s.getDate()} - ${e.getDate()} ${mNames[s.getMonth()]} ${s.getFullYear()}`;
      return `${s.getDate()} ${mNames[s.getMonth()]} - ${e.getDate()} ${mNames[e.getMonth()]} ${e.getFullYear()}`;
    }
    if (dashDateMode === 'month') return `${mNames[dashSelectedDate.getMonth()]} ${dashSelectedDate.getFullYear()}`;
    if (dashDateMode === 'year') return `ปี ${dashSelectedDate.getFullYear()}`;
    if (dashDateMode === 'range') {
      if(!dashDateRange.start && !dashDateRange.end) return 'ช่วงเวลา...';
      return `${dashDateRange.start ? new Date(dashDateRange.start).getDate() + ' ' + mNames[new Date(dashDateRange.start).getMonth()] : '?'} - ${dashDateRange.end ? new Date(dashDateRange.end).getDate() + ' ' + mNames[new Date(dashDateRange.end).getMonth()] : '?'}`;
    }
    return 'ทุกเวลา';
  };

  const changeCalViewDate = (dir: number) => {
    const d = new Date(calViewDate);
    if (calInnerMode === 'day') d.setMonth(d.getMonth() + dir);
    else if (calInnerMode === 'month') d.setFullYear(d.getFullYear() + dir);
    else if (calInnerMode === 'year') d.setFullYear(d.getFullYear() + (dir * 10));
    setCalViewDate(d);
  };

  const daysInMonth = new Date(calViewDate.getFullYear(), calViewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(calViewDate.getFullYear(), calViewDate.getMonth(), 1).getDay();
  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

  const isDateInSelectedWeek = (dateNum: number) => {
    if (dashDateMode !== 'week') return false;
    const d = new Date(calViewDate.getFullYear(), calViewDate.getMonth(), dateNum);
    const selD = dashSelectedDate;
    const distMon = selD.getDay() === 0 ? 6 : selD.getDay() - 1;
    const s = new Date(selD); s.setDate(s.getDate() - distMon); s.setHours(0,0,0,0);
    const e = new Date(s); e.setDate(s.getDate() + 6); e.setHours(23,59,59,999);
    return d >= s && d <= e;
  };

  const desktopNavItems = [
    isAdminOrStaff && { id: 'dashboard', label: 'แดชบอร์ด', icon: PieChart, activeClass: 'text-emerald-600' },
    { id: 'store', label: 'หน้าร้าน', icon: Store, activeClass: 'text-sky-600' },
    isAdminOrStaff && { id: 'products', label: 'คลังสินค้า', icon: Box, activeClass: 'text-blue-700' },
    isAdminOrStaff && { id: 'orders', label: 'คำสั่งซื้อ', icon: ClipboardList, activeClass: 'text-purple-700' },
    currentUser?.role === 'admin' && { id: 'users', label: 'จัดการผู้ใช้', icon: Users, activeClass: 'text-amber-600' },
    currentUser?.role === 'admin' && { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings, activeClass: 'text-slate-800' },
    !isAdminOrStaff && { id: 'my_orders', label: 'คำสั่งซื้อของฉัน', icon: ShoppingBag, activeClass: 'text-pink-600' },
  ].filter(Boolean) as any[];

  const mobileNavItems = [
    isAdminOrStaff && { id: 'dashboard', label: 'ภาพรวม', icon: PieChart, activeClass: 'text-emerald-600' },
    { id: 'store', label: 'หน้าร้าน', icon: Store, activeClass: 'text-sky-600' },
    isAdminOrStaff && { id: 'products', label: 'คลังสินค้า', icon: Box, activeClass: 'text-blue-600' },
    isAdminOrStaff && { id: 'orders', label: 'คำสั่งซื้อ', icon: ClipboardList, activeClass: 'text-purple-600' },
    !isAdminOrStaff && { id: 'my_orders', label: 'สั่งซื้อของฉัน', icon: ShoppingBag, activeClass: 'text-pink-600' },
    currentUser?.role === 'admin' && { id: 'users', label: 'ผู้ใช้', icon: Users, activeClass: 'text-amber-600' },
    { id: 'profile_menu', label: 'โปรไฟล์', icon: User, activeClass: 'text-fuchsia-600' },
  ].filter(Boolean) as any[];

  const desktopActiveIndex = desktopNavItems.findIndex(i => i.id === activeTab);
  const mobileActiveIndex = mobileNavItems.findIndex(i => 
    i.id === 'profile_menu' ? (isUserMenuOpen || activeTab === 'profile' || activeTab === 'settings') : (i.id === activeTab && !isUserMenuOpen)
  );

  // คำนวณความกว้าง Sidebar แบบ Real-time ตามเมาส์ (ล็อกค่าต่ำสุด 84 และสูงสุด 256)
  const sidebarBaseWidth = isSidebarHovered ? 256 : 84;
  const dynamicSidebarWidth = isDraggingSidebar 
    ? Math.max(84, Math.min(256, sidebarBaseWidth + sidebarDragOffset)) 
    : sidebarBaseWidth;
  // คำนวณเปอร์เซ็นต์ความคืบหน้าการลาก (0.0 ถึง 1.0) เพื่อนำไปผูกกับ Opacity/Transform แบบเนียนๆ
  const dragProgress = (dynamicSidebarWidth - 84) / (256 - 84);

  // --- RENDER SPLASH SCREEN WHILE INITIALIZING ---
  if (!isAppReady) {
    return (
      <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-400/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500 gap-6">
          <div className="p-6 bg-white rounded-[2rem] shadow-xl border border-slate-100 flex items-center justify-center">
             <ShoppingBag className="w-14 h-14 text-blue-600 animate-bounce" />
          </div>
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  // --- RENDER LOGIN IF NOT LOGGED IN ---
  if (!currentUser) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center relative font-sans selection:bg-blue-500/20 overflow-hidden">
        
        {/* Global Loading Overlay for Auth Actions */}
        {isLoading && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[200] flex items-center justify-center animate-in fade-in duration-200">
             <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-slate-100 animate-in zoom-in-95 duration-300">
               <div className="p-3 bg-blue-50 rounded-2xl">
                 <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
               </div>
               <div className="text-center">
                 <p className="text-sm font-black text-slate-800 tracking-wide">กำลังประมวลผล</p>
                 <p className="text-[11px] font-bold text-slate-400 mt-1">Please wait...</p>
               </div>
             </div>
          </div>
        )}

        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-400/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
          {toasts.map(toast => (
            <div key={toast.id} className={`animate-in slide-in-from-top-8 fade-in duration-500 ease-out flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] pointer-events-auto border backdrop-blur-xl w-fit max-w-full ${
              toast.type === 'error' ? 'bg-rose-50/90 border-rose-200 text-rose-700' : 'bg-emerald-50/90 border-emerald-200 text-emerald-700'
            }`}>
              {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0"/> : <CheckCircle className="w-5 h-5 flex-shrink-0"/>}
              <span className="font-bold text-sm">{toast.message}</span>
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white w-full max-w-md relative z-10 mx-4 my-auto flex-shrink-0 max-h-[95vh] overflow-y-auto hide-scrollbar">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4 shadow-sm border border-blue-100">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-wide">{sysSettings.storeName}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {authMode === 'login' ? 'เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อ' : authMode === 'register' ? 'สมัครสมาชิกใหม่' : 'รีเซ็ตรหัสผ่าน'}
            </p>
          </div>

          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in zoom-in-95 duration-700 ease-out">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Username</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ชื่อผู้ใช้งาน" required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors font-bold text-slate-800" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="รหัสผ่าน" required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors font-bold text-slate-800" 
                  />
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded-md checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer" />
                      <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors">ให้อยู่ในระบบต่อ</span>
                  </label>
                  <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">ลืมรหัสผ่าน?</button>
                </div>
              </div>
              <button type="submit" disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center gap-2 mt-4">
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> กำลังเข้าสู่ระบบ...</> : <>เข้าสู่ระบบ <ArrowRight className="w-5 h-5" /></>}
              </button>
              <div className="text-center pt-2">
                <span className="text-xs text-slate-500 font-medium">ยังไม่มีบัญชีใช่ไหม? </span>
                <button type="button" onClick={() => setAuthMode('register')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">สมัครสมาชิกที่นี่</button>
              </div>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in zoom-in-95 duration-700 ease-out">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">ชื่อ-นามสกุล</label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required placeholder="ระบุชื่อของคุณ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors font-bold text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">อีเมล</label>
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required placeholder="example@email.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors font-bold text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Username (ใช้เข้าระบบ)</label>
                <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required placeholder="ระบุชื่อผู้ใช้สำหรับเข้าระบบ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors font-bold text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Password</label>
                <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors font-bold text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Confirm Password</label>
                <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required placeholder="ยืนยันรหัสผ่านอีกครั้ง" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors font-bold text-slate-800" />
              </div>
              <button type="submit" disabled={isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all mt-4 flex justify-center items-center gap-2">
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> กำลังลงทะเบียน...</> : 'ลงทะเบียน'}
              </button>
              <button type="button" onClick={() => setAuthMode('login')} className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                ยกเลิกและกลับไปหน้าเข้าสู่ระบบ
              </button>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5 animate-in fade-in zoom-in-95 duration-700 ease-out">
              <p className="text-sm text-slate-600 font-medium text-center px-4">กรุณาระบุอีเมลของคุณ ระบบจะทำการส่งลิงก์เพื่อตั้งรหัสผ่านใหม่ไปให้</p>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ระบุอีเมลที่ลงทะเบียนไว้" required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors font-bold text-slate-800" 
                  />
                </div>
              </div>
              <button type="submit" disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center gap-2">
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> กำลังดำเนินการ...</> : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
              </button>
              <button type="button" onClick={() => setAuthMode('login')} className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                กลับไปหน้าเข้าสู่ระบบ
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-600 font-sans relative overflow-hidden flex flex-col md:flex-row selection:bg-blue-500/20 scroll-smooth">
      
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[200] flex items-center justify-center animate-in fade-in duration-200">
           <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-slate-100 animate-in zoom-in-95 duration-300">
             <div className="p-3 bg-blue-50 rounded-2xl">
               <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
             </div>
             <div className="text-center">
               <p className="text-sm font-black text-slate-800 tracking-wide">กำลังประมวลผล</p>
               <p className="text-[11px] font-bold text-slate-400 mt-1">Please wait...</p>
             </div>
           </div>
        </div>
      )}

      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-400/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-purple-400/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* --- TOAST CONTAINER --- */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
        {toasts.map(toast => (
          <div key={toast.id} className={`animate-in slide-in-from-top-8 fade-in duration-300 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] pointer-events-auto border backdrop-blur-xl w-fit max-w-full ${
            toast.type === 'error' ? 'bg-rose-50/90 border-rose-200 text-rose-700' : 
            toast.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-700' : 
            'bg-emerald-50/90 border-emerald-200 text-emerald-700'
          }`}>
            {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0"/> : toast.type === 'warning' ? <AlertCircle className="w-5 h-5 flex-shrink-0"/> : <CheckCircle className="w-5 h-5 flex-shrink-0"/>}
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          </div>
        ))}
      </div>

      <aside 
        onMouseDown={(e) => setSidebarDragStartX(e.clientX)}
        style={{ '--sidebar-width': `${dynamicSidebarWidth}px` } as React.CSSProperties}
        className={`w-full bg-white/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0 select-none cursor-default md:w-[var(--sidebar-width)] ${!isDraggingSidebar ? 'transition-[width] duration-300 ease-in-out' : ''} relative`}
      >
        <div className="p-4 md:p-0 border-b border-slate-200/80 flex items-center min-h-[88px] relative overflow-hidden">
          {/* Logo Container - ล็อคขนาดให้คงที่ 84px เสมอ ทำให้ไม่กระตุกตอนย่อ */}
          <div className="flex items-center justify-center md:w-[84px] h-full flex-shrink-0">
            <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
          </div>
          
          {/* Desktop Text Container - ใช้ Absolute & Fade เข้าออก ผูกกับระยะการลากเมาส์ (dragProgress) แบบเรียลไทม์ */}
          <div 
            style={isDraggingSidebar ? { opacity: dragProgress, transform: `translateX(${-16 * (1 - dragProgress)}px)` } : {}}
            className={`hidden md:flex flex-col justify-center absolute left-[84px] w-[150px] ${!isDraggingSidebar ? 'transition-all duration-300' : ''} ${!isDraggingSidebar && isSidebarHovered ? 'opacity-100 translate-x-0' : (!isDraggingSidebar ? 'opacity-0 -translate-x-4 pointer-events-none' : 'pointer-events-none')}`}
          >
            <h1 className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wide whitespace-normal break-words leading-tight line-clamp-2">
              {sysSettings.storeName}
            </h1>
            <div className="uppercase tracking-widest font-bold flex items-start text-[10px] md:text-xs text-blue-600/70 mt-0.5">
              <Sparkles className="w-3 h-3 flex-shrink-0 mr-1 mt-0.5" /> 
              <span className="whitespace-normal break-words leading-tight line-clamp-2">{sysSettings.storeSubtitle}</span>
            </div>
          </div>
          
          {/* Mobile Text Container */}
          <div className="md:hidden flex flex-col flex-1 ml-3">
             <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{sysSettings.storeName}</h1>
             <div className="uppercase tracking-widest font-bold flex items-start text-[10px] text-blue-600/70 mt-0.5"><Sparkles className="w-3 h-3 flex-shrink-0 mr-1 mt-0.5"/>{sysSettings.storeSubtitle}</div>
          </div>

          <button 
            onClick={() => openModal('cart')}
            className="md:hidden relative p-2.5 bg-sky-50 text-sky-600 rounded-full hover:bg-sky-100 transition-colors shadow-sm border border-sky-100 mr-2"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartStats.cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartStats.cartItemCount}
              </span>
            )}
          </button>
        </div>

        <nav className="hidden md:flex flex-1 p-4 flex-col overflow-y-auto overflow-x-hidden relative gap-2">
          {/* Desktop Liquid Indicator */}
          <div 
            className="absolute left-4 right-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] shadow-sm" 
            style={{ 
              height: '48px', 
              top: '16px',
              transform: `translateY(${desktopActiveIndex * 56}px)`,
              opacity: desktopActiveIndex >= 0 ? 1 : 0
            }} 
          />
          {desktopNavItems.map((item, idx) => {
             const isActive = desktopActiveIndex === idx;
             return (
               <button key={item.id} onClick={() => handleTabSwitch(item.id)} className={`relative z-10 flex items-center h-[48px] rounded-xl text-left ${!isDraggingSidebar ? 'transition-all duration-300' : ''} ${isSidebarHovered || isDraggingSidebar ? 'w-full px-3.5' : 'w-[52px] justify-center mx-auto'} ${isActive ? `${item.activeClass} font-bold` : 'text-slate-500 hover:text-slate-800 font-medium'}`}>
                  <div className={`p-1.5 rounded-lg transition-colors duration-500 flex-shrink-0 flex items-center justify-center ${isActive ? 'bg-white shadow-sm border border-slate-100' : 'bg-transparent'}`}>
                    <item.icon className={`w-5 h-5 transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${isActive ? 'scale-110' : 'scale-100'}`} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span 
                    style={isDraggingSidebar ? { opacity: dragProgress, maxWidth: `${dragProgress * 200}px`, marginLeft: `${dragProgress * 12}px` } : {}}
                    className={`whitespace-nowrap overflow-hidden ${!isDraggingSidebar ? 'transition-all duration-300' : ''} ${!isDraggingSidebar && isSidebarHovered ? 'max-w-[200px] ml-3 opacity-100' : (!isDraggingSidebar ? 'max-w-0 ml-0 opacity-0' : '')}`}
                  >
                    {item.label}
                  </span>
               </button>
             )
          })}
        </nav>

        <div className="relative hidden md:block border-t border-slate-200/80 h-[88px] flex-shrink-0">
          <div 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`absolute inset-0 m-4 flex items-center cursor-pointer hover:bg-slate-50 rounded-xl transition-colors`}
          >
            <div className="flex items-center justify-center w-[52px] h-full flex-shrink-0">
              <img src={currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"/>
            </div>
            {/* User Details - Fade In/Out ผูกกับระยะการลากเมาส์ */}
            <div 
              style={isDraggingSidebar ? { opacity: dragProgress, transform: `translateX(${-16 * (1 - dragProgress)}px)` } : {}}
              className={`absolute left-[60px] min-w-0 flex flex-col justify-center ${!isDraggingSidebar ? 'transition-all duration-300' : ''} ${!isDraggingSidebar && isSidebarHovered ? 'opacity-100 translate-x-0' : (!isDraggingSidebar ? 'opacity-0 -translate-x-4 pointer-events-none' : 'pointer-events-none')}`}
            >
              <p className="text-sm font-bold text-slate-800 truncate w-[140px]">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span> <span className="truncate">{currentUser.role.toUpperCase()}</span></p>
            </div>
          </div>

          {isUserMenuOpen && (
            <>
              {/* Desktop Popover Menu */}
              <div className="hidden md:block fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(false); }}></div>
              <div className={`hidden md:block absolute bottom-[calc(100%+0.5rem)] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 ${isSidebarHovered ? 'left-4 w-56' : 'left-4 w-48'}`}>
                <button 
                  onClick={() => { handleTabSwitch('profile'); setIsUserMenuOpen(false); }} 
                  className="w-full text-left px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-fuchsia-600 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4" /> โปรไฟล์
                </button>
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => { handleTabSwitch('settings'); setIsUserMenuOpen(false); }} 
                    className="w-full text-left px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> ตั้งค่าระบบ
                  </button>
                )}
                <div className="h-px bg-slate-100"></div>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-3.5 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* MOBILE POPOVER MENU (Dropdown style) */}
      {isUserMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-[95]" onClick={() => setIsUserMenuOpen(false)}></div>
          <div className="md:hidden fixed right-4 bottom-[calc(max(env(safe-area-inset-bottom),16px)+85px)] w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200 origin-bottom-right">
            <button 
              onClick={() => { handleTabSwitch('profile'); setIsUserMenuOpen(false); }} 
              className="w-full text-left px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-fuchsia-600 flex items-center gap-2.5 transition-colors"
            >
              <User className="w-4 h-4" /> จัดการโปรไฟล์
            </button>
            {currentUser.role === 'admin' && (
              <button 
                onClick={() => { handleTabSwitch('settings'); setIsUserMenuOpen(false); }} 
                className="w-full text-left px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors"
              >
                <Settings className="w-4 h-4" /> ตั้งค่าระบบ
              </button>
            )}
            <div className="h-px bg-slate-100"></div>
            <button 
              onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} 
              className="w-full text-left px-4 py-3.5 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
            >
              <LogOut className="w-4 h-4" /> ออกจากระบบ
            </button>
          </div>
        </>
      )}

      {/* MOBILE FLOATING NAV (Liquid Tab Bar Animation) */}
      <div className="md:hidden fixed z-[90] left-0 right-0 bottom-0 pb-[max(env(safe-area-inset-bottom),16px)] px-4 flex justify-center pointer-events-none transition-transform duration-300">
        <nav className="pointer-events-auto w-full max-w-[420px] bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[2rem] h-16 flex relative px-2">
          
          {/* Liquid Bubble Indicator */}
          <div 
            className="absolute top-0 bottom-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-0" 
            style={{ 
              width: `calc((100% - 16px) / ${mobileNavItems.length})`, 
              left: '8px',
              transform: `translateX(calc(${mobileActiveIndex} * 100%))`,
              opacity: mobileActiveIndex >= 0 ? 1 : 0
            }} 
          >
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full shadow-lg shadow-blue-500/40" />
          </div>

          {/* Nav Items */}
          {mobileNavItems.map(item => {
            const isActive = item.id === 'profile_menu' ? (isUserMenuOpen || activeTab === 'profile' || activeTab === 'settings') : (activeTab === item.id && !isUserMenuOpen);
            return (
              <button 
                key={item.id} 
                onClick={() => {
                  if (item.id === 'profile_menu') setIsUserMenuOpen(!isUserMenuOpen);
                  else handleTabSwitch(item.id);
                }} 
                className="relative z-10 flex-1 flex items-center justify-center h-full outline-none"
              >
                {/* Icon Container */}
                <div className={`transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] flex items-center justify-center ${isActive ? 'scale-125' : 'scale-100 hover:scale-110'}`}>
                  <item.icon 
                    className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400'}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <main ref={mainScrollRef} className="flex-1 overflow-y-auto z-10 w-full relative outline-none" onScroll={(e) => { 
        if (!lenisRef.current) {
          setIsDashScrolled(e.currentTarget.scrollTop > 20); 
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          if (scrollHeight - scrollTop <= clientHeight + 300) {
            setDashVisibleOrdersCount(prev => prev + 5);
          }
        }
      }}>
        <div className="w-full min-h-full flex flex-col">
          <div className="pb-28 md:pb-10 min-h-full flex flex-col w-full">
            
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out relative">
            <div className="sticky top-0 z-40 w-full flex flex-col pb-2 sm:pb-4">
              <div className={`absolute inset-0 bg-slate-50/95 backdrop-blur-xl border-b border-slate-200/80 transition-all duration-500 ease-out ${isDashScrolled ? 'opacity-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]' : 'opacity-0'}`}></div>
              <div className="relative z-10 w-full flex flex-col">
                <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 pb-2 sm:pt-5 sm:pb-3 flex items-center justify-between w-full">
                  <h2 className={`font-bold text-slate-800 tracking-wide flex items-center gap-2 sm:gap-3 whitespace-nowrap transition-all duration-300 ${isDashScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>
                    ภาพรวมธุรกิจ <span className={`text-emerald-500/40 hidden sm:inline transition-all duration-300 ${isDashScrolled ? 'text-lg' : 'text-xl sm:text-2xl'}`}>/ OVERVIEW</span>
                  </h2>
                </div>
                
                <div className={`w-full transition-all duration-300 ease-in-out ${isDashScrolled ? 'px-0' : 'px-4 sm:px-6 lg:px-8 xl:px-10'}`}>
                  <div className={`flex flex-col lg:flex-row w-full gap-3 bg-white/95 backdrop-blur-md p-2 sm:p-3 transition-all duration-300 ease-in-out ${isDashScrolled ? 'rounded-none border-y border-slate-200 shadow-none' : 'rounded-2xl border border-slate-200 shadow-[0_4px_15px_rgba(0,0,0,0.02)]'}`}>
                    
                    {/* Top Row: Search & Mobile Toggle */}
                    <div className="flex gap-2 w-full lg:flex-1">
                      <div className="relative flex-1">
                        <input type="text" placeholder="ค้นหา ID, ชื่อ, เบอร์..." value={dashSearchQuery} onChange={(e) => setDashSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-colors" />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                      <button 
                        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                        className={`lg:hidden flex-shrink-0 border rounded-xl px-3 flex items-center justify-center transition-colors shadow-sm ${
                          dashDateMode !== 'all' || dashStatusFilter !== 'all' || isMobileFiltersOpen
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Filter className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Filters Row (Collapsible on Mobile) */}
                    <div className={`flex-col sm:flex-row gap-2 w-full lg:w-auto ${isMobileFiltersOpen ? 'flex animate-in fade-in slide-in-from-top-2 duration-200' : 'hidden lg:flex'}`}>
                      
                      {/* Date Filter Group (Dropdown + Samsung Style Calendar UI) */}
                      <div className="relative flex items-center flex-1 sm:flex-none z-20">
                        
                        {/* Composite Dropdown + Button Design */}
                        <div 
                          className={`flex items-stretch w-full sm:w-[360px] border rounded-xl shadow-sm overflow-hidden transition-all ${
                            isDatePickerOpen ? 'border-purple-400 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          {/* Left Dropdown Section */}
                          <div className="relative flex items-center bg-slate-50/80 border-r border-slate-200 w-28 sm:w-32 flex-shrink-0 transition-colors hover:bg-slate-100">
                            <select
                              value={dashDateMode}
                              onChange={(e) => {
                                const mode = e.target.value as any;
                                setDashDateMode(mode);
                                
                                // ตั้งค่าเริ่มต้นเป็น "ปัจจุบัน" เสมอเมื่อเปลี่ยนโหมด
                                if (mode === 'day' || mode === 'week' || mode === 'month' || mode === 'year') {
                                  setDashSelectedDate(new Date());
                                  setCalViewDate(new Date()); // ให้ปฏิทินแสดงหน้าปัจจุบันด้วย
                                  setCalInnerMode(mode === 'year' ? 'year' : (mode === 'month' ? 'month' : 'day'));
                                }
                                
                                if (mode === 'all') {
                                  setDashDateRange({start:'', end:''});
                                }
                                
                                // ปิดป๊อปอัพเสมอเมื่อเลือกจาก dropdown (ให้คลิกเปิดเองที่ช่องขวา)
                                setIsDatePickerOpen(false); 
                              }}
                              className="appearance-none pl-9 pr-2 py-2.5 bg-transparent text-slate-700 font-bold text-sm outline-none cursor-pointer w-full h-full z-10"
                            >
                              <option value="all">ทุกเวลา</option>
                              <option value="day">วันที่</option>
                              <option value="week">สัปดาห์</option>
                              <option value="month">เดือน</option>
                              <option value="year">ปี</option>
                              <option value="range">ช่วงเวลา</option>
                            </select>
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none z-0" />
                          </div>

                          {/* Right Value Section */}
                          <div 
                            onClick={() => { if(dashDateMode !== 'all') setIsDatePickerOpen(!isDatePickerOpen); }}
                            className={`flex-1 flex items-center justify-between px-3 py-2.5 bg-white transition-colors min-w-0 ${dashDateMode === 'all' ? 'opacity-60 bg-slate-50 cursor-default' : 'cursor-pointer hover:bg-slate-50/50'}`}
                          >
                            <span className="text-sm font-medium text-slate-700 truncate pr-2">
                              {formatDisplayDate()}
                            </span>
                            
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {dashDateMode !== 'all' && (
                                <div 
                                  onClick={(e) => { e.stopPropagation(); setDashDateMode('all'); setDashDateRange({start:'', end:''}); setIsDatePickerOpen(false); }} 
                                  className="p-1 rounded-full text-slate-300 hover:bg-rose-100 hover:text-rose-500 transition-colors z-10"
                                  title="ล้างตัวกรอง"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <Calendar className={`w-4 h-4 ${dashDateMode === 'all' ? 'text-slate-300' : 'text-purple-500'}`} />
                            </div>
                          </div>
                        </div>

                        {/* Popover Calendar UI (No Left Menu) */}
                        {isDatePickerOpen && dashDateMode !== 'all' && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setIsDatePickerOpen(false)}></div>
                            <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-[320px] bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-slate-200 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-left sm:origin-top-right flex flex-col">
                              
                              {/* Calendar Grid */}
                              <div className="p-4 sm:p-5 relative bg-white min-h-[300px] flex flex-col">
                                    <div className="flex justify-between items-center mb-5">
                                      <button onClick={() => changeCalViewDate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ArrowLeft className="w-4 h-4"/></button>
                                      <button onClick={() => {
                                        if (calInnerMode === 'day') setCalInnerMode('month');
                                        else if (calInnerMode === 'month') setCalInnerMode('year');
                                      }} className="text-lg font-black text-slate-800 hover:text-emerald-600 transition-colors px-3 py-1 rounded-xl hover:bg-emerald-50">
                                        {calInnerMode === 'day' ? `${mNames[calViewDate.getMonth()]} ${calViewDate.getFullYear()}` : calInnerMode === 'month' ? `ปี ${calViewDate.getFullYear()}` : `${Math.floor(calViewDate.getFullYear()/10)*10} - ${Math.floor(calViewDate.getFullYear()/10)*10 + 9}`}
                                      </button>
                                      <button onClick={() => changeCalViewDate(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 rotate-180 transition-colors"><ArrowLeft className="w-4 h-4"/></button>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-center">
                                      {/* Grid: วันที่ และ สัปดาห์ */}
                                      {calInnerMode === 'day' && (
                                        <div className="grid grid-cols-7 text-center gap-y-1.5 relative">
                                          {dNames.map(d => <div key={d} className={`text-[11px] font-black mb-2 ${d==='อา'?'text-rose-400':d==='ส'?'text-blue-400':'text-slate-400'}`}>{d}</div>)}
                                          {calDays.map((d, i) => {
                                            if (d === null) return <div key={`empty-${i}`}></div>;
                                            const isSelected = (dashDateMode === 'day') && dashSelectedDate.getDate() === d && dashSelectedDate.getMonth() === calViewDate.getMonth() && dashSelectedDate.getFullYear() === calViewDate.getFullYear();
                                            const isWeekSelected = dashDateMode === 'week' && isDateInSelectedWeek(d);
                                            const isToday = d === new Date().getDate() && calViewDate.getMonth() === new Date().getMonth() && calViewDate.getFullYear() === new Date().getFullYear();
                                            
                                            const cellDateStr = `${calViewDate.getFullYear()}-${String(calViewDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                            const isRangeStart = dashDateMode === 'range' && dashDateRange.start === cellDateStr;
                                            const isRangeEnd = dashDateMode === 'range' && dashDateRange.end === cellDateStr;
                                            const isRangeSelected = isRangeStart || isRangeEnd;
                                            const isInRange = dashDateMode === 'range' && dashDateRange.start && dashDateRange.end && cellDateStr > dashDateRange.start && cellDateStr < dashDateRange.end;

                                            return (
                                              <div key={i} className={`flex justify-center items-center h-10 sm:h-11 relative cursor-pointer group ${dashDateMode === 'week' || dashDateMode === 'range' ? 'hover:bg-emerald-50/80 rounded-lg' : ''}`}
                                                   onClick={() => {
                                                     if (dashDateMode === 'range') {
                                                        if (!dashDateRange.start || (dashDateRange.start && dashDateRange.end)) {
                                                           setDashDateRange({ start: cellDateStr, end: '' });
                                                        } else {
                                                           if (cellDateStr < dashDateRange.start) {
                                                              setDashDateRange({ start: cellDateStr, end: dashDateRange.start });
                                                           } else {
                                                              setDashDateRange({ start: dashDateRange.start, end: cellDateStr });
                                                           }
                                                        }
                                                     } else {
                                                        setDashSelectedDate(new Date(calViewDate.getFullYear(), calViewDate.getMonth(), d));
                                                        if(dashDateMode === 'day' || dashDateMode === 'week') setIsDatePickerOpen(false);
                                                     }
                                                   }}>
                                                {(isWeekSelected || isInRange) && <div className="absolute inset-0 bg-emerald-100 rounded-xl -z-10 scale-95"></div>}
                                                {isRangeStart && dashDateRange.end && <div className="absolute inset-y-0 right-0 w-1/2 bg-emerald-100 -z-10"></div>}
                                                {isRangeEnd && dashDateRange.start && <div className="absolute inset-y-0 left-0 w-1/2 bg-emerald-100 -z-10"></div>}
                                                <div className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-sm transition-all z-10
                                                  ${(isSelected || isRangeSelected) ? 'bg-emerald-500 text-white font-black shadow-md scale-110' : 
                                                    (isWeekSelected || isInRange) ? 'text-emerald-700 font-bold' :
                                                    isToday ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-700 hover:bg-slate-100 font-medium'}`}>
                                                  {d}
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}

                                      {/* Grid: เดือน */}
                                      {calInnerMode === 'month' && (
                                        <div className="grid grid-cols-3 gap-3">
                                          {mNames.map((m, i) => {
                                            const isSelected = dashSelectedDate.getMonth() === i && dashSelectedDate.getFullYear() === calViewDate.getFullYear();
                                            return (
                                              <button key={m} onClick={() => {
                                                const newDate = new Date(calViewDate);
                                                newDate.setMonth(i);
                                                setCalViewDate(newDate);
                                                if (dashDateMode === 'month') {
                                                  setDashSelectedDate(newDate);
                                                  setIsDatePickerOpen(false);
                                                } else {
                                                  setCalInnerMode('day');
                                                }
                                              }} className={`py-4 sm:py-5 rounded-2xl text-sm font-bold transition-all ${isSelected && dashDateMode === 'month' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 hover:border-emerald-200'}`}>
                                                {m}
                                              </button>
                                            )
                                          })}
                                        </div>
                                      )}

                                      {/* Grid: ปี */}
                                      {calInnerMode === 'year' && (
                                        <div className="grid grid-cols-3 gap-3">
                                          {Array.from({length: 12}, (_, i) => Math.floor(calViewDate.getFullYear() / 10) * 10 - 1 + i).map(y => {
                                            const isSelected = dashSelectedDate.getFullYear() === y;
                                            return (
                                              <button key={y} onClick={() => {
                                                const newDate = new Date(calViewDate);
                                                newDate.setFullYear(y);
                                                setCalViewDate(newDate);
                                                if (dashDateMode === 'year') {
                                                  setDashSelectedDate(newDate);
                                                  setIsDatePickerOpen(false);
                                                } else {
                                                  setCalInnerMode('month');
                                                }
                                              }} className={`py-4 sm:py-5 rounded-2xl text-sm font-bold transition-all ${isSelected && dashDateMode === 'year' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 hover:border-emerald-200'}`}>
                                                {y}
                                              </button>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {dashDateMode === 'range' && (
                                      <div className="pt-5 mt-3 border-t border-slate-100">
                                        <button onClick={() => setIsDatePickerOpen(false)} className="w-full py-3 bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_4px_15px_rgba(16,185,129,0.3)] font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                                          <Check className="w-5 h-5"/> ยืนยันช่วงเวลา
                                        </button>
                                      </div>
                                    )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="relative flex-1 sm:w-40 flex-shrink-0 z-10">
                        <select value={dashStatusFilter} onChange={(e) => setDashStatusFilter(e.target.value)} className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 shadow-sm font-medium text-slate-700 cursor-pointer w-full transition-colors">
                          <option value="all">ทุกสถานะ</option>
                          {orderStatuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                        <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 xl:p-6 text-white shadow-[0_8px_30px_rgba(99,102,241,0.2)] relative overflow-hidden lg:col-span-3">
                  <div className="absolute -right-4 -top-4 opacity-20"><Banknote className="w-32 h-32"/></div>
                  <p className="text-indigo-100 font-bold mb-1 text-xs xl:text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4"/> ยอดขายรวม</p>
                  <h3 className="text-2xl xl:text-3xl font-bold tracking-tight relative z-10">฿{dashboardStats.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="bg-white rounded-3xl p-5 xl:p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-center lg:col-span-3">
                  <p className="text-slate-500 font-bold mb-1 text-xs xl:text-sm flex items-center gap-2"><Box className="w-4 h-4 text-blue-500"/> ค่าสินค้า (ต้นทุน)</p>
                  <h3 className="text-2xl xl:text-3xl font-bold text-slate-800">฿{dashboardStats.totalProductRevenue.toLocaleString()}</h3>
                </div>
                <div className="bg-white rounded-3xl p-5 xl:p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-center lg:col-span-2">
                  <p className="text-slate-500 font-bold mb-1 text-xs xl:text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-sky-500"/> ค่าหิ้ว+ส่ง (รายได้)</p>
                  <h3 className="text-2xl xl:text-3xl font-bold text-slate-800">฿{(dashboardStats.totalCarryingFee + dashboardStats.totalShippingFee).toLocaleString()}</h3>
                </div>
                <div className="bg-white rounded-3xl p-5 xl:p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-center lg:col-span-2">
                  <p className="text-slate-500 font-bold mb-1 text-xs xl:text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500"/> รายจ่ายจริง</p>
                  <h3 className="text-2xl xl:text-3xl font-bold text-rose-600">฿{dashboardStats.totalActualExpenses.toLocaleString()}</h3>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 xl:p-6 text-white shadow-[0_8px_30px_rgba(16,185,129,0.2)] relative overflow-hidden md:col-span-2 lg:col-span-2">
                  <div className="absolute -right-4 -top-4 opacity-20"><Award className="w-32 h-32"/></div>
                  <p className="text-emerald-100 font-bold mb-1 text-xs xl:text-sm flex items-center gap-2"><Activity className="w-4 h-4"/> กำไรสุทธิ</p>
                  <h3 className="text-3xl xl:text-4xl font-bold tracking-tight relative z-10">฿{((dashboardStats.totalCarryingFee + dashboardStats.totalShippingFee) - dashboardStats.totalActualExpenses).toLocaleString()}</h3>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-purple-500"/> จำนวนคำสั่งซื้อแยกตามสถานะ</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 sm:gap-4">
                  <div onClick={() => setDashStatusFilter('all')} className={`bg-white rounded-2xl p-4 border shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] cursor-pointer ${dashStatusFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-100 opacity-60 hover:opacity-100'}`}>
                    <div className="flex justify-between items-start mb-3"><span className="px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold border bg-slate-800 text-white border-slate-700">ทั้งหมด</span></div>
                    <div className="flex items-end justify-between mt-1">
                      <h4 className="text-3xl font-bold text-slate-800 leading-none">
                        {dashStatusFilter === 'all' ? (dashboardStats.totalBaseOrders || 0) : 0}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold mb-1">รายการ</span>
                    </div>
                  </div>
                  {orderStatuses.map((status) => (
                    <div key={status.id} onClick={() => setDashStatusFilter(status.id)} className={`bg-white rounded-2xl p-4 border shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] cursor-pointer ${dashStatusFilter === status.id ? 'border-emerald-400 ring-2 ring-emerald-400/20' : (dashStatusFilter !== 'all' ? 'border-slate-100 opacity-60 hover:opacity-100' : 'border-slate-100')}`}>
                      <div className="flex justify-between items-start mb-3"><span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold border ${getColorClasses(status.color)}`}>{status.label}</span></div>
                      <div className="flex items-end justify-between mt-1">
                        <h4 className="text-3xl font-bold text-slate-800 leading-none">
                          {dashStatusFilter === 'all' || dashStatusFilter === status.id ? (dashboardStats.statusCounts?.[status.id] || 0) : 0}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold mb-1">รายการ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-sm overflow-hidden flex flex-col h-[350px]">
                  <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3 flex-shrink-0"><Activity className="w-5 h-5 text-sky-500"/> โครงสร้างรายได้</h3>
                  <TableScrollWrapper className="space-y-4 overflow-y-auto flex-1 pr-1">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-blue-600">ค่าสินค้า</span><span className="text-slate-700">฿{dashboardStats.totalProductRevenue.toLocaleString()}</span></div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"><div className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" style={{width: `${dashboardStats.totalRevenue ? (dashboardStats.totalProductRevenue/dashboardStats.totalRevenue)*100 : 0}%`}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-emerald-600">ค่าหิ้ว</span><span className="text-slate-700">฿{dashboardStats.totalCarryingFee.toLocaleString()}</span></div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"><div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" style={{width: `${dashboardStats.totalRevenue ? (dashboardStats.totalCarryingFee/dashboardStats.totalRevenue)*100 : 0}%`}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-orange-600">ค่าจัดส่ง</span><span className="text-slate-700">฿{dashboardStats.totalShippingFee.toLocaleString()}</span></div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"><div className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000" style={{width: `${dashboardStats.totalRevenue ? (dashboardStats.totalShippingFee/dashboardStats.totalRevenue)*100 : 0}%`}}></div></div>
                    </div>
                  </TableScrollWrapper>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-sm overflow-hidden flex flex-col h-[350px]">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 flex-shrink-0"><Box className="w-5 h-5 text-rose-500"/> สินค้าใกล้หมดสต๊อก</h3>
                  <TableScrollWrapper className="space-y-3 overflow-y-auto flex-1 pr-1">
                    {products.filter(p => p.stock > 0 && p.stock <= 3).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-rose-50/40 rounded-xl border border-rose-100 hover:bg-rose-50 transition-colors cursor-pointer" onClick={() => {setActiveTab('products'); openModal('product_form', p)}}>
                        <div className="flex gap-3 items-center min-w-0">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-rose-100 overflow-hidden flex-shrink-0">
                            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); setZoomedImage(p.imageUrl); }}/> : <ImageIcon className="w-5 h-5 text-slate-300"/>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate max-w-[120px] sm:max-w-[180px]">{p.name}</p>
                            <p className="text-[11px] text-rose-500 font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-rose-100 w-fit mt-1">เหลือเพียง {p.stock} ชิ้น</p>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 bg-white text-rose-600 text-xs font-bold rounded-lg border border-rose-200 shadow-sm whitespace-nowrap flex-shrink-0">เติมสต๊อก</button>
                      </div>
                    ))}
                    {products.filter(p => p.stock > 0 && p.stock <= 3).length === 0 && <p className="text-slate-400 text-sm py-4 text-center">สต๊อกอยู่ในเกณฑ์ปกติ</p>}
                  </TableScrollWrapper>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-sm mb-6 flex flex-col h-fit max-h-[450px] overflow-hidden">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 flex-shrink-0"><Award className="w-5 h-5 text-amber-500"/> รายงานสินค้าขายดี (เรียงตามจำนวน)</h3>
                
                {/* Mobile View */}
                <TableScrollWrapper className="md:hidden flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
                  {dashboardStats.topProducts.map((p, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 ease-out" style={{animationDelay: `${Math.min(idx * 50, 500)}ms`, animationFillMode: 'both', animationDuration: '600ms'}}>
                      <div className="flex justify-between items-start">
                         <span className="font-bold text-slate-300 text-lg leading-none">#{idx + 1}</span>
                         <span className="font-bold text-emerald-600">฿{p.revenue.toLocaleString()}</span>
                      </div>
                      <p className="font-bold text-slate-700 text-sm leading-snug">{p.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-500">ขายแล้ว:</span>
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs">{p.qty} ชิ้น</span>
                      </div>
                    </div>
                  ))}
                  {dashboardStats.topProducts.length === 0 && <div className="text-center py-8 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-lg border border-dashed border-slate-200">ไม่มีข้อมูลการขายในช่วงเวลานี้</div>}
                </TableScrollWrapper>

                {/* Desktop View */}
                <TableScrollWrapper className="hidden md:block overflow-x-auto overflow-y-auto flex-1 pr-1">
                  <table className="w-full text-left relative min-w-[500px]">
                    <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                      <tr className="text-[10px] text-slate-400 uppercase shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                        <th className="pb-3 pt-2 pl-2 font-bold w-12 rounded-bl-xl">Rank</th>
                        <th className="pb-3 pt-2 font-bold min-w-[150px]">ชื่อสินค้า (Item Name)</th>
                        <th className="pb-3 pt-2 font-bold text-center w-28">ขายแล้ว (ชิ้น)</th>
                        <th className="pb-3 pt-2 pr-2 font-bold text-right w-36 rounded-br-xl">ยอดรวม (THB)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {dashboardStats.topProducts.map((p, idx) => (
                        <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors group animate-in fade-in slide-in-from-bottom-4 ease-out" style={{animationDelay: `${Math.min(idx * 80, 800)}ms`, animationFillMode: 'both', animationDuration: '1000ms'}}>
                          <td className="py-3.5 pl-2 font-bold text-slate-300 group-hover:text-amber-500 transition-colors">#{idx + 1}</td>
                          <td className="py-3.5 font-bold text-slate-700 truncate max-w-[150px] sm:max-w-[250px] lg:max-w-[300px]">{p.name}</td>
                          <td className="py-3.5 text-center font-mono font-bold text-blue-600">
                            <span className="bg-blue-50/80 px-3 py-1 rounded-lg border border-blue-100/50">{p.qty}</span>
                          </td>
                          <td className="py-3.5 pr-2 text-right font-bold text-emerald-600">฿{p.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                      {dashboardStats.topProducts.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-lg mt-2">ไม่มีข้อมูลการขายในช่วงเวลานี้</td></tr>}
                    </tbody>
                  </table>
                </TableScrollWrapper>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-4 sm:p-6 shadow-sm mb-6 flex flex-col h-auto">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4 flex-shrink-0">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-purple-500"/> รายการคำสั่งซื้อ</h3>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm">พบ {filteredDashOrders.length} รายการ</span>
                </div>
                
                {/* Mobile View (No inner scroll, expands fully, infinite scroll on main window) */}
                <div className="md:hidden flex flex-col gap-4 w-full">
                  {filteredDashOrders.slice(0, dashVisibleOrdersCount).map((order, idx) => {
                    const rowSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
                    const rowCarryingFee = order.items.reduce((sum, item) => sum + ((item.carryingFee || 0) * item.qty), 0);
                    return (
                      <div key={order.id} onClick={() => openEditOrderModal(order)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 ease-out cursor-pointer" style={{animationDelay: `${Math.min(idx * 50, 500)}ms`, animationFillMode: 'both', animationDuration: '600ms'}}>
                        <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                          <div>
                            <p className="font-mono text-blue-600 font-bold text-sm">{order.id}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] text-slate-400">{order.orderDate}</p>
                              {order.createdBy && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 font-medium">บันทึกโดย: {order.createdBy}</span>}
                            </div>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="font-bold text-slate-800 text-sm">{order.customer}</p>
                          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mt-0.5">
                            {order.phone && <a href={`tel:${formatPhone(order.phone)}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-1 hover:text-blue-600 hover:underline"><Phone className="w-3 h-3 text-slate-300"/> {formatPhone(order.phone)}</a>}
                            {order.facebook && <span className="flex items-center gap-1"><User className="w-3 h-3 text-slate-300"/> {order.facebook}</span>}
                            {order.email && <a href={`mailto:${order.email}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-1 hover:text-blue-600 hover:underline"><Mail className="w-3 h-3 text-slate-300"/> {order.email}</a>}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-100">
                           {order.items.map((item, i) => {
                             const product = products.find(p => p.id === item.id);
                             const itemImageUrl = product?.imageUrl;
                             return (
                             <div key={i} className="flex flex-col gap-2 border-b border-slate-200/50 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                               <div className="flex justify-between gap-3">
                                 <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center cursor-zoom-in" onClick={(e) => { if(itemImageUrl){ e.stopPropagation(); setZoomedImage(itemImageUrl); } }}>
                                      {itemImageUrl ? <img src={itemImageUrl} alt={item.name} className="w-full h-full object-cover hover:opacity-80 transition-opacity" /> : <ImageIcon className="w-5 h-5 text-slate-300"/>}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <span className="text-slate-700 font-medium line-clamp-2 leading-tight">{item.name}</span>
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                         <span className="text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">จำนวน: {item.qty}</span>
                                         {item.variation && <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">ตัวเลือก: {item.variation}</span>}
                                      </div>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                   <span className="font-bold text-slate-600 whitespace-nowrap">฿{(item.price * item.qty).toLocaleString()}</span>
                                   {item.carryingFee > 0 && <span className="text-[10px] text-emerald-600">หิ้ว +฿{(item.carryingFee * item.qty).toLocaleString()}</span>}
                                 </div>
                               </div>
                             </div>
                           )})}
                        </div>
                        <div className="text-[11px] text-slate-600 bg-orange-50/50 p-2.5 rounded-lg border border-orange-100/50">
                           <div className="flex items-center gap-2 mb-1.5">
                             <span className={`px-2 py-0.5 rounded font-bold w-fit tracking-wide text-[10px] ${order.deliveryMethod === 'pickup' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{order.deliveryMethod === 'pickup' ? 'นัดรับ' : 'จัดส่ง'}</span>
                             {order.deliveryDate && <span className="text-slate-500 font-medium flex items-center gap-1"><Calendar className="w-3 h-3"/> {order.deliveryDate}</span>}
                           </div>
                           <p className="flex items-start gap-1.5">
                             <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-0.5"/>
                             {order.googleMapLink ? (
                               <a href={order.googleMapLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="line-clamp-2 text-blue-600 hover:underline font-medium">{order.address || '-'}</a>
                             ) : (
                               <span className="line-clamp-2">{order.address || '-'}</span>
                             )}
                           </p>
                        </div>
                        <div className="flex flex-col gap-1.5 text-[11px] px-1">
                          <div className="flex gap-2">
                            <span className="text-slate-400 w-16 flex-shrink-0">ธนาคาร:</span>
                            <span className="text-slate-700 font-medium line-clamp-1">{order.bankName || '-'} {order.bankAccount ? `(${order.bankAccount})` : ''}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-slate-400 w-16 flex-shrink-0">หมายเหตุ:</span>
                            <span className="text-slate-700 line-clamp-2">{order.note || '-'}</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5 text-[11px] px-1">
                           <div className="flex justify-between text-slate-500"><span>ค่าสินค้า:</span> <span>฿{rowSubtotal.toLocaleString()}</span></div>
                           {rowCarryingFee > 0 && <div className="flex justify-between text-emerald-600"><span>ค่าหิ้วรวม:</span> <span>+฿{rowCarryingFee.toLocaleString()}</span></div>}
                           {Number(order.shippingFee) > 0 && <div className="flex justify-between text-orange-600"><span>ค่าจัดส่ง:</span> <span>+฿{Number(order.shippingFee).toLocaleString()}</span></div>}
                           {Number(order.discount) > 0 && <div className="flex justify-between text-rose-500"><span>ส่วนลด:</span> <span>-฿{Number(order.discount).toLocaleString()}</span></div>}
                           <div className="flex justify-between items-end mt-1 pt-2 border-t border-slate-100">
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">ยอดรวมสุทธิ</span>
                             <span className="text-lg font-black text-purple-600">฿{order.total.toLocaleString()}</span>
                           </div>
                           <div className={`grid gap-2 pt-3 mt-2 border-t border-slate-100/60 ${isAdminOrStaff ? 'grid-cols-3' : 'grid-cols-2'}`}>
                             <button onClick={(e) => handleShareOrder(e, order)} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full shadow-sm"><Share2 className="w-3.5 h-3.5"/> แชร์</button>
                             <button onClick={(e) => { e.stopPropagation(); openEditOrderModal(order); }} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full shadow-sm"><Edit className="w-3.5 h-3.5"/> แก้ไข</button>
                             {isAdminOrStaff && (
                                <button onClick={(e) => { e.stopPropagation(); openModal('delete_order_confirm', order); }} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors w-full shadow-sm"><Trash2 className="w-3.5 h-3.5"/> ลบ</button>
                             )}
                           </div>
                        </div>
                    </div>
                  )
                })}
                {filteredDashOrders.length === 0 && (
                     <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-200 border-dashed">
                       <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                       <p className="font-medium text-sm">ไม่พบคำสั่งซื้อ</p>
                     </div>
                  )}
                  {dashVisibleOrdersCount < filteredDashOrders.length && (
                    <div className="py-4 flex justify-center pb-8">
                       <div className="flex items-center gap-2 text-slate-400 text-xs font-bold animate-pulse">
                          <Activity className="w-4 h-4" /> กำลังโหลดข้อมูลเพิ่มเติม...
                       </div>
                    </div>
                  )}
                </div>

                {/* Desktop View (No vertical internal scroll) */}
                <TableScrollWrapper className="hidden md:block overflow-x-auto flex-1 rounded-xl w-full">
                  <table className="w-full min-w-[1100px] xl:min-w-[1250px] text-left border-collapse relative">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50/95 backdrop-blur-sm text-slate-500 text-[12px] uppercase tracking-wider font-bold shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                        <th className="px-6 py-4 pl-8 whitespace-nowrap rounded-bl-xl">Order ID</th>
                        <th className="px-6 py-4 min-w-[160px]">ลูกค้า / ติดต่อ</th>
                        <th className="px-6 py-4 min-w-[250px]">รายการสินค้า</th>
                        <th className="px-6 py-4 min-w-[200px]">จัดส่ง / สถานที่</th>
                        <th className="px-6 py-4 min-w-[140px]">สรุปยอด (THB)</th>
                        <th className="px-6 py-4 min-w-[140px]">ธนาคาร / บัญชี</th>
                        <th className="px-6 py-4 min-w-[160px]">หมายเหตุ</th>
                        <th className="px-6 py-4 pr-8 text-center whitespace-nowrap rounded-br-xl">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredDashOrders.slice(0, dashVisibleOrdersCount).map((order, idx) => {
                        const rowSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
                        const rowCarryingFee = order.items.reduce((sum, item) => sum + ((item.carryingFee || 0) * item.qty), 0);
                        
                        return (
                        <tr key={order.id} onClick={() => openEditOrderModal(order)} className="hover:bg-slate-50/70 transition-colors group cursor-pointer animate-in fade-in slide-in-from-bottom-4 ease-out" style={{animationDelay: `${Math.min(idx * 80, 800)}ms`, animationFillMode: 'both', animationDuration: '1000ms'}}>
                          <td className="px-6 py-5 pl-8 align-top whitespace-nowrap">
                            <p className="font-mono text-blue-600 font-bold group-hover:text-blue-700 text-sm">{order.id}</p>
                            {order.orderDate && <p className="text-[12px] text-slate-400 font-sans mt-1">{order.orderDate}</p>}
                            {order.createdBy && <p className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded w-fit mt-1.5 font-medium">บันทึกโดย: {order.createdBy}</p>}
                          </td>
                          <td className="px-6 py-5 align-top">
                            <p className="font-bold text-slate-800 mb-1.5 text-sm">{order.customer}</p>
                            <div className="flex flex-col gap-1 text-[12px] text-slate-500">
                              {order.facebook && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400"/> {order.facebook}</span>}
                              {order.phone && <a href={`tel:${formatPhone(order.phone)}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-1.5 hover:text-blue-600 hover:underline"><Phone className="w-3.5 h-3.5 text-slate-400"/> {formatPhone(order.phone)}</a>}
                              {order.email && <a href={`mailto:${order.email}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-1.5 hover:text-blue-600 hover:underline"><Mail className="w-3.5 h-3.5 text-slate-400"/> {order.email}</a>}
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="space-y-3">
                              {order.items.map((item, i) => {
                                const product = products.find(p => p.id === item.id);
                                const itemImageUrl = product?.imageUrl;
                                return (
                                <div key={i} className="flex justify-between items-start gap-3 text-[13px] border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                     <div className="w-10 h-10 rounded bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center cursor-zoom-in" onClick={(e) => { if(itemImageUrl){ e.stopPropagation(); setZoomedImage(itemImageUrl); } }}>
                                       {itemImageUrl ? <img src={itemImageUrl} alt={item.name} className="w-full h-full object-cover hover:opacity-80 transition-opacity" /> : <ImageIcon className="w-5 h-5 text-slate-300"/>}
                                     </div>
                                     <div className="flex flex-col gap-1 min-w-0">
                                       <span className="font-medium text-slate-700 line-clamp-2 leading-relaxed">{item.name}</span>
                                       {item.variation && <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded w-fit">ตัวเลือก: {item.variation}</span>}
                                     </div>
                                  </div>
                                  <span className="font-mono text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">x{item.qty}</span>
                                </div>
                              )})}
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wide ${
                                order.deliveryMethod === 'pickup' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {order.deliveryMethod === 'pickup' ? 'นัดรับ' : 'จัดส่ง'}
                              </span>
                              {order.deliveryDate && <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap"><Calendar className="w-3.5 h-3.5"/> {order.deliveryDate}</span>}
                            </div>
                            <div className="text-[12px] text-slate-600 flex items-start gap-1.5 max-w-[200px]">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                              {order.googleMapLink ? (
                                <a href={order.googleMapLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="line-clamp-2 leading-relaxed text-blue-600 hover:underline font-medium">{order.address || '-'}</a>
                              ) : (
                                <span className="line-clamp-2 leading-relaxed">{order.address || '-'}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="w-36 text-[12px] space-y-1.5 text-slate-500">
                              <p className="flex justify-between"><span>สินค้า:</span> <span>฿{rowSubtotal.toLocaleString()}</span></p>
                              {rowCarryingFee > 0 && <p className="flex justify-between"><span>หิ้ว:</span> <span className="text-emerald-600">+฿{rowCarryingFee.toLocaleString()}</span></p>}
                              {Number(order.shippingFee) > 0 && <p className="flex justify-between"><span>จัดส่ง:</span> <span className="text-orange-600">+฿{Number(order.shippingFee).toLocaleString()}</span></p>}
                              {Number(order.discount) > 0 && <p className="flex justify-between text-rose-500"><span>ส่วนลด:</span> <span>-฿{Number(order.discount).toLocaleString()}</span></p>}
                              <p className="flex justify-between font-bold text-slate-700 pt-2 mt-2 border-t border-slate-100 text-[13px]">
                                <span>สุทธิ:</span> <span className="text-purple-600 font-black">฿{order.total.toLocaleString()}</span>
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            {order.bankName || order.bankAccount ? (
                              <div className="text-[12px]">
                                {order.bankName && <p className="font-bold text-slate-700 mb-1">{order.bankName}</p>}
                                {order.bankAccount && <p className="text-slate-500 font-mono tracking-wide">{order.bankAccount}</p>}
                              </div>
                            ) : (
                              <span className="text-[12px] text-slate-400 italic">- รอชำระเงิน -</span>
                            )}
                          </td>
                          <td className="px-6 py-5 align-top">
                            {order.note ? (
                              <div className="text-[12px] text-slate-600 whitespace-pre-wrap leading-relaxed max-w-[220px]">
                                {order.note}
                              </div>
                            ) : (
                              <span className="text-[12px] text-slate-300 italic">-</span>
                            )}
                          </td>
                          <td className="px-6 py-5 pr-8 align-top text-center whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                  {filteredDashOrders.length === 0 && (
                     <div className="text-center py-20 text-slate-400">
                       <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                       <p className="font-medium">ไม่พบคำสั่งซื้อจากตัวกรองที่เลือก</p>
                     </div>
                  )}
                  {dashVisibleOrdersCount < filteredDashOrders.length && (
                    <div className="py-6 flex justify-center border-t border-slate-100 mt-4">
                       <div className="flex items-center gap-2 text-slate-400 text-sm font-bold animate-pulse">
                          <Activity className="w-4 h-4" /> กำลังโหลดข้อมูลเพิ่มเติม...
                       </div>
                    </div>
                  )}
                </TableScrollWrapper>
              </div>
            </div>
          </div>
        )}

        {/* STOREFRONT TAB */}
        {activeTab === 'store' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            
            <div className="sticky top-0 z-30 flex flex-col w-full bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              {/* Header Main */}
              <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 tracking-wide flex items-center gap-3">
                    <Store className="w-8 h-8 text-sky-500" /> หน้าร้าน 
                    <span className="text-sky-500/40 text-2xl">/ STOREFRONT</span>
                  </h2>
                  <p className="text-slate-500 mt-1 font-medium text-sm">เลือกซื้อสินค้าจาก {sysSettings.storeName}</p>
                </div>
                <div className="w-full md:w-72 relative md:mr-40 lg:mr-48 xl:mr-56">
                  <input type="text" placeholder="ค้นหาสินค้า..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 shadow-sm transition-all" />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* CAPSULE ANNOUNCEMENT (ใต้ขอบ Header) */}
            {sysSettings.isCapsuleActive && sysSettings.capsuleText && (
              <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-5 pb-2 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                <style>{`
                  @keyframes scroll-right-to-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                  }
                  .animate-capsule-marquee {
                    display: inline-block;
                    padding-left: 100%;
                    animation-name: scroll-right-to-left;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    will-change: transform;
                  }
                  .animate-capsule-marquee:hover {
                    animation-play-state: paused;
                  }
                  .capsule-mask {
                    -webkit-mask-image: linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent);
                    mask-image: linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent);
                  }
                `}</style>
                <div className="max-w-7xl mx-auto bg-white rounded-full shadow-[0_4px_15px_rgba(14,165,233,0.1)] border border-sky-100 px-5 sm:px-6 py-2.5 flex items-center overflow-hidden w-full transition-transform">
                  <span className="text-sky-500 font-black text-sm sm:text-base whitespace-nowrap flex-shrink-0 pr-2 sm:pr-3 tracking-wide bg-white z-10 relative">
                    📢 ประกาศ:
                  </span>
                  <div className="capsule-mask flex-1 overflow-hidden relative flex items-center w-full">
                    <div 
                      className="animate-capsule-marquee text-sky-600 font-bold text-sm sm:text-base whitespace-nowrap"
                      style={{ 
                        /* สูตรความเร็วคงที่: เวลาพื้นฐานวิ่งผ่านจอ (12 วิ) + (จำนวนตัวอักษร * 0.12 วินาที)
                          ทำให้ไม่ว่าข้อความจะสั้นหรือยาว สปีดการกวาดสายตาอ่านจะเท่ากันเสมอ
                        */
                        animationDuration: `${12 + ((typeof sysSettings.capsuleText === 'object' ? JSON.stringify(sysSettings.capsuleText) : String(sysSettings.capsuleText || '')).length * 0.12)}s` 
                      }}
                    >
                      &nbsp;{typeof sysSettings.capsuleText === 'object' ? JSON.stringify(sysSettings.capsuleText) : String(sysSettings.capsuleText || '')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`px-4 sm:px-6 lg:px-8 xl:px-10 ${sysSettings.isCapsuleActive && sysSettings.capsuleText ? 'pt-2' : 'pt-6'}`}>
              {filteredProducts.length === 0 ? (
                 <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                   <Search className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                   <p className="font-bold text-slate-500">ไม่พบสินค้าที่ตรงกับการค้นหา</p>
                 </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 sm:gap-5 md:gap-6">
                  {filteredProducts.map((product, idx) => {
                    const isSoldOut = product.status === 'sold_out' || product.stock <= 0;
                    return (
                    <div key={product.id} className="group bg-white/70 backdrop-blur-xl border border-white hover:border-sky-200 rounded-2xl p-3 sm:p-5 flex flex-col relative overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(14,165,233,0.12)] hover:-translate-y-1 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 ease-out" style={{ animationDelay: `${Math.min(idx * 80, 800)}ms`, animationFillMode: 'both', animationDuration: '1000ms' }}>
                      {isSoldOut && (
                        <div className="absolute top-6 -right-10 w-[150px] bg-rose-500/95 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-black tracking-widest py-1.5 text-center rotate-45 z-50 uppercase shadow-md pointer-events-none">SOLD OUT</div>
                      )}
                      <div className="flex-1 flex flex-col">
                        <div onClick={() => openModal('product_details', product)} className="cursor-pointer w-full aspect-square bg-slate-50 rounded-xl mb-3 sm:mb-4 flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-sky-50/50 transition-colors relative overflow-hidden">
                           <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-transparent to-transparent bg-[length:4px_4px]"></div>
                           {product.imageUrl ? (
                             <img src={product.imageUrl} alt={product.name} className={`w-full h-full object-cover z-10 transition-transform duration-500 cursor-zoom-in ${isSoldOut ? 'opacity-50 grayscale' : 'group-hover:scale-105'}`} onClick={(e) => { e.stopPropagation(); setZoomedImage(product.imageUrl); }} onError={(e) => {e.currentTarget.style.display='none'; if(e.currentTarget.nextSibling) (e.currentTarget.nextSibling as HTMLElement).style.display='block';}} />
                           ) : null}
                           <ImageIcon className={`w-10 h-10 sm:w-14 sm:h-14 z-10 ${product.imageUrl ? 'hidden' : 'block'} ${isSoldOut ? 'text-slate-300' : 'text-slate-300 group-hover:text-sky-300 group-hover:scale-110 transition-all duration-500'}`} strokeWidth={1.5} />
                        </div>
                        <h3 onClick={() => openModal('product_details', product)} className={`cursor-pointer hover:text-sky-600 transition-colors text-sm sm:text-lg font-bold mb-1 sm:mb-2 leading-snug line-clamp-2 ${isSoldOut ? 'text-slate-400' : 'text-slate-800'}`}>
                          {product.name}
                        </h3>
                        <div className="mt-auto pt-2 sm:pt-4 flex flex-wrap justify-between items-end mb-3 sm:mb-4 gap-2">
                          <span className="text-sky-600 font-extrabold text-lg sm:text-2xl tracking-tight">฿{Number(product.price).toLocaleString()}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-slate-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md w-fit">เหลือ {Number(product.stock).toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={() => openModal('product_details', product)} disabled={isSoldOut} className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all shadow-sm hover:shadow-[0_4px_15px_rgba(14,165,233,0.3)] flex items-center justify-center gap-1.5 sm:gap-2">
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
                        <span className="hidden sm:inline">{isSoldOut ? 'สินค้าหมด' : 'หยิบใส่ตะกร้า'}</span>
                        <span className="sm:hidden">{isSoldOut ? 'หมด' : 'ใส่ตะกร้า'}</span>
                      </button>
                    </div>
                  )})}
                </div>
              )}
            </div>
            
            <button onClick={() => openModal('cart')} className="hidden md:flex fixed top-8 right-10 bg-sky-500 hover:bg-sky-600 text-white px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgba(14,165,233,0.4)] hover:scale-105 transition-all duration-300 z-40 group items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                {cartStats.cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartStats.cartItemCount}
                  </span>
                )}
              </div>
              <span className="font-bold text-lg">฿{cartTotal.toLocaleString()}</span>
            </button>
          </div>
        )}

        {/* PRODUCTS TAB (ADMIN) */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-bold text-slate-800 tracking-wide">
                คลังสินค้า <span className="text-blue-600/40">/ CARGO</span>
              </h2>
              <div className="flex w-full sm:w-auto gap-3">
                <div className="relative flex-1 sm:w-64">
                  <input type="text" placeholder="ค้นหา รหัส, ชื่อสินค้า..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all" />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                <button onClick={() => openModal('product_form')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_8px_20px_rgba(37,99,235,0.25)] font-medium whitespace-nowrap">
                  <Plus className="w-5 h-5" /> <span className="hidden sm:inline">เพิ่มรายการใหม่</span>
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                  <PackageX className="w-16 h-16 mx-auto text-slate-300 mb-4 animate-pulse" />
                  <p className="tracking-wide font-medium">ไม่พบสินค้าในคลัง</p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 sm:gap-5 md:gap-6">
                  {filteredProducts.map((product, index) => {
                    const isSoldOut = product.status === 'sold_out' || product.stock <= 0;
                    const isDragged = draggedIdx === index;
                    const isHovered = dragOverIdx === index && draggedIdx !== index;
                    const dragDirection = draggedIdx !== null && dragOverIdx !== null ? (draggedIdx < dragOverIdx ? 'left' : 'right') : '';

                    let cardClasses = `group bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-3 sm:p-5 flex flex-col relative overflow-hidden transition-all duration-300 ease-out shadow-[0_8px_30px_rgba(0,0,0,0.04)] cursor-grab active:cursor-grabbing animate-in fade-in zoom-in-95 slide-in-from-bottom-8`;
                    if (isDragged) cardClasses += ` opacity-30 scale-90 border-dashed border-2 border-blue-400 shadow-none z-0`;
                    else if (isHovered) cardClasses += ` ${dragDirection === 'left' ? '-translate-x-3' : 'translate-x-3'} rotate-2 border-${dragDirection === 'left' ? 'r' : 'l'}-4 border-${dragDirection === 'left' ? 'r' : 'l'}-blue-500 shadow-xl z-20 scale-[0.98] bg-blue-50/90`;
                    else cardClasses += ` hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)] z-10`;

                    return (
                      <div 
                        key={product.id} draggable 
                        style={{ animationDelay: `${Math.min(index * 80, 800)}ms`, animationFillMode: 'both', animationDuration: '1000ms' }}
                        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setTimeout(() => setDraggedIdx(index), 0); }}
                        onDragOver={(e) => { e.preventDefault(); if (dragOverIdx !== index) setDragOverIdx(index); }}
                        onDragEnter={(e) => { e.preventDefault(); setDragOverIdx(index); }}
                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { if (dragOverIdx === index) setDragOverIdx(null); } }}
                        onDrop={(e) => { e.preventDefault(); handleDrop(index); }}
                        onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
                        className={cardClasses}
                      >
                        {isSoldOut && (
                          <div className="absolute top-6 -right-10 w-[150px] bg-rose-500/95 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-black tracking-widest py-1.5 text-center rotate-45 z-50 uppercase shadow-md pointer-events-none">SOLD OUT</div>
                        )}
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-2 left-2 z-20 text-slate-300 group-hover:text-blue-500 bg-white/80 backdrop-blur-sm rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none">
                          <GripHorizontal className="w-5 h-5" />
                        </div>
                        <div className={`flex-1 flex flex-col ${draggedIdx !== null ? 'pointer-events-none' : ''}`}>
                          <div onClick={() => openModal('product_details', product)} className="cursor-pointer w-full aspect-square bg-slate-50 rounded-xl mb-3 sm:mb-4 flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-blue-50/50 transition-colors relative overflow-hidden">
                             {product.imageUrl ? (
                               <img src={product.imageUrl} alt={product.name} className={`w-full h-full object-cover z-10 transition-transform duration-500 cursor-zoom-in ${isSoldOut ? 'opacity-50 grayscale' : 'group-hover:scale-105'}`} onClick={(e) => { e.stopPropagation(); setZoomedImage(product.imageUrl); }} onError={(e) => {e.currentTarget.style.display='none'; if(e.currentTarget.nextSibling) (e.currentTarget.nextSibling as HTMLElement).style.display='block';}} />
                             ) : null}
                             <ImageIcon className={`w-10 h-10 z-10 ${product.imageUrl ? 'hidden' : 'block'} ${isSoldOut ? 'text-slate-300' : 'text-slate-300 group-hover:text-blue-400'}`} strokeWidth={1.5} />
                          </div>
                          <p className="text-[10px] sm:text-xs text-slate-400 mb-1 font-mono tracking-wider">{product.id}</p>
                          <h3 onClick={() => openModal('product_details', product)} className={`cursor-pointer hover:text-blue-600 transition-colors text-sm sm:text-lg font-bold mb-1 sm:mb-2 leading-snug line-clamp-2 ${isSoldOut ? 'text-slate-400 line-through decoration-rose-300' : 'text-slate-800'}`}>
                            {product.name}
                          </h3>
                          <div className="mt-auto pt-2 flex flex-wrap justify-between items-end mb-2 sm:mb-3 gap-2">
                            <span className="text-blue-600 font-extrabold text-lg sm:text-2xl tracking-tight">฿{Number(product.price).toLocaleString()}</span>
                            <span className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border font-mono tracking-wide font-bold w-fit ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                              QTY: {Number(product.stock).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className={`border-t border-slate-100 pt-3 sm:pt-4 mt-auto flex flex-col gap-2 sm:gap-3 ${draggedIdx !== null ? 'pointer-events-none' : ''}`}>
                          <button onClick={() => toggleProductStatus(product.id, product.status)} className={`text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors border ${product.status === 'available' ? 'text-orange-600 bg-orange-50 border-orange-100 hover:bg-orange-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}>
                            {product.status === 'available' ? <span className="flex items-center gap-1.5"><PackageX className="w-3 h-3"/> ตั้งเป็นหมดชั่วคราว</span> : <span className="flex items-center gap-1.5"><Check className="w-3 h-3"/> กลับมาพร้อมขาย</span>}
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => openModal('product_form', product)} className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 text-slate-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors font-bold text-[10px] sm:text-xs"><Edit className="w-3.5 h-3.5" /> แก้ไข</button>
                            <button onClick={() => openModal('delete_confirm', product)} className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 text-slate-600 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors font-bold text-[10px] sm:text-xs"><Trash2 className="w-3.5 h-3.5" /> ลบ</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-bold text-slate-800 tracking-wide">
                คำสั่งซื้อ <span className="text-purple-600/40">/ ORDERS</span>
              </h2>
              <div className="flex w-full sm:w-auto gap-3">
                <div className="relative flex-1 sm:w-64">
                  <input type="text" placeholder="ค้นหา Order ID, ชื่อลูกค้า..." value={orderSearchQuery} onChange={(e) => setOrderSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all" />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                <button onClick={handleExportCSV} className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm whitespace-nowrap">
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>
            
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-6">

              {/* Mobile View */}
              <div className="md:hidden flex flex-col gap-4">
                {filteredOrders.map((order, idx) => {
                  const rowSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
                  const rowCarryingFee = order.items.reduce((sum, item) => sum + ((item.carryingFee || 0) * item.qty), 0);
                  return (
                    <div key={order.id} onClick={() => openEditOrderModal(order)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 ease-out cursor-pointer" style={{animationDelay: `${Math.min(idx * 50, 500)}ms`, animationFillMode: 'both', animationDuration: '600ms'}}>
                        <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                          <div>
                            <p className="font-mono text-blue-600 font-bold text-sm">{order.id}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] text-slate-400">{order.orderDate}</p>
                              {order.createdBy && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 font-medium">บันทึกโดย: {order.createdBy}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="font-bold text-slate-800 text-sm">{order.customer}</p>
                          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mt-0.5">
                            {order.phone && <a href={`tel:${formatPhone(order.phone)}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-1 hover:text-blue-600 hover:underline"><Phone className="w-3 h-3 text-slate-300"/> {formatPhone(order.phone)}</a>}
                            {order.facebook && <span className="flex items-center gap-1"><User className="w-3 h-3 text-slate-300"/> {order.facebook}</span>}
                            {order.email && <a href={`mailto:${order.email}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-1 hover:text-blue-600 hover:underline"><Mail className="w-3 h-3 text-slate-300"/> {order.email}</a>}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-100">
                           {order.items.map((item, i) => {
                             const product = products.find(p => p.id === item.id);
                             const itemImageUrl = product?.imageUrl;
                             return (
                             <div key={i} className="flex flex-col gap-2 border-b border-slate-200/50 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                               <div className="flex justify-between gap-3">
                                 <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center cursor-zoom-in" onClick={(e) => { if(itemImageUrl){ e.stopPropagation(); setZoomedImage(itemImageUrl); } }}>
                                      {itemImageUrl ? <img src={itemImageUrl} alt={item.name} className="w-full h-full object-cover hover:opacity-80 transition-opacity" /> : <ImageIcon className="w-5 h-5 text-slate-300"/>}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <span className="text-slate-700 font-medium line-clamp-2 leading-tight">{item.name}</span>
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                         <span className="text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">จำนวน: {item.qty}</span>
                                         {item.variation && <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">ตัวเลือก: {item.variation}</span>}
                                      </div>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                   <span className="font-bold text-slate-600 whitespace-nowrap">฿{(item.price * item.qty).toLocaleString()}</span>
                                   {item.carryingFee > 0 && <span className="text-[10px] text-emerald-600">หิ้ว +฿{(item.carryingFee * item.qty).toLocaleString()}</span>}
                                 </div>
                               </div>
                             </div>
                           )})}
                        </div>
                        <div className="text-[11px] text-slate-600 bg-orange-50/50 p-2.5 rounded-lg border border-orange-100/50">
                           <div className="flex items-center gap-2 mb-1.5">
                             <span className={`px-2 py-0.5 rounded font-bold w-fit tracking-wide text-[10px] ${order.deliveryMethod === 'pickup' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{order.deliveryMethod === 'pickup' ? 'นัดรับ' : 'จัดส่ง'}</span>
                             {order.deliveryDate && <span className="text-slate-500 font-medium flex items-center gap-1"><Calendar className="w-3 h-3"/> {order.deliveryDate}</span>}
                           </div>
                           <p className="flex items-start gap-1.5">
                             <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-0.5"/>
                             {order.googleMapLink ? (
                               <a href={order.googleMapLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="line-clamp-2 text-blue-600 hover:underline font-medium">{order.address || '-'}</a>
                             ) : (
                               <span className="line-clamp-2">{order.address || '-'}</span>
                             )}
                           </p>
                        </div>
                        <div className="flex flex-col gap-1.5 text-[11px] px-1">
                          <div className="flex gap-2">
                            <span className="text-slate-400 w-16 flex-shrink-0">ธนาคาร:</span>
                            <span className="text-slate-700 font-medium line-clamp-1">{order.bankName || '-'} {order.bankAccount ? `(${order.bankAccount})` : ''}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-slate-400 w-16 flex-shrink-0">หมายเหตุ:</span>
                            <span className="text-slate-700 line-clamp-2">{order.note || '-'}</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5 text-[11px] px-1">
                           <div className="flex justify-between text-slate-500"><span>ค่าสินค้า:</span> <span>฿{rowSubtotal.toLocaleString()}</span></div>
                           {rowCarryingFee > 0 && <div className="flex justify-between text-emerald-600"><span>ค่าหิ้วรวม:</span> <span>+฿{rowCarryingFee.toLocaleString()}</span></div>}
                           {Number(order.shippingFee) > 0 && <div className="flex justify-between text-orange-600"><span>ค่าจัดส่ง:</span> <span>+฿{Number(order.shippingFee).toLocaleString()}</span></div>}
                           {Number(order.discount) > 0 && <div className="flex justify-between text-rose-500"><span>ส่วนลด:</span> <span>-฿{Number(order.discount).toLocaleString()}</span></div>}
                           <div className="flex justify-between items-end mt-1 pt-2 border-t border-slate-100">
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">ยอดรวมสุทธิ</span>
                             <span className="text-lg font-black text-purple-600">฿{order.total.toLocaleString()}</span>
                           </div>
                           <div className={`grid gap-2 pt-3 mt-2 border-t border-slate-100/60 ${isAdminOrStaff ? 'grid-cols-3' : 'grid-cols-2'}`}>
                             <button onClick={(e) => handleShareOrder(e, order)} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full shadow-sm"><Share2 className="w-3.5 h-3.5"/> แชร์</button>
                             <button onClick={(e) => { e.stopPropagation(); openEditOrderModal(order); }} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full shadow-sm"><Edit className="w-3.5 h-3.5"/> แก้ไข</button>
                             {isAdminOrStaff && (
                                <button onClick={(e) => { e.stopPropagation(); openModal('delete_order_confirm', order); }} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors w-full shadow-sm"><Trash2 className="w-3.5 h-3.5"/> ลบ</button>
                             )}
                           </div>
                        </div>
                    </div>
                  )
                })}
                {filteredOrders.length === 0 && (
                   <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-200 border-dashed">
                     <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                     <p className="font-medium text-sm">ไม่พบคำสั่งซื้อที่ค้นหา</p>
                   </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
                <TableScrollWrapper className="overflow-x-auto w-full">
                  <table className="w-full min-w-[1300px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                        <th className="px-6 py-5 pl-8 whitespace-nowrap">Order ID</th>
                        <th className="px-6 py-5 min-w-[160px]">ลูกค้า / ติดต่อ</th>
                        <th className="px-6 py-5 min-w-[250px]">รายการสินค้า</th>
                        <th className="px-6 py-5 min-w-[200px]">จัดส่ง / สถานที่</th>
                        <th className="px-6 py-5 min-w-[140px]">สรุปยอด (THB)</th>
                        <th className="px-6 py-5 min-w-[140px]">ธนาคาร / บัญชี</th>
                        <th className="px-6 py-5 min-w-[100px] max-w-[140px]">หมายเหตุ</th>
                        <th className="px-6 py-5 text-center whitespace-nowrap min-w-[160px]">สถานะ</th>
                        <th className="px-6 py-5 pr-8 text-center whitespace-nowrap min-w-[140px]">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredOrders.map((order, idx) => {
                        const rowSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
                        const rowCarryingFee = order.items.reduce((sum, item) => sum + ((item.carryingFee || 0) * item.qty), 0);
                        return (
                        <tr key={order.id} onClick={() => openEditOrderModal(order)} className="hover:bg-slate-50/70 transition-colors group cursor-pointer animate-in fade-in slide-in-from-bottom-4 ease-out" style={{ animationDelay: `${Math.min(idx * 80, 800)}ms`, animationFillMode: 'both', animationDuration: '1000ms' }}>
                          <td className="px-6 py-5 pl-8 align-top whitespace-nowrap">
                            <p className="font-mono text-blue-600 font-bold group-hover:text-blue-700 text-sm">{order.id}</p>
                            {order.orderDate && <p className="text-[12px] text-slate-400 font-sans mt-1">{order.orderDate}</p>}
                            {order.createdBy && <p className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded w-fit mt-1.5 font-medium">บันทึกโดย: {order.createdBy}</p>}
                          </td>
                          <td className="px-6 py-5 align-top">
                            <p className="font-bold text-slate-800 mb-1.5 text-sm">{order.customer}</p>
                            <div className="flex flex-col gap-1 text-[12px] text-slate-500">
                              {order.facebook && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400"/> {order.facebook}</span>}
                              {order.phone && <a href={`tel:${formatPhone(order.phone)}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-1.5 hover:text-blue-600 hover:underline"><Phone className="w-3.5 h-3.5 text-slate-400"/> {formatPhone(order.phone)}</a>}
                              {order.email && <a href={`mailto:${order.email}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-1.5 hover:text-blue-600 hover:underline"><Mail className="w-3.5 h-3.5 text-slate-400"/> {order.email}</a>}
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="space-y-3">
                              {order.items.map((item, idx) => {
                                const product = products.find(p => p.id === item.id);
                                const itemImageUrl = product?.imageUrl;
                                return (
                                <div key={idx} className="flex justify-between items-start gap-3 text-[13px] border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                     <div className="w-10 h-10 rounded bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center cursor-zoom-in" onClick={(e) => { if(itemImageUrl){ e.stopPropagation(); setZoomedImage(itemImageUrl); } }}>
                                       {itemImageUrl ? <img src={itemImageUrl} alt={item.name} className="w-full h-full object-cover hover:opacity-80 transition-opacity" /> : <ImageIcon className="w-5 h-5 text-slate-300"/>}
                                     </div>
                                     <div className="flex flex-col gap-1 min-w-0">
                                       <span className="font-medium text-slate-700 line-clamp-2 leading-relaxed">{item.name}</span>
                                       {item.variation && <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded w-fit">ตัวเลือก: {item.variation}</span>}
                                     </div>
                                  </div>
                                  <span className="font-mono text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">x{item.qty}</span>
                                </div>
                              )})}
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wide ${order.deliveryMethod === 'pickup' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{order.deliveryMethod === 'pickup' ? 'นัดรับ' : 'จัดส่ง'}</span>
                              {order.deliveryDate && <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap"><Calendar className="w-3.5 h-3.5"/> {order.deliveryDate}</span>}
                            </div>
                            <div className="text-[12px] text-slate-600 flex items-start gap-1.5 max-w-[200px]">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                              {order.googleMapLink ? (
                                <a href={order.googleMapLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="line-clamp-2 leading-relaxed text-blue-600 hover:underline font-medium">{order.address || '-'}</a>
                              ) : (
                                <span className="line-clamp-2 leading-relaxed">{order.address || '-'}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="w-36 text-[12px] space-y-1.5 text-slate-500">
                              <p className="flex justify-between"><span>สินค้า:</span> <span>฿{rowSubtotal.toLocaleString()}</span></p>
                              {rowCarryingFee > 0 && <p className="flex justify-between"><span>หิ้ว:</span> <span className="text-emerald-600">+฿{rowCarryingFee.toLocaleString()}</span></p>}
                              {Number(order.shippingFee) > 0 && <p className="flex justify-between"><span>จัดส่ง:</span> <span className="text-orange-600">+฿{Number(order.shippingFee).toLocaleString()}</span></p>}
                              {Number(order.discount) > 0 && <p className="flex justify-between text-rose-500"><span>ส่วนลด:</span> <span>-฿{Number(order.discount).toLocaleString()}</span></p>}
                              <p className="flex justify-between font-bold text-slate-700 pt-2 mt-2 border-t border-slate-100 text-[13px]">
                                <span>สุทธิ:</span> <span className="text-purple-600 font-black">฿{order.total.toLocaleString()}</span>
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            {order.bankName || order.bankAccount ? (
                              <div className="text-[12px]">
                                {order.bankName && <p className="font-bold text-slate-700 mb-1">{order.bankName}</p>}
                                {order.bankAccount && <p className="text-slate-500 font-mono tracking-wide">{order.bankAccount}</p>}
                              </div>
                            ) : (
                              <span className="text-[12px] text-slate-400 italic">- รอชำระเงิน -</span>
                            )}
                          </td>
                          <td className="px-6 py-5 align-top">
                            {order.note ? (
                              <div className="text-[12px] text-slate-600 whitespace-pre-wrap leading-relaxed max-w-[140px] line-clamp-3">{order.note}</div>
                            ) : (
                              <span className="text-[12px] text-slate-300 italic">-</span>
                            )}
                          </td>
                          <td className="px-6 py-5 align-top text-center whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-5 pr-8 align-top text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={(e) => handleShareOrder(e, order)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 bg-slate-50 border border-slate-100 rounded-lg transition-colors shadow-sm" title="แชร์ข้อมูลออเดอร์"><Share2 className="w-4 h-4"/></button>
                              <button onClick={(e) => { e.stopPropagation(); openEditOrderModal(order); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 bg-slate-50 border border-slate-100 rounded-lg transition-colors shadow-sm" title="แก้ไขออเดอร์"><Edit className="w-4 h-4"/></button>
                              {isAdminOrStaff && (
                                <button onClick={(e) => { e.stopPropagation(); openModal('delete_order_confirm', order); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 bg-slate-50 border border-slate-100 rounded-lg transition-colors shadow-sm" title="ลบออเดอร์"><Trash2 className="w-4 h-4"/></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                  {filteredOrders.length === 0 && (
                     <div className="text-center py-16 text-slate-400">
                       <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                       <p className="font-medium">ไม่พบคำสั่งซื้อที่ค้นหา</p>
                     </div>
                  )}
                </TableScrollWrapper>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && currentUser.role === 'admin' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6">
              <h2 className="text-3xl font-bold text-slate-800 tracking-wide">ตั้งค่าระบบ <span className="text-slate-400">/ SYSTEM</span></h2>
            </div>
            
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-20 space-y-6">
              <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white space-y-5 relative overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Settings className="w-5 h-5"/></div>
                  <h3 className="text-lg font-black text-slate-800 tracking-wide">ตั้งค่าข้อมูลร้านและระบบ</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                  <div>
                    <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest mb-2 font-bold">ชื่อร้าน (Store Name)</label>
                    <input type="text" value={sysSettings.storeName} onChange={(e) => setSysSettings({...sysSettings, storeName: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest mb-2 font-bold">คำอธิบายร้าน (Subtitle)</label>
                    <input type="text" value={sysSettings.storeSubtitle} onChange={(e) => setSysSettings({...sysSettings, storeSubtitle: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pt-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Banknote className="w-5 h-5"/></div>
                  <h3 className="text-lg font-black text-slate-800 tracking-wide">บัญชีรับชำระเงินของร้าน</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
                  <div>
                    <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest mb-2 font-bold">ธนาคาร (Bank Name)</label>
                    <input type="text" value={sysSettings.storeBankName || ''} onChange={(e) => setSysSettings({...sysSettings, storeBankName: e.target.value})} placeholder="เช่น กสิกรไทย" className="w-full p-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest mb-2 font-bold">ชื่อบัญชี (Account Name)</label>
                    <input type="text" value={sysSettings.storeAccountName || ''} onChange={(e) => setSysSettings({...sysSettings, storeAccountName: e.target.value})} placeholder="เช่น บจก. ร้านค้า หรือ นาย ก." className="w-full p-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest mb-2 font-bold">เลขบัญชี (Account Number)</label>
                    <input type="text" value={sysSettings.storeBankAccount || ''} onChange={(e) => setSysSettings({...sysSettings, storeBankAccount: e.target.value})} placeholder="xxx-x-xxxxx-x" className="w-full p-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm" />
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pt-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Folder className="w-5 h-5"/></div>
                  <h3 className="text-lg font-black text-slate-800 tracking-wide">การจัดเก็บไฟล์ (Google Drive)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest mb-2 font-bold">Drive Folder ID (รูปสินค้า)</label>
                    <p className="text-[11px] text-slate-400 mb-2 font-medium">รหัสโฟลเดอร์สำหรับเก็บรูปภาพสินค้าภายในร้าน</p>
                    <input type="text" value={sysSettings.driveProductFolderId} onChange={(e) => setSysSettings({...sysSettings, driveProductFolderId: e.target.value})} placeholder="เช่น 1A2B3C4D5E6F..." className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest mb-2 font-bold">Drive Folder ID (ระบบ & โปรไฟล์)</label>
                    <p className="text-[11px] text-slate-400 mb-2 font-medium">รหัสโฟลเดอร์สำหรับเก็บโปรไฟล์ Admin และข้อมูลอื่นๆ</p>
                    <input type="text" value={sysSettings.driveSystemFolderId} onChange={(e) => setSysSettings({...sysSettings, driveSystemFolderId: e.target.value})} placeholder="เช่น 0J9I8H7G6F5E..." className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-inner" />
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pt-4 mt-4">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-xl"><MessageCircle className="w-5 h-5"/></div>
                  <h3 className="text-lg font-black text-slate-800 tracking-wide">การแจ้งเตือน (Telegram)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest mb-2 font-bold">Bot Token</label>
                    <p className="text-[11px] text-slate-400 mb-2 font-medium">ได้รับจากการสร้างบอทผ่าน @BotFather</p>
                    <input type="text" value={sysSettings.telegramBotToken || ''} onChange={(e) => setSysSettings({...sysSettings, telegramBotToken: e.target.value})} placeholder="เช่น 7xxxxxxxxx:AA..." className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest mb-2 font-bold">Chat ID</label>
                    <p className="text-[11px] text-slate-400 mb-2 font-medium">ไอดีห้องแชท หรือ Group (เช่น -100xxxxxxxxxx)</p>
                    <input type="text" value={sysSettings.telegramChatId || ''} onChange={(e) => setSysSettings({...sysSettings, telegramChatId: e.target.value})} placeholder="-100xxxxxxxxxx" className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all shadow-inner" />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                  <button onClick={handleSaveSettings} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all">
                    <Save className="w-4 h-4" /> บันทึกการตั้งค่า
                  </button>
                </div>
              </div>

              {/* ANNOUNCEMENT SETTINGS CARD */}
              <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white space-y-5 relative overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-xl"><Megaphone className="w-5 h-5"/></div>
                  <h3 className="text-lg font-black text-slate-800 tracking-wide">ตั้งค่าประกาศหน้าร้าน</h3>
                </div>
                
                {/* 1. Popup Announcement */}
                <div className="grid grid-cols-1 gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                     <label className="relative inline-flex items-center cursor-pointer">
                       <input type="checkbox" checked={!!sysSettings.isAnnouncementActive} onChange={(e) => setSysSettings({...sysSettings, isAnnouncementActive: e.target.checked})} className="sr-only peer" />
                       <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                       <span className="ml-3 text-sm font-bold text-slate-700">เปิดใช้งานป๊อปอัพประกาศกลางจอ (Popup Modal)</span>
                     </label>
                  </div>
                  {sysSettings.isAnnouncementActive && (
                    <div className="mt-2">
                      <label className="block text-slate-500 font-mono text-xs uppercase tracking-widest mb-2 font-bold">ข้อความบนป๊อปอัพ (รองรับการขึ้นบรรทัดใหม่)</label>
                      <TextAreaScrollable rows={4} value={typeof sysSettings.announcementText === 'object' ? JSON.stringify(sysSettings.announcementText) : String(sysSettings.announcementText || '')} onChange={(e) => setSysSettings({...sysSettings, announcementText: e.target.value})} placeholder="พิมพ์ข้อความที่ต้องการประกาศให้ลูกค้าทราบ..." className="w-full p-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-sm resize-none overflow-y-auto" />
                    </div>
                  )}
                </div>

                {/* 2. Capsule Announcement */}
                <div className="grid grid-cols-1 gap-4 bg-sky-50/40 p-5 rounded-2xl border border-sky-100 mt-2">
                  <div className="flex items-center gap-3">
                     <label className="relative inline-flex items-center cursor-pointer">
                       <input type="checkbox" checked={!!sysSettings.isCapsuleActive} onChange={(e) => setSysSettings({...sysSettings, isCapsuleActive: e.target.checked})} className="sr-only peer" />
                       <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                       <span className="ml-3 text-sm font-bold text-slate-700">เปิดใช้งานป้ายประกาศแคปซูลใต้ Header (ข้อความวิ่ง)</span>
                     </label>
                  </div>
                  {sysSettings.isCapsuleActive && (
                    <div className="mt-2">
                      <label className="block text-sky-700 font-mono text-xs uppercase tracking-widest mb-2 font-bold">ข้อความวิ่งในแคปซูล</label>
                      <input type="text" value={typeof sysSettings.capsuleText === 'object' ? JSON.stringify(sysSettings.capsuleText) : String(sysSettings.capsuleText || '')} onChange={(e) => setSysSettings({...sysSettings, capsuleText: e.target.value})} placeholder="เช่น โปรโมชั่นพิเศษ ส่งฟรีเมื่อซื้อครบ 500 บาท!" className="w-full p-4 bg-white border border-sky-200 rounded-xl text-slate-800 font-medium text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all shadow-sm" />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                  <button onClick={handleSaveSettings} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all">
                    <Save className="w-4 h-4" /> บันทึกการตั้งค่า
                  </button>
                </div>
              </div>

              {/* SHIPPING SETTINGS CARD */}
              <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white space-y-5 relative overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Truck className="w-5 h-5"/></div>
                  <h3 className="text-lg font-black text-slate-800 tracking-wide">ตั้งค่าการจัดส่งและการรับสินค้า</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50/30 p-5 rounded-2xl border border-orange-100">
                   <div className="space-y-4">
                      <h4 className="font-bold text-orange-700 flex items-center gap-2 border-b border-orange-200/50 pb-2"><Truck className="w-4 h-4"/> จัดส่งโดยขนส่ง (พัสดุ)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-orange-800 font-mono text-[10px] uppercase tracking-widest mb-1.5 font-bold">ค่าจัดส่งชิ้นแรก</label>
                          <div className="relative">
                            <input type="number" min="0" value={sysSettings.baseShippingFee} onChange={(e) => setSysSettings({...sysSettings, baseShippingFee: e.target.value})} className="w-full pl-3 pr-8 py-2.5 bg-white border border-orange-200 rounded-xl text-slate-800 font-bold text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm" />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">฿</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-orange-800 font-mono text-[10px] uppercase tracking-widest mb-1.5 font-bold">ชิ้นต่อไปบวกเพิ่ม</label>
                          <div className="relative">
                            <input type="number" min="0" value={sysSettings.addShippingFee} onChange={(e) => setSysSettings({...sysSettings, addShippingFee: e.target.value})} className="w-full pl-3 pr-8 py-2.5 bg-white border border-orange-200 rounded-xl text-slate-800 font-bold text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm" />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">฿</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-orange-800 font-mono text-[10px] uppercase tracking-widest mb-1.5 font-bold">รายละเอียด/หมายเหตุการจัดส่ง</label>
                        <TextAreaScrollable rows={3} value={sysSettings.shippingNote || ''} onChange={(e) => setSysSettings({...sysSettings, shippingNote: e.target.value})} placeholder="เช่น จัดส่งผ่าน Kerry Express ระยะเวลา 1-2 วัน" className="w-full p-3 bg-white border border-orange-200 rounded-xl text-slate-800 font-medium text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm resize-none overflow-y-auto" />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="font-bold text-emerald-700 flex items-center gap-2 border-b border-emerald-200/50 pb-2"><MapPin className="w-4 h-4"/> นัดรับด้วยตนเอง</h4>
                      <div>
                        <label className="block text-emerald-800 font-mono text-[10px] uppercase tracking-widest mb-1.5 font-bold">ค่าธรรมเนียมนัดรับ (ใส่ 0 คือฟรี)</label>
                        <div className="relative w-1/2">
                          <input type="number" min="0" value={sysSettings.pickupFee} onChange={(e) => setSysSettings({...sysSettings, pickupFee: e.target.value})} className="w-full pl-3 pr-8 py-2.5 bg-white border border-emerald-200 rounded-xl text-slate-800 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm" />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">฿</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-emerald-800 font-mono text-[10px] uppercase tracking-widest mb-1.5 font-bold">รายละเอียดสถานที่นัดรับ</label>
                        <TextAreaScrollable rows={3} value={sysSettings.pickupNote || ''} onChange={(e) => setSysSettings({...sysSettings, pickupNote: e.target.value})} placeholder="เช่น นัดรับได้ที่หน้าหมู่บ้าน..." className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-slate-800 font-medium text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm resize-none overflow-y-auto" />
                      </div>
                   </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                  <button onClick={handleSaveSettings} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all">
                    <Save className="w-4 h-4" /> บันทึกการตั้งค่า
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex flex-col h-[480px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-shrink-0">
                    <div className="flex items-center gap-3"><div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Tag className="w-5 h-5"/></div><h3 className="text-lg font-black text-slate-800">จัดการสถานะ</h3></div>
                    <button onClick={handleAddStatus} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4"/> เพิ่ม</button>
                  </div>
                  <TableScrollWrapper className="space-y-3 overflow-y-auto flex-1 pr-2 mt-4">
                    {orderStatuses.map((status) => (
                      <div key={status.id} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex-1 w-full">
                           <input type="text" value={status.label} onChange={(e) => handleUpdateStatus(status.id, 'label', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-purple-400" />
                        </div>
                        <div className="w-full sm:w-32">
                           <select value={status.color} onChange={(e) => handleUpdateStatus(status.id, 'color', e.target.value)} className={`w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none ${getColorClasses(status.color).split(' ')[1]}`}>
                             <option value="slate">เทา</option><option value="blue">น้ำเงิน</option><option value="emerald">เขียว</option><option value="amber">เหลือง</option><option value="rose">แดง</option><option value="purple">ม่วง</option>
                           </select>
                        </div>
                        <button onClick={() => handleRemoveStatus(status.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    ))}
                  </TableScrollWrapper>
                </div>

                <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex flex-col h-[480px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-shrink-0">
                    <div className="flex items-center gap-3"><div className="p-2 bg-sky-50 text-sky-600 rounded-xl"><Landmark className="w-5 h-5"/></div><h3 className="text-lg font-black text-slate-800">จัดการธนาคาร</h3></div>
                    <button onClick={handleAddBank} className="bg-sky-100 hover:bg-sky-200 text-sky-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4"/> เพิ่ม</button>
                  </div>
                  <TableScrollWrapper className="space-y-3 overflow-y-auto flex-1 pr-2 mt-4">
                    {bankOptions.map((bank) => (
                      <div key={bank.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex-1 w-full">
                           <input type="text" value={bank.name} onChange={(e) => handleUpdateBank(bank.id, e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-sky-400" />
                        </div>
                        <button onClick={() => handleRemoveBank(bank.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    ))}
                  </TableScrollWrapper>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB (ADMIN ONLY) */}
        {activeTab === 'users' && currentUser.role === 'admin' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-bold text-slate-800 tracking-wide">
                จัดการผู้ใช้ <span className="text-amber-500/40">/ USERS</span>
              </h2>
              <div className="flex w-full sm:w-auto gap-3">
                <div className="relative flex-1 sm:w-64">
                  <input type="text" placeholder="ค้นหาชื่อ, Username, ID..." value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 shadow-sm transition-all" />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                <button onClick={() => openModal('user_form')} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_8px_20px_rgba(245,158,11,0.25)] font-medium whitespace-nowrap">
                  <Plus className="w-5 h-5" /> <span className="hidden sm:inline">เพิ่มผู้ใช้</span>
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-6">

              {/* Mobile View */}
              <div className="md:hidden flex flex-col gap-4">
                {filteredUsers.map((user, idx) => (
                  <div key={user.id} onClick={() => openModal('user_form', user)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 ease-out cursor-pointer" style={{animationDelay: `${Math.min(idx * 50, 500)}ms`, animationFillMode: 'both', animationDuration: '600ms'}}>
                    <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=fdf4ff&color=c026d3&bold=true`} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{user.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">@{user.username} <span className="text-slate-300 mx-1">•</span> <span className="font-bold">{user.id}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-[11px] text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {user.email && <a href={`mailto:${user.email}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-2.5 hover:text-blue-600 hover:underline"><Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/> <span className="truncate">{user.email}</span></a>}
                      {user.phone && <a href={`tel:${formatPhone(user.phone)}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-2.5 hover:text-blue-600 hover:underline"><Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/> <span>{formatPhone(user.phone)}</span></a>}
                      {user.facebook && <span className="flex items-center gap-2.5"><User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/> <span className="truncate">{user.facebook}</span></span>}
                      {!user.email && !user.phone && !user.facebook && <span className="text-slate-400 italic">- ไม่มีข้อมูลติดต่อ -</span>}
                      
                      <div className="border-t border-slate-200/60 pt-2.5 mt-1.5">
                         <span className="font-bold text-slate-500 mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> ที่อยู่จัดส่งหลัก:</span>
                         <p className="line-clamp-2 pl-5">{user.address || <span className="text-slate-400 italic">- ไม่ระบุ -</span>}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end pt-1">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200' : user.role === 'staff' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {user.role}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); openModal('user_form', user); }} className="p-2.5 text-slate-400 hover:text-amber-600 bg-slate-50 border border-slate-100 hover:bg-amber-50 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); openModal('delete_user_confirm', user); }} disabled={user.id === currentUser.id} className="p-2.5 text-slate-400 hover:text-rose-600 bg-slate-50 border border-slate-100 hover:bg-rose-50 disabled:opacity-30 disabled:bg-transparent rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                   <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-200 border-dashed">
                     <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                     <p className="font-medium text-sm">ไม่พบผู้ใช้ที่ค้นหา</p>
                   </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
                <TableScrollWrapper className="overflow-x-auto w-full">
                  <table className="w-full min-w-[900px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                        <th className="px-6 py-5 pl-8 whitespace-nowrap w-24">User ID</th>
                        <th className="px-6 py-5 min-w-[200px]">ผู้ใช้งาน (User)</th>
                        <th className="px-6 py-5 min-w-[200px]">ข้อมูลติดต่อ</th>
                        <th className="px-6 py-5 min-w-[150px]">ที่อยู่จัดส่ง (หลัก)</th>
                        <th className="px-6 py-5 text-center w-32">สิทธิ์ (Role)</th>
                        <th className="px-6 py-5 pr-8 text-center whitespace-nowrap w-32">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredUsers.map((user, idx) => (
                        <tr key={user.id} onClick={() => openModal('user_form', user)} className="hover:bg-slate-50/70 transition-colors group cursor-pointer animate-in fade-in slide-in-from-bottom-4 ease-out" style={{ animationDelay: `${Math.min(idx * 80, 800)}ms`, animationFillMode: 'both', animationDuration: '1000ms' }}>
                          <td className="px-6 py-4 pl-8 align-top whitespace-nowrap font-mono text-slate-500 font-bold">{user.id}</td>
                          <td className="px-6 py-4 align-top">
                            <div className="flex items-center gap-3">
                              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=fdf4ff&color=c026d3&bold=true`} alt={user.name} className="w-10 h-10 rounded-full border border-slate-200 object-cover flex-shrink-0" />
                              <div>
                                <p className="font-bold text-slate-800">{user.name}</p>
                                <p className="text-[12px] text-slate-500 font-mono">@{user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="flex flex-col gap-1 text-[12px] text-slate-600">
                              {user.email && <a href={`mailto:${user.email}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-1.5 hover:text-blue-600 hover:underline"><Mail className="w-3.5 h-3.5 text-slate-400"/> {user.email}</a>}
                              {user.phone && <a href={`tel:${formatPhone(user.phone)}`} onClick={e=>e.stopPropagation()} className="flex items-center gap-1.5 hover:text-blue-600 hover:underline"><Phone className="w-3.5 h-3.5 text-slate-400"/> {formatPhone(user.phone)}</a>}
                              {user.facebook && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400"/> {user.facebook}</span>}
                              {!user.email && !user.phone && !user.facebook && <span className="text-slate-400 italic">- ไม่มีข้อมูล -</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <p className="text-[12px] text-slate-600 line-clamp-2 max-w-[200px]">{user.address || <span className="text-slate-400 italic">- ไม่ระบุ -</span>}</p>
                          </td>
                          <td className="px-6 py-4 align-top text-center">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200' : user.role === 'staff' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 pr-8 align-top text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={(e) => { e.stopPropagation(); openModal('user_form', user); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); openModal('delete_user_confirm', user); }} disabled={user.id === currentUser.id} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                         <tr><td colSpan={6} className="text-center py-16 text-slate-400 font-medium bg-slate-50/50">ไม่พบผู้ใช้ที่ค้นหา</td></tr>
                      )}
                    </tbody>
                  </table>
                </TableScrollWrapper>
              </div>
            </div>
          </div>
        )}

        {/* MY ORDERS TAB */}
        {activeTab === 'my_orders' && !isAdminOrStaff && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800 tracking-wide flex items-center gap-3">
                คำสั่งซื้อของฉัน <span className="text-pink-500/40 text-2xl hidden sm:inline">/ MY ORDERS</span>
              </h2>
            </div>
            
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-20 max-w-5xl mx-auto space-y-6">
              <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-sm border border-white">
                <div className="space-y-6">
                  {orders.filter(o => o.userId === currentUser?.id).length > 0 ? orders.filter(o => o.userId === currentUser?.id).map(order => (
                    <div key={order.id} onClick={() => openEditOrderModal(order)} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-pink-200 transition-colors flex flex-col gap-4 cursor-pointer">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200/60 pb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono font-black text-blue-600 text-lg">{order.id}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-slate-500 font-medium"><Calendar className="w-4 h-4 inline mr-1 text-slate-400"/>สั่งซื้อเมื่อ: {order.orderDate}</span>
                            {order.createdBy && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-bold">บันทึกโดย: {order.createdBy}</span>}
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex flex-col gap-1 items-start sm:items-end">
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5 font-bold uppercase tracking-widest">ยอดรวมสุทธิ</p>
                            <p className="text-xl font-black text-pink-600">฿{order.total.toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openModal('cancel_order_confirm', order); }}
                            disabled={!['waiting_payment', 'paid'].includes(order.status)}
                            className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors w-full sm:w-auto ${
                              ['waiting_payment', 'paid'].includes(order.status)
                                ? 'text-rose-500 bg-rose-50 hover:bg-rose-100 border-rose-100'
                                : 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed opacity-70'
                            }`}
                          >
                            ยกเลิกคำสั่งซื้อ
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {order.items.map((item, idx) => {
                          const product = products.find(p => p.id === item.id);
                          const itemImageUrl = product?.imageUrl;
                          return (
                          <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-sm bg-white p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden cursor-zoom-in" onClick={(e) => { if(itemImageUrl){ e.stopPropagation(); setZoomedImage(itemImageUrl); } }}>
                                {itemImageUrl ? <img src={itemImageUrl} alt={item.name} className="w-full h-full object-cover hover:opacity-80 transition-opacity" /> : <ImageIcon className="w-6 h-6 text-slate-300"/>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-slate-700 block mb-1 truncate">{item.name}</span>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                                  <span className="text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100">จำนวน: {item.qty} ชิ้น</span>
                                  {item.variation && <span className="text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100">ตัวเลือก: {item.variation}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-left sm:text-right flex flex-col gap-1 items-start sm:items-end flex-shrink-0 pl-14 sm:pl-0">
                              <span className="font-bold text-slate-800 text-base">฿{(item.price * item.qty).toLocaleString()}</span>
                              {item.carryingFee > 0 && <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ค่าหิ้ว +฿{(item.carryingFee * item.qty).toLocaleString()}</span>}
                            </div>
                          </div>
                        )})}
                      </div>
                      
                      {Number(order.shippingFee) > 0 && (
                         <div className="text-right text-sm font-bold text-orange-600 pt-2 flex justify-end gap-2 items-center">
                           <Truck className="w-4 h-4" /> ค่าจัดส่ง: ฿{Number(order.shippingFee).toLocaleString()}
                         </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-16">
                      <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold text-lg mb-4">ยังไม่มีประวัติการสั่งซื้อ</p>
                      <button onClick={() => setActiveTab('store')} className="px-6 py-2 bg-sky-50 text-sky-600 rounded-xl font-bold hover:bg-sky-100 transition-colors shadow-sm">ไปช้อปเลย!</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USER PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800 tracking-wide flex items-center gap-3">
                โปรไฟล์ของฉัน <span className="text-fuchsia-500/40 text-2xl hidden sm:inline">/ PROFILE</span>
              </h2>
              <button onClick={handleLogout} className="md:hidden flex items-center gap-2 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-rose-100">
                <LogOut className="w-4 h-4" /> ออกจากระบบ
              </button>
            </div>
            
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-20 max-w-5xl mx-auto space-y-6">
              
              {/* Profile Card & Edit Form */}
              <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-sm border border-white flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col items-center lg:w-1/3">
                  <label 
                    className={`relative cursor-pointer group mb-4 rounded-full transition-all duration-300 ${isProfileImgDragging ? 'scale-110 ring-4 ring-fuchsia-400 ring-offset-4 ring-offset-white' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsProfileImgDragging(true); }}
                    onDragLeave={() => setIsProfileImgDragging(false)}
                    onDrop={handleProfileImageDrop}
                  >
                    <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProfileImageFile(file);
                    }} />
                    <img src={profileAvatarUrl || currentUser.avatar} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover group-hover:opacity-80 transition-opacity"/>
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity flex-col gap-1">
                      <PenTool className="w-6 h-6 text-white"/>
                      <span className="text-[10px] text-white font-bold tracking-wider">ลากมาวาง</span>
                    </div>
                  </label>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">{currentUser.name}</h3>
                  <p className="text-sm text-slate-500 font-mono mb-4">@{currentUser.username}</p>
                  <span className="px-4 py-1.5 bg-fuchsia-50 text-fuchsia-600 rounded-xl text-xs font-bold border border-fuchsia-100 mb-6 text-center">
                    {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : currentUser.role === 'staff' ? 'เจ้าหน้าที่ (Staff)' : 'สมาชิกระดับทั่วไป (User)'}
                  </span>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="flex-1 space-y-5">
                  <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200/60 pb-3"><User className="w-4 h-4 text-fuchsia-500"/> ข้อมูลลูกค้า & ชำระเงิน</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 mb-1.5">ชื่อ-นามสกุล</label><input name="name" defaultValue={currentUser.name} required className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/10 transition-all font-bold text-slate-700" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1.5">อีเมล</label><input name="email" type="email" defaultValue={currentUser.email || ''} required className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/10 transition-all font-bold text-slate-700" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1.5">Facebook</label><input name="facebook" defaultValue={currentUser.facebook || ''} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/10 transition-all font-bold text-slate-700" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1.5">เบอร์โทรศัพท์ติดต่อ</label><input name="phone" defaultValue={currentUser.phone || ''} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/10 transition-all font-bold text-slate-700" /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">ธนาคาร</label>
                        <select name="bankName" defaultValue={currentUser.bankName || ''} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/10 transition-all font-bold text-slate-700">
                          <option value="">ไม่ระบุ</option>
                          {bankOptions.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                      </div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1.5">เลขบัญชี</label><input name="bankAccount" defaultValue={currentUser.bankAccount || ''} placeholder="xxx-x-xxxxx-x" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/10 transition-all font-bold text-slate-700" /></div>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200/60 pb-3"><Truck className="w-4 h-4 text-fuchsia-500"/> ข้อมูลจัดส่ง</h4>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">ที่อยู่สำหรับจัดส่ง (เริ่มต้น)</label>
                      <textarea name="address" rows={3} defaultValue={currentUser.address || ''} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/10 transition-all resize-none font-bold text-slate-700"></textarea>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(192,38,211,0.25)] transition-all flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลง
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}
        
          </div>
        </div>
      </main>

      {/* --- ANNOUNCEMENT POP-UP (GLOBAL LEVEL) --- */}
      {showAnnouncement && (
        <div 
          className={`fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ease-out ${isAnnouncementVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* เปลี่ยน transition-all เป็น transition ธรรมดา เพื่อไม่ให้มัน animate ความสูงตอนเนื้อหา/รูปภาพโหลดเสร็จ */}
          <div className={`bg-white rounded-3xl w-full max-w-3xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden transform transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAnnouncementVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Megaphone className="w-6 h-6 text-white animate-pulse" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">ประกาศจากทางร้าน</h3>
              </div>
              <button onClick={closeAnnouncement} className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            {/* Scrollable Content */}
            <TableScrollWrapper className="p-5 sm:p-8 overflow-y-auto flex-1">
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium text-sm sm:text-base">
                {typeof sysSettings.announcementText === 'object' ? JSON.stringify(sysSettings.announcementText) : String(sysSettings.announcementText || '')}
              </div>
            </TableScrollWrapper>
            
            {/* Footer Action */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
              <label className="flex items-center justify-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={dontShowToday} onChange={(e) => setDontShowToday(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-sky-500 checked:border-sky-500 transition-colors cursor-pointer" />
                  <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                </div>
                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">วันนี้ไม่ต้องแสดงอีก</span>
              </label>
              <button onClick={closeAnnouncement} className="w-full sm:w-auto px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-colors shadow-[0_4px_15px_rgba(14,165,233,0.3)]">รับทราบ</button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {modal.isOpen && (
        <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-3 sm:p-4 transition-opacity duration-300 ease-out ${isModalVisible ? 'opacity-100' : 'opacity-0'}`} onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <datalist id="existing-user-ids">
             {usersList.map(u => <option key={`mu-${u.id}`} value={u.id}>{u.name}</option>)}
             {Array.from(new Set(orders.filter(o => o.userId).map(o => o.userId))).filter(id => !usersList.find(u => u.id === id)).map(id => {
                const order = orders.find(o => o.userId === id);
                return <option key={`ou-${id}`} value={id}>{order?.customer}</option>;
             })}
          </datalist>
          <datalist id="existing-customer-names">
             {usersList.map(u => <option key={`muc-${u.id}`} value={u.name} />)}
             {Array.from(new Set(orders.map(o => o.customer))).filter(name => !usersList.find(u => u.name === name)).map((name, i) => (
                <option key={`ouc-${i}`} value={name} />
             ))}
          </datalist>
          {/* เปลี่ยน transition-all เป็น transition ธรรมดา เพื่อป้องกัน Layout Shift/Flicker บนมือถือ */}
          <div className={`bg-white shadow-2xl rounded-3xl w-full overflow-hidden flex flex-col transform transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isModalVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              ${(modal.type === 'product_details' || modal.type === 'product_details_for_order' || modal.type === 'product_form') ? 'max-w-4xl max-h-[90vh] md:max-h-[85vh] md:min-h-[500px]' : 
                (modal.type === 'store_for_order' ? 'max-w-4xl max-h-[85vh] md:h-[600px]' :
                (modal.type === 'edit_order' ? 'max-w-4xl max-h-[90vh]' :
                (modal.type === 'cart' ? 'max-w-xl max-h-[90vh]' : 
                ((modal.type === 'checkout' || modal.type === 'user_form') ? 'max-w-2xl max-h-[90vh]' : 'max-w-md max-h-[90vh]'))))} 
            `} onClick={(e) => e.stopPropagation()}>
            
            {/* EDIT ORDER MODAL */}
            {modal.type === 'edit_order' && draftOrder && (
              <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-slate-200 bg-white flex-shrink-0 gap-4 relative">
                  <div className="pr-24 sm:pr-0">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2"><Receipt className="w-6 h-6 text-purple-600" /> {isAdminOrStaff ? 'จัดการคำสั่งซื้อ' : 'รายละเอียดคำสั่งซื้อ'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-mono text-slate-500">ID: {draftOrder.id}</p>
                      {draftOrder.createdBy && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">บันทึกโดย: {draftOrder.createdBy}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="w-full sm:w-auto">
                      {isAdminOrStaff ? (
                        <select 
                          className={`border border-slate-200 text-sm font-bold rounded-xl block w-full sm:w-56 p-2.5 outline-none shadow-sm cursor-pointer ${getColorClasses(orderStatuses.find(s=>s.id === draftOrder.status)?.color || 'slate')}`}
                          value={draftOrder.status} onChange={(e) => updateDraftOrderField('status', e.target.value)}
                        >
                          {orderStatuses.map(s => <option key={s.id} value={s.id} className="text-slate-800 bg-white">{s.label}</option>)}
                        </select>
                      ) : (
                        <div className="block">{getStatusBadge(draftOrder.status)}</div>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 sm:static flex items-center gap-2 flex-shrink-0">
                      <button type="button" onClick={(e) => handleShareOrder(e, draftOrder as Order)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-full border border-blue-100 shadow-sm transition-colors" title="แชร์ออเดอร์">
                        <Share2 className="w-5 h-5"/>
                      </button>
                      <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full border border-slate-200 shadow-sm transition-colors"><X className="w-5 h-5"/></button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3"><User className="w-4 h-4 text-purple-500"/> ข้อมูลลูกค้า & ชำระเงิน</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">User ID</label><input type="text" list="existing-user-ids" value={draftOrder.userId || ''} onChange={(e) => handleDraftOrderCustomerChange('userId', e.target.value)} readOnly={!isAdminOrStaff} placeholder="รหัสลูกค้า" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" /></div>
                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">ชื่อลูกค้า</label><input type="text" list="existing-customer-names" value={draftOrder.customer || ''} onChange={(e) => handleDraftOrderCustomerChange('customer', e.target.value)} readOnly={!isAdminOrStaff} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" /></div>
                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">อีเมล</label><input type="email" value={draftOrder.email || ''} onChange={(e) => updateDraftOrderField('email', e.target.value)} readOnly={!isAdminOrStaff} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" /></div>
                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">เบอร์โทร</label><input type="text" value={draftOrder.phone || ''} onChange={(e) => updateDraftOrderField('phone', e.target.value)} readOnly={!isAdminOrStaff} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" /></div>
                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Facebook</label><input type="text" value={draftOrder.facebook || ''} onChange={(e) => updateDraftOrderField('facebook', e.target.value)} readOnly={!isAdminOrStaff} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" /></div>
                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">วันที่สั่งซื้อ</label><input type="date" value={draftOrder.orderDate || ''} onChange={(e) => updateDraftOrderField('orderDate', e.target.value)} readOnly={!isAdminOrStaff} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">ธนาคาร</label>
                          <select value={draftOrder.bankName || ''} onChange={(e) => updateDraftOrderField('bankName', e.target.value)} disabled={!isAdminOrStaff} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors">
                            <option value="">เลือกธนาคาร...</option>
                            {bankOptions.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                          </select>
                        </div>
                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">เลขบัญชี</label><input type="text" placeholder="xxx-x-xxxxx-x" value={draftOrder.bankAccount || ''} onChange={(e) => updateDraftOrderField('bankAccount', e.target.value)} readOnly={!isAdminOrStaff} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" /></div>
                      </div>
                    </div>

                    {/* Delivery Box */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3"><Truck className="w-4 h-4 text-purple-500"/> ข้อมูลจัดส่ง</h4>
                      <div className="flex gap-4">
                        <label className={`flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 has-[:checked]:bg-purple-50 has-[:checked]:border-purple-300 has-[:checked]:text-purple-700 transition-colors flex-1 ${!isAdminOrStaff && 'pointer-events-none opacity-80'}`}>
                          <input type="radio" name="draftMethod" checked={draftOrder.deliveryMethod === 'shipping'} onChange={() => updateDraftOrderField('deliveryMethod', 'shipping')} disabled={!isAdminOrStaff} className="w-4 h-4 text-purple-600" />
                          จัดส่งพัสดุ
                        </label>
                        <label className={`flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 has-[:checked]:bg-purple-50 has-[:checked]:border-purple-300 has-[:checked]:text-purple-700 transition-colors flex-1 ${!isAdminOrStaff && 'pointer-events-none opacity-80'}`}>
                          <input type="radio" name="draftMethod" checked={draftOrder.deliveryMethod === 'pickup'} onChange={() => updateDraftOrderField('deliveryMethod', 'pickup')} disabled={!isAdminOrStaff} className="w-4 h-4 text-purple-600" />
                          นัดรับเอง
                        </label>
                      </div>
                      <div><label className="text-xs font-bold text-slate-500 mb-1 block">ที่อยู่ / สถานที่นัดรับ</label><textarea rows={2} value={draftOrder.address || ''} onChange={(e) => updateDraftOrderField('address', e.target.value)} readOnly={!isAdminOrStaff} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors resize-none"></textarea></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">วันที่ต้องการ/นัดรับ</label><input type="date" value={draftOrder.deliveryDate || ''} onChange={(e) => updateDraftOrderField('deliveryDate', e.target.value)} readOnly={!isAdminOrStaff} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" /></div>
                        <div><label className="text-xs font-bold text-slate-500 mb-1 block">ลิงก์แผนที่ (ถ้ามี)</label><input type="url" placeholder="https://maps..." value={draftOrder.googleMapLink || ''} onChange={(e) => updateDraftOrderField('googleMapLink', e.target.value)} readOnly={!isAdminOrStaff} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" /></div>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-purple-500"/> รายการสินค้า ({draftOrder.items.length})</h4>
                      {isAdminOrStaff && <button onClick={() => openModal('store_for_order')} className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"><Plus className="w-4 h-4" /> เพิ่มสินค้า</button>}
                    </div>
                    {draftOrder.items.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center">
                        <PackageX className="w-10 h-10 text-slate-300 mb-2"/>
                        <p className="text-sm font-bold text-slate-400">ยังไม่มีสินค้าในออเดอร์นี้</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {draftOrder.items.map((item, idx) => {
                          const product = products.find(p => p.id === item.id);
                          const itemImageUrl = product?.imageUrl;
                          return (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4 hover:border-purple-200 transition-colors">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden shadow-sm">
                                {itemImageUrl ? (
                                  <img src={itemImageUrl} alt={item.name} className="w-full h-full object-cover cursor-zoom-in hover:opacity-80 transition-opacity" onClick={(e) => { e.stopPropagation(); setZoomedImage(itemImageUrl); }} />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-800 truncate">{item.name}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                                  {item.variation && <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium">ตัวเลือก: <span className="font-bold">{item.variation}</span></span>}
                                  <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">฿{item.price.toLocaleString()}</span>
                                  {item.carryingFee > 0 && <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ค่าหิ้ว +{item.carryingFee.toLocaleString()}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 self-end sm:self-auto flex-shrink-0">
                              {isAdminOrStaff ? (
                                <>
                                  <div className="flex items-center gap-1 bg-white rounded-lg p-1.5 border shadow-sm">
                                    <button onClick={() => updateDraftItemQty(idx, -1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"><Minus className="w-4 h-4" /></button>
                                    <span className="w-8 text-center font-black text-sm text-slate-700">{item.qty}</span>
                                    <button onClick={() => updateDraftItemQty(idx, 1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"><Plus className="w-4 h-4" /></button>
                                  </div>
                                  <button onClick={() => removeDraftItem(idx)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                                </>
                              ) : (
                                <div className="bg-white rounded-lg px-3 py-1.5 border shadow-sm font-black text-sm text-slate-700">จำนวน: {item.qty}</div>
                              )}
                            </div>
                          </div>
                        )})}
                      </div>
                    )}
                  </div>

                  {/* Actual Expenses - Hidden for Users */}
                  {isAdminOrStaff && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2"><Banknote className="w-4 h-4 text-rose-500"/> รายจ่ายจริง (ต้นทุน)</h4>
                      <button type="button" onClick={addDraftExpense} className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"><Plus className="w-4 h-4" /> เพิ่มรายจ่าย</button>
                    </div>
                    {(!draftOrder.actualExpenses || draftOrder.actualExpenses.length === 0) ? (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center">
                        <Minus className="w-8 h-8 text-slate-300 mb-2"/>
                        <p className="text-sm font-bold text-slate-400">ยังไม่มีการบันทึกรายจ่ายจริง</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {draftOrder.actualExpenses.map((exp, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl border border-slate-100 sm:border-transparent">
                            <input type="text" placeholder="ชื่อรายการ เช่น ค่าจัดส่งจริง" value={exp.name} onChange={(e) => updateDraftExpense(idx, 'name', e.target.value)} className="w-full sm:flex-1 p-2.5 bg-white sm:bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-rose-400 focus:bg-white transition-colors" />
                            <div className="flex items-center gap-2 w-full sm:w-40">
                               <input type="number" placeholder="จำนวนเงิน" value={exp.amount === 0 ? '' : exp.amount} onChange={(e) => updateDraftExpense(idx, 'amount', e.target.value)} className="w-full p-2.5 bg-white sm:bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-rose-400 focus:bg-white transition-colors text-right font-bold text-rose-600" />
                               <span className="text-sm font-bold text-slate-500 hidden sm:block">฿</span>
                            </div>
                            <button type="button" onClick={() => removeDraftExpense(idx)} className="self-end sm:self-auto p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 sm:border-transparent bg-white sm:bg-transparent"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        ))}
                        <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                          <p className="text-sm font-bold text-slate-600 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">รวมรายจ่ายจริง: <span className="text-rose-600 font-black ml-2 text-lg">฿{(draftOrder.actualExpenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0).toLocaleString()}</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  {/* Summary Box */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-blue-600/80 uppercase tracking-wider mb-1">ค่าสินค้า</span>
                      <span className="text-xl font-black text-blue-700">฿{draftSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider mb-1">ค่าหิ้วรวม</span>
                      <span className="text-xl font-black text-emerald-700">฿{draftCarryingFee.toLocaleString()}</span>
                    </div>
                    <div className="bg-orange-50/80 p-4 rounded-2xl border border-orange-200 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-orange-600/80 uppercase tracking-wider mb-2">ค่าจัดส่ง</span>
                      <div className="flex items-center gap-1.5"><span className="text-sm font-bold text-orange-700">฿</span>
                        {isAdminOrStaff ? (
                          <input type="number" min="0" value={draftOrder.shippingFee === 0 ? '' : draftOrder.shippingFee} placeholder="0" onChange={(e) => updateDraftOrderField('shippingFee', e.target.value)} className="w-full bg-white border border-orange-200 rounded-lg px-2 py-1.5 text-sm font-black text-orange-700 outline-none focus:border-orange-400 shadow-sm"/>
                        ) : (
                          <span className="text-xl font-black text-orange-700">{Number(draftOrder.shippingFee || 0).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-rose-600/80 uppercase tracking-wider mb-2">ส่วนลด</span>
                      <div className="flex items-center gap-1.5"><span className="text-sm font-bold text-rose-700">-฿</span>
                        {isAdminOrStaff ? (
                          <input type="number" min="0" value={draftOrder.discount === 0 ? '' : draftOrder.discount} placeholder="0" onChange={(e) => updateDraftOrderField('discount', e.target.value)} className="w-full bg-white border border-rose-200 rounded-lg px-2 py-1.5 text-sm font-black text-rose-700 outline-none focus:border-rose-400 shadow-sm"/>
                        ) : (
                          <span className="text-xl font-black text-rose-700">{Number(draftOrder.discount || 0).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Net Total */}
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 rounded-2xl shadow-[0_8px_20px_rgba(124,58,237,0.2)] border border-purple-500 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-8 opacity-20"><Banknote className="w-32 h-32" /></div>
                    <div className="relative z-10 flex flex-col">
                      <span className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-0.5">ยอดรวมสุทธิ (Net Total)</span>
                    </div>
                    <div className="relative z-10 text-right">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight">฿{draftTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2"><PenTool className="w-4 h-4 text-purple-500"/> หมายเหตุ (Note)</h4>
                    <textarea rows={3} placeholder="ไม่มีหมายเหตุ" value={draftOrder.note || ''} onChange={(e) => updateDraftOrderField('note', e.target.value)} readOnly={!isAdminOrStaff} className="w-full p-3 bg-yellow-50/50 border border-yellow-200 rounded-xl text-sm outline-none focus:border-yellow-400 focus:bg-yellow-50 transition-colors resize-none leading-relaxed text-slate-700"></textarea>
                  </div>
                </div>
                
                <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex justify-between items-center gap-3 flex-shrink-0">
                  {isAdminOrStaff ? (
                    <button type="button" onClick={() => openModal('delete_order_confirm', draftOrder)} className="px-4 py-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold transition-colors flex items-center gap-2"><Trash2 className="w-5 h-5 hidden sm:block"/> <span className="text-sm">ลบออเดอร์</span></button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => openModal('cancel_order_confirm', draftOrder)} 
                      disabled={!['waiting_payment', 'paid'].includes(draftOrder.status)}
                      className={`px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 ${
                        ['waiting_payment', 'paid'].includes(draftOrder.status)
                          ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                          : 'text-slate-400 bg-slate-100 cursor-not-allowed opacity-70'
                      }`}
                    >
                      <X className="w-5 h-5 hidden sm:block"/> <span className="text-sm">ยกเลิกคำสั่งซื้อ</span>
                    </button>
                  )}
                  <div className="flex gap-2 sm:gap-3">
                    <button type="button" onClick={closeModal} className="px-4 sm:px-6 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors text-sm sm:text-base">{isAdminOrStaff ? 'ยกเลิก' : 'ปิดหน้านี้'}</button>
                    {isAdminOrStaff && <button type="button" onClick={saveEditedOrder} className="px-4 sm:px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold tracking-wide shadow-[0_4px_15px_rgba(147,51,234,0.3)] flex items-center gap-2 transition-all text-sm sm:text-base"><Save className="w-4 h-4 sm:w-5 sm:h-5"/> บันทึก</button>}
                  </div>
                </div>
              </div>
            )}

            {/* STORE FOR ORDER MODAL */}
            {modal.type === 'store_for_order' && (
              <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
                <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-white">
                  <div className="flex items-center gap-3">
                    <button onClick={() => openModal('edit_order')} className="p-2 bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
                    <h3 className="text-xl font-black text-slate-800">เลือกสินค้าลงออเดอร์</h3>
                  </div>
                  <button onClick={closeModal} className="p-2 text-slate-400"><X className="w-6 h-6"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                    {products.map((product) => {
                      const isSoldOut = product.status === 'sold_out' || product.stock <= 0;
                      return (
                      <div key={product.id} onClick={() => { if (!isSoldOut) openModal('product_details_for_order', product) }}
                        className={`bg-white rounded-2xl p-4 border transition-all relative overflow-hidden ${isSoldOut ? 'opacity-50 grayscale' : 'cursor-pointer hover:border-blue-400'}`}>
                        {isSoldOut && (
                           <div className="absolute top-5 -right-10 w-[140px] bg-rose-500/95 backdrop-blur-sm text-white text-[10px] font-black tracking-widest py-1 text-center rotate-45 z-50 uppercase shadow-md pointer-events-none">SOLD OUT</div>
                        )}
                        <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl cursor-zoom-in hover:scale-105 transition-transform" onClick={(e) => { e.stopPropagation(); setZoomedImage(product.imageUrl); }} onError={(e) => {e.currentTarget.style.display='none'; if(e.currentTarget.nextSibling) (e.currentTarget.nextSibling as HTMLElement).style.display='block';}}/>
                          ) : null}
                          <ImageIcon className={`w-10 h-10 z-10 ${product.imageUrl ? 'hidden' : 'block'} text-slate-300`} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2">{product.name}</h3>
                        <div className="mt-2 flex justify-between items-end">
                          <span className="text-blue-600 font-black">฿{Number(product.price).toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">เหลือ {Number(product.stock).toLocaleString()}</span>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCT DETAILS (Shared) */}
            {(modal.type === 'product_details' || modal.type === 'product_details_for_order') && (
              <div className="flex flex-col flex-1 min-h-0 bg-white relative">
                
                {/* Scrollable Content Area */}
                <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto md:overflow-hidden">
                  
                  {/* LEFT COLUMN: Image Gallery (Shopee/Lazada Style) */}
                  <div className="w-full md:w-1/2 flex flex-col flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 relative md:overflow-y-auto justify-start md:justify-center">
                    {/* Mobile Close Button */}
                    <button type="button" onClick={closeModal} className="md:hidden absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md z-30 hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-700"/></button>
                    
                    {/* Main Image Box (มี Padding และ Shadow) */}
                    <div className="p-5 sm:p-8 w-full flex-shrink-0 flex justify-center">
                      <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-full aspect-square relative bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex justify-center items-center overflow-hidden border border-slate-100 z-10">
                        {selectedImage ? (
                          <img src={selectedImage} alt={modal.data?.name} className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-500" onClick={() => setZoomedImage(selectedImage)} />
                        ) : <ImageIcon className="w-16 h-16 sm:w-24 sm:h-24 text-slate-300" />}
                      </div>
                    </div>

                    {/* Thumbnails Row (Horizontal Scroll) */}
                    {modal.data?.images && modal.data.images.length > 1 && (
                      <div className="px-5 sm:px-8 pb-5 sm:pb-8 flex gap-2.5 overflow-x-auto snap-x w-full flex-shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {modal.data.images.map((img: string, idx: number) => {
                          const isSelected = selectedImage === img;
                          return (
                            <button 
                              key={idx} 
                              onClick={() => setSelectedImage(img)} 
                              className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-start bg-white
                                ${isSelected ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-300'}
                              `}
                            >
                              <img src={img} className="w-full h-full object-cover" alt={`thumb-${idx}`} />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* RIGHT COLUMN: Info, Variations & Description (Scrollable) */}
                  <div className="w-full md:w-1/2 flex flex-col flex-1 min-h-0 bg-white relative md:overflow-y-auto">
                    {/* Desktop Close Button */}
                    <div className="hidden md:flex justify-end p-4 sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-slate-100">
                      <h4 className="font-black text-slate-800 flex items-center flex-1 ml-2">ข้อมูลสินค้า</h4>
                      <button type="button" onClick={closeModal} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                    </div>

                    <div className="p-5 sm:p-6 md:pt-6 flex flex-col gap-6">
                       {/* Core Info */}
                       <div>
                         <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">{modal.data?.name}</h3>
                         <div className="flex flex-wrap items-end gap-3 mt-3 sm:mt-4">
                           <p className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight leading-none drop-shadow-sm">฿{Number(modal.data?.price || 0).toLocaleString()}</p>
                           <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 mb-0.5 sm:mb-1">เหลือ {Number(modal.data?.stock || 0).toLocaleString()} ชิ้น</span>
                         </div>
                         
                         <div className="flex flex-wrap gap-2 mt-4">
                           <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded border flex items-center gap-1 ${Number(modal.data?.carryingFee) > 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-50 border-slate-200'}`}><ShoppingBag className="w-3.5 h-3.5"/> ค่าหิ้ว ฿{Number(modal.data?.carryingFee || 0).toLocaleString()}</span>
                           <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded border flex items-center gap-1 ${Number(modal.data?.shippingFee) > 0 ? 'text-orange-700 bg-orange-50 border-orange-200' : 'text-slate-500 bg-slate-50 border-slate-200'}`}><Truck className="w-3.5 h-3.5"/> ค่าส่ง ฿{Number(modal.data?.shippingFee || 0).toLocaleString()}</span>
                         </div>
                       </div>

                       {/* Variations */}
                       {modal.data?.variations?.length > 0 && (
                         <div className="border-t border-slate-100 pt-5">
                           <div className="flex items-center justify-between mb-3">
                             <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Tags className="w-4 h-4 text-blue-500"/> ตัวเลือกสินค้า</h4>
                             {selectedVariation && <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 shadow-sm truncate max-w-[120px]">เลือก: {selectedVariation}</span>}
                           </div>
                           <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2.5">
                             {modal.data.variations.map((v: Variation) => {
                               const isSelected = selectedVariation === v.name;
                               const isOutOfStock = v.stock <= 0 && activeTab === 'store';
                               return (
                                 <button key={v.name} onClick={() => setSelectedVariation(v.name)} disabled={isOutOfStock}
                                   className={`relative flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl border-2 font-bold transition-all duration-200 aspect-square overflow-hidden
                                     ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm scale-[1.02]' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}
                                     ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : 'active:scale-95'}
                                   `}>
                                   {isSelected && (
                                     <>
                                       <div className="absolute -top-3.5 -right-3.5 w-7 h-7 sm:-top-4 sm:-right-4 sm:w-8 sm:h-8 bg-blue-500 rotate-45 z-0 transition-transform"></div>
                                       <Check className="absolute top-0.5 right-0.5 sm:top-[2px] sm:right-[2px] w-2.5 h-2.5 sm:w-3 sm:h-3 text-white z-10" strokeWidth={4}/>
                                     </>
                                   )}
                                   <span className="text-xs sm:text-sm z-10 w-full text-center px-0.5 leading-tight break-words line-clamp-2">{v.name}</span>
                                   <span className={`text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 z-10 font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap transition-colors ${isOutOfStock ? 'bg-rose-100 text-rose-600' : (isSelected ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500')}`}>
                                     {isOutOfStock ? 'หมด' : v.stock}
                                   </span>
                                 </button>
                               )
                             })}
                           </div>
                         </div>
                       )}

                       {/* Description */}
                       <div className="border-t border-slate-100 pt-5">
                         <div className="flex items-center gap-2 mb-3">
                           <AlignLeft className="w-4 h-4 text-slate-400"/>
                           <h4 className="text-sm font-black text-slate-800">รายละเอียดสินค้า</h4>
                         </div>
                         <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                           {modal.data?.description ? (
                              <div className="bg-white border border-slate-200 shadow-sm p-4 sm:p-5 rounded-2xl">{modal.data.description}</div>
                           ) : (
                              <div className="flex flex-col items-center justify-center text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200 py-8">ไม่มีรายละเอียดสินค้าระบุไว้</div>
                           )}
                         </div>
                       </div>

                    </div>
                  </div>

                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="w-full bg-slate-50 sm:bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-20 p-4 sm:p-4 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 max-w-5xl mx-auto w-full">
                     
                     {/* Pricing Summary */}
                     <div className="flex justify-between items-end sm:items-center sm:gap-4 pl-1 sm:pl-2 mb-1 sm:mb-0">
                       <span className="text-sm font-bold text-slate-800 sm:text-[11px] sm:text-slate-400 sm:uppercase sm:font-black sm:tracking-wider">รวมต่อชิ้น</span>
                       <span className="text-2xl font-black text-blue-600 tracking-tight leading-none drop-shadow-sm">฿{(Number(modal.data?.price || 0) + Number(modal.data?.carryingFee || 0) + Number(modal.data?.shippingFee || 0)).toLocaleString()}</span>
                     </div>

                     {/* Action Button */}
                     <div className="w-full sm:w-auto flex justify-end">
                      {modal.type === 'product_details_for_order' ? (
                        <button onClick={() => {
                          if (modal.data?.variations?.length > 0 && !selectedVariation) { showToast('กรุณาเลือกตัวเลือกสินค้า', 'warning'); return; }
                          addProductToDraftOrder(modal.data, selectedVariation);
                        }} className="w-full sm:w-[220px] bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white py-3.5 sm:py-3 rounded-xl font-bold shadow-[0_4px_15px_rgba(147,51,234,0.3)] transition-all flex justify-center items-center gap-2 text-sm sm:text-sm whitespace-nowrap">เพิ่มลงออเดอร์ <Plus className="w-5 h-5 flex-shrink-0" /></button>
                      ) : activeTab === 'products' ? (
                        <button onClick={() => openModal('product_form', modal.data)} className="w-full sm:w-[220px] bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 sm:py-3 rounded-xl font-bold shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center gap-2 text-sm sm:text-sm whitespace-nowrap">แก้ไขสินค้า <Edit className="w-5 h-5 flex-shrink-0" /></button>
                      ) : (
                        <button onClick={() => {
                          if (modal.data?.variations?.length > 0 && !selectedVariation) { showToast('กรุณาเลือกตัวเลือกสินค้าก่อน', 'warning'); return; }
                          addToCart(modal.data, selectedVariation); closeModal();
                        }} disabled={modal.data?.status === 'sold_out' || modal.data?.stock <= 0}
                        className="w-full sm:w-[220px] bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.98] disabled:active:scale-100 text-white py-3.5 sm:py-3 rounded-xl font-bold shadow-[0_4px_15px_rgba(14,165,233,0.3)] disabled:shadow-none transition-all flex justify-center items-center gap-2 text-sm sm:text-sm whitespace-nowrap">{modal.data?.status === 'sold_out' || modal.data?.stock <= 0 ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'} <ShoppingCart className="w-5 h-5 flex-shrink-0" /></button>
                      )}
                     </div>
                  </div>
                </div>

              </div>
            )}

            {/* PRODUCT FORM MODAL */}
            {modal.type === 'product_form' && (
              <form className="flex flex-col flex-1 min-h-0 bg-slate-50" onSubmit={handleProductSubmit}>
                {/* Header fixed at top */}
                <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200 bg-white flex-shrink-0 z-10 shadow-sm">
                  <h3 className="text-xl font-black text-slate-800">{modal.data ? 'แก้ไขสินค้า / EDIT' : 'เพิ่มสินค้าใหม่ / NEW ITEM'}</h3>
                  <button type="button" onClick={closeModal} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                </div>
                
                {/* Scrollable Body - Common Scrollbar for entire form */}
                <div className="flex flex-col md:flex-row flex-1 overflow-y-auto p-5 sm:p-6 gap-6 md:gap-8">
                  
                  {/* LEFT COLUMN: Images Gallery */}
                  <div className="w-full md:w-2/5 flex flex-col flex-shrink-0 gap-3">
                    <input type="file" id="product-image-upload" accept="image/png, image/jpeg, image/webp" multiple className="hidden" onChange={handleImageChange} disabled={uploadProgress > 0} />
                    
                    {/* Main Image 1:1 Dropzone/Preview */}
                    <label 
                      htmlFor="product-image-upload"
                      className={`w-full aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative cursor-pointer overflow-hidden transition-all duration-300 group bg-white shadow-sm ${isProductImgDragging ? 'border-blue-500 bg-blue-50/50 border-dashed' : 'border-slate-200 hover:border-blue-400'}`}
                      onDragOver={(e) => { e.preventDefault(); setIsProductImgDragging(true); }}
                      onDragLeave={() => setIsProductImgDragging(false)}
                      onDrop={handleProductImageDrop}
                    >
                      {uploadProgress > 0 ? (
                        <div className="flex flex-col items-center w-full max-w-[200px] z-20 px-4">
                          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                          <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                          <p className="text-xs font-bold text-slate-500 tracking-wider">กำลังอัปโหลด... {uploadProgress}%</p>
                        </div>
                      ) : previewUrls.length > 0 ? (
                        <>
                          <img src={previewUrls[0]} alt="Main Preview" className="w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                             <span className="text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 shadow-lg">
                               <Plus className="w-4 h-4"/> เพิ่ม/เปลี่ยนรูป
                             </span>
                          </div>
                        </>
                      ) : (
                        <div className={`flex flex-col items-center z-10 text-center transition-transform ${isProductImgDragging ? 'scale-110' : ''}`}>
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${isProductImgDragging ? 'bg-blue-100 text-blue-600 shadow-md' : 'bg-slate-50 shadow-sm group-hover:scale-110 text-blue-500'}`}>
                            <Plus className="w-8 h-8" />
                          </div>
                          <p className={`text-sm font-bold transition-colors ${isProductImgDragging ? 'text-blue-600' : 'text-slate-600'}`}>
                            {isProductImgDragging ? 'ปล่อยรูปภาพที่นี่' : 'คลิกเพื่อเพิ่มรูปภาพหลัก'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">รองรับอัปโหลดหลายรูปพร้อมกัน</p>
                        </div>
                      )}
                    </label>

                    {/* Thumbnails Row */}
                    <div className="flex gap-2.5 overflow-x-auto hide-scrollbar snap-x pb-1 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative rounded-xl border border-slate-200 overflow-hidden group shadow-sm bg-white snap-start">
                          <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <button type="button" onClick={(e) => { e.preventDefault(); removePreviewImage(idx); }} className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow-sm"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                          {idx === 0 && <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">รูปหลัก</span>}
                        </div>
                      ))}
                      {/* Empty Box for Adding More */}
                      <label htmlFor="product-image-upload" className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors bg-white snap-start group shadow-sm">
                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </label>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Form Details */}
                  <div className="w-full md:w-3/5 flex flex-col space-y-4 md:pr-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">ชื่อสินค้า (Item Name)</label>
                      <input name="name" type="text" defaultValue={modal.data?.name} required className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm transition-all" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 mb-1">ราคา (THB)</label><input name="price" type="number" min="0" defaultValue={modal.data?.price} required className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-blue-700 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm transition-all" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1">โควต้ารวม (Stock)</label><input name="stock" type="number" min="0" defaultValue={modal.data?.stock} required className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm transition-all" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1">ค่าหิ้ว (Fee)</label><input name="carryingFee" type="number" min="0" defaultValue={modal.data?.carryingFee || 0} required className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-sm transition-all" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1">ค่าจัดส่ง (Ship)</label><input name="shippingFee" type="number" min="0" defaultValue={modal.data?.shippingFee || 0} required className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-bold focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none shadow-sm transition-all" /></div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Tags className="w-4 h-4 text-blue-500"/> ตัวเลือกย่อย (Variations)</span>
                        <button type="button" onClick={handleAddFormVariation} className="text-blue-600 text-xs font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"><Plus className="w-3 h-3"/> เพิ่มตัวเลือก</button>
                      </div>
                      <div className="space-y-2.5">
                        {formVariations.map((v, idx) => (
                          <div key={idx} className="flex gap-1.5 sm:gap-2 items-center w-full">
                            <input type="text" value={v.name} onChange={(e) => handleChangeFormVariation(idx, 'name', e.target.value)} placeholder="เช่น XS, สีดำ" required className="flex-1 min-w-0 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                            <input type="number" value={v.stock} onChange={(e) => handleChangeFormVariation(idx, 'stock', e.target.value)} placeholder="สต๊อก" required className="w-16 sm:w-24 flex-shrink-0 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors" />
                            <button type="button" onClick={() => handleRemoveFormVariation(idx)} className="text-rose-400 p-2.5 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        ))}
                        {formVariations.length === 0 && <div className="text-xs text-slate-400 italic mt-2 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200 text-center">ไม่มีตัวเลือกย่อย (สามารถเพิ่มได้ถ้าสินค้ามีหลายขนาด/สี)</div>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">รายละเอียด (Description)</label>
                      <textarea 
                        name="description" 
                        defaultValue={modal.data?.description} 
                        className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none overflow-hidden shadow-sm leading-relaxed transition-all min-h-[150px]"
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto'; // รีเซ็ตความสูงก่อน
                          target.style.height = `${target.scrollHeight}px`; // ขยายตามเนื้อหา
                        }}
                        ref={(el) => {
                          if (el) {
                            setTimeout(() => {
                              el.style.height = 'auto';
                              el.style.height = `${el.scrollHeight}px`;
                            }, 0);
                          }
                        }}
                      ></textarea>
                    </div>
                  </div>

                </div>
                
                {/* Footer fixed at bottom */}
                <div className="p-4 sm:p-5 border-t border-slate-200 bg-white grid grid-cols-2 sm:flex sm:justify-end gap-3 flex-shrink-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                  <button type="button" onClick={closeModal} className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-colors flex items-center justify-center">ยกเลิก</button>
                  <button type="submit" className="w-full sm:w-auto px-6 sm:px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4 flex-shrink-0"/> <span className="truncate">บันทึกข้อมูล</span></button>
                </div>
              </form>
            )}

            {/* DELETE CONFIRM */}
            {modal.type === 'delete_confirm' && (
              <div className="p-8 text-center bg-white rounded-3xl">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="w-10 h-10" /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">ยืนยันการลบ</h3>
                <p className="text-slate-500 mb-8 text-sm">ลบ "{modal.data?.name}" ถาวร?</p>
                <div className="flex justify-center gap-4">
                  <button onClick={closeModal} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">ยกเลิก</button>
                  <button onClick={() => deleteProduct(modal.data.id)} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-[0_4px_15px_rgba(225,29,72,0.3)] transition-all">ยืนยันลบ</button>
                </div>
              </div>
            )}

            {/* CART & CHECKOUT */}
            {modal.type === 'cart' && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-sky-500" /> ตะกร้าสินค้า</h3>
                  <button onClick={closeModal} className="p-1 text-slate-400"><X className="w-6 h-6"/></button>
                </div>
                <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-white">
                  {cart.length === 0 ? (
                    <div className="text-center py-10"><ShoppingBag className="w-16 h-16 mx-auto text-slate-200 mb-4" /><p className="text-slate-500 font-medium">ไม่มีสินค้าในตะกร้า</p></div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-3 sm:gap-4 items-start border border-slate-100 p-3 sm:p-4 rounded-2xl bg-white shadow-sm hover:border-sky-200 transition-colors">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
                            {item.product.imageUrl ? <img src={item.product.imageUrl} className="w-full h-full object-cover cursor-zoom-in hover:opacity-80 transition-opacity" onClick={(e) => { e.stopPropagation(); setZoomedImage(item.product.imageUrl); }}/> : <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between h-full min-h-[5rem] sm:min-h-[6rem]">
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 leading-tight">{item.product.name}</h4>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs mt-1.5">
                                {item.variation && <span className="text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 whitespace-nowrap">แบบ: {item.variation}</span>}
                                {(item.product.carryingFee > 0) && <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1 whitespace-nowrap"><ShoppingBag className="w-3 h-3"/> หิ้ว +{item.product.carryingFee.toLocaleString()}</span>}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                              <p className="text-blue-600 font-black text-base sm:text-lg leading-none tracking-tight">฿{(item.product.price * item.qty).toLocaleString()}</p>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200 shadow-sm">
                                  <button onClick={() => updateCartQty(item.id, -1)} className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-800 active:scale-95"><Minus className="w-4 h-4" /></button>
                                  <span className="w-6 sm:w-8 text-center font-black text-sm text-slate-700">{item.qty}</span>
                                  <button onClick={() => updateCartQty(item.id, 1)} className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-800 active:scale-95"><Plus className="w-4 h-4" /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100 active:scale-95"><Trash2 className="w-5 h-5" /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <div className="space-y-2 mb-4 text-sm font-bold text-slate-600">
                      <div className="flex justify-between"><span>ค่าสินค้า:</span> <span>฿{cartStats.cartSubtotal.toLocaleString()}</span></div>
                      {cartStats.cartCarryingFee > 0 && <div className="flex justify-between"><span className="flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-emerald-500"/> ค่าหิ้วรวม:</span> <span className="text-emerald-600">฿{cartStats.cartCarryingFee.toLocaleString()}</span></div>}
                      {defaultShippingFee >= 0 && <div className="flex justify-between"><span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-orange-500"/> ค่าจัดส่ง (เริ่มต้น):</span> <span className={defaultShippingFee === 0 ? "text-emerald-600" : "text-orange-600"}>{defaultShippingFee === 0 ? "ฟรี" : `฿${defaultShippingFee.toLocaleString()}`}</span></div>}
                    </div>
                    <div className="flex justify-between items-end mb-4 pt-3 border-t border-slate-200">
                      <span className="text-slate-800 font-bold">ยอดรวมสุทธิ</span><span className="text-2xl font-black text-sky-600">฿{cartTotal.toLocaleString()}</span>
                    </div>
                    <button onClick={() => openModal('checkout')} className="w-full bg-sky-500 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 whitespace-nowrap">ดำเนินการสั่งซื้อ <Check className="w-5 h-5 flex-shrink-0" /></button>
                  </div>
                )}
              </div>
            )}

            {/* CHECKOUT */}
            {modal.type === 'checkout' && (
              <form className="flex flex-col flex-1 min-h-0" onSubmit={handleCheckoutSubmit}>
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-sky-50 flex-shrink-0">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><CreditCard className="w-6 h-6 text-sky-600" /> ข้อมูลจัดส่ง</h3>
                  <button type="button" onClick={() => openModal('cart')} className="p-1 text-slate-400"><X className="w-6 h-6"/></button>
                </div>
                <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    {isAdminOrStaff && <div><label className="text-xs font-bold text-slate-600 mb-1 block">User ID (ระบุเพื่อสร้างออเดอร์ให้ลูกค้า)</label><input name="userId" list="existing-user-ids" value={checkoutForm.userId} onChange={(e) => handleCheckoutFormChange('userId', e.target.value)} placeholder="ID ลูกค้า หรือเว้นว่าง" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/10 transition-all" /></div>}
                    <div><label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อลูกค้า</label><input name="customerName" list="existing-customer-names" value={checkoutForm.customerName} onChange={(e) => handleCheckoutFormChange('customerName', e.target.value)} required className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
                    <div><label className="text-xs font-bold text-slate-600 mb-1 block">อีเมล</label><input name="email" type="email" value={checkoutForm.email} onChange={(e) => handleCheckoutFormChange('email', e.target.value)} required className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
                    <div><label className="text-xs font-bold text-slate-600 mb-1 block">Facebook</label><input name="facebook" value={checkoutForm.facebook} onChange={(e) => handleCheckoutFormChange('facebook', e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
                    <div><label className="text-xs font-bold text-slate-600 mb-1 block">เบอร์โทร</label><input name="phone" value={checkoutForm.phone} onChange={(e) => handleCheckoutFormChange('phone', e.target.value)} required className="w-full p-3 bg-slate-50 border rounded-xl" /></div>
                    <div className="col-span-2 sm:col-span-1">
                       <label className="text-xs font-bold text-slate-600 mb-1 block">การรับสินค้า</label>
                       <select name="deliveryMethod" value={checkoutForm.deliveryMethod} onChange={(e) => handleCheckoutFormChange('deliveryMethod', e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none">
                         <option value="shipping">จัดส่งพัสดุ</option><option value="pickup">นัดรับด้วยตนเอง</option>
                       </select>
                    </div>
                  </div>
                  
                  <div><label className="text-xs font-bold text-slate-600 mb-1 block">ที่อยู่ / สถานที่นัดรับ</label><textarea name="address" value={checkoutForm.address} onChange={(e) => handleCheckoutFormChange('address', e.target.value)} required className="w-full p-3 bg-slate-50 border rounded-xl resize-none"></textarea></div>

                  {/* Shipping & Total Summary inside Checkout */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex justify-between text-sm mb-2 text-slate-600 font-bold">
                       <span>ค่าสินค้า + หิ้ว</span>
                       <span>฿{(cartStats.cartSubtotal + cartStats.cartCarryingFee).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-sm mb-3 text-slate-600 font-bold">
                       <span>ค่าจัดส่ง ({checkoutForm.deliveryMethod === 'shipping' ? 'จัดส่งพัสดุ' : 'นัดรับ'})</span>
                       <span className={checkoutShippingFee === 0 ? 'text-emerald-600' : 'text-orange-600'}>
                         {checkoutShippingFee === 0 ? 'ฟรี' : `+฿${checkoutShippingFee.toLocaleString()}`}
                       </span>
                     </div>

                     {/* ย้ายหมายเหตุมาแสดงต่อจากบรรทัดค่าจัดส่ง เพื่อให้สอดคล้องกัน */}
                     {checkoutForm.deliveryMethod === 'shipping' && sysSettings.shippingNote && (
                        <div className="mb-3 p-3 bg-orange-50 border border-orange-100/50 rounded-lg text-xs text-orange-700 leading-relaxed whitespace-pre-wrap animate-in fade-in shadow-sm">
                          <span className="font-bold flex items-center gap-1.5 mb-1"><Truck className="w-3.5 h-3.5"/> หมายเหตุการจัดส่ง:</span>
                          {sysSettings.shippingNote}
                        </div>
                     )}
                     {checkoutForm.deliveryMethod === 'pickup' && sysSettings.pickupNote && (
                        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-100/50 rounded-lg text-xs text-emerald-700 leading-relaxed whitespace-pre-wrap animate-in fade-in shadow-sm">
                          <span className="font-bold flex items-center gap-1.5 mb-1"><MapPin className="w-3.5 h-3.5"/> หมายเหตุสถานที่นัดรับ:</span>
                          {sysSettings.pickupNote}
                        </div>
                     )}

                     <div className="flex justify-between items-end font-black text-lg text-sky-600 border-t border-slate-200 pt-3 mt-1">
                       <span className="text-xs text-slate-500 uppercase tracking-widest">ยอดรวมสุทธิ</span>
                       <span className="text-2xl">฿{cartTotalCheckout.toLocaleString()}</span>
                     </div>
                  </div>
                </div>
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                  <button type="button" onClick={() => openModal('cart')} className="px-5 py-2.5 bg-white border rounded-xl font-bold flex items-center justify-center">ย้อนกลับ</button>
                  <button type="submit" className="px-5 py-2.5 bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center whitespace-nowrap">ยืนยันสั่งซื้อ</button>
                </div>
              </form>
            )}

            {/* USER FORM MODAL */}
            {modal.type === 'user_form' && (
              <form className="flex flex-col flex-1 min-h-0" onSubmit={handleSaveUser}>
                <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Users className="w-6 h-6 text-amber-500" /> {modal.data ? 'ข้อมูลและการจัดการสิทธิ์' : 'เพิ่มผู้ใช้ใหม่'}</h3>
                  <button type="button" onClick={closeModal} className="p-1 text-slate-400"><X className="w-6 h-6"/></button>
                </div>
                <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-slate-600 mb-1 block">Username (ใช้เข้าระบบ)</label><input name="username" defaultValue={modal.data?.username} required disabled={!!modal.data} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed" /></div>
                    <div>
                       <label className="text-xs font-bold text-slate-600 mb-1 block">สิทธิ์การใช้งาน (Role)</label>
                       <select name="role" defaultValue={modal.data?.role || 'user'} disabled={modal.data?.id === currentUser.id} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none disabled:opacity-60 disabled:cursor-not-allowed">
                         <option value="user">User (ลูกค้าทั่วไป)</option>
                         <option value="staff">Staff (เจ้าหน้าที่)</option>
                         <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                       </select>
                    </div>
                    <div><label className="text-xs font-bold text-slate-600 mb-1 block">ชื่อ-นามสกุล</label><input name="name" defaultValue={modal.data?.name} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 outline-none" /></div>
                    <div><label className="text-xs font-bold text-slate-600 mb-1 block">อีเมล</label><input name="email" type="email" defaultValue={modal.data?.email} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 outline-none" /></div>
                    <div><label className="text-xs font-bold text-slate-600 mb-1 block">เบอร์โทรศัพท์</label><input name="phone" defaultValue={modal.data?.phone} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 outline-none" /></div>
                    <div><label className="text-xs font-bold text-slate-600 mb-1 block">Facebook</label><input name="facebook" defaultValue={modal.data?.facebook} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 outline-none" /></div>
                  </div>
                  <div><label className="text-xs font-bold text-slate-600 mb-1 block">ที่อยู่จัดส่ง (เริ่มต้น)</label><textarea name="address" rows={3} defaultValue={modal.data?.address} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 outline-none resize-none"></textarea></div>
                </div>
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                  <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold shadow-sm text-slate-600">ยกเลิก</button>
                  <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2"><Save className="w-4 h-4"/> บันทึกข้อมูลผู้ใช้</button>
                </div>
              </form>
            )}

            {/* DELETE USER CONFIRM MODAL */}
            {modal.type === 'delete_user_confirm' && (
              <div className="p-8 text-center bg-white rounded-3xl">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="w-10 h-10" /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">ยืนยันการลบผู้ใช้</h3>
                <p className="text-slate-500 mb-8 text-sm">คุณต้องการลบผู้ใช้ "{modal.data?.name}" (@{modal.data?.username}) หรือไม่?<br/>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                <div className="flex justify-center gap-4">
                  <button onClick={closeModal} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">ยกเลิก</button>
                  <button onClick={() => handleDeleteUser(modal.data.id)} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-[0_4px_15px_rgba(225,29,72,0.3)] transition-all">ยืนยันลบผู้ใช้</button>
                </div>
              </div>
            )}

            {/* CANCEL ORDER CONFIRM MODAL */}
            {modal.type === 'cancel_order_confirm' && (
              <div className="p-8 text-center bg-white rounded-3xl">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><X className="w-10 h-10" /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">ยืนยันการยกเลิกคำสั่งซื้อ</h3>
                <p className="text-slate-500 mb-8 text-sm">คุณต้องการยกเลิกคำสั่งซื้อ "{modal.data?.id}" หรือไม่?<br/>(คำสั่งซื้อจะถูกเปลี่ยนสถานะเป็น "ยกเลิกแล้ว")</p>
                <div className="flex justify-center gap-4">
                  <button onClick={closeModal} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">ย้อนกลับ</button>
                  <button onClick={() => { handleCancelOrder(modal.data.id); closeModal(); }} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-[0_4px_15px_rgba(225,29,72,0.3)] transition-all">ยืนยันการยกเลิก</button>
                </div>
              </div>
            )}

            {/* DELETE ORDER CONFIRM MODAL */}
            {modal.type === 'delete_order_confirm' && (
              <div className="p-8 text-center bg-white rounded-3xl">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="w-10 h-10" /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">ยืนยันการลบคำสั่งซื้อ</h3>
                <p className="text-slate-500 mb-8 text-sm">ลบคำสั่งซื้อ "{modal.data?.id}" ถาวร?<br/><span className="text-rose-500 font-bold">ระบบจะทำการคืนสต๊อกสินค้าอัตโนมัติ</span></p>
                <div className="flex justify-center gap-4">
                  <button onClick={closeModal} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">ยกเลิก</button>
                  <button onClick={() => handleDeleteOrder(modal.data.id)} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-[0_4px_15px_rgba(225,29,72,0.3)] transition-all">ยืนยันการลบถาวร</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- IMAGE ZOOM FULLSCREEN OVERLAY --- */}
      {zoomedImage && (
        <ImageZoomOverlay imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </div>
  );
}

export default App;