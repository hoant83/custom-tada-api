/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Notification } from 'src/entities/notification/notification.entity';
import { CreateEditNotificationDto } from 'src/modules/admin/notification/dto/CreateEditNotification.dto';
import {
  ID_NOTI_CONTENT,
  ID_NOTI_SUBJECT,
  KR_NOTI_CONTENT,
  KR_NOTI_SUBJECT,
  NOTI_CONTENT,
  NOTI_SUBJECT,
  VI_NOTI_CONTENT,
  VI_NOTI_SUBJECT,
} from '../constants/notification.enum';
import { USER_LANGUAGE } from '../constants/user-language.enum';

export const getNotificationByLanguge = (
  model: CreateEditNotificationDto | Notification,
  lang: USER_LANGUAGE,
): any => {
  switch (lang) {
    case USER_LANGUAGE.VI:
      return { title: model.title, body: model.body };
    case USER_LANGUAGE.EN:
      return { title: model.titleEN, body: model.bodyEN };
    case USER_LANGUAGE.KR:
      return { title: model.titleKR, body: model.bodyKR };
    case USER_LANGUAGE.ID:
      return { title: model.titleID, body: model.bodyID };
    default:
      return { title: model.titleEN, body: model.bodyEN };
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const replaceInfoNotificationByLanguage = (
  orderId: string,
  type: any,
): CreateEditNotificationDto => {
  const modelNoti = new CreateEditNotificationDto();

  const translateLangContent = VI_NOTI_CONTENT;
  const translateLangSubject = VI_NOTI_SUBJECT;
  const translateLangContentEN = NOTI_CONTENT;
  const translateLangSubjectEN = NOTI_SUBJECT;
  const translateLangContentKR = KR_NOTI_CONTENT;
  const translateLangSubjectKR = KR_NOTI_SUBJECT;
  const translateLangContentID = ID_NOTI_CONTENT;
  const translateLangSubjectID = ID_NOTI_SUBJECT;

  modelNoti.body = translateLangContent[type].replace('[orderID]', orderId);
  modelNoti.title = translateLangSubject[type];

  modelNoti.bodyEN = translateLangContentEN[type].replace('[orderID]', orderId);
  modelNoti.titleEN = translateLangSubjectEN[type];

  modelNoti.bodyKR = translateLangContentKR[type].replace('[orderID]', orderId);
  modelNoti.titleKR = translateLangSubjectKR[type];

  modelNoti.bodyID = translateLangContentID[type].replace('[orderID]', orderId);
  modelNoti.titleID = translateLangSubjectID[type];

  return modelNoti;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const replaceInfoNotificationByLanguageWithTruckOwner = (
  orderId: string,
  type: any,
  list: string,
): CreateEditNotificationDto => {
  const modelNoti = replaceInfoNotificationByLanguage(orderId, type);
  modelNoti.body = modelNoti.body.replace('[name]', list);
  modelNoti.bodyEN = modelNoti.bodyEN.replace('[name]', list);
  modelNoti.bodyKR = modelNoti.bodyKR.replace('[name]', list);
  modelNoti.bodyID = modelNoti.bodyID.replace('[name]', list);

  return modelNoti;
};

export const replaceInfoNotificationByLanguageOrderAssignSuccess = (
  orderId: string,
  type: any,
  publicId: string,
): CreateEditNotificationDto => {
  const modelNoti = replaceInfoNotificationByLanguage(orderId, type);
  modelNoti.body = modelNoti.body.replace('[truckownerID]', publicId);
  modelNoti.bodyEN = modelNoti.bodyEN.replace('[truckownerID]', publicId);
  modelNoti.bodyKR = modelNoti.bodyKR.replace('[truckownerID]', publicId);
  modelNoti.bodyID = modelNoti.bodyID.replace('[truckownerID]', publicId);

  return modelNoti;
};

export const replaceInfoNotificationByName = (
  orderId: string,
  type: any,
  name: string,
): CreateEditNotificationDto => {
  const modelNoti = replaceInfoNotificationByLanguage(orderId, type);
  modelNoti.body = modelNoti.body.replace('[customerID]', name);
  modelNoti.bodyEN = modelNoti.bodyEN.replace('[customerID]', name);
  modelNoti.bodyKR = modelNoti.bodyKR.replace('[customerID]', name);
  modelNoti.bodyID = modelNoti.bodyID.replace('[customerID]', name);

  return modelNoti;
};

export const getLanguage = (
  lang: USER_LANGUAGE | USER_LANGUAGE[],
  property: string,
): string => {
  let result;

  if (lang.indexOf(USER_LANGUAGE.EN) !== -1) {
    // result = lang.
  }

  return result;
};
