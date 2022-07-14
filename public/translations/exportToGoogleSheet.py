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
  return sheet

def exportToGGSheet(sheet):
  data, langs, number = readFileJson()
  data.insert(0, ['Translate'] + langs)
  sheet.add_worksheet(rows = 200, cols = number + 1, title = 'Translation')
  sheet_runs = sheet.get_worksheet(0)
  sheet_runs.insert_rows(data)
  
def readFileJson():
  exportList = []    
  with open(rootPath + '/translate.json', encoding='utf-8') as json_file:
    store = json.load(json_file)
    for key, value in store.items():
      listLangValue = list(value.values())
      listLangKey = list(value.keys())
      export = [key] + listLangValue
      exportList.append(export)
  return exportList, listLangKey, len(listLangKey)
  
if __name__ == "__main__":
  sheet = initConnection()
  exportToGGSheet(sheet)