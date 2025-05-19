import dayjs from 'dayjs';

/**
 * 将对象转化为URL的查询字符串
 * @param q 查询对象
 * @returns URL的查询字符串
 */
export const formatQuery = (q: Record<string, any>) => {
  let query = '';
  const keys = Object.keys(q);
  if (keys.length) {
    query += '?';
  }
  keys.forEach((key) => {
    if (q[key] !== '' && q[key] !== undefined) {
      query += `${key}=${q[key]}&`;
    }
  });
  return query.substring(0, query.length - 1);
};

/**
 * 时间戳区间转换成00:00:00到后一天00:00:00的格式
 * @param preciseTimes 13位时间戳数组
 * @returns
 */
export const standardizeDateTime = (preciseTimes: Array<string | number>) => {
  if (preciseTimes.length === 2 && preciseTimes[0] && preciseTimes[1]) {
    const startTime = dayjs(Number(preciseTimes[0]));
    const endTime = dayjs(Number(preciseTimes[1]));
    startTime.startOf('day');
    endTime.startOf('day');
    endTime.add(1, 'd');

    return [startTime.format('x'), endTime.format('x')];
  }
  return [undefined, undefined];
};

/**
 * 将时间戳格式化，例如转化为2021-11-24 15:36
 * @param timeStamp 时间戳
 * @param type 格式类型
 * @returns
 */
export const formatTime = (timeStamp: number, type: string) => {
  return dayjs(timeStamp).format(type);
};

/**
 * 将一个浅层对象(属性值为基本类型)转化为字符串
 * @param obj
 * @example
 * const obj = {name: 'ff', age: 17};
 * console.log(formatObj2str(obj)); // "name:'ff';age:17"
 * @returns
 */
export const formatObj2str = (obj: any) => {
  return Object.keys(obj).reduce(
    (str, key, index) => (index === 1 ? `${str}:${obj[str]};` : str) + `${key}:${obj[key]};`
  );
};
