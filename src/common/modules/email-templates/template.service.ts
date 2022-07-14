import { HttpStatus, Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { customThrowError } from 'src/common/helpers/throw.helper';
import fs = require('fs');
import path = require('path');

@Injectable()
export class TemplatesService {
  MAIL_FOOTER: string;
  phone: string;
  email: string;
  company: string;
  constructor() {
    this.MAIL_FOOTER = `${process.env.BACKEND_HOST}/images/footer.jpg`;
    this.phone = process.env.CONTACT_PHONE;
    this.email = process.env.CONTACT_EMAIL;
    this.company = process.env.COMPANY_NAME;
  }
  getResource(
    lang: string,
    template: string,
    host?: string,
    nickname?: string,
    role?: TOKEN_ROLE,
  ): any {
    let dir;
    if (role === TOKEN_ROLE.CUSTOMER) {
      dir = 'customer';
    }
    if (role === TOKEN_ROLE.TRUCK_OWNER) {
      dir = 'truckOwner';
    }
    if (role === TOKEN_ROLE.ADMIN) {
      dir = 'admin';
    }
    const pathDir = path.join(__dirname, '../../../templates');
    if (!fs.existsSync(`${pathDir}/${dir}/${lang}/${template}`)) {
      customThrowError('Resource not found!', HttpStatus.NOT_FOUND);
    }
    const footer = fs
      .readFileSync(`${pathDir}/${dir}/${lang}/footer.html`, 'utf8')
      .toString();
    const data = footer
      .replace('{{footer}}', this.MAIL_FOOTER)
      .replace(/{{phoneNumber}}/g, this.phone)
      .replace(/{{email}}/g, this.email)
      .replace(/{{companyName}}/g, this.company);

    handlebars.registerPartial('footer', data);
    const templates = fs
      .readFileSync(`${pathDir}/${dir}/${lang}/${template}`)
      .toString();
    return templates;
  }

  getLicenseTemplate(lang: string): any {
    const pathDir = path.join(__dirname, '../../../templates');
    if (!fs.existsSync(`${pathDir}/admin/${lang}/license.html`)) {
      customThrowError('Resource not found!', HttpStatus.NOT_FOUND);
    }
    const footer = fs
      .readFileSync(`${pathDir}/admin/${lang}/footer.html`, 'utf8')
      .toString();
    const data = footer
      .replace('{{footer}}', this.MAIL_FOOTER)
      .replace(/{{phoneNumber}}/g, this.phone)
      .replace(/{{email}}/g, this.email)
      .replace(/{{companyName}}/g, this.company);

    handlebars.registerPartial('footer', data);
    const templates = fs
      .readFileSync(`${pathDir}/admin/${lang}/license.html`)
      .toString();
    return templates;
  }
}
