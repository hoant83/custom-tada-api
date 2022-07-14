export enum CONTAINER_TYPE {
  DC = 'DC',
  RF = 'RF',
  HC = 'HC',
  HR = 'HR',
  OT = 'OT',
  FR = 'FR',
  TANK = 'TANK',
}

export enum CONTAINER_TYPE_IMPORT {
  'DC (Dry container)' = CONTAINER_TYPE.DC,
  'RF (Reefer)' = CONTAINER_TYPE.RF,
  'HC (High cube)' = CONTAINER_TYPE.HC,
  'HR (High cube reefer)' = CONTAINER_TYPE.HR,
  'OT (Open Top)' = CONTAINER_TYPE.OT,
  'FR (Flat Rack)' = CONTAINER_TYPE.FR,
  'TANK' = CONTAINER_TYPE.TANK,

  'Công khô (DC)' = CONTAINER_TYPE.DC,
  'Công lạnh (RF)' = CONTAINER_TYPE.RF,
  'Công cao (HC)' = CONTAINER_TYPE.HC,
  'Công lạnh cao (HR)' = CONTAINER_TYPE.HR,
  'Công mở (OT)' = CONTAINER_TYPE.OT,
  'Công mặt phẳng (FR)' = CONTAINER_TYPE.FR,
  'Công bồn' = CONTAINER_TYPE.TANK,

  'DC (드라이 컨테이너)' = CONTAINER_TYPE.DC,
  'RF (냉동차)' = CONTAINER_TYPE.RF,
  'HC (하이 큐브)' = CONTAINER_TYPE.HC,
  'HR (하이 큐브 냉동차)' = CONTAINER_TYPE.HR,
  'OT (오픈 탑)' = CONTAINER_TYPE.OT,
  'FR (플랫 랙)' = CONTAINER_TYPE.FR,
  '탱크 컨테이너' = CONTAINER_TYPE.TANK,
}
