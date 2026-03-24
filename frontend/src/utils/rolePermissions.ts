// Role hierarchy ve izinler
// Organizasyon Şemasına Göre Düzenlenmiştir

export const ROLES = {
  // Admin - tüm erişim (değişmez)
  ADMIN: 'admin',
  
  // Client - müşteri rolü
  CLIENT: 'client',
  
  // Board of Directors (Yönetim Kurulu)
  DIRECTOR: 'director',
  
  // Administration Department
  OFFICE_MANAGER: 'office_manager',
  PERSONAL_ASSISTANT: 'personal_assistant',
  RECEPTIONIST: 'receptionist',
  SECRETARY: 'secretary',
  CLERK_TYPIST: 'clerk_typist',
  FILING_CLERK: 'filing_clerk',
  
  // Accounts Department
  ACCOUNTANT: 'accountant',
  CREDIT_CONTROLLER: 'credit_controller',
  ACCOUNTS_CLERK: 'accounts_clerk',
  PURCHASING_ASSISTANT: 'purchasing_assistant',
  
  // Creative Department
  ACCOUNT_MANAGER: 'account_manager', // Creative'de yönetici (4 tane)
  GRAPHIC_DESIGNER: 'graphic_designer',
  PHOTOGRAPHER: 'photographer',
  COPY_WRITER: 'copy_writer',
  EDITOR: 'editor',
  AUDIO_TECHNICIAN: 'audio_technician',
  RESOURCE_LIBRARIAN: 'resource_librarian',
  
  // Computing Department
  COMPUTER_MANAGER: 'computer_manager',
  NETWORK_SUPPORT: 'network_support',
};

// Role grupları (Organizasyon Şemasına Göre)
export const ROLE_GROUPS = {
  // Board of Directors
  BOARD_OF_DIRECTORS: [
    ROLES.DIRECTOR,
  ],
  
  // Administration Department
  ADMINISTRATION_MANAGEMENT: [
    ROLES.OFFICE_MANAGER,
  ],
  ADMINISTRATION_STAFF: [
    ROLES.PERSONAL_ASSISTANT,
    ROLES.RECEPTIONIST,
    ROLES.SECRETARY,
    ROLES.CLERK_TYPIST,
    ROLES.FILING_CLERK,
  ],
  ADMINISTRATION: [
    ROLES.OFFICE_MANAGER,
    ROLES.PERSONAL_ASSISTANT,
    ROLES.RECEPTIONIST,
    ROLES.SECRETARY,
    ROLES.CLERK_TYPIST,
    ROLES.FILING_CLERK,
  ],
  
  // Accounts Department
  ACCOUNTS_MANAGEMENT: [
    ROLES.ACCOUNTANT,
  ],
  ACCOUNTS_STAFF: [
    ROLES.CREDIT_CONTROLLER,
    ROLES.ACCOUNTS_CLERK,
    ROLES.PURCHASING_ASSISTANT,
  ],
  ACCOUNTS: [
    ROLES.ACCOUNTANT,
    ROLES.CREDIT_CONTROLLER,
    ROLES.ACCOUNTS_CLERK,
    ROLES.PURCHASING_ASSISTANT,
  ],
  
  // Creative Department
  CREATIVE_MANAGEMENT: [
    ROLES.ACCOUNT_MANAGER, // Creative'de yönetici
  ],
  CREATIVE_STAFF: [
    ROLES.GRAPHIC_DESIGNER,
    ROLES.PHOTOGRAPHER,
    ROLES.COPY_WRITER,
    ROLES.EDITOR,
    ROLES.AUDIO_TECHNICIAN,
    ROLES.RESOURCE_LIBRARIAN,
  ],
  CREATIVE: [
    ROLES.ACCOUNT_MANAGER,
    ROLES.GRAPHIC_DESIGNER,
    ROLES.PHOTOGRAPHER,
    ROLES.COPY_WRITER,
    ROLES.EDITOR,
    ROLES.AUDIO_TECHNICIAN,
    ROLES.RESOURCE_LIBRARIAN,
  ],
  
  // Computing Department
  COMPUTING_MANAGEMENT: [
    ROLES.COMPUTER_MANAGER,
  ],
  COMPUTING_STAFF: [
    ROLES.NETWORK_SUPPORT,
  ],
  COMPUTING: [
    ROLES.COMPUTER_MANAGER,
    ROLES.NETWORK_SUPPORT,
  ],
};

// Sayfa erişim kontrolleri
export const hasAccessToUsers = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.OFFICE_MANAGER, // Administration Department Manager
    ROLES.COMPUTER_MANAGER, // Computing Department Manager
  ].includes(role);
};

export const hasAccessToClients = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR, // Board of Directors
    ROLES.OFFICE_MANAGER, // Administration Department Manager
    ROLES.ACCOUNTANT, // Accounts Department Manager
    ROLES.ACCOUNT_MANAGER, // Creative Department Manager
  ].includes(role);
};

export const hasAccessToCampaigns = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR, // Board of Directors
    ROLES.ACCOUNTANT, // Accounts Department Manager
    ROLES.ACCOUNT_MANAGER, // Creative Department Manager
    ...ROLE_GROUPS.CREATIVE_STAFF, // Creative Staff (atandıkları kampanyalar)
  ].includes(role);
};

