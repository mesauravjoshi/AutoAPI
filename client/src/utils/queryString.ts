import { ParamItem } from '@/types/types';

const QueryString = (query: ParamItem[]) => {

  const validParams = query
    .filter(param => param.enabled && param.key.trim() !== '')
    .map(param =>
      `${encodeURIComponent(param.key.length > 0 ? param.key : 'a')}=${encodeURIComponent(param.value)}`
    );
  const queryString = validParams.length ? `?${validParams.join('&')}` : '';
  return queryString;
}

export default QueryString