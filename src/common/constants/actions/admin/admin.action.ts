export const ADMIN_MODULE = 'ADMIN';
export enum ADMIN_ACTION {
  /*
    TRUCK OWNER RELATED
  */
  ADMIN_CREATE_TRUCK_OWNER = 'ADMIN_CREATE_TRUCK_OWNER',
  ADMIN_UPDATE_TRUCK_OWNER = 'ADMIN_UPDATE_TRUCK_OWNER',
  ADMIN_DELETE_TRUCK_OWNER = 'ADMIN_DELETE_TRUCK_OWNER',
  ADMIN_RESTORE_TRUCK_OWNER = 'ADMIN_RESTORE_TRUCK_OWNER',
  ADMIN_EXPORT_REPORT_TRUCK_OWNER = 'ADMIN_EXPORT_REPORT_TRUCK_OWNER',
  ADMIN_UPDATE_TRUCKOWNER_PROFILE = 'ADMIN_UPDATE_TRUCKOWNER_PROFILE',

  /*
    CUSTOMER RELATED
  */
  ADMIN_CREATE_CUSTOMER = 'ADMIN_CREATE_CUSTOMER',
  ADMIN_UPDATE_CUSTOMER = 'ADMIN_UPDATE_CUSTOMER',
  ADMIN_RESTORE_CUSTOMER = 'ADMIN_RESTORE_CUSTOMER',
  ADMIN_DELETE_CUSTOMER = 'ADMIN_DELETE_CUSTOMER',
  ADMIN_VERIFY_CUSTOMER = 'ADMIN_VERIFY_CUSTOMER',
  UPLOAD_CARD_FRONT = 'ADMIN_UPLOAD_CARD_FRONT',
  UPLOAD_CARD_BACK = 'ADMIN_UPLOAD_CARD_BACK',
  DELETE_CUSTOMER_FILE = 'ADMIN_DELETE_CUSTOMER_FILE',
  DELETE_CUSTOMER_COMPANY_FILE = 'ADMIN_DELETE_CUSTOMER_COMPANY_FILE',
  UPLOAD_BUSINESS_LICENSE = 'ADMIN_UPLOAD_BUSINESS_LICENSE',
  UPLOAD_COMPANY_ICON = 'ADMIN_UPLOAD_COMPANY_ICON',
  CREATE_EMPLOYEE = 'ADMIN_CREATE_EMPLOYEE',
  DELETE_EMPLOYEE = 'ADMIN_DELETE_EMPLOYEE',
  ADD_FAVORITE_TRUCK_OWNER = 'ADMIN_ADD_FAVORITE_TRUCK_OWNER',
  REMOVE_FAVORITE_TRUCK_OWNER = 'ADMIN_REMOVE_FAVORITE_TRUCK_OWNER',
  RESET_FAVORITE_TRUCK_OWNER = 'ADMIN_RESET_FAVORITE_TRUCK_OWNER',

  /*
    TRUCK RELATED
  */
  ADMIN_CREATE_TRUCK = 'ADMIN_CREATE_TRUCK',
  ADMIN_UPDATE_TRUCK = 'ADMIN_UPDATE_TRUCK',
  ADMIN_DELETE_TRUCK = 'ADMIN_DELETE_TRUCK',
  UPLOAD_TRUCK_OTHER_DOC = 'UPLOAD_TRUCK_OTHER_DOC',

  /*
    TRUCKOWNER RELATED
  */
  ADMIN_TRUCKOWNER_UPLOAD_CARD_FRONT = 'ADMIN_TRUCKOWNER_UPLOAD_CARD_FRONT',
  ADMIN_TRUCKOWNER_UPLOAD_CARD_BACK = 'ADMIN_TRUCKOWNER_UPLOAD_CARD_BACK',
  ADMIN_TRUCKOWNER_UPLOAD_DRIVER_LICENSE = 'ADMIN_TRUCKOWNER_UPLOAD_DRIVER_LICENSE',
  ADMIN_TRUCKOWNER_UPLOAD_TRUCK_CERTIFICATE = 'ADMIN_TRUCKOWNER_UPLOAD_TRUCK_CERTIFICATE',
  ADMIN_TRUCKOWNER_UPLOAD_BUSINESS_LICENSE = 'ADMIN_TRUCKOWNER_UPLOAD_BUSINESS_LICENSE',
  ADMIN_TRUCKOWNER_UPLOAD_COMPANY_ICON = 'ADMIN_TRUCKOWNER_UPLOAD_COMPANY_ICON',
  ADMIN_TRUCKOWNER_UPLOAD_DRIVER_CARD_FRONT = 'ADMIN_TRUCKOWNER_UPLOAD_DRIVER_CARD_FRONT',
  ADMIN_TRUCKOWNER_UPLOAD_DRIVER_CARD_BACK = 'ADMIN_TRUCKOWNER_UPLOAD_DRIVER_CARD_BACK',
  ADMIN_TRUCKOWNER_DELETE_TRUCKOWNER_FILES = 'ADMIN_TRUCKOWNER_DELETE_TRUCKOWNER_FILES',
  ADMIN_TRUCKOWNER_DELETE_TRUCK_FILES = 'ADMIN_TRUCKOWNER_DELETE_TRUCK_FILES',
  ADMIN_TRUCKOWNER_DELETE_DRIVER_FILES = 'ADMIN_TRUCKOWNER_DELETE_DRIVER_FILES',
  ADMIN_TRUCKOWNER_DELETE_COMPANY_FILES = 'ADMIN_TRUCKOWNER_DELETE_COMPANY_FILES',
  ADMIN_TRUCKOWNER_DELETE_COMPANY = 'ADMIN_TRUCKOWNER_DELETE_COMPANY',
  ADMIN_TRUCKOWNER_UPDATE_COMPANY = 'ADMIN_TRUCKOWNER_UPDATE_COMPANY',
  ADMIN_TRUCKOWNER_UNTAKE_ORDER = 'ADMIN_TRUCKOWNER_UNTAKE_ORDER',
  ADMIN_VERIFY_TRUCKOWNER = 'ADMIN_VERIFY_TRUCKOWNER',
  ADMIN_ASSIGN_TRUCK_AS_TRUCKOWNER = 'ADMIN_ASSIGN_TRUCK_AS_TRUCKOWNER',
  ADMIN_ASSIGN_TRUCKOWNER_AS_TRUCKOWNER = 'ADMIN_ASSIGN_TRUCKOWNER_AS_TRUCKOWNER',
  ADMIN_ASSIGN_DRIVER_AS_TRUCKOWNER = 'ADMIN_ASSIGN_DRIVER_AS_TRUCKOWNER',
  ADMIN_CREATE_TRUCK_OWNER_BANK_ACCOUNT = 'ADMIN_CREATE_TRUCK_OWNER_BANK_ACCOUNT',
  ADMIN_UPDATE_TRUCK_OWNER_BANK_ACCOUNT = 'ADMIN_UPDATE_TRUCK_OWNER_BANK_ACCOUNT',
  /*
    DRIVER RELATED
  */
  ADMIN_CREATE_DRIVER = 'ADMIN_CREATE_DRIVER',
  ADMIN_UPDATE_DRIVER = 'ADMIN_UPDATE_DRIVER',
  ADMIN_RESTORE_DRIVER = 'ADMIN_RESTORE_DRIVER',
  ADMIN_DELETE_DRIVER = 'ADMIN_DELETE_DRIVER',
  UPLOAD_DRIVER_OTHER_DOC = 'UPLOAD_DRIVER_OTHER_DOC',
  ADMIN_UPDATE_LOGO = 'ADMIN_UPDATE_LOGO',
  ADMIN_PAYMENT_DRIVER = 'ADMIN_PAYMENT_DRIVER',

