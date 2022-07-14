/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';
import { customThrowError } from './throw.helper';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from '../constants/response-messages.enum';
import { TOKEN_ROLE } from '../constants/token-role.enum';
import { USER_LANGUAGE } from '../constants/user-language.enum';
import * as handlebars from 'handlebars';
import { TemplatesService } from '../modules/email-templates/template.service';
import { getNickname } from './utility.helper';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { LanguageService } from '../modules/languagues/language.service';
import {
  EMAIL_SUBJECT,
  KR_EMAIL_SUBJECT,
  VI_EMAIL_SUBJECT,
} from '../constants/email-title.enum';
import { LicenseMail } from 'src/modules/admin/user/dto/LicenseMail.dto';

@Injectable()
export class MailHelper {
  mailService: MailService = new MailService();
  PREFIX_EMAIL_SUBJECT = '';
  from: string;
  to: string;
  frontendHost: string;
  customerFront: string;
  truckOwnerFront: string;
  adminFront: string;
  vi: any;
  en: any;
  kr: any;
  MAIL_FOOTER: string;
  phone: string;
  email: string;
  companyName: string;
  webSite: string;
  address: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly templatesService: TemplatesService,
    private readonly languageService: LanguageService,
  ) {
    this.mailService.setApiKey(this.configService.get('SENDGRID_APIKEY'));
    this.from = this.configService.get('ADMIN_EMAIL');
    this.to = this.configService.get('TO_TEST_EMAIL');
    this.frontendHost = this.configService.get('FRONTEND_HOST');
    this.customerFront = this.configService.get('CUSTOMER_FRONTEND_HOST');
    this.truckOwnerFront = this.configService.get('TRUCK_OWNER_FRONTEND_HOST');
    this.adminFront = this.configService.get('ADMIN_FRONTEND_HOST');
    this.vi = this.languageService.getResource('vi');
    this.en = this.languageService.getResource('en');
    this.kr = this.languageService.getResource('kr');
    this.MAIL_FOOTER = `${process.env.BACKEND_HOST}/images/footer.jpg`;
    this.phone = this.configService.get('CONTACT_PHONE');
    this.email = this.configService.get('CONTACT_EMAIL');
    this.companyName = this.configService.get('COMPANY_NAME');
    this.webSite = this.configService.get('COTACT_WEB');
    this.address = this.configService.get('CONTACT_ADDRESS');
  }

  sendVerifyEmail(
    email: string,
    token: string,
    role: TOKEN_ROLE,
    nickname: string,
    lang: USER_LANGUAGE,
  ): void {
    try {
      let host;
      if (role === TOKEN_ROLE.CUSTOMER) {
        host = this.customerFront;
      }
      if (role === TOKEN_ROLE.TRUCK_OWNER) {
        host = this.truckOwnerFront;
      }

      let subject;

      switch (lang) {
        case USER_LANGUAGE.VI:
          subject = VI_EMAIL_SUBJECT.VERIFY_EMAIL;
          break;
        case USER_LANGUAGE.KR:
          subject = KR_EMAIL_SUBJECT.VERIFY_EMAIL;
          break;
        default:
          subject = EMAIL_SUBJECT.VERIFY_EMAIL;
      }

      const templates = this.templatesService.getResource(
        lang,
        'verify.html',
        host,
        nickname,
        role,
      );
      const data = {
        nickname: nickname,
        hyperlink: host + '/account/verify-email/' + token,
        companyName: this.companyName,
      };
      const compileTemplate = handlebars.compile(templates);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        error,
      );
    }
  }

  resendVerifyEmail(
    email: string,
    token: string,
    role: TOKEN_ROLE,
    nickname: string,
    lang: USER_LANGUAGE,
  ): void {
    try {
      let host;
      if (role === TOKEN_ROLE.CUSTOMER) {
        host = this.customerFront;
      }
      if (role === TOKEN_ROLE.TRUCK_OWNER) {
        host = this.truckOwnerFront;
      }

      let subject;

      switch (lang) {
        case USER_LANGUAGE.VI:
          subject = VI_EMAIL_SUBJECT.RESEND_VERIFY_EMAIL;
          break;
        case USER_LANGUAGE.KR:
          subject = KR_EMAIL_SUBJECT.RESEND_VERIFY_EMAIL;
          break;
        default:
          subject = EMAIL_SUBJECT.RESEND_VERIFY_EMAIL;
      }

      const templates = this.templatesService.getResource(
        lang,
        'resendverify.html',
        host,
        nickname,
        role,
      );
      const data = {
        nickname: nickname,
        hyperlink: host + '/account/verify-email/' + token,
        companyName: this.companyName,
      };
      const compileTemplate = handlebars.compile(templates);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        error,
      );
    }
  }

  sendVerifiedEmail(
    email: string,
    token: string,
    role: TOKEN_ROLE,
    nickname: string,
    lang: USER_LANGUAGE,
  ): void {
    try {
      let host;
      let subject;
      let data = {};
      if (role === TOKEN_ROLE.CUSTOMER) {
        host = this.customerFront;
        data = {
          nickname: nickname,
          companyName: this.companyName,
          website: this.customerFront,
        };
      }
      if (role === TOKEN_ROLE.TRUCK_OWNER) {
        host = this.truckOwnerFront;
        data = {
          nickname: nickname,
          companyName: this.companyName,
          webSite: this.truckOwnerFront,
        };
      }
      switch (lang) {
        case USER_LANGUAGE.VI:
          subject = EMAIL_SUBJECT.VERIFIED_EMAIL;
          break;
        case USER_LANGUAGE.KR:
          subject = KR_EMAIL_SUBJECT.VERIFIED_EMAIL;
          break;
        default:
          subject = EMAIL_SUBJECT.VERIFIED_EMAIL;
      }

      const templates = this.templatesService.getResource(
        lang,
        'verified.html',
        host,
        nickname,
        role,
      );
      const compileTemplate = handlebars.compile(templates);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        error,
      );
    }
  }

  sendWelcomeMail(
    email: string,
    role: TOKEN_ROLE,
    nickname: string,
    lang: USER_LANGUAGE,
  ): void {
    try {
      let subject;
      let host;
      let data = {};
      if (role === TOKEN_ROLE.CUSTOMER) {
        host = this.customerFront;
        data = {
          nickname: nickname,
          companyName: this.companyName,
          webSite: this.customerFront,
        };
      }
      if (role === TOKEN_ROLE.TRUCK_OWNER) {
        host = this.truckOwnerFront;
        data = {
          nickname: nickname,
          companyName: this.companyName,
          webSite: this.truckOwnerFront,
        };
      }

      switch (lang) {
        case USER_LANGUAGE.VI:
          subject = EMAIL_SUBJECT.EMAIL_WELCOME;
          break;
        case USER_LANGUAGE.KR:
          subject = KR_EMAIL_SUBJECT.EMAIL_WELCOME;
          break;
        default:
          subject = EMAIL_SUBJECT.EMAIL_WELCOME;
      }
      const templates = this.templatesService.getResource(
        lang,
        'welcome.html',
        host,
        nickname,
        role,
      );
      const compileTemplate = handlebars.compile(templates);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: email,
        subject: `${this.PREFIX_EMAIL_SUBJECT}${subject.replace(
          '{{companyName}}',
          this.companyName,
        )}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        error,
      );
    }
  }

  sendForgotPassword(
    token: string,
    email: string,
    role: TOKEN_ROLE,
    nickname: string,
    lang: USER_LANGUAGE,
  ): void {
    try {
      let host;
      let subject;
      if (role === TOKEN_ROLE.CUSTOMER) {
        host = this.customerFront;
      }
      if (role === TOKEN_ROLE.TRUCK_OWNER) {
        host = this.truckOwnerFront;
      }
      if (role === TOKEN_ROLE.ADMIN) {
        host = this.adminFront;
      }

      switch (lang) {
        case USER_LANGUAGE.VI:
          subject = EMAIL_SUBJECT.FORGOT_PASSWORD;
          break;
        case USER_LANGUAGE.KR:
          subject = KR_EMAIL_SUBJECT.FORGOT_PASSWORD;
          break;
        default:
          subject = EMAIL_SUBJECT.FORGOT_PASSWORD;
      }
      const template = this.templatesService.getResource(
        lang,
        'resetpassword.html',
        host,
        nickname,
        role,
      );
      let data = null;
      if (role === TOKEN_ROLE.ADMIN) {
        data = {
          nickname: nickname,
          hyperlink: host + '/admin/set-password/' + token,
          companyName: this.companyName,
        };
      } else {
        data = {
          nickname: nickname,
          hyperlink: host + '/account/reset-password/' + token,
          companyName: this.companyName,
        };
      }
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: email,
        subject: `${this.PREFIX_EMAIL_SUBJECT}${subject.replace(
          '{{companyName}}',
          this.companyName,
        )}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        error,
      );
    }
  }

  sendChangeEmail(token: string, email: string): void {
    console.log(token, email);
  }

  sendPasswordChangedEmail(email: string, nickname: string): void {
    try {
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: email,
        subject: `${this.PREFIX_EMAIL_SUBJECT}${EMAIL_SUBJECT.PASSWORD_CHANGED}`,
        html: `Hi ${nickname}, Your password has been changed: </br>
        <ul>
          <li>Website: <a href="${this.frontendHost}/">${this.frontendHost}/</a></li>
        </ul>
      `,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        error,
      );
    }
  }

  sendResetPassword(token: string, email: string): void {
    console.log(token, email);
  }

  sendSetPassword(
    email: string,
    token: string,
    user: any,
    role: TOKEN_ROLE,
    lang: USER_LANGUAGE,
  ): void {
    try {
      const nickname = getNickname(user);
      let host;
      let subject;
      if (role === TOKEN_ROLE.CUSTOMER) {
        host = this.customerFront;
      }
      if (role === TOKEN_ROLE.TRUCK_OWNER) {
        host = this.truckOwnerFront;
      }
      if (role === TOKEN_ROLE.ADMIN) {
        host = this.adminFront;
      }

      switch (lang) {
        case USER_LANGUAGE.VI:
          subject = EMAIL_SUBJECT.FORGOT_PASSWORD;
          break;
        case USER_LANGUAGE.KR:
          subject = KR_EMAIL_SUBJECT.FORGOT_PASSWORD;
          break;
        default:
          subject = EMAIL_SUBJECT.FORGOT_PASSWORD;
      }

      const template = this.templatesService.getResource(
        lang,
        'resetpassword.html',
        host,
        nickname,
        role,
      );
      const link =
        host === this.adminFront
          ? '/admin/set-password/'
          : '/account/set-password/';
      const data = {
        nickname: nickname,
        hyperlink: host + link + token,
        companyName: this.companyName,
      };

      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: email,
        subject: `${this.PREFIX_EMAIL_SUBJECT}${subject.replace(
          '{{companyName}}',
          this.companyName,
        )}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        error,
      );
    }
  }

  sendNewOrder(user: any, order: any): void {
    try {
      const nickname = getNickname(user);
      let subject, serviceType, containerType, cargoType, truckType;

      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.NEW_ORDER.replace(
          '{{orderId}}',
          order.orderId,
        );
        if (order.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
          serviceType = this.vi.ORDER.SERVICETYPE_TRAILOR;
          containerType = this.vi.ORDER[`CONTAINERTYPE_${order.containerType}`];
        } else {
          serviceType = this.vi.ORDER.SERVICETYPE_NORMAL;
          truckType = this.vi.ORDER[`TRUCKTYPE_${order.truckType}`];
        }
        cargoType = this.vi.ORDER[`CARGOTYPE_${order.cargoType}`];
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        [`STATUS_${order.status}`];
        subject = EMAIL_SUBJECT.NEW_ORDER.replace('{{orderId}}', order.orderId);
        if (order.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
          serviceType = this.en.ORDER.SERVICETYPE_TRAILOR;
          containerType = this.en.ORDER[`CONTAINERTYPE_${order.containerType}`];
        } else {
          serviceType = this.en.ORDER.SERVICETYPE_NORMAL;
          truckType = this.en.ORDER[`TRUCKTYPE_${order.truckType}`];
        }
        cargoType = this.en.ORDER[`CARGOTYPE_${order.cargoType}`];
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.NEW_ORDER.replace(
          '{{orderId}}',
          order.orderId,
        );
        if (order.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
          serviceType = this.kr.ORDER.SERVICETYPE_TRAILOR;
          containerType = this.kr.ORDER[`CONTAINERTYPE_${order.containerType}`];
        } else {
          serviceType = this.kr.ORDER.SERVICETYPE_NORMAL;
          truckType = this.kr.ORDER[`TRUCKTYPE_${order.truckType}`];
        }
        cargoType = this.kr.ORDER[`CARGOTYPE_${order.cargoType}`];
      }

      const data = {
        nickname: nickname,
        serviceType: serviceType,
        pickupAddress: order.pickupAddressText,
        dropOffAddress: order.dropOffFields[0].dropoffAddressText,
        containerSize: order.containerSize,
        containerQuantity: order.containerQuantity,
        containerType: containerType,
        cargoDescription: order.cargoName,
        cargoType: cargoType,
        truckType: truckType,
        suggestedTruckQuantity: order.truckQuantity,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'neworder.html',
        null,
        nickname,
        TOKEN_ROLE.CUSTOMER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendNewQuickOrder(user: any, order: any): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      let serviceType = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.NEW_ORDER.replace(
          '{{orderId}}',
          order.orderId,
        );
        if (order.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
          serviceType = this.vi.ORDER.SERVICETYPE_TRAILOR;
        } else {
          serviceType = this.vi.ORDER.SERVICETYPE_NORMAL;
        }
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.NEW_ORDER.replace('{{orderId}}', order.orderId);
        if (order.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
          serviceType = this.en.ORDER.SERVICETYPE_TRAILOR;
        } else {
          serviceType = this.en.ORDER.SERVICETYPE_NORMAL;
        }
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.NEW_ORDER.replace(
          '{{orderId}}',
          order.orderId,
        );
        if (order.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
          serviceType = this.kr.ORDER.SERVICETYPE_TRAILOR;
        } else {
          serviceType = this.kr.ORDER.SERVICETYPE_NORMAL;
        }
      }
      const data = {
        nickname: nickname,
        serviceType: serviceType,
        pickupAddress: order.pickupAddressText,
        dropOffAddress: order.dropoffAddressText,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'newquickorder.html',
        null,
        nickname,
        TOKEN_ROLE.CUSTOMER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendOrderCodes(user: any, order: any): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.PICKUP_AND_DELIVERY_CODE.replace(
          '{{orderId}}',
          order.orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.PICKUP_AND_DELIVERY_CODE.replace(
          '{{orderId}}',
          order.orderId,
        );
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.PICKUP_AND_DELIVERY_CODE.replace(
          '{{orderId}}',
          order.orderId,
        );
      }
      const data = {
        orderId: order.orderId,
        nickname: nickname,
        pickupCode: order.pickupCode,
        deliveryCode: order.deliveryCode,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'pickupanddeliverycode.html',
        null,
        nickname,
        TOKEN_ROLE.CUSTOMER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendEditOrder(user: any, order: any): any {
    if (!user) {
      return true;
    }
    try {
      const nickname = getNickname(user);
      let subject = '';
      let serviceType = '';
      let status = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.EDIT_ORDER.replace(
          '{{orderId}}',
          order.orderId,
        );
        status = this.vi.ORDER[`STATUS_${order.status}`];
        if (order.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
          serviceType = this.vi.ORDER.SERVICETYPE_TRAILOR;
        } else {
          serviceType = this.vi.ORDER.SERVICETYPE_NORMAL;
        }
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.EDIT_ORDER.replace(
          '{{orderId}}',
          order.orderId,
        );
        status = this.en.ORDER[`STATUS_${order.status}`];
        if (order.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
          serviceType = this.en.ORDER.SERVICETYPE_TRAILOR;
        } else {
          serviceType = this.en.ORDER.SERVICETYPE_NORMAL;
        }
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.EDIT_ORDER.replace(
          '{{orderId}}',
          order.orderId,
        );
        status = this.en.ORDER[`STATUS_${order.status}`];
        if (order.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
          serviceType = this.kr.ORDER.SERVICETYPE_TRAILOR;
        } else {
          serviceType = this.kr.ORDER.SERVICETYPE_NORMAL;
        }
      }
      const data = {
        nickname: nickname,
        orderId: order.orderId,
        serviceType: serviceType,
        pickupAddress: order.pickupAddressText,
        dropOffAddress: order.dropoffAddressText,
        status: status,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'editorder.html',
        null,
        nickname,
        TOKEN_ROLE.CUSTOMER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendFindNewTruck(user: any, orderId: any, truckOwnerName: string): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.LOOK_FOR_NEW_TRUCK.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.LOOK_FOR_NEW_TRUCK.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.LOOK_FOR_NEW_TRUCK.replace(
          '{{orderId}}',
          orderId,
        );
      }
      const data = {
        nickname: nickname,
        orderId: orderId,
        truckOwnerName: truckOwnerName,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'cancelledbeforeassign.html',
        null,
        nickname,
        TOKEN_ROLE.CUSTOMER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendCustomerFindNewTruck(user: any, orderId: any): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.CUSTOMER_REQUEST_NEW_TRUCK.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.CUSTOMER_REQUEST_NEW_TRUCK.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.CUSTOMER_REQUEST_NEW_TRUCK.replace(
          '{{orderId}}',
          orderId,
        );
      }
      const data = {
        nickname: nickname,
        orderId: orderId,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'findnewtruck.html',
        null,
        nickname,
        TOKEN_ROLE.TRUCK_OWNER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendCancelledAfterassign(user: any, orderId: any): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.CANCEL_AFTER_ASSIGN.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.CANCEL_AFTER_ASSIGN.replace(
          '{{orderId}}',
          orderId,
        );
      }
      const data = {
        nickname: nickname,
        orderId: orderId,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'cancelledafterassign.html',
        null,
        nickname,
        TOKEN_ROLE.CUSTOMER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendAssigned(user: any, orderId: any, truckowner: any): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      let companyName = '';
      if (truckowner.company) {
        companyName = truckowner.company.name;
      }
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.ASSIGNED_SUCCESS.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.ASSIGNED_SUCCESS.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.ASSIGNED_SUCCESS.replace(
          '{{orderId}}',
          orderId,
        );
      }
      const data = {
        nickname: nickname,
        transportCompanyName: companyName,
        name: getNickname(truckowner),
        phoneNumber: truckowner.phoneNumber,
        email: truckowner.email,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'orderassigned.html',
        null,
        nickname,
        TOKEN_ROLE.CUSTOMER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendAssignedToTruck(
    user: any,
    orderId: any,
    drivers: string,
    trucks: string,
  ): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.TRUCK_ASSIGNED_SUCCESS.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.TRUCK_ASSIGNED_SUCCESS.replace(
          '{{orderId}}',
          orderId,
        );
      }
      const data = {
        nickname: nickname,
        orderId: orderId,
        drivers: drivers,
        trucks: trucks,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'orderassigned.html',
        null,
        nickname,
        TOKEN_ROLE.TRUCK_OWNER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendAccepted(user: any, orderId: any, customer: any): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.ACCEPT_ORDER.replace('{{orderId}}', orderId);
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.ACCEPT_ORDER.replace('{{orderId}}', orderId);
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.ACCEPT_ORDER.replace('{{orderId}}', orderId);
      }
      const data = {
        nickname: nickname,
        customerName: getNickname(customer),
        customerEmail: customer.email,
        customerPhone: customer.phoneNumber,
        orderId: orderId,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'orderaccepted.html',
        null,
        nickname,
        TOKEN_ROLE.TRUCK_OWNER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendCustomerCancelledSuccess(user: any, orderId: string): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.CANCEL_ORDER.replace('{{orderId}}', orderId);
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.CANCEL_ORDER.replace('{{orderId}}', orderId);
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.CANCEL_ORDER.replace('{{orderId}}', orderId);
      }
      const data = {
        nickname: nickname,
        orderId: orderId,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'ordercancelled.html',
        null,
        nickname,
        TOKEN_ROLE.CUSTOMER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendTruckCancelledSuccess(user: any, orderId: string): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.TRUCK_CANCELLED_ORDER_SUCCESS.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.TRUCK_CANCELLED_ORDER_SUCCESS.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.TRUCK_CANCELLED_ORDER_SUCCESS.replace(
          '{{orderId}}',
          orderId,
        );
      }
      const data = {
        nickname: nickname,
        orderId: orderId,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'ordercancelled.html',
        null,
        nickname,
        TOKEN_ROLE.TRUCK_OWNER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendCustomerCancelled(user: any, orderId: string): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.CUSTOMER_CANCELLED.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.CUSTOMER_CANCELLED.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.CUSTOMER_CANCELLED.replace(
          '{{orderId}}',
          orderId,
        );
      }
      const data = {
        nickname: nickname,
        orderId: orderId,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'customercancelled.html',
        null,
        nickname,
        TOKEN_ROLE.TRUCK_OWNER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendDriverCancelToTruck(user: any, orderId: string): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.TRUCK_OWNER_DRIVER_CANCEL.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.TRUCK_OWNER_DRIVER_CANCEL.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.TRUCK_OWNER_DRIVER_CANCEL.replace(
          '{{orderId}}',
          orderId,
        );
      }
      const data = {
        nickname: nickname,
        orderId: orderId,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'ordercancelled.html',
        null,
        nickname,
        TOKEN_ROLE.TRUCK_OWNER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendDriverCancelToCustomer(user: any, orderId: string): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.CUSTOMER_DRIVER_CANCEL.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.CUSTOMER_DRIVER_CANCEL.replace(
          '{{orderId}}',
          orderId,
        );
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.CUSTOMER_DRIVER_CANCEL.replace(
          '{{orderId}}',
          orderId,
        );
      }
      const data = {
        nickname: nickname,
        orderId: orderId,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'cancelledafterassign.html',
        null,
        nickname,
        TOKEN_ROLE.CUSTOMER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendFavoriteTruck(user: any, customerName: string): void {
    try {
      const nickname = getNickname(user);
      let subject = '';
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT.FAVORITE_TRUCK;
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT.FAVORITE_TRUCK;
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT.FAVORITE_TRUCK;
      }
      const data = {
        nickname: nickname,
        customerName: customerName,
        companyName: this.companyName,
      };
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'favoritetruckadded.html',
        null,
        nickname,
        TOKEN_ROLE.TRUCK_OWNER,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendComplete(
    user: any,
    order: any,
    role: TOKEN_ROLE,
    truckOwner?: any,
  ): void {
    try {
      const nickname = getNickname(user);
      let subject,
        subjectType,
        name = '';
      let data = {};
      switch (role) {
        case TOKEN_ROLE.CUSTOMER:
          subjectType = 'CUSTOMER';
          if (truckOwner && truckOwner.company) {
            name = truckOwner.company.name;
          }
          data = {
            nickname: nickname,
            orderId: order.orderId,
            transportCompanyName: name,
            completedAt: order.updatedDate,
            companyName: this.companyName,
          };
          break;
        case TOKEN_ROLE.TRUCK_OWNER:
          subjectType = 'TRUCK_OWNER';
          name = nickname;
          data = {
            nickname: nickname,
            orderId: order.orderId,
          };
          break;
      }
      // ORDER[`STATUS_${order.status}`]
      if (user.preferLanguage === USER_LANGUAGE.VI) {
        subject = VI_EMAIL_SUBJECT[`${subjectType}_ORDER_COMPLETE`].replace(
          '{{orderId}}',
          order.orderId,
        );
      }
      if (
        user.preferLanguage === USER_LANGUAGE.EN ||
        user.preferLanguage === USER_LANGUAGE.ID
      ) {
        subject = EMAIL_SUBJECT[`${subjectType}_ORDER_COMPLETE`].replace(
          '{{orderId}}',
          order.orderId,
        );
      }
      if (user.preferLanguage === USER_LANGUAGE.KR) {
        subject = KR_EMAIL_SUBJECT[`${subjectType}_ORDER_COMPLETE`].replace(
          '{{orderId}}',
          order.orderId,
        );
      }
      const template = this.templatesService.getResource(
        user.preferLanguage,
        'ordercompleted.html',
        null,
        nickname,
        role,
      );
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: user.email,
        subject: `${subject.replace('{{companyName}}', this.companyName)}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }

  sendTestEmail(): void {
    try {
      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: this.configService.get('TO_TEST_EMAIL'),
        subject: EMAIL_SUBJECT.TEST,
        text: 'hello plain text',
        html: '<h1>helllooooo</h1>',
      });
    } catch (error) {
      customThrowError('test email failed', -5);
    }
  }

  sendLicenseRequest(user: any, model: LicenseMail): void {
    try {
      const template = this.templatesService.getLicenseTemplate(
        user.preferLanguage,
      );
      const data = {
        companyName: model.companyName,
        email: model.email,
        contactNo: model.contactNo,
        notes: model.notes,
      };
      const compileTemplate = handlebars.compile(template);
      const finalPageHTML = compileTemplate(data);

      this.mailService.send({
        from: this.configService.get('ADMIN_EMAIL'),
        to: 'hotro@tada.global',
        subject: `TaaS Truck - Request for license upgrade - ${model.companyName}`,
        html: finalPageHTML,
      });
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_SEND_FAIL,
        error,
      );
    }
  }
}
