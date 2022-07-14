import * as fs from 'fs';

export const getProvincesFromFile = (path: string) => {
  const data = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });

  const provinces = data.split('\n').map((province, index) => ({
    name: province,
    slug: province,
    type: 'city',
    name_with_type: province,
    code: getProvinceCode(index + 1),
  }));

  return provinces;
};

const getProvinceCode = (code: number): string => {
  return code.toString().length > 1 ? `0${code}` : `00${code}`;
};
