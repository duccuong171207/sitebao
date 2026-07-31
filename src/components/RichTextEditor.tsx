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
  placeholder = 'Type editorial body text here...',
  minHeight = '300px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef<boolean>(false);
  
  // Sync value when prop changes externally (e.g. loading article for edit), but NOT while user is typing/composing
  useEffect(() => {
    if (editorRef.current && !isComposingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && !isComposingRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    handleInput();
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="border border-slate-300 rounded overflow-hidden flex flex-col bg-white">
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
        <button type="button" onClick={() => execCommand('formatBlock', '<H1>')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer" title="Heading 1"><Heading1 size={16} /></button>
        <button type="button" onClick={() => execCommand('formatBlock', '<H2>')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer" title="Heading 2"><Heading2 size={16} /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('bold')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer" title="Bold"><Bold size={16} /></button>
        <button type="button" onClick={() => execCommand('italic')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer" title="Italic"><Italic size={16} /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer" title="Bullet List"><List size={16} /></button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer" title="Numbered List"><ListOrdered size={16} /></button>
        <button type="button" onClick={() => execCommand('formatBlock', '<BLOCKQUOTE>')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer" title="Quote"><Quote size={16} /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('formatBlock', '<P>')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded text-xs font-bold uppercase cursor-pointer" title="Paragraph">P</button>
      </div>
      
      <div 
        ref={editorRef}
        className="p-4 outline-none font-serif text-sm leading-relaxed text-slate-800 focus:bg-amber-50/10 transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 prose prose-slate max-w-none"
        style={{ minHeight }}
        contentEditable
        spellCheck={false}
        lang="vi"
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={() => { isComposingRef.current = true; }}
        onCompositionEnd={handleCompositionEnd}
      />
    </div>
  );
};