  /*
    COMPANY RELATED
  */
  ADMIN_DELETE_COMPANY = 'ADMIN_DELETE_COMPANY',
  ADMIN_CREATE_COMPANY = 'ADMIN_CREATE_COMPANY',
  ADMIN_UPDATE_COMPANY = 'ADMIN_UPDATE_COMPANY',

  /*
    ADMIN ACCOUNT RELATED
  */
  ADMIN_CHANGE_PASSWORD = 'ADMIN_CHANGE_PASSWORD',
  ADMIN_CREATE_ADMIN = 'ADMIN_CREATE_ADMIN',
  ADMIN_UPDATE_ADMIN = 'ADMIN_UPDATE_ADMIN',
  ADMIN_DELETE_ADMIN = 'ADMIN_DELETE_ADMIN',

  /*
    ORDER RELATED
  */
  ADMIN_CREATE_ORDER = 'ADMIN_CREATE_ORDER',
  ADMIN_CANCEL_ORDER_AS_CUSTOMER = 'ADMIN_CANCEL_ORDER_AS_CUSTOMER',

  ADMIN_CANCEL_ORDER_AS_DRIVER = 'ADMIN_CANCEL_ORDER_AS_DRIVER',

  ADMIN_UPDATE_EMPLOYEE = 'ADMIN_UPDATE_EMPLOYEE',
  ADMIN_DELETE_FILE = 'ADMIN_DELETE_FILE',
  ADMIN_RESTORE_ADMIN = 'ADMIN_RESTORE_ADMIN',
  ADMIN_EXPORT_ORDER = 'ADMIN_EXPORT_ORDER',
  ADMIN_EXPORT_CUSTOMERS = 'ADMIN_EXPORT_CUSTOMERS',
  ADMIN_EXPORT_TRUCKOWNERS = 'ADMIN_EXPORT_TRUCKOWNERS',
  ADMIN_EXPORT_DRIVERS = 'ADMIN_EXPORT_DRIVERS',

  /*
    SMS RELATED
  */
  ADMIN_UPDATE_SMS_SETTING = 'ADMIN_UPDATE_SMS_SETTING',

  /**
   * PRICING RELATED
   */
  ADMIN_DELETE_PRICE = 'ADMIN_DELETE_PRICE',

  /**
   * TRUCK TYPE FARE RELATED
   */
  ADMIN_DELETE_TRUCK_TYPE_FARE = 'ADMIN_DELETE_TRUCK_TYPE_FARE',

  /**
   * PAYLOAD FARE RELATED
   */
  ADMIN_DELETE_PAYLOAD_FARE = 'ADMIN_DELETE_PAYLOAD_FARE',

  /**
   * ZONE FARE RELATED
   */
  ADMIN_DELETE_ZONE_FARE = 'ADMIN_DELETE_ZONE_FARE',

  /**
   * DYNAMIC ITEM RELATED
   */
  ADMIN_DELETE_DYNAMIC_ITEM = 'ADMIN_DELETE_DYNAMIC_ITEM',

  /**
   * DISTANCE RELATED
   */
  ADMIN_DELETE_DISTANCE_PRICE = 'ADMIN_DELETE_DISTANCE_PRICE',
  ADMIN_DELETE_DISTANCE = 'ADMIN_DELETE_DISTANCE',

  /**
   * PAYMENT DONE
   */
  UPDATE_PAYMENT_DONE = 'UPDATE_PAYMENT_DONE',
  CREATE_TRUCK_OWNER_BANK_ACCOUNT = 'CREATE_TRUCK_OWNER_BANK_ACCOUNT',
}