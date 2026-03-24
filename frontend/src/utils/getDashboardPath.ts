export const getDashboardPath = (role: string): string => {
  // Admin
  if (role === 'admin') return '/admin/dashboard';
  
  // Client - YENİ!
  if (role === 'client') return '/client/dashboard';
  
  // Administration
  if (['office_manager', 'personal_assistant', 'receptionist', 'secretary', 'clerk_typist', 'filing_clerk'].includes(role)) {
    return '/admin/administration';
  }
  
  // Accounts
  if (['accountant', 'credit_controller', 'accounts_clerk', 'purchasing_assistant'].includes(role)) {
    return '/admin/accounts';
  }
  
  // Creative Management
  if (['director', 'account_manager'].includes(role)) {
    return '/admin/creative';
  }
  
  // Creative Staff
  if (['graphic_designer', 'photographer', 'copy_writer', 'editor', 'audio_technician', 'resource_librarian'].includes(role)) {
    return '/creative-staff/tasks';
  }
  
  // Computing
  if (['computer_manager', 'network_support'].includes(role)) {
    return '/admin/computing';
  }
  
  // Default
  return '/admin/dashboard';
};
