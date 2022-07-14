import json
import csv
import pathlib


store = {}
listLangImport = ['kr', 'vi']

def getRootJsonFiles(path: str):
  with open(path) as json_file:
    data = json.load(json_file)
    labels = data.keys();
    for label in labels:
      keys =  data[label].keys()
      for key in keys:
        store[str(label) + '.'  + str(key)] = {'en': data[label][key] }
      
def importFromJson(path: str, lang: str):
    with open(path, encoding='utf-8') as json_file:
      data = json.load(json_file)
      labels = list(store.keys())
      for element in labels:
        [label, key] = element.split('.')
        if (label in data):
          if (key in list(data[label].keys())):
            update = store[element]
            update[lang] = data[label][key].rstrip()
            list(store[element].values())[0] = update
        else:
             store[element] = {**store[element], lang: ''}

    
if __name__ == "__main__":
  rootPath = str(pathlib.Path(__file__).parent.absolute())

  getRootJsonFiles(rootPath + '/../locales/en.json')
  for lang in listLangImport: 
    path = rootPath + '/../locales/' + lang+ '.json'
    importFromJson(path, lang)
  
  with open(rootPath + '/translate.json', 'w', encoding='utf-8') as outfile:
    json.dump(store, outfile, ensure_ascii=False, indent = 4)
  
  for key, value in store.items():
    with open(rootPath + '/translate.csv', 'w', encoding='utf-8') as outfile:
      fieldnames = ['Translate', 'en'] + listLangImport
      writer = csv.DictWriter(outfile, fieldnames=fieldnames,  lineterminator='\n')
      writer.writeheader()
      for key, value in store.items():
        writer.writerow({'Translate':key, **value})