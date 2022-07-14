import csv
import os
import json
import pathlib

store = []
def importToJson(lang: str, index: int):
  data = {}
  for element in store:
    split = element[0].split('.')
    if (len(split) == 2):
      if not (split[0] in data):
        data[split[0]] =  {}
      data[split[0]][split[1]] = element[index]
    
  with open(rootPath + '/translated/' + lang + '_translated.json', 'w', encoding='utf-8') as outfile:
    json.dump(data, outfile, ensure_ascii=False, indent = 4)    
  
if __name__ == '__main__':
  rootPath = str(pathlib.Path(__file__).parent.absolute())

  with open(rootPath + '/translate.csv', encoding='utf-8') as csv_file:
      csv_reader = csv.reader(csv_file, delimiter=',')
      for row in csv_reader:
        store.append(row)
        
  listLangImport = store[0][1:]
  store = store[1:]
  
  for index, lang in enumerate(listLangImport):
    importToJson(lang, index + 1)