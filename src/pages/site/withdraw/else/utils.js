export function filterToEnglishAndNumbers(text) {
  // 使用正则表达式只保留英文字符（大小写）和数字
  return text
    .replace(/[\/,.<>!@#$%^&*()_+=\[\]{}|\\:;"'?~`\-\s]/g, "")
    .replace(/[\u4e00-\u9fa5]/g, "")
    .replace(/[\uFF01-\uFF5E]/g, "")
}

export function filterString(text) {
  // 使用正则表达式去除全形字符、特殊符号和数字
  return text.replace(/[0-9]/g, "").replace(/[\uFF01-\uFF5E]/g, "")
  // .replace(/[\/,.<>!@#$%^&*()_+-=\[\]{}|\\:;"'?~`\s]/g, "")
}

export function filterNumber(text) {
  // 使用正则表达式只保留数字
  return text.replace(/[^\d]/g, "")
}

export const useFilter = () => {
  return { filterToEnglishAndNumbers, filterString, filterNumber }
}
