'use client';
import {useEffect,useRef} from 'react';

const tools=[
  ['bold','B','Bold'],['italic','I','Italic'],['underline','U','Underline'],
  ['formatBlock','H2','Heading'],['insertUnorderedList','•','Bullet list'],['insertOrderedList','1.','Numbered list']
];

export default function RichTextEditor({value,onChange}){
 const ref=useRef(null);
 useEffect(()=>{if(ref.current && ref.current.innerHTML!==value) ref.current.innerHTML=value||''},[value]);
 const command=(cmd,arg=null)=>{ref.current?.focus();document.execCommand(cmd,false,arg);onChange(ref.current?.innerHTML||'')};
 const link=()=>{const url=window.prompt('Link URL');if(url)command('createLink',url)};
 return <div className="rte">
   <div className="rteToolbar">
    {tools.map(([cmd,label,title])=><button type="button" key={cmd} title={title} onMouseDown={e=>{e.preventDefault();command(cmd,cmd==='formatBlock'?'h2':null)}} className={label==='B'?'toolBold':label==='I'?'toolItalic':''}>{label}</button>)}
    <button type="button" title="Paragraph" onMouseDown={e=>{e.preventDefault();command('formatBlock','p')}}>¶</button>
    <button type="button" title="Quote" onMouseDown={e=>{e.preventDefault();command('formatBlock','blockquote')}}>❝</button>
    <button type="button" title="Add link" onMouseDown={e=>{e.preventDefault();link()}}>🔗</button>
    <button type="button" title="Horizontal line" onMouseDown={e=>{e.preventDefault();command('insertHorizontalRule')}}>―</button>
   </div>
   <div ref={ref} className="rteArea" contentEditable suppressContentEditableWarning onInput={e=>onChange(e.currentTarget.innerHTML)} data-placeholder="এখানে সম্পূর্ণ খবর লিখুন..." />
   <div className="rteHint">Bold, italic, heading, list, quote, link এবং paragraph spacing ব্যবহার করতে toolbar থেকে অপশন বেছে নিন।</div>
 </div>
}