export const hasAccessToAdverts = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR, // Board of Directors
    ROLES.ACCOUNT_MANAGER, // Creative Department Manager
    ...ROLE_GROUPS.CREATIVE_STAFF, // Creative Staff
  ].includes(role);
};

export const hasAccessToConceptNotes = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR, // Board of Directors
    ROLES.ACCOUNT_MANAGER, // Creative Department Manager
    ...ROLE_GROUPS.CREATIVE_STAFF, // Creative Staff
  ].includes(role);
};

export const hasAccessToInvoices = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR, // Board of Directors
    ROLES.ACCOUNT_MANAGER, // Creative Department Manager
    ...ROLE_GROUPS.ACCOUNTS, // Accounts Department (tümü)
  ].includes(role);
};

// Performans izleme erişimi
export const hasAccessToPerformanceMonitoring = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR, // Board of Directors
    ROLES.OFFICE_MANAGER, // Administration Department Manager
    ROLES.ACCOUNTANT, // Accounts Department Manager
    ROLES.COMPUTER_MANAGER, // Computing Department Manager
    ROLES.ACCOUNT_MANAGER, // Creative Department Manager (sadece kendi ekibi)
  ].includes(role);
};

// Tam performans erişimi (tüm personel)
export const hasFullPerformanceAccess = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR, // Board of Directors
    ROLES.OFFICE_MANAGER, // Administration Department Manager
    ROLES.COMPUTER_MANAGER, // Computing Department Manager
  ].includes(role);
};

export const canCreateConceptNotes = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR, // Board of Directors
    ROLES.ACCOUNT_MANAGER, // Creative Department Manager
    ...ROLE_GROUPS.CREATIVE_STAFF, // Creative Staff
  ].includes(role);
};

// Personel Dereceleri ve Ücretleri erişim kontrolü
export const hasAccessToStaffGrades = (role: string): boolean => {
  // Dereceleri herkes görebilir
  return role !== ROLES.CLIENT; // Client hariç tüm aktif kullanıcılar
};

export const canEditStaffGrades = (role: string): boolean => {
  // Dereceleri sadece yöneticiler düzenleyebilir
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR,
    ROLES.OFFICE_MANAGER,
  ].includes(role);
};

export const hasAccessToSalaries = (role: string): boolean => {
  // Ücretleri herkes görebilir (kendi ücreti veya altındakiler)
  return role !== ROLES.CLIENT; // Client hariç tüm aktif kullanıcılar
};

export const canEditSalaries = (role: string): boolean => {
  // Ücretleri sadece yöneticiler düzenleyebilir
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR,
    ROLES.OFFICE_MANAGER,
    ROLES.ACCOUNTANT,
  ].includes(role);
};

// Yıllık Bonus erişim kontrolü
export const hasAccessToAnnualBonuses = (role: string): boolean => {
  // Bonusları herkes görebilir (kendi bonusu veya altındakiler)
  return role !== ROLES.CLIENT; // Client hariç tüm aktif kullanıcılar
};

export const canCreateEditBonuses = (role: string): boolean => {
  // Bonus oluşturma/düzenleme: Admin, Director, Office Manager, Accountant
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR,
    ROLES.OFFICE_MANAGER,
    ROLES.ACCOUNTANT,
  ].includes(role);
};

export const canApproveBonuses = (role: string): boolean => {
  // Bonus onaylama: Admin, Director, Office Manager
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR,
    ROLES.OFFICE_MANAGER,
  ].includes(role);
};

export const canEditCampaigns = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.DIRECTOR, // Board of Directors
    ROLES.ACCOUNT_MANAGER, // Creative Department Manager
  ].includes(role);
};

export const canManageUsers = (role: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.OFFICE_MANAGER, // Administration Department Manager
    ROLES.COMPUTER_MANAGER, // Computing Department Manager
  ].includes(role);
};

// Client kontrolü
export const isClient = (role: string): boolean => {
  return role === ROLES.CLIENT;
};

// Role görüntüleme adı
export const getRoleDisplayName = (role: string): string => {
  const names: any = {
    admin: 'Sistem Yöneticisi',
    client: 'Müşteri',
    director: 'Yönetim Kurulu / Direktör',
    office_manager: 'Ofis Müdürü (Administration)',
    personal_assistant: 'Kişisel Asistan',
    receptionist: 'Resepsiyonist',
    secretary: 'Sekreter',
    clerk_typist: 'Katip',
    filing_clerk: 'Arşiv Görevlisi',
    accountant: 'Muhasebeci (Accounts)',
    credit_controller: 'Kredi Kontrolörü',
    accounts_clerk: 'Muhasebe Memuru',
    purchasing_assistant: 'Satın Alma Asistanı',
    account_manager: 'Hesap Yöneticisi (Creative)',
    graphic_designer: 'Grafik Tasarımcı',
    photographer: 'Fotoğrafçı',
    copy_writer: 'Metin Yazarı',
    editor: 'Editör',
    audio_technician: 'Ses Teknisyeni',
    resource_librarian: 'Kaynak Kütüphanecisi',
    computer_manager: 'Bilgisayar Yöneticisi (Computing)',
    network_support: 'Ağ Destek',
  };
  return names[role] || role;
};
