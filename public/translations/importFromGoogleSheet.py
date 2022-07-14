import gspread
from oauth2client.service_account import ServiceAccountCredentials
import pathlib
import json

rootPath = str(pathlib.Path(__file__).parent.absolute())

def initConnection():
  scope = ['https://spreadsheets.google.com/feeds','https://www.googleapis.com/auth/drive']
  creds = ServiceAccountCredentials.from_json_keyfile_name(rootPath + '/tada-translation-d8df71e3248f.json', scope)
  client = gspread.authorize(creds)
  sheet = client.open('TADA TRANSLATIONS')
  sheet_instance = sheet.get_worksheet(0)
  return sheet_instance.get_all_records()


def importToJson(lang: str, store):
  data = {}
  for element in store:
    for key, value in element.items():
      if key == 'Translate':        
        split = value.split('.')
      if key == lang and len(split) == 2:
        if not (split[0] in data):
          data[split[0]] =  {}
        data[split[0]][split[1]] = value
        
  with open(rootPath + '/translated/' + lang + '_translated.json', 'w', encoding='utf-8') as outfile:
      json.dump(data, outfile, ensure_ascii=False, indent = 4)    
      
  
if __name__ == "__main__":
  store = initConnection()
  listLangImport = list(store[0].keys())[1:]
  
  for index, lang in enumerate(listLangImport):
    importToJson(lang, store)