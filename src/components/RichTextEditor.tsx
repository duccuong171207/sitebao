import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange,
  placeholder = 'Type here...',
  minHeight = '300px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Set initial value only once when mounted to avoid cursor jumps
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="border border-slate-300 rounded overflow-hidden flex flex-col bg-white">
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
        <button type="button" onClick={() => execCommand('formatBlock', '<H1>')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Heading 1"><Heading1 size={16} /></button>
        <button type="button" onClick={() => execCommand('formatBlock', '<H2>')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Heading 2"><Heading2 size={16} /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('bold')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Bold"><Bold size={16} /></button>
        <button type="button" onClick={() => execCommand('italic')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Italic"><Italic size={16} /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Bullet List"><List size={16} /></button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Numbered List"><ListOrdered size={16} /></button>
        <button type="button" onClick={() => execCommand('formatBlock', '<BLOCKQUOTE>')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Quote"><Quote size={16} /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('formatBlock', '<P>')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded text-xs font-bold uppercase" title="Paragraph">P</button>
      </div>
      
      <div 
        ref={editorRef}
        className="p-4 outline-none font-serif text-sm leading-relaxed text-slate-800 focus:bg-amber-50/10 transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 prose prose-slate max-w-none"
        style={{ minHeight }}
        contentEditable
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={handleInput}
      />
    </div>
  );
};
