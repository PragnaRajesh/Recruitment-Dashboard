import * as runtime from 'react/jsx-runtime';

const _rt: any = (runtime as any).default ?? runtime;

// Some compiled code expects jsxDEV; provide it (fallback to jsx)
export const jsxDEV = _rt.jsxDEV ?? _rt.jsx ?? ((type: any, props: any, key: any) => _rt.jsx(type, props, key));
export const jsx = _rt.jsx;
export const jsxs = _rt.jsxs;
export const Fragment = _rt.Fragment;

export default { jsxDEV, jsx, jsxs, Fragment };
