import { roundTwoFixed } from 'src/common/helpers/utility.helper';
import { GeneralSettupCommissionDto } from 'src/dto/setting/general-setting-commission.dto';
import { Settings } from 'src/entities/setting/setting.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Settings)
export class SettingRepository extends Repository<Settings> {
  constructor() {
    super();
  }

  async getGeneralSettingCommisson(): Promise<GeneralSettupCommissionDto> {
    const generalSetting: Settings = await this.findOne();
    const result: GeneralSettupCommissionDto = {
      isEnableCommissionFeature: generalSetting.enableCommission,
      isEnableAllTruckOwnersCommission: generalSetting.allTruckOwnersCommisson,
      isEnableSetupDefaultDriversCommission:
        generalSetting.defaultSettingCommission,
      defaultFixedCommission: generalSetting.fixedCommission,
      defaultPercentCommission: roundTwoFixed(generalSetting.percentCommission),
    };
    return result;
  }
}
