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
      const noInvertedCommaRegex = new RegExp(oldId, 'g');
      
      stringifiedData = stringifiedData.replace(doubleInvertedCommaRegex, `"${newId}"`)
                              .replace(stringifiedJsonRegex, `"${newId}\\\"`)
                              .replace(singleInvertedCommaRegex, `'${newId}'`)
                              .replace(noInvertedCommaRegex, newId);
    }
  }
  return stringifiedData;
}

/**
 * platform-data.json
 */
let stringifiedDemoData = readFileSync('.sirenData.json', 'utf-8');
stringifiedDemoData = processData(stringifiedDemoData);
writeFileSync('platform-data-output.json', stringifiedDemoData);
delete stringifiedDemoData;
/**
 * End of processing of platform-data.json
 */

/**
 * sirenaccess.json
 */
let stringifiedSirenAccessData = readFileSync('.sirenAccess.json', 'utf-8');
for (const [oldId, newId] of oldNewIdMap) {
  const sirenAccessRegex = new RegExp(`"metadata:${oldId}"`, 'g');
  stringifiedSirenAccessData = stringifiedSirenAccessData.replace(sirenAccessRegex, `"metadata:${newId}"`);
}
writeFileSync('sirenaccess-output.json', stringifiedSirenAccessData);
delete stringifiedSirenAccessData;
/**
 * End of processing of sirenaccess.json
 */

 /**
  * easy-start-data.json
  */
let stringifiedEasyStartData = readFileSync('easy-start-data.json', 'utf-8');
stringifiedEasyStartData = processData(stringifiedEasyStartData);
writeFileSync('easy-start-output.json', stringifiedEasyStartData);
delete stringifiedEasyStartData;
/**
 * End of processing of easy-start-data.json
 */
 

console.log(oldNewIdMap);