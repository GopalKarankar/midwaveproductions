export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getParam(obj, key) {
  if (!obj) return undefined;
  const value = obj[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parsePageParams(
  searchParamsObj,
  { defaultPageSize = 20, allowedSort = [], defaultSort = '' } = {}
) {
  const page = Math.max(1, parseInt(getParam(searchParamsObj, 'page') || '1', 10));
  const pageSize = Math.max(1, Math.min(100, parseInt(getParam(searchParamsObj, 'pageSize') || defaultPageSize, 10)));
  const sortField = getParam(searchParamsObj, 'sort') || defaultSort;
  const sortDir = getParam(searchParamsObj, 'dir') === 'asc' ? 'asc' : 'desc';

  // Reject sort fields outside the allow-list
  const isValidSort = !sortField || allowedSort.includes(sortField);
  const finalSortField = isValidSort ? sortField : defaultSort;
  const finalSortDir = isValidSort ? sortDir : 'desc';

  const skip = (page - 1) * pageSize;
  const limit = pageSize;
  const sort = finalSortField ? { [finalSortField]: finalSortDir === 'asc' ? 1 : -1 } : {};

  return {
    page,
    pageSize,
    skip,
    limit,
    sortField: finalSortField,
    sortDir: finalSortDir,
    sort,
  };
}

export function serializeDocs(docs) {
  return JSON.parse(JSON.stringify(docs));
}

export function getLocalTzOffset(date = new Date()) {
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}

function formatLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildDailySeries(aggResult, rangeStart, days) {
  const countsByDay = new Map(aggResult.map((d) => [d._id, d.count]));
  const series = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(rangeStart);
    day.setDate(day.getDate() + i);
    const key = formatLocalDateKey(day);
    series.push({
      date: key,
      label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: countsByDay.get(key) ?? 0,
    });
  }
  return series;
}
