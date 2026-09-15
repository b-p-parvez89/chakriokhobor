'use client';
import {useEffect} from 'react';
export default function HistoryWriter({article}){useEffect(()=>{try{const old=JSON.parse(localStorage.getItem('chakri_history')||'[]');const next=[article,...old.filter(x=>x._id!==article._id)].slice(0,50);localStorage.setItem('chakri_history',JSON.stringify(next))}catch{}},[article]);return null}
