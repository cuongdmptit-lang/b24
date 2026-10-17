import React from 'react';
export default function WeatherIcon({ type, large = false }) {
  const sun = type === 'sun' || type === 'partly';
  const cloud = ['partly','cloud','rain','storm','snow','fog'].includes(type);
  return <svg className={'weather-icon' + (large ? ' large' : '')} viewBox="0 0 120 100" fill="none" aria-hidden="true">
    {sun && <g stroke="#eab653" strokeWidth="4" strokeLinecap="round"><circle cx="49" cy="39" r="19" fill="#ffdb80" stroke="none"/><path d="M49 8v5M49 65v5M18 39h5M75 39h5M27 17l4 4M67 57l4 4M27 61l4-4M67 21l4-4"/></g>}
    {cloud && <path d="M32 72C11 72 12 44 32 43C35 18 73 19 79 42C103 38 113 72 88 72Z" fill={type === 'storm' ? '#859caa' : '#f8fcff'} stroke="#b4ccd1" strokeWidth="2"/>}
    {type === 'rain' && <path d="M38 81l-4 9M59 81l-4 9M80 81l-4 9" stroke="#64a8ca" strokeWidth="4" strokeLinecap="round"/>}
    {type === 'storm' && <path d="M60 62l-12 19h12l-5 16 23-24H64l7-11" fill="#ffd171"/>}
    {type === 'fog' && <path d="M24 79h70M34 88h49" stroke="#9bb5bb" strokeWidth="4" strokeLinecap="round"/>}
    {type === 'snow' && <g fill="#80b8cb"><circle cx="36" cy="84" r="3"/><circle cx="60" cy="90" r="3"/><circle cx="84" cy="84" r="3"/></g>}
    {type === 'unknown' && <text x="49" y="65" fill="#71958b" fontSize="44">?</text>}
  </svg>;
}
