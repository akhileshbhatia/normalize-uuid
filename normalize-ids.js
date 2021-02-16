const { readFileSync, writeFileSync } = require('fs');
const uuid = require('uuid');

const excludedTypes = ['config', 'script', 'fingerprint'];
const oldNewIdMap = new Map();

const processData = (stringifiedData) => {
  let parsedData = JSON.parse(stringifiedData);

  for (const savedObj of parsedData) {
    const savedObjectType = savedObj._source.type;
    if (savedObjectType && !excludedTypes.includes(savedObjectType)) {
      const oldId = savedObj._id;
      const newId = `${savedObjectType}:${uuid.v4()}`;
      oldNewIdMap.set(oldId, newId);
      const doubleInvertedCommaRegex = new RegExp(`"${oldId}"`, 'g');
      const stringifiedJsonRegex = new RegExp(`"${oldId}\\\\"`, 'g');
      const singleInvertedCommaRegex = new RegExp(`'${oldId}'`, 'g');
      
      stringifiedData = stringifiedData.replace(doubleInvertedCommaRegex, `"${newId}"`)
                              .replace(stringifiedJsonRegex, `"${newId}\\\"`)
                              .replace(singleInvertedCommaRegex, `'${newId}'`);
    }
  }
  return stringifiedData;
}

/**
 * platform-data.json
 */
let stringifiedDemoData = readFileSync('platform-data.json', 'utf-8');
stringifiedDemoData = processData(stringifiedDemoData);
for (const [oldId, newId] of oldNewIdMap) {
  const noInvertedCommaRegex = new RegExp(oldId, 'g');
  stringifiedDemoData = stringifiedDemoData.replace(noInvertedCommaRegex, newId);
}
writeFileSync('platform-data-output.json', stringifiedDemoData);
delete stringifiedDemoData;
/**
 * End of processing of platform-data.json
 */

/**
 * sirenaccess.json
 */
let stringifiedSirenAccessData = readFileSync('sirenaccess.json', 'utf-8');
let stringOldNewMap = '';
for (const [oldId, newId] of oldNewIdMap) {
  const sirenAccessRegex = new RegExp(`"metadata:${oldId}"`, 'g');
  stringifiedSirenAccessData = stringifiedSirenAccessData.replace(sirenAccessRegex, `"metadata:${newId}"`);
  stringOldNewMap += `${oldId} => ${newId}\n`;
}
writeFileSync('sirenaccess-output.json', stringifiedSirenAccessData);
writeFileSync('oldNewMap.txt', stringOldNewMap);
delete stringifiedSirenAccessData;
delete stringOldNewMap;
/**
 * End of processing of sirenaccess.json
 */

 /**
  * easy-start-data.json Requires only updating sidebaroptions object
  */
let stringifiedEasyStartData = readFileSync('easy-start-data.json', 'utf-8');
stringifiedEasyStartData = stringifiedEasyStartData.replace(new RegExp(`"sidebaroptions:instance"`, 'g'), `"sidebaroptions:${uuid.v4()}"`);
writeFileSync('easy-start-output.json', stringifiedEasyStartData);
delete stringifiedEasyStartData;
/**
 * End of processing of easy-start-data.json
 */
